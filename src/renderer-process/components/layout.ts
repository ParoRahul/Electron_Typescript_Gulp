'use strict'

import { Builder, Dimension } from '../base/builder'
import { IDisposable} from '../../common/disposable'
import { Component } from './component'
import { IStorageService } from '../service/storage/storage'
import { IThemeService } from '../service/themeService'
import { STYLE_CONSTANTS } from './constant'

interface IComponentLayoutInfo {
	titlebar: { height: number; };
	activitybar: { width: number; };
	sidebar: { minWidth: number; };
	panel: { minHeight: number; };
	editor: { minWidth: number; minHeight: number; };
	statusbar: { height: number; };
}

export class WorkbenchLayout  {

	private static sashXWidthSettingsKey = 'workbench.sidebar.width';
	private static sashYHeightSettingsKey = 'workbench.panel.height';

	private parent: Builder;
	private workbenchContainer: Builder;
	private titlebar: Component;
	private activitybar: Component;
	private editor: Component;
	private sidebar: Component;
	private panel: Component;
	private statusbar: Component;
	private toUnbind: IDisposable[];
	private ComponentLayoutInfo: IComponentLayoutInfo;
	private workbenchSize: Dimension;
	private startSidebarWidth: number;
	private sidebarWidth: number;
	private sidebarHeight: number;
	private titlebarHeight: number;
	private activitybarWidth: number;
	private statusbarHeight: number;
	private startPanelHeight: number;
	private panelHeight: number;
	private panelHeightBeforeMaximized: number;
	private panelWidth: number;
	private layoutEditorGroupsVertically: boolean;

	// Take Components as an object bag since instatation service does not have typings for constructors with 9+ arguments
	constructor(
		parent: Builder,
		workbenchContainer: Builder,
		components: {
			titlebar: Component,
			activitybar: Component,
			editor: Component,
			sidebar: Component,
			panel: Component,
			statusbar: Component
		},
		private storageService: IStorageService,
		private themeService: IThemeService,
		/* private contextViewService: IContextViewService,
		private viewletService: IViewletService, */
	) {
		this.parent = parent
		this.workbenchContainer = workbenchContainer
		this.titlebar = components.titlebar
		this.activitybar = components.activitybar
		this.editor = components.editor
		this.sidebar = components.sidebar
		this.panel = components.panel
		this.statusbar = components.statusbar
		this.toUnbind = []
		this.ComponentLayoutInfo = this.getComponentLayoutInfo()
		this.panelHeightBeforeMaximized = 0
	}

	private getComponentLayoutInfo(): IComponentLayoutInfo {
		return {
			titlebar: {
				height: STYLE_CONSTANTS.TITLE_BAR_HEIGHT
			},
			activitybar: {
				width: STYLE_CONSTANTS.ACTIVITY_BAR_WIDTH
			},
			sidebar: {
				minWidth: STYLE_CONSTANTS.MIN_SIDEBAR_WIDTH
			},
			panel: {
				minHeight: STYLE_CONSTANTS.MIN_PANEL_HEIGHT
			},
			editor: {
				minWidth: STYLE_CONSTANTS.MIN_EDITOR_WIDTH,
				minHeight: STYLE_CONSTANTS.MIN_EDITOR_HEIGHT
			},
			statusbar: {
				height: STYLE_CONSTANTS.STATUS_BAR_HEIGHT
			}
		}
	}
}