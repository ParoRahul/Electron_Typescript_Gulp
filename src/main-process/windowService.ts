'use strict'

import { IParsedArgument } from '../common/node/argumentParser'
import { IEnvironmentService } from '../common/node/environmentService'
import { createDecorator } from '../common/ioc/instantiation'
import { ILogService } from './logService'
import { IStorageService } from './storageService'
import { ISettingsService } from './settingsService'
import { IWindowState, defaultWindowState, AppWindow, IWindowConfiguration } from './window'
import { isEmpty } from '../common/objects'

import { app, BrowserWindow, ipcMain } from 'electron'

export enum EOpenContext {
	CLI,       // opening when running from the command line
	DOCK,      // macOS only: opening from the dock (also when opening files to a running instance from desktop)
	MENU,      // opening from the main application window
	DIALOG,    // opening from a file or folder dialog
	DESKTOP,   // opening from the OS's UI
	API        // opening through the API
}

export interface IWindowsState {
	openedWindows?: IWindowState[];
	lastActiveWindow: IWindowState;
}

export interface IProcessEnvironment {
	[key: string]: string;
}

export interface IOpenConfiguration {
	context: EOpenContext;
	cli: IParsedArgument;
	userEnv?: IProcessEnvironment;
	forceNewWindow?: boolean;
	forceReuseWindow?: boolean;
}

export interface IWindowsService {
	_serviceBrand: undefined;
	startUp(): Promise<void>
	launchWindows(context: EOpenContext): void;
	open(windowState: IWindowState): AppWindow;
	/* reload(window: AppWindow, cli?: IParsedArgs): void   */
	getwindowCount(): number;
	getWindowById(id: number): AppWindow|undefined;
	getLastActiveWindow(): AppWindow | undefined;
	focusLastActive(cli: IParsedArgument, context: EOpenContext): AppWindow;
	sendToFocused(channel: string, ...args: any[]): void;
	dispose(): Promise<void>;
	setShuttingDown(): void;
	saveWindowsState(): void;
	onAllWindowClose(): Promise<void>;
}

export const DWindowsService = createDecorator<IWindowsService>('WindowsService')

export class WindowsService implements IWindowsService {

	_serviceBrand: undefined;

	private static windowsStateKey = 'windowsState';

	private static WINDOWS: AppWindow[] = [];

	private windowsState: IWindowsState| null;

	//private initialUserEnv: IProcessEnvironment;

	private isShuttingDown = false;

	private windowCountChange = Symbol.for('WindowCountChange');

	constructor(private readonly logService: ILogService,
				private readonly environment: IEnvironmentService ,
				private readonly storageService: IStorageService ,
				private readonly settingsService: ISettingsService )
	{
			this._registerEventListeners()
			this.windowsState = null
			this.logService.log('WindowsService Instantiate')
	}

	async startUp(): Promise<void> {
		this.retriveWindowsState().then((state)=>{
			this.windowsState = state
			this.logService.log('WindowsService retriveWindowsState done')
		}).then(() =>{
			this.launchWindows(EOpenContext.DESKTOP)
			this.logService.log('WindowsService launchWindows done')
		})
	}

	private async retriveWindowsState(): Promise<IWindowsState>{
		let windowsState:IWindowsState = this.storageService.getItem(WindowsService.windowsStateKey,{})
		if (isEmpty(windowsState)){
				windowsState = Object.create({
					lastActiveWindow : defaultWindowState()
				})
				return windowsState
		} else if (!windowsState?.lastActiveWindow){
				windowsState.lastActiveWindow = defaultWindowState()
				return windowsState
		} else {
				return windowsState
		}
	}

	private _registerEventListeners() {
		app.on('browser-window-blur', () => {
			if (!this.isShuttingDown) {
				this.saveWindowsState()
			}
		})

		ipcMain.on('myapp:reloadWindow', (event: Electron.IpcMainEvent, windowId: number) => {
			this.logService.log('IPC#myapp:reloadWindow')
			const appwindow = this.getWindowById(windowId)
			if (appwindow) {
				//this.reload(appwindow);
				appwindow.reload()
			}
		})

		ipcMain.on('myapp:toggleDevTools', (event: Electron.IpcMainEvent, windowId: number) => {
			this.logService.log('IPC#myapp:toggleDevTools')
			const appwindow = this.getWindowById(windowId)
			if (appwindow) {
				appwindow.toggleDevTools()
			}
		})

    }

    launchWindows(context: EOpenContext): void {
		this.logService.log('WindowsService launchWindows ')
		this.open(this.windowsState!.lastActiveWindow)
    }

    open(windowState: IWindowState): AppWindow{
		const appWindow = new AppWindow(
			windowState,
			this.logService,
			this.environment,
			this.settingsService,
		)

		WindowsService.WINDOWS.push(appWindow)
		appWindow.window.once('close', (event: Electron.Event)=>{
			appWindow.updateWindowState()
			this.logService.log('Closeing AppWindow ...')
		})

		appWindow.window.once('closed', (event: Electron.Event)=>{
			if (this.getwindowCount() == 0){
				return
			}
			this.saveWindowsState()
			appWindow.dispose().then(()=>{
				const index = WindowsService.WINDOWS.indexOf(appWindow)
				WindowsService.WINDOWS.splice(index, 1)
				this.logService.log('AppWindow removed from Array')
			})
		})
		const option: IWindowConfiguration = {
			mainPid: process.pid,
			appRoot: this.environment.appRoot,
		}
		appWindow.load(option)
		return appWindow
	}

	/* public reload(window: AppWindow, cli?: IParsedArgs): void {
		this.lifeCycle.unload(window, UnloadReason.RELOAD).
		then(resolvedstatus => {
			if (!resolvedstatus) {
				window.reload();
			}
		});
	} */

	saveWindowsState(): void {
		const currentWindowsState: IWindowsState = {
			openedWindows: [],
			lastActiveWindow: defaultWindowState()
		}
		const lastActiveWindow = this.getFocusedWindow()||this.getLastActiveWindow()
		if (lastActiveWindow){
			currentWindowsState.lastActiveWindow = lastActiveWindow.getWindowState()
		}
		if (this.getwindowCount() > 1) {
			currentWindowsState.openedWindows = WindowsService.WINDOWS.map(window => window.getWindowState())
		}
		this.storageService.setItem(WindowsService.windowsStateKey, currentWindowsState)

		if (this.isShuttingDown) {
			this.logService.log('onBeforeShutdown', currentWindowsState)
		}
	}

	setShuttingDown(): void {
		this.isShuttingDown = true
	}

	private getFocusedWindow(): AppWindow | undefined {
		const window = BrowserWindow.getFocusedWindow()
		if (window) {
			return this.getWindowById(window.id)
		}
		return undefined
	}

	focusLastActive(cli: IParsedArgument, context: EOpenContext): AppWindow{
		const lastActive = this.getLastActiveWindow()
		if (lastActive) {
			lastActive.focus()
			return lastActive
		}
		return this.open(defaultWindowState())
	}

	getLastActiveWindow(): AppWindow | undefined {
		const dateList: number[]=[]
		WindowsService.WINDOWS.forEach( window => dateList.push(window.lastFocusTime))
		if (dateList.length > 0) {
			const lastFocusedDate = Math.max(...dateList)
			return WindowsService.WINDOWS.find(window => window.lastFocusTime === lastFocusedDate)
		} else {
			return
		}
	}

	sendToFocused(channel: string, ...args: any[]): void {
		const focusedWindow = this.getFocusedWindow() || this.getLastActiveWindow()
		if (focusedWindow) {
			focusedWindow.sendWhenReady(channel, ...args)
		}
	}

	getWindowById(windowId: number): AppWindow | undefined {
		const filteredList = WindowsService.WINDOWS.filter(window => window.id === windowId)
		if (filteredList.length > 0 ){
			return filteredList[0]
		} else {
			return
		}
	}

	getwindowCount(): number  {
		return WindowsService.WINDOWS.length
	}

	onAllWindowClose(): Promise<void> {
		return new Promise((resolve,rejected) => {
			if (this.getwindowCount() == 0 ){
				resolve()
			}
			this.isShuttingDown = true
			this.saveWindowsState()
			const windowIdList: number[] = WindowsService.WINDOWS.map(appWindow=> appWindow.id)
			windowIdList.forEach(windowId => {
				const appWindow = this.getWindowById(windowId)
				appWindow!.dispose().then(()=>{
					const index = WindowsService.WINDOWS.indexOf(appWindow!)
					WindowsService.WINDOWS.splice(index, 1)

				})
			})
			this.logService.log('App Window Dispose Done')
			resolve()
		})
	}

	dispose(): Promise<void> {
		return new Promise((resolve,rejected) => {
			ipcMain.removeAllListeners('myapp:reloadWindow')
			ipcMain.removeAllListeners('myapp:toggleDevTools')
			this.logService.log('Windows Service Dispose')
			resolve()
		})
	}

}