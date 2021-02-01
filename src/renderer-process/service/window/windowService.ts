/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { ElectronWindow } from './window'
import { createDecorator } from '../../../common/ioc/instantiation'
import { IEvent, Emitter } from '../../base/event'

import {ipcRenderer as ipc} from 'electron'

//const windowId = remote.getCurrentWindow().id

export const DWindowIPCService = createDecorator<IWindowIPCService>('windowService')

export interface IWindowServices {
	_serviceBrand: undefined;
	windowService?: IWindowIPCService;
}

export interface IBroadcast {
	channel: string;
	payload: any;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IWindowIPCService {
	_serviceBrand: any;

	getWindowId(): number;

	getWindow(): ElectronWindow;

	registerWindow(win: ElectronWindow): void;

	broadcast(b: IBroadcast, target?: string): void;

	onBroadcast: IEvent<IBroadcast>;
}

export class WindowService implements IWindowIPCService {
	_serviceBrand: any;

	private win: ElectronWindow;

	private _onBroadcast: Emitter<IBroadcast>;

	constructor(private readonly windowId: number) {
		this._onBroadcast = new Emitter<IBroadcast>()
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