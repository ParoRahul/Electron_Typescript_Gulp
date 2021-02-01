'use strict'

/* import { CPromise } from '../../../common/promise' */
import Severity from 'vs/base/common/severity'
import { toErrorMessage } from 'vs/base/common/errorMessage'
import { ILifecycleService, IShutdownEvent, EShutdownReason } from './lifecycle'
import { IMessageService, DMessageService } from '../message/message'
import { IWindowIPCService, DWindowIPCService } from '../window/windowService'
import { ipcRenderer as ipc } from 'electron'
import { IEvent, Emitter } from '../../base/event'

import { Promise } from 'bluebird'

export class LifecycleService implements ILifecycleService {

	_serviceBrand: undefined;

	private _onWillShutdown = new Emitter<IShutdownEvent>();
	private _onShutdown = new Emitter<EShutdownReason>();

	private _willShutdown: boolean;

	constructor(
		@DMessageService private messageService: IMessageService,
		@DWindowIPCService private windowService: IWindowIPCService
	) {
		this.registerListeners()
	}

	get willShutdown(): boolean {
		return this._willShutdown
	}

	get onWillShutdown(): IEvent<IShutdownEvent> {
		return this._onWillShutdown.event
	}

	get onShutdown(): IEvent<EShutdownReason> {
		return this._onShutdown.event
	}

	private registerListeners(): void {
		const windowId = this.windowService.getWindowId()

		// Main side indicates that window is about to unload, check for vetos
		ipc.on('vscode:beforeUnload', (event, reply: { okChannel: string, cancelChannel: string, reason: EShutdownReason }) => {
			this._willShutdown = true

			// trigger onWillShutdown events and veto collecting
			this.onBeforeUnload(reply.reason).then(veto => {
				if (veto) {
					this._willShutdown = false // reset this flag since the shutdown has been vetoed!
					ipc.send(reply.cancelChannel, windowId)
				} else {
					this._onShutdown.fire(reply.reason)
					ipc.send(reply.okChannel, windowId)
				}
			})
		})
	}

	private onBeforeUnload(reason: EShutdownReason): Promise<boolean> {
		const vetos: (boolean | Promise<boolean>)[] = []
		this._onWillShutdown.fire({
			veto(value) {
				vetos.push(value)
			},
			reason
		})
		if (vetos.length === 0) {
			return Promise.resolve(false)
		}
		const promises: Promise<void>[] = []
		let lazyValue = false
		for (const valueOrPromise of vetos) {

			// veto, done
			if (valueOrPromise === true) {
				return Promise.resolve(true)
			}

			if (typeof (valueOrPromise) !=='boolean' ){
				promises.push(valueOrPromise.then(value => {
					if (value) {
						lazyValue = true // veto, done
					}
				}, err => {
					// error, treated like a veto, done
					this.messageService.show(Severity.Error, toErrorMessage(err))
					lazyValue = true
				}))
			}
		}
		return Promise.all(promises).then(() => lazyValue)
	}
}