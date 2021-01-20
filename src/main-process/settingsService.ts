'use strict'

import { isUndefinedOrNull } from '../common/types'
import { IEnvironmentService } from '../common/node/environmentService'
import { IStorageService, IStorageDatabase } from './storageService'

import { nativeTheme } from 'electron'
import { createDecorator } from '../common/ioc/instantiation'



export type TMenuBarVisibility = 'default' | 'visible' | 'toggle' | 'hidden';

export interface IWindowSettings extends IStorageDatabase{
	zoomLevel: number;
	titleBarStyle: 'native' | 'custom';
	autoDetectHighContrast: boolean;
	menuBarVisibility: TMenuBarVisibility;
	newWindowDimensions: 'default' | 'inherit' | 'maximized' | 'fullscreen';
	nativeFullScreen: boolean;
	theme: 'dark-theme' | 'light-theme'|'hc-black';
}

export interface ISettingsService {
    _serviceBrand: undefined;
    init(): Promise<void>
    getItem<T extends keyof IWindowSettings>(key:T): IWindowSettings[T];
    settings: IWindowSettings;
    zoomLevel: number;
    titleBarStyle: 'native' | 'custom';
    autoDetectHighContrast: boolean;
    menuBarVisibility: TMenuBarVisibility;
	newWindowDimensions: 'default' | 'inherit' | 'maximized' | 'fullscreen';
	nativeFullScreen: boolean;
    theme: 'dark-theme' | 'light-theme'|'hc-black';
    getBackGroundColor :string
}

export const DSettingsService = createDecorator<ISettingsService>('SettingsService')

export class SettingsService implements ISettingsService {

    _serviceBrand: undefined;

    private static default(): IWindowSettings{
        return {
            zoomLevel: 1,
            titleBarStyle: 'native',
            autoDetectHighContrast: true,
            menuBarVisibility: 'default',
            newWindowDimensions: 'default',
            nativeFullScreen: true,
            theme: 'dark-theme'
        }
    }

    private static windowsSettingsKey = 'windowSettings'

    private _settings: IWindowSettings| null = null;

    constructor(private readonly  environment: IEnvironmentService ,
                private readonly  strorage: IStorageService){
        if (this.environment.verbose || !this.environment.isBuilt) {
            console.log(`LOG: ${new Date().toLocaleTimeString()}:  SettingsService Instantiate`)
        }
    }

    async init(): Promise<void>{
        this._settings = this.strorage.getItem(SettingsService.windowsSettingsKey,{})
        if ( isUndefinedOrNull(this._settings)){
            this._settings = SettingsService.default()
            this.strorage.setItem(SettingsService.windowsSettingsKey, this._settings)
        }
    }

    get settings(): IWindowSettings{
        if (!this._settings){
            this._settings = SettingsService.default()
        }
        return this._settings
    }

    getItem<T extends keyof IWindowSettings>(key:T): IWindowSettings[T] {
        return this.settings[key]
    }

    get zoomLevel(): number {
        return this.settings.zoomLevel
    }

    get titleBarStyle(): 'native' | 'custom' {
        return this.settings.titleBarStyle
    }

    get autoDetectHighContrast(): boolean {
        return this.settings.autoDetectHighContrast
    }

    get menuBarVisibility(): TMenuBarVisibility {
        return this.settings.menuBarVisibility
    }

    get newWindowDimensions():  'default' | 'inherit' | 'maximized' | 'fullscreen' {
        return this.settings.newWindowDimensions
    }

    get nativeFullScreen(): boolean {
        return this.settings.nativeFullScreen
    }

    get theme(): 'dark-theme' | 'light-theme'|'hc-black' {
        return this.settings.theme
    }

    get getBackGroundColor() :string{
        // let baseTheme = this.theme
		const usesLightTheme = 'light-theme' === this.theme
		const usesHighContrastTheme = 'hc-black' === this.theme || (this.environment.isWindows && nativeTheme.shouldUseInvertedColorScheme)
		const bgColor = usesHighContrastTheme ? '#000000'  : (usesLightTheme ? '#FFFFFF' : (this.environment.isMacintosh ? '#171717' : '#1E1E1E'))
		return bgColor
    }

}