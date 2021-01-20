'use strict'

import 'css!./media/workbench'

import { IEvent, Emitter } from './base/event'
import { IOptions } from './options'
import { Builder, $ } from './base/builder'
import { IDisposable, dispose } from '../common/disposable'

import { IInstantiationService } from '../common/ioc/instantiation'
import { InstantiationService }  from '../common/ioc/instantiationService'
import { ServiceCollection }  from '../common/ioc/serviceCollection'
import { IStorageService, DStorageService, EStorageScope } from './service/storage/storage'
import { IWorkspaceContextService, DWorkspaceContextService } from './service/workspace/workspace'
import { IDENTIFIER, SETTING_KEY, CONFIGURATION_KEY } from './components/constant'
import { IPartService } from './service/partService'


interface IZenModeSettings {
	fullScreen: boolean;
	hideTabs: boolean;
	hideStatusBar: boolean;
	restore: boolean;
}

export interface IWorkbenchCallbacks {
	onServicesCreated?: () => void;
	onWorkbenchStarted?: (info: IWorkbenchStartedInfo) => void;
}

export interface IWorkbenchStartedInfo {
	customKeybindingsCount: number;
	restoreViewletDuration: number;
	restoreEditorsDuration: number;
	pinnedViewlets: string[];
	themeId: string;
}

export class Workbench {
//export class Workbench implements IPartService {

	private static sidebarHiddenSettingKey = SETTING_KEY.SIDEBAR_HIDDEN_SETTING_KEY;
	private static sidebarRestoreSettingKey = SETTING_KEY.SIDEBAR_RESTORE_SETTING_KEY
	private static panelHiddenSettingKey = SETTING_KEY.PANEL_HIDDEN_SETTING_KEY;
	private static zenModeActiveSettingKey = SETTING_KEY.ZENMODE_ACTIVE_SETTING_KEY;

	private static sidebarPositionConfigurationKey = CONFIGURATION_KEY.SIDEBAR_POSITION_CONFIGURATION_KEY;
	private static statusbarVisibleConfigurationKey = CONFIGURATION_KEY.STATUSBAR_VISIBLE_CONFIGURATION_KEY;
	private static activityBarVisibleConfigurationKey = CONFIGURATION_KEY.ACTIVITYBAR_VISIBLE_CONFIGURATIO_NKEY;

	private _onTitleBarVisibilityChange: Emitter<void>;

	private readonly workbenchParams: IOptions;
	private workbenchContainer: Builder;
	private workbench: Builder;

	private toDispose: IDisposable[];

	private sideBarHidden: boolean;
	private statusBarHidden: boolean;
	private activityBarHidden: boolean;

	private instantiationService: IInstantiationService;
	private readonly storageService: IStorageService;
	private readonly contextService: IWorkspaceContextService;


	constructor(private readonly parent: HTMLElement,
				private readonly container: HTMLElement,
				private readonly options: IOptions,
				private readonly serviceCollection: ServiceCollection){
		//console.log(parent)
		// console.log(container)
		this.workbenchParams = options
		this.toDispose = []
		this._onTitleBarVisibilityChange = new Emitter<void>()
		this.instantiationService = null
		this.storageService = serviceCollection.get(DStorageService) as IStorageService
		this.contextService = serviceCollection.get(DWorkspaceContextService) as IWorkspaceContextService
	}

	get onTitleBarVisibilityChange(): IEvent<void> {
		return this._onTitleBarVisibilityChange.event
	}

	/* get onEditorLayout(): IEvent<void> {
		return chain(this.editorPart.onLayout)
			.map(() => void 0)
			.event;
	} */

	startup(callbacks?: IWorkbenchCallbacks): void {
		this.workbenchContainer = $('.app-workbench-container')
		this.workbench = $().div({ 'class': 'app-workbench', id: IDENTIFIER.WORKBENCH_CONTAINER })
		.appendTo(this.workbenchContainer)
		this.initServices()
		this.registerListeners()
		this.initSettings()
		this.renderWorkbench()
	}

	private initServices(): void {
		this.instantiationService = new InstantiationService( this.serviceCollection, true)

		console.log('init Service for work bench')
	}

	private registerListeners(): void {
		console.log('registerListeners for work bench')
	}

	private initSettings(): void {
		this.sideBarHidden = this.storageService.getBoolean(Workbench.sidebarHiddenSettingKey,
															EStorageScope.WORKSPACE, false)
		if (!this.contextService.hasWorkspace()) {
			this.sideBarHidden = true // we hide sidebar in single-file-mode
		}
	}

	private renderWorkbench(): void {
		console.log('renderWorkbench for work bench')
		this.workbenchContainer.build(this.container)
	}

	dispose(): void {
		this.toDispose = dispose(this.toDispose)
	}
}