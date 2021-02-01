
'use strict'

import { IWindowService, DWindowService } from '../window/windowService'
import { product } from '../../../main-process/product'
/* import { CPromise } from '../../../common/promise' */
import { WorkbenchMessageService } from './workbenchMessageService'
import { IConfirmation, ESeverity, IChoiceService } from './message'
import { isWindows, isLinux } from '../../../common/node/platform'
import { Action } from '../../base/action'

import { Promise } from 'bluebird'

export class MessageService extends WorkbenchMessageService implements IChoiceService {

	constructor(
		container: HTMLElement,
		@DWindowService private windowService: IWindowService,
	) {
		super(container)
	}

	confirm(confirmation: IConfirmation): boolean {
		if (!confirmation.primaryButton) {
			//confirmation.primaryButton = nls.localize({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes")
			confirmation.primaryButton = "&&Yes"
		}
		if (!confirmation.secondaryButton) {
			confirmation.secondaryButton = "Cancel"
		}

		const opts: Electron.MessageBoxOptions = {
			title: confirmation.title,
			message: confirmation.message,
			buttons: [confirmation.primaryButton, confirmation.secondaryButton],
			defaultId: 0,
			cancelId: 1
		}

		if (confirmation.detail) {
			opts.detail = confirmation.detail
		}

		if (confirmation.type) {
			opts.type = confirmation.type
		}

		const result = this.showMessageBox(opts)

		return result === 0 ? true : false
	}

	choose(severity: ESeverity, message: string, options: string[], modal: boolean = false): Promise<number> {
		if (modal) {
			const type: 'none' | 'info' | 'error' | 'question' | 'warning' =
					severity === ESeverity.Info ? 'question' :
					severity === ESeverity.Error ? 'error' : severity === ESeverity.Warning ? 'warning' : 'none'
			return Promise.resolve(this.showMessageBox({ message, buttons: options, type }))
		}

		const promise = new Promise<number>((resolve,reject,onCancel)=> {
			const callback = (index: number) => () => {
				resolve(index)
				return Promise.resolve(true)
			}
			const actions = options.map((option, index) => new Action('?', option, '', true, callback(index)))
			onCancel = () => this.show(severity, { message, actions }, () => promise.cancel())
		})

		return promise
	}

	private showMessageBox(opts: Electron.MessageBoxOptions): number {
		opts.buttons = opts.buttons.map(button => this.mnemonicLabel(button))
		opts.buttons = isLinux ? opts.buttons.reverse() : opts.buttons

		if (opts.defaultId !== void 0) {
			opts.defaultId = isLinux ? opts.buttons.length - opts.defaultId - 1 : opts.defaultId
		}

		if (opts.cancelId !== void 0) {
			opts.cancelId = isLinux ? opts.buttons.length - opts.cancelId - 1 : opts.cancelId
		}

		opts.noLink = true
		opts.title = opts.title || product.nameLong

		const result = this.windowService.getWindow().showMessageBox(opts)
		return isLinux ? opts.buttons.length - result - 1 : result
	}

	private mnemonicLabel(label: string): string {
		if (!isWindows) {
			return label.replace(/\(&&\w\)|&&/g, '') // no mnemonic support on mac/linux
		}

		return label.replace(/&&/g, '&')
	}
}