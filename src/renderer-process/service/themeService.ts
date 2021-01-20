'use strict'

import {IEvent} from '../base/event'

export const VS_LIGHT_THEME = 'app-light'
export const VS_DARK_THEME = 'app-dark'
export const VS_HC_THEME = 'hc-black'

export const COLOR_THEME_SETTING = 'workbench.colorTheme'
export const ICON_THEME_SETTING = 'workbench.iconTheme'

export interface IColorTheme {
	readonly id: string;
	readonly label: string;
	readonly settingsId: string;
	readonly description?: string;
	readonly isLoaded: boolean;
	readonly settings?: IThemeSetting[];

	isLightTheme(): boolean;
	isDarkTheme(): boolean;
	getSyntaxThemeId(): string;
	getBaseThemeId(): string;
}

export interface IFileIconTheme {
	readonly id: string;
	readonly label: string;
	readonly settingsId: string;
	readonly description?: string;
	readonly isLoaded: boolean;
	readonly hasFileIcons?: boolean;
	readonly hasFolderIcons?: boolean;
}

export interface IThemeService {
	setColorTheme(themeId: string, settingsTarget: string): Promise<IColorTheme>;
	getColorTheme(): IColorTheme;
	getColorThemes(): Promise<IColorTheme[]>;
	onDidColorThemeChange: IEvent<IColorTheme>;

	setFileIconTheme(iconThemeId: string, settingsTarget: string): Promise<IFileIconTheme>;
	getFileIconTheme(): IFileIconTheme;
	getFileIconThemes(): Promise<IFileIconTheme[]>;
	onDidFileIconThemeChange: IEvent<IFileIconTheme>;
}

export interface IThemeSetting {
	name?: string;
	scope?: string | string[];
	settings: IThemeSettingStyle;
}

export interface IThemeSettingStyle {
	foreground?: string;
	background?: string;
}