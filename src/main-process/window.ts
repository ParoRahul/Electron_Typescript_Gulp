'use strict'

import * as path from 'path'
import * as url from 'url'

import { IEnvironmentService } from '../common/node/environmentService'
import * as objects from '../common/objects'
/* import { CPromise } from '../common/promise' */
import { Promise } from 'bluebird'

import { ILogService } from './logService'
import { ISettingsService, TMenuBarVisibility } from './settingsService'
import { product } from './product'
import { IWindowConfiguration } from './windowConfig'
import { BrowserWindow, screen, nativeTheme, Rectangle, dialog,nativeImage  } from 'electron'


export interface IValueCallback<T> {
	(value: T): void;
}

export enum EWindowMode {
	Maximized,
	Normal,
	Minimized,
	Fullscreen
}

enum EWindowError {
	UNRESPONSIVE,
	CRASHED
}

export interface IWindowState {
	width: number;
	height: number;
	x: number;
	y: number;
	mode: EWindowMode;
}

export const defaultWindowState = function (mode:EWindowMode =  EWindowMode.Normal): IWindowState {
	return {
		width: 1024,
		height: 768,
		x: 4,
		y: 4,
		mode: mode
	}
}

export enum EReadyState {
	NONE, // This window has not loaded any HTML yet
	LOADING, //This window is loading HTML
	NAVIGATING, //This window is navigating to another HTML
	READY //This window is done loading HTML
}


export interface IAppWindow {
	id: number;
	EReadyState: EReadyState;
	window: BrowserWindow;
	getWindowState(): IWindowState
	send(channel: string, ...args: any[]): void;
	focus(): void;
	load(windowConfig: IWindowConfiguration): void
	toggleDevTools(): void
}

export class AppWindow  implements IAppWindow {

	/* public static readonly windowDestroyed = Symbol.for('windowDestroyed');

	public static readonly windowClosed = Symbol.for('windowClosed'); */

	private static windowsSettingsKey = 'windowSettings';

	private static MIN_WIDTH = 200;

	private static MIN_HEIGHT = 120;

	private showTimeoutHandle: NodeJS.Timeout | undefined;

	private _id: number;

	private _window: Electron.BrowserWindow;

	private _lastFocusTime: number;

	private _EReadyState: EReadyState;

	private windowState: IWindowState;

	private currentMenuBarVisibility: TMenuBarVisibility;

	private whenReadyCallbacks: IValueCallback<IAppWindow>[];

	private currentLoadConfig: IWindowConfiguration| null;

	constructor(
				private config: IWindowState,
				private logService: ILogService,
        private environment: IEnvironmentService ,
				private settings: ISettingsService ) {
		// super();
		this._lastFocusTime = -1
		this._EReadyState = EReadyState.NONE
		this.whenReadyCallbacks = []
		this.currentLoadConfig = null
		this.windowState = this.restoreWindowState(this.config)

		const isFullscreenOrMaximized =
			(this.windowState.mode === EWindowMode.Maximized || this.windowState.mode === EWindowMode.Fullscreen)
		const options: Electron.BrowserWindowConstructorOptions = {
			width: this.windowState.width,
			height: this.windowState.height,
			x: this.windowState.x,
			y: this.windowState.y,
			minWidth: AppWindow.MIN_WIDTH,
			minHeight: AppWindow.MIN_HEIGHT,
			show: !isFullscreenOrMaximized,
			title: product.nameLong,
			webPreferences: {
				devTools: this.environment.isDevelopment,
				nodeIntegration: true,
				nodeIntegrationInWorker: false,
			}
		}
		if (this.environment.isLinux) {
			const iconurl:string = 	url.pathToFileURL(
														path.join(this.environment.appRoot, 'resources/linux/icon.png')).toString()
			options.icon = nativeImage.createFromDataURL(iconurl)
		} else if (this.environment.isWindows ) {
			const iconurl:string = 	url.pathToFileURL(
														path.join(this.environment.appRoot, 'resources/win32/icon.ico')).toString()
			options.icon = nativeImage.createFromDataURL(iconurl)
		}

		options.backgroundColor = this.settings.getBackGroundColor

		options.fullscreenable = this.settings.nativeFullScreen

		const titleBarStyle = this.settings.titleBarStyle

		if (titleBarStyle == 'custom'){
			options.titleBarStyle = 'hidden'
			if (!this.environment.isMacintosh) {
				options.frame = false
			}
		} else {
			options.titleBarStyle = 'default'
		}

		this._window = new BrowserWindow(options)
		this._id = this._window.id
		if (isFullscreenOrMaximized) {
			this._window.maximize()
			if (this.windowState.mode === EWindowMode.Fullscreen) {
				this._window.setFullScreen(true)
			}
			if (!this._window.isVisible()) {
				this._window.show()
			}
		}
		this._lastFocusTime = Date.now()
		this.currentMenuBarVisibility = this.settings.menuBarVisibility
		this.setMenuBarVisibility(this.currentMenuBarVisibility,true)
		this.registerEventListeners()
	}

	get windowId(): number { return this._id}

	private restoreWindowState(state?: IWindowState): IWindowState {
		//const hasMultipleDisplays = false
		if (state) {
			try {
				const validaState = this.validateWindowState(state)
				if (validaState){ state = validaState }
			} catch (err) {
				this.logService.warn(`Unexpected error validating window state: ${err}\n${err.stack}`)
			}
		}
		if (!state) {
			state = defaultWindowState()
		}
		return state
	}

	private validateWindowState(state: IWindowState): IWindowState| null {
		if (!state) {
			return null
		}
		if ([state.x, state.y, state.width, state.height].some(n => typeof n !== 'number')) {
			return null
		}
		if (state.width <= 0 || state.height <= 0) {
			return null
		}
		const displays = screen.getAllDisplays()
		if (displays.length === 1) {
			const displayBounds = displays[0].bounds
			if (state.mode !== EWindowMode.Maximized && displayBounds.width > 0 && displayBounds.height > 0 ) {
				if (state.x < displayBounds.x) {
					state.x = displayBounds.x // prevent window from falling out of the screen to the left
				}
				if (state.y < displayBounds.y) {
					state.y = displayBounds.y // prevent window from falling out of the screen to the top
				}
				if (state.x > (displayBounds.x + displayBounds.width)) {
					state.x = displayBounds.x // prevent window from falling out of the screen to the right
				}
				if (state.y > (displayBounds.y + displayBounds.height)) {
					state.y = displayBounds.y // prevent window from falling out of the screen to the bottom
				}
				if (state.width > displayBounds.width) {
					state.width = displayBounds.width // prevent window from exceeding display bounds width
				}
				if (state.height > displayBounds.height) {
					state.height = displayBounds.height // prevent window from exceeding display bounds height
				}
			}
			if (state.mode === EWindowMode.Maximized) {
				return defaultWindowState(EWindowMode.Maximized) // when maximized, make sure we have good values when the user restores the window
			}
			return state
		}
		// Multi Monitor: be less strict because metrics can be crazy
		const bounds = { x: state.x, y: state.y, width: state.width, height: state.height }
		const display = screen.getDisplayMatching(bounds)
		if (display && display.bounds.x + display.bounds.width > bounds.x &&
			display.bounds.y + display.bounds.height > bounds.y) {
			if (state.mode === EWindowMode.Maximized) {
				const defaults = defaultWindowState(EWindowMode.Maximized) // when maximized, make sure we have good values when the user restores the window
				defaults.x = state.x // carefull to keep x/y position so that the window ends up on the correct monitor
				defaults.y = state.y

				return defaults
			}
			return state
		}
		return null
	}

	private setMenuBarVisibility(visibility: TMenuBarVisibility, notify = true): void {
		if (this.environment.isMacintosh) {
			return
		}
		let isFullscreen: boolean
		switch (visibility) {
			case ('default'):
				isFullscreen = this.window.isFullScreen()
				this.window.setMenuBarVisibility(!isFullscreen)
				this.window.setAutoHideMenuBar(isFullscreen)
				break

			case ('visible'):
				this.window.setMenuBarVisibility(true)
				this.window.setAutoHideMenuBar(false)
				break

			case ('toggle'):
				this.window.setMenuBarVisibility(false)
				this.window.setAutoHideMenuBar(true)

				if (notify) {
					this.send('myApp:showInfoMessage','You can still access the menu bar by pressing the **Alt** key.')
				}
				break
			case ('hidden'):
				setTimeout(() => {
					this.window.setMenuBarVisibility(false)
					this.window.setAutoHideMenuBar(false)
				})
				break
		}
	}

	private registerEventListeners(){
		this._window.webContents.on('crashed', () => this.onWindowError(EWindowError.CRASHED))

		this._window.on('unresponsive', () => this.onWindowError(EWindowError.UNRESPONSIVE))

		/* this._window.on('closed', () => {
			this.emit(AppWindow.windowClosed);
			this.dispose();
		}); */

		this._window.webContents.on('did-finish-load', () => {
			this._EReadyState = EReadyState.LOADING
			if (!this._window.isVisible()) {
				if (this.windowState.mode === EWindowMode.Maximized) {
					this._window.maximize()
				}
				this._window.show()
			}
			this.logService.log('Windows url did-finish-load ')
		})

		this._window.on('focus', () => {
			this._lastFocusTime = Date.now()
			this.updateWindowState()
		})

		this._window.on('maximize', (e: Event) => {
			this.updateWindowState()
			//app.emit('browser-window-maximize', e, this._window);
			//console.log(`this.windowState.mode ${this.windowState.mode} `)
		})

		this._window.on('unmaximize', (e: Event) => {
			this.updateWindowState()
			//app.emit('browser-window-unmaximize', e, this._window);
			//console.log(`this.windowState.mode ${this.windowState.mode} `)
		})

		this.window.on('enter-full-screen', () => {
			this.sendWhenReady('myapp:enterFullScreen')
		})

		this._window.on('leave-full-screen', () => {
			this.sendWhenReady('myapp:leaveFullScreen')
		})

		this._window.on('move', (e: Event) => {
			this.updateWindowState()
		})

		this._window.on('resize', (e: Event) => {
			this.updateWindowState()
		})

		this._window.on('restore', (e: Event) => {
			this.updateWindowState()
		})

		if (this.environment.isWindows) {
			nativeTheme.on('updated', () => {
				if (nativeTheme.shouldUseInvertedColorScheme) {
					this.sendWhenReady('vscode:enterHighContrast')
				} else {
					this.sendWhenReady('vscode:leaveHighContrast')
				}
			})
		}

		/* this._window.webContents.on('did-fail-load', (event: Event, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean) => {
			this.logService.warn('[electron event]: fail to load, ', errorDescription);
		});

		this._window.webContents.on('new-window', (event: Event, url: string) => {
			event.preventDefault();
		}); */
	}

	private onWindowError(error: EWindowError): void {
		const options: Electron.MessageBoxOptions = {
			title: product.nameLong,
			type: 'warning',
			buttons: ['Reopen','Keep Waiting', 'close'],
			message: 'The window is no longer responding',
			detail: 'You can reopen or close the window or keep waiting.',
			noLink: true
		}
		if (error === EWindowError.UNRESPONSIVE) {
			this.logService.error('[MyApp]: detected unresponsive')
		}
		else {
			this.logService.error('[MyApp]: render process crashed!')
			options.buttons = ['reopen','close']
			options.message = 'The window has crashed'
			options.detail = 'We are sorry for the inconvenience! You can reopen the window to continue where you left off '
		}
		dialog.showMessageBox(this._window, options).then(result => {
			if (result.response === 0) {
				this.reload()
			} else if (result.response === 2) {
				this.destroyWindow()
			}
		})
	}

	private destroyWindow(): void {
		/* this.emit(AppWindow.windowDestroyed) */
		this.updateWindowState()
		this._window.destroy()
	}

	setReady(): void {
		this._EReadyState = EReadyState.READY
		while (this.whenReadyCallbacks.length) {
			this.whenReadyCallbacks.pop()!(this)
		}
	}

	get isReady() { return this._EReadyState === EReadyState.READY }

	sendWhenReady(channel: string, ...args: any[]): void {
		if (this.isReady) {
			this.send(channel, ...args)
		} else {
			this.ready().then(() => {this.send(channel, ...args)})
		}
	}

	toggleDevTools(): void {
		this._window.webContents.toggleDevTools()
	}

	get id():number { return this._id }

	get EReadyState(): EReadyState { return this._EReadyState }

	get lastFocusTime() { return this._lastFocusTime }

	get window() { return this._window }

	send(channel: string, ...args: any[]): void {
		this._window.webContents.send(channel, ...args)
	}

	ready(): Promise<AppWindow> {
		return new Promise<AppWindow>((resolve, reject) => {
			try {
				if (this.isReady) {
					return resolve(this)
				}
				this.whenReadyCallbacks.push(resolve as IValueCallback<IAppWindow>)
			} catch( e: unknown ){
				reject(e)
			}
		})
	}

	focus(): void {
		if (!this._window) {
			return
		}
		if (this._window.isMinimized()) {
			this._window.restore()
		}
		this._window.focus()
	}

	toggleFullScreen(): void {
		const willBeFullScreen = !this._window.isFullScreen()
		// set fullscreen flag on window
		this._window.setFullScreen(willBeFullScreen)
		// respect configured menu bar visibility or default to toggle if not set
		this.setMenuBarVisibility(this.currentMenuBarVisibility, false)
	}

	load(windowConfig: IWindowConfiguration): void {
		if (this.EReadyState === EReadyState.NONE) {
			this.logService.log('Loaing primary Url')
			this.currentLoadConfig = objects.assign({}, windowConfig)
		} else {
			this._EReadyState = EReadyState.NAVIGATING
		}

		const windowSettings = this.settings.settings
		windowConfig.windowId = this._window.id
		const zoomLevel = windowSettings?.zoomLevel
		if (typeof zoomLevel === 'number') {
			windowConfig.zoomLevel = zoomLevel
		}
		windowConfig.fullscreen = this._window.isFullScreen()
		let autoDetectHighContrast = true
		if (windowSettings?.autoDetectHighContrast === false) {
			autoDetectHighContrast = false
		}
		windowConfig.highContrast = this.environment.isWindows && autoDetectHighContrast && nativeTheme.shouldUseInvertedColorScheme
		windowConfig.maximized = this._window.isMaximized()

		const config = objects.assign({}, windowConfig)
		for (const key in config) {
			if (!config[key]) {
				delete config[key]
			}
		}
		const htmlPath = path.resolve(this.environment.appRoot,'renderer-process','index.html')
		let htmlurl = url.pathToFileURL(htmlPath).toString()
		htmlurl =`${htmlurl}?config=${encodeURIComponent(JSON.stringify(config))}`
		this.logService.log(config)
		this._window.webContents.openDevTools()
		this._window.loadURL(htmlurl)
		if (!this.environment.isBuilt){
			this.showTimeoutHandle = setTimeout(
			() => {
					if (this._window && !this._window.isVisible() && !this._window.isMinimized()) {
						this._window.show()
						this._window.focus()
						this._window.webContents.openDevTools()
					}
			}, 10000)
		}

	}

	reload(): void {
		this.load(this.currentLoadConfig!)
	}

	updateWindowState(): void {
		let bounds: Rectangle
		if (this._window.isFullScreen()){
			this.windowState.mode = EWindowMode.Fullscreen
			bounds = this.getBounds()
		} else if (this._window.isMaximized()){
			this.windowState.mode = EWindowMode.Maximized
			bounds = this.getBounds()
		} else if (this._window.isMinimized()){
			this.windowState.mode = EWindowMode.Minimized
			bounds = this.getBounds()
		} else {
			this.windowState.mode = EWindowMode.Normal
			bounds = this._window.getNormalBounds()
		}
		this.windowState.x = bounds.x
		this.windowState.y = bounds.y
		this.windowState.width = bounds.width
		this.windowState.height = bounds.height
	}

	private getBounds(): Rectangle {
		const pos = this._window.getPosition()
		const dimension = this._window.getSize()
		return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] }
	}

	getWindowState(): IWindowState{
		return Object.assign({}, this.windowState)
	}

	dispose(): Promise<void> {
		return new Promise((resolve, reject)=> {
			if (this.showTimeoutHandle) {
				clearTimeout(this.showTimeoutHandle)
			}
			/* this.removeAllListeners(AppWindow.windowClosed);
			this.removeAllListeners(AppWindow.windowDestroyed); */
			this._window.destroy()
			this.logService.log('AppWindow Dispose')
			resolve()
		})
	}

}