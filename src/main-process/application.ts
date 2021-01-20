'use strict'

import { ILogService } from './logService'
import { IEnvironmentService } from '../common/node/environmentService'
import { IWindowsService, EOpenContext } from './windowService'
import { IStorageService } from './storageService'
import { ISettingsService } from './settingsService'


import { app, ipcMain } from 'electron'

export interface IApplication {
	startup():void
}

export class Application implements IApplication{

	constructor(private logService: ILogService,
				private environmentService: IEnvironmentService,
				private storageService: IStorageService,
				private settingsService: ISettingsService,
				private windowsService: IWindowsService )
	{
		app.requestSingleInstanceLock()
		this._registerEventListeners()
	}

	private _registerEventListeners(){

			process.on('uncaughtException', (error: Error) => this.onUnexpectedError(error))

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			process.on('unhandledRejection', (reason: Error| any) => this.onUnexpectedError(reason))

			app.on('remote-require', (event) => {
				this.logService.log('App#on(remote-require): prevented')
				event.preventDefault()
			})

			app.on('remote-get-global', (event: Event) => {
				this.logService.log(`App#on(remote-get-global): prevented `)
				event.preventDefault()
			})

			app.on('remote-get-builtin', (event: Event ) => {
				this.logService.log(`App#on(remote-get-builtin): prevented on `)
			})

			app.on('second-instance', (event, commandLine, workingDirectory) => {
				if (app.hasSingleInstanceLock()){
					this.windowsService.focusLastActive(this.environmentService.args, EOpenContext.DESKTOP)
				}
			})

			app.on('activate', (event: Event, hasVisibleWindows: boolean) => {
				this.logService.log('App#activate')
				console.log('active')
				this.windowsService.launchWindows(EOpenContext.DESKTOP)
			})

			app.once('window-all-closed',(event: Electron.Event)=>{
				event.preventDefault()
				this.logService.log('window-all-closed triggered')
				this.windowsService.onAllWindowClose().
				then(()=>
					this.windowsService.dispose()
				).then(
					()=> app.quit()
				)
			})

			app.once('before-quit', (event: Electron.Event)=>{
				event.preventDefault()
							this.dispose().then(() => {
					this.logService.log('calling final app.quit')
					app.removeAllListeners()
					app.quit()
				})
			})

			/* app.once('before-quit', () => {
				this.windowsService.setShuttingDown();
				this.windowsService.saveWindowsState();
			});

			app.once('will-quit', (event: Electron.Event)=>{
				event.preventDefault();
				app.removeAllListeners('before-quit');
							this.dispose().then(() => {
					this.logService.log('calling final app.quit');
					app.quit();
				})
			}); */

			ipcMain.on('myapp:openDevTools', (event: Electron.IpcMainEvent) => event.sender.openDevTools())
	}

	startup() {
		this.logService.log('Application Startup')
		this.storageService.init().then(()=>{
			this.logService.log('Storage Service init ')
			this.settingsService.init()
		}).then (()=>{
			this.logService.log('settingsService  init ')
			this.windowsService.startUp()
		})
		//this.windowsService.launchWindows(OpenContext.DESKTOP);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private onUnexpectedError(error: Error| any ): void
	private onUnexpectedError(error: Error): void {
		if (error) {
			const friendlyError = {
				message: error.message,
				stack: error.stack
			}
			if (this.windowsService) {
				this.windowsService.sendToFocused('MyApp:reportError', JSON.stringify(friendlyError))
			}
		}
		this.logService.error(`[uncaught exception in main]: ${error}`)
		if (error.stack) {
			this.logService.error(error.stack)
		}
	}

	private dispose(): Promise<void>{
		return new Promise((resolve,rejected) => {
			try{
				ipcMain.removeAllListeners('myapp:openDevTools')
				this.logService.log('Disposeing App ')
				resolve()
			} catch (e: unknown){
				rejected(e)
			}
		})
	}
}
