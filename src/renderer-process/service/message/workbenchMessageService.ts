/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as errors from '../../../common/errors'
import * as types  from '../../../common/types'
import { MessageList, ESeverity as BaseSeverity } from '../../base/messagelist/messageList'
import { IDisposable } from '../../../common/disposable'
import { IEvent } from '../../base/event'
import { IMessageService, IMessageWithAction, IConfirmation, ESeverity } from './message'



interface IBufferedMessage {
	severity: ESeverity;
	message: any;
	onHide: () => void;
	disposeFn: () => void;
}

export class WorkbenchMessageService implements IMessageService {

	_serviceBrand: any;

	private handler: MessageList;
	private disposeables: IDisposable[];

	private canShowMessages: boolean;
	private messageBuffer: IBufferedMessage[];

	constructor(
		container: HTMLElement,
	) {
		this.handler = new MessageList(container)

		this.messageBuffer = []
		this.canShowMessages = true
		this.disposeables = []
	}

	get onMessagesShowing(): IEvent<void> {
		return this.handler.onMessagesShowing
	}

	get onMessagesCleared(): IEvent<void> {
		return this.handler.onMessagesCleared
	}

	suspend(): void {
		this.canShowMessages = false
		this.handler.hide()
	}

	resume(): void {
		this.canShowMessages = true
		this.handler.show()

		// Release messages from buffer
		while (this.messageBuffer.length) {
			const bufferedMessage = this.messageBuffer.pop()
			bufferedMessage.disposeFn = this.show(bufferedMessage.severity, bufferedMessage.message, bufferedMessage.onHide)
		}
	}

	private toBaseSeverity(severity: ESeverity): BaseSeverity {
		switch (severity) {
			case ESeverity.Info:
				return BaseSeverity.Info

			case ESeverity.Warning:
				return BaseSeverity.Warning
		}

		return BaseSeverity.Error
	}

	show(sev: ESeverity, message: string, onHide?: () => void): () => void;
	show(sev: ESeverity, message: Error, onHide?: () => void): () => void;
	show(sev: ESeverity, message: string[], onHide?: () => void): () => void;
	show(sev: ESeverity, message: Error[], onHide?: () => void): () => void;
	show(sev: ESeverity, message: IMessageWithAction, onHide?: () => void): () => void;
	show(sev: ESeverity, message: any, onHide?: () => void): () => void {
		if (!message) {
			return () => void 0 // guard against undefined messages
		}

		if (Array.isArray(message)) {
			const closeFns: Function[] = []
			message.forEach((msg: any) => closeFns.push(this.show(sev, msg, onHide)))

			return () => closeFns.forEach((fn) => fn())
		}

		if (errors.isPromiseCanceledError(message)) {
			return () => void 0 // this kind of error should not be shown
		}

		if (types.isNumber(message.severity)) {
			sev = message.severity
		}

		return this.doShow(sev, message, onHide)
	}

	private doShow(sev: ESeverity, message: any, onHide?: () => void): () => void {

		// Check flag if we can show a message now
		if (!this.canShowMessages) {
			const messageObj: IBufferedMessage = {
				severity: sev,
				message,
				onHide,
				disposeFn: () => this.messageBuffer.splice(this.messageBuffer.indexOf(messageObj), 1)
			}
			this.messageBuffer.push(messageObj)

			// Return function that allows to remove message from buffer
			return () => messageObj.disposeFn()
		}

		// Show in Console
		if (sev === ESeverity.Error) {
			console.error(message)
		}

		// Show in Global Handler
		return this.handler.showMessage(this.toBaseSeverity(sev), message, onHide)
	}

	hideAll(): void {
		if (this.handler) {
			this.handler.hideMessages()
		}
	}

	confirm(confirmation: IConfirmation): boolean {
		let messageText = confirmation.message
		if (confirmation.detail) {
			messageText = messageText + '\n\n' + confirmation.detail
		}

		return window.confirm(messageText)
	}

	dispose(): void {
		while (this.disposeables.length) {
			this.disposeables.pop().dispose()
		}
	}
}