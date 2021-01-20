/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

/* import * as platform from '../../../common/node/platform' */
import * as url from 'url'
/* import uri from 'vs/base/common/uri'

import workbenchEditorCommon = require('vs/workbench/common/editor');
import { IViewletService} from 'vs/workbench/services/viewlet/common/viewletService'
import { IWorkbenchEditorService} from 'vs/workbench/services/editor/common/editorService'
import { IStorageService, DStorageService } from '../storage/storage'
import { IEventService} from 'vs/platform/event/common/event'
import { IWorkspaceContextService, DWorkspaceContextService} from '../workspace/workspace' */

import {ipcRenderer as ipc, shell, remote} from 'electron'

const dialog = remote.dialog

export interface IWindowConfiguration {
	window: {
		openFilesInNewWindow: boolean;
		reopenFolders: string;
		zoomLevel: number;
	};
}

export class ElectronWindow {
	private windowId: number;

	constructor(
		private readonly win: Electron.BrowserWindow,
		private readonly shellContainer: HTMLElement,
		/* @DWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@IEventService private eventService: IEventService,
		@DStorageService private readonly storageService: IStorageService,
		@IWorkbenchEditorService private readonly editorService: IWorkbenchEditorService,
		@IViewletService private readonly viewletService: IViewletService */
	) {
		this.win = win
		this.windowId = win.id
		this.registerListeners()
	}

	private registerListeners(): void {

		// React to editor input changes (Mac only)
		/* if (platform.isMacintosh ) {
			this.eventService.addListener(EventType.EDITOR_INPUT_CHANGED, (e: EditorEvent) => {
				const fileInput = workbenchEditorCommon.asFileEditorInput(e.editorInput, true)
				let representedFilename = ''
				if (fileInput) {
					representedFilename = fileInput.getResource().fsPath
				}

				ipc.send('vscode:setRepresentedFilename', this.windowId, representedFilename)
			})
		} */

		// Prevent a dropped file from opening as nw application
		window.document.body.addEventListener('dragover', (e: DragEvent) => {
			e.preventDefault()
		})

		// Let a dropped file open inside Monaco (only if dropped over editor area)
		window.document.body.addEventListener('drop', (e: DragEvent) => {
			e.preventDefault()
		})

		// Handle window.open() calls
		/* (<any>window).open = function(url: string, target: string, features: string, replace: boolean) {
			shell.openExternal(url)
			return null
		} */
	}

	open(pathsToOpen: string[]): void;
	open(fileResource: url.URL): void;
	open(pathToOpen: string): void;
	open(arg1: any): void {
		let pathsToOpen: string[]
		if (Array.isArray(arg1)) {
			pathsToOpen = arg1
		} else if (typeof arg1 === 'string') {
			pathsToOpen = [arg1]
		} else {
			pathsToOpen = [url.fileURLToPath(<url.URL>arg1)]
		}

		ipc.send('vscode:windowOpen', pathsToOpen) // handled from browser process
	}

	openNew(): void {
		ipc.send('vscode:openNewWindow') // handled from browser process
	}

	close(): void {
		this.win.close()
	}

	reload(): void {
		ipc.send('vscode:reloadWindow', this.windowId)
	}

	showMessageBox(options: Electron.MessageBoxOptions): any {
		return dialog.showMessageBox(this.win, options)
		.then((value: Electron.MessageBoxReturnValue)=> value)
	}

	/* showSaveDialog(options: Electron.SaveDialogOptions, callback?: (fileName: any) => void): string {
		return dialog.showSaveDialog(this.win, options)
	} */

	setFullScreen(fullscreen: boolean): void {
		ipc.send('vscode:setFullScreen', this.windowId, fullscreen) // handled from browser process
	}

	openDevTools(): void {
		ipc.send('vscode:openDevTools', this.windowId) // handled from browser process
	}

	setMenuBarVisibility(visible: boolean): void {
		ipc.send('vscode:setMenuBarVisibility', this.windowId, visible) // handled from browser process
	}

	focus(): void {
		ipc.send('vscode:focusWindow', this.windowId) // handled from browser process
	}

	flashFrame(): void {
		ipc.send('vscode:flashFrame', this.windowId) // handled from browser process
	}
}