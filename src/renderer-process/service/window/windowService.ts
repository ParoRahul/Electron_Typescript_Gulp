/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { ElectronWindow } from './window'
import { createDecorator } from '../../../common/ioc/instantiation'
import { IEvent, Emitter } from '../../base/event'

import {ipcRenderer as ipc, remote} from 'electron'

const windowId = remote.getCurrentWindow().id

export const DWindowService = createDecorator<IWindowService>('windowService')

export interface IWindowServices {
	_serviceBrand: undefined;
	windowService?: IWindowService;
}

export interface IBroadcast {
	channel: string;
	payload: any;
}

export interface IWindowService {
	_serviceBrand: any;

	getWindowId(): number;

	getWindow(): ElectronWindow;

	registerWindow(win: ElectronWindow): void;

	broadcast(b: IBroadcast, target?: string): void;

	onBroadcast: IEvent<IBroadcast>;
}

export class WindowService implements IWindowService {
	_serviceBrand: any;

	private win: ElectronWindow;
	private windowId: number;
	private _onBroadcast: Emitter<IBroadcast>;

	constructor() {
		this._onBroadcast = new Emitter<IBroadcast>()
		this.windowId = windowId

		this.registerListeners()
	}

	private registerListeners(): void {
		ipc.on('vscode:broadcast', (event, b: IBroadcast) => {
			this._onBroadcast.fire(b)
		})
	}

	get onBroadcast(): IEvent<IBroadcast> {
		return this._onBroadcast.event
	}

	getWindowId(): number {
		return this.windowId
	}

	getWindow(): ElectronWindow {
		return this.win
	}

	registerWindow(win: ElectronWindow): void {
		this.win = win
	}

	broadcast(b: IBroadcast, target?: string): void {
		ipc.send('vscode:broadcast', this.getWindowId(), target, {
			channel: b.channel,
			payload: b.payload
		})
	}
}