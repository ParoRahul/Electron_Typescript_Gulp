/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'


let _isWindows = false
let _isMacintosh = false
let _isLinux = false
let _isRootUser = false
let _isNative = false
let _isWeb = false
let _locale: string = undefined
let _language: string = undefined

export interface IProcessEnvironment {
	[key: string]: string;
}

interface INodeProcess {
	platform: string;
	env: IProcessEnvironment;
	getuid(): number;
}
declare let process: INodeProcess
declare let global: any

interface INavigator {
	userAgent: string;
	language: string;
}
declare let navigator: INavigator
declare let self: any

export const LANGUAGE_DEFAULT = 'en'

// OS detection
if (typeof process === 'object') {
	_isWindows = (process.platform === 'win32')
	_isMacintosh = (process.platform === 'darwin')
	_isLinux = (process.platform === 'linux')
	_isRootUser = !_isWindows && (process.getuid() === 0)
	_language = LANGUAGE_DEFAULT
	_isNative = true
} else if (typeof navigator === 'object') {
	const userAgent = navigator.userAgent
	_isWindows = userAgent.indexOf('Windows') >= 0
	_isMacintosh = userAgent.indexOf('Macintosh') >= 0
	_isLinux = userAgent.indexOf('Linux') >= 0
	_isWeb = true
	_locale = navigator.language
	_language = _locale
}

export enum EPlatform {
	Web,
	Mac,
	Linux,
	Windows
}

export let _platform: EPlatform = EPlatform.Web
if (_isNative) {
	if (_isMacintosh) {
		_platform = EPlatform.Mac
	} else if (_isWindows) {
		_platform = EPlatform.Windows
	} else if (_isLinux) {
		_platform = EPlatform.Linux
	}
}

export const isWindows = _isWindows
export const isMacintosh = _isMacintosh
export const isLinux = _isLinux
export const isRootUser = _isRootUser
export const isNative = _isNative
export const isWeb = _isWeb
export const platform = _platform
export const language = _language

export const locale = _locale

export interface ITimeoutToken {
}

export interface IIntervalToken {
}

interface IGlobals {
	Worker?: any;
	setTimeout(callback: (...args: any[]) => void, delay: number, ...args: any[]): ITimeoutToken;
	clearTimeout(token: ITimeoutToken): void;

	setInterval(callback: (...args: any[]) => void, delay: number, ...args: any[]): IIntervalToken;
	clearInterval(token: IIntervalToken): void;
}

const _globals = <IGlobals>(typeof self === 'object' ? self : global)
export const globals: any = _globals

export function hasWebWorkerSupport(): boolean {
	return typeof _globals.Worker !== 'undefined'
}
export const setTimeout = _globals.setTimeout.bind(_globals)
export const clearTimeout = _globals.clearTimeout.bind(_globals)

export const setInterval = _globals.setInterval.bind(_globals)
export const clearInterval = _globals.clearInterval.bind(_globals)