/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import 'css!./messageList'

import {Builder, $} from '../builder'
//import { CPromise, DPromise } from '../../../common/promise'
import * as DOM from '../dom'
import * as browser from '../browser'
import * as aria from '../aria/aria'
import * as types from '../../../common/types'
import {IEvent,Emitter} from '../event'
import {Action} from '../action'
import * as htmlRenderer from '../htmlContentRenderer'

import { Promise } from 'bluebird'

export enum ESeverity {
	Info,
	Warning,
	Error
}

export interface IMessageWithAction {
	message: string;
	actions: Action[];
}

interface IMessageEntry {
	id: any;
	text: string;
	severity: ESeverity;
	time: number;
	count?: number;
	actions: Action[];
	onHide: () => void;
}

export class IMessageListOptions {
	purgeInterval: number;
	maxMessages: number;
	maxMessageLength: number;
}

export interface IUsageLogger {
	publicLog(eventName: string, data?: any): void;
}

export class MessageList {

	private static DEFAULT_MESSAGE_PURGER_INTERVAL = 10000;
	private static DEFAULT_MAX_MESSAGES = 5;
	private static DEFAULT_MAX_MESSAGE_LENGTH = 500;

	private messages: IMessageEntry[];
	private messageListPurger: Promise<any>;
	private messageListContainer: Builder;

	private container: HTMLElement;
	private options: IMessageListOptions;
	private usageLogger: IUsageLogger;

	private _onMessagesShowing: Emitter<void>;
	private _onMessagesCleared: Emitter<void>;

	constructor(container: HTMLElement,
				usageLogger?: IUsageLogger, options:
				IMessageListOptions = { purgeInterval: MessageList.DEFAULT_MESSAGE_PURGER_INTERVAL,
				maxMessages: MessageList.DEFAULT_MAX_MESSAGES, maxMessageLength: MessageList.DEFAULT_MAX_MESSAGE_LENGTH }) {
		this.messages = []
		this.messageListPurger = null
		this.container = container
		this.usageLogger = usageLogger
		this.options = options

		this._onMessagesShowing = new Emitter<void>()
		this._onMessagesCleared = new Emitter<void>()

		this.registerListeners()
	}

	private registerListeners(): void {
		browser.onDidChangeFullscreen(() => this.positionMessageList())
		browser.onDidChangeZoomLevel(() => this.positionMessageList())
	}

	get onMessagesShowing(): IEvent<void> {
		return this._onMessagesShowing.event
	}

	get onMessagesCleared(): IEvent<void> {
		return this._onMessagesCleared.event
	}

	showMessage(severity: ESeverity, message: string, onHide?: () => void): () => void;
	showMessage(severity: ESeverity, message: Error, onHide?: () => void): () => void;
	showMessage(severity: ESeverity, message: string[], onHide?: () => void): () => void;
	showMessage(severity: ESeverity, message: Error[], onHide?: () => void): () => void;
	showMessage(severity: ESeverity, message: IMessageWithAction, onHide?: () => void): () => void;
	showMessage(severity: ESeverity, message: any, onHide?: () => void): () => void {
		if (Array.isArray(message)) {
			const closeFns: Function[] = []
			message.forEach((msg: any) => closeFns.push(this.showMessage(severity, msg, onHide)))

			return () => closeFns.forEach((fn) => fn())
		}

		// Return only if we are unable to extract a message text
		const messageText = this.getMessageText(message)
		if (!messageText || typeof messageText !== 'string') {
			return () => {/* empty */ }
		}

		// Show message
		return this.doShowMessage(message, messageText, severity, onHide)
	}

	private getMessageText(message: any): string {
		if (types.isString(message)) {
			return message
		}

		if (message instanceof Error) {
			//return toErrorMessage(message, false)
			console.log(message.message)
		}

		if ((<IMessageWithAction>message).message) {
			return (<IMessageWithAction>message).message
		}

		return null
	}

	private doShowMessage(id: string, message: string, severity: ESeverity, onHide: () => void): () => void;
	private doShowMessage(id: Error, message: string, severity: ESeverity, onHide: () => void): () => void;
	private doShowMessage(id: IMessageWithAction, message: string, severity: ESeverity, onHide: () => void): () => void;
	private doShowMessage(id: any, message: string, severity: ESeverity, onHide: () => void): () => void {

		// Trigger Auto-Purge of messages to keep list small
		this.purgeMessages()

		// Store in Memory (new messages come first so that they show up on top)
		this.messages.unshift({
			id: id,
			text: message,
			severity: severity,
			time: Date.now(),
			actions: (<IMessageWithAction>id).actions,
			onHide
		})

		// Render
		this.renderMessages(true, 1)

		// Support in Screen Readers too
		let alertText: string
		if (severity === ESeverity.Error) {
			//alertText = nls.localize('alertErrorMessage', "Error: {0}", message)
			alertText = message
		} else if (severity === ESeverity.Warning) {
			//alertText = nls.localize('alertWarningMessage', "Warning: {0}", message)
			alertText = message
		} else {
			//alertText = nls.localize('alertInfoMessage', "Info: {0}", message)
			alertText = message
		}

		aria.alert(alertText)

		return () => this.hideMessage(id)
	}

	private renderMessages(animate: boolean, delta: number): void {
		const container = $(this.container)
		// Lazily create, otherwise clear old
		if (!this.messageListContainer) {
			this.messageListContainer = $('.global-message-list').appendTo(container)
		} else {
			$(this.messageListContainer).empty()
			$(this.messageListContainer).removeClass('transition')
		}

		// Support animation for messages by moving the container out of view and then in
		if (animate) {
			$(this.messageListContainer).style('top', '-35px')
		}

		// Render Messages as List Items
		$(this.messageListContainer).ul({ 'class': 'message-list' }, ul => {
			const messages = this.prepareMessages()
			if (messages.length > 0) {
				this._onMessagesShowing.fire()
			} else {
				this._onMessagesCleared.fire()
			}

			messages.forEach((message: IMessageEntry, index: number) => {
				this.renderMessage(message, $(ul), messages.length, delta)
			})

			// Support animation for messages by moving the container out of view and then in
			if (animate) {
				setTimeout(() => {
					this.positionMessageList()
					$(this.messageListContainer).addClass('transition')
				}, 50 /* Need this delay to reliably get the animation on some browsers */)
			}
		})
	}

	private positionMessageList(animate?: boolean): void {
		if (!this.messageListContainer) {
			return // not yet created
		}

		$(this.messageListContainer).removeClass('transition') // disable any animations

		let position = 0
		if (!browser.isFullscreen() && DOM.hasClass(this.container, 'titlebar-style-custom')) {
			position = 22 / browser.getZoomFactor() // adjust the position based on title bar size and zoom factor
		}

		$(this.messageListContainer).style('top', `${position}px`)
	}

	private renderMessage(message: IMessageEntry, container: Builder, total: number, delta: number): void {
		container.li({ class: 'message-list-entry message-list-entry-with-action' }, (li) => {

			// Actions (if none provided, add one default action to hide message)
			const messageActions = this.getMessageActions(message)
			li.div({ class: 'actions-container' }, actionContainer => {
				for (let i = 0; i < messageActions.length; i++) {
					const action = messageActions[i]
					actionContainer.div({ class: 'message-action' }, div => {
						div.a({ class: 'action-button', tabindex: '0', role: 'button' }).text(action.label).on([DOM.EventType.CLICK, DOM.EventType.KEY_DOWN], e => {
							if (e instanceof KeyboardEvent) {
								if (!(e.key == 'Enter') && !(e.key == 'Space')) {
									return
								}
							}

							DOM.EventHelper.stop(e, true)

							if (this.usageLogger) {
								this.usageLogger.publicLog('workbenchActionExecuted', { id: action.id, from: 'message' })
							}

							(action.run() || Promise.resolve(null))
								.then(null, error => this.showMessage(ESeverity.Error, (error as Error)))
								.then(r => {
									if (typeof r === 'boolean' && r === false) {
										return
									}

									this.hideMessage(message.text) // hide all matching the text since there may be duplicates
								})
						})
					})
				}
			})

			// Text
			const text = message.text.substr(0, this.options.maxMessageLength)
			li.div({ class: 'message-left-side' }, div => {
				div.addClass('message-overflow-ellipsis')

				// Severity indicator
				const sev = message.severity
				const label = (sev === ESeverity.Error) ? 'Error':((sev === ESeverity.Warning)? 'Warning': 'Error')
				$().span({ class: 'message-left-side severity ' + ((sev === ESeverity.Error) ? 'app-error' : (sev === ESeverity.Warning) ? 'app-warning' : 'app-info'), text: label }).appendTo(div)

				// Error message
				const messageContentElement = htmlRenderer.renderHtml({
					tagName: 'span',
					className: 'message-left-side',
					formattedText: text
				})

				$(messageContentElement as HTMLElement).title(messageContentElement.textContent).appendTo(div)
			})
		})
	}

	private getMessageActions(message: IMessageEntry): Action[] {
		let messageActions: Action[]
		if (message.actions && message.actions.length > 0) {
			messageActions = message.actions
		} else {
			messageActions = [
				new Action('close.message.action', /* nls.localize('close', "Close") */'Close', null, true, () => {
					this.hideMessage(message.text) // hide all matching the text since there may be duplicates

					return Promise.resolve(true)
				})
			]
		}

		return messageActions
	}

	private prepareMessages(): IMessageEntry[] {

		// Aggregate Messages by text to reduce their count
		const messages: IMessageEntry[] = []
		const handledMessages: { [message: string]: number; } = {}

		let offset = 0
		for (let i = 0; i < this.messages.length; i++) {
			const message = this.messages[i]
			if (types.isUndefinedOrNull(handledMessages[message.text])) {
				message.count = 1
				messages.push(message)
				handledMessages[message.text] = offset++
			} else {
				messages[handledMessages[message.text]].count++
			}
		}

		if (messages.length > this.options.maxMessages) {
			return messages.splice(messages.length - this.options.maxMessages, messages.length)
		}

		return messages
	}

	private disposeMessages(messages: IMessageEntry[]): void {
		messages.forEach(message => {
			if (message.onHide) {
				message.onHide()
			}

			if (message.actions) {
				message.actions.forEach(action => {
					action.dispose()
				})
			}
		})
	}

	hideMessages(): void {
		this.hideMessage()
	}

	show(): void {
		if (this.messageListContainer && this.messageListContainer.isHidden()) {
			this.messageListContainer.show()
		}
	}

	hide(): void {
		if (this.messageListContainer && !this.messageListContainer.isHidden()) {
			this.messageListContainer.hide()
		}
	}

	private hideMessage(messageText?: string): void;
	private hideMessage(messageObj?: any): void {
		let messageFound = false

		for (let i = 0; i < this.messages.length; i++) {
			const message = this.messages[i]
			let hide = false

			// Hide specific message
			if (messageObj) {
				hide = ((types.isString(messageObj) && message.text === messageObj) || message.id === messageObj)
			}

			// Hide all messages
			else {
				hide = true
			}

			if (hide) {
				this.disposeMessages(this.messages.splice(i, 1))
				i--
				messageFound = true
			}
		}

		if (messageFound) {
			this.renderMessages(false, -1)
		}
	}

	private purgeMessages(): void {

		// Cancel previous
		if (this.messageListPurger) {
			this.messageListPurger.cancel()
		}

		// Configure
		//this.messageListPurger = new DPromise(this.options.purgeInterval)
		this.messageListPurger = Promise.delay(this.options.purgeInterval)
		.then(() => {
			let needsUpdate = false
			let counter = 0

			for (let i = 0; i < this.messages.length; i++) {
				const message = this.messages[i]

				// Only purge infos and warnings and only if they are not providing actions
				if (message.severity !== ESeverity.Error && !message.actions) {
					this.disposeMessages(this.messages.splice(i, 1))
					counter--
					i--
					needsUpdate = true
				}
			}

			if (needsUpdate) {
				this.renderMessages(false, counter)
			}

		})

	}
}