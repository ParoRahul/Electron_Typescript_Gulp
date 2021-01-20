/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import {IEvent, Emitter } from './event'
import { IDisposable } from '../../common/disposable'

class WindowManager {


	private static _fullscreen: boolean;

	private static _zoomLevel = 0;
	private static _zoomFactor = 0;

	private static _pixelRatioCache = 0;
	private static _pixelRatioComputed = false;

	private static _onDidChangeZoomLevel: Emitter<number> = new Emitter<number>();
	static onDidChangeZoomLevel: IEvent<number> = WindowManager._onDidChangeZoomLevel.event;

	private static _onDidChangeFullscreen: Emitter<void> = new Emitter<void>();
	static onDidChangeFullscreen: IEvent<void> = WindowManager._onDidChangeFullscreen.event;

	static getZoomLevel(): number {
		return WindowManager._zoomLevel
	}

	static setZoomLevel(zoomLevel: number): void {
		if (WindowManager._zoomLevel === zoomLevel) {
			return
		}
		WindowManager._zoomLevel = zoomLevel
		WindowManager._pixelRatioComputed = false
		WindowManager._onDidChangeZoomLevel.fire(this._zoomLevel)
	}

	static getZoomFactor(): number {
		return WindowManager._zoomFactor
	}

	static setZoomFactor(zoomFactor: number): void {
		WindowManager._zoomFactor = zoomFactor
	}

	static getPixelRatio(): number {
		if (!WindowManager._pixelRatioComputed) {
			WindowManager._pixelRatioCache = WindowManager._computePixelRatio()
			WindowManager._pixelRatioComputed = true
		}
		return WindowManager._pixelRatioCache
	}

	private static _computePixelRatio(): number {
		const ctx = document.createElement('canvas').getContext('2d')
		const dpr = window.devicePixelRatio || 1
		const bsr = (<any>ctx).webkitBackingStorePixelRatio ||
			(<any>ctx).mozBackingStorePixelRatio ||
			(<any>ctx).msBackingStorePixelRatio ||
			(<any>ctx).oBackingStorePixelRatio ||
			(<any>ctx).backingStorePixelRatio || 1
		return dpr / bsr
	}

	static setFullscreen(fullscreen: boolean): void {
		if (WindowManager._fullscreen === fullscreen) {
			return
		}

		WindowManager._fullscreen = fullscreen
		WindowManager._onDidChangeFullscreen.fire()
	}

	static isFullscreen(): boolean {
		return WindowManager._fullscreen
	}
}

/** A zoom index, e.g. 1, 2, 3 */
export function getZoomLevel(): number {
	return WindowManager.getZoomLevel()
}
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
export function getZoomFactor(): number {
	return WindowManager.getZoomFactor()
}
export function getPixelRatio(): number {
	return WindowManager.getPixelRatio()
}
export function setZoomLevel(zoomLevel: number): void {
	WindowManager.setZoomLevel(zoomLevel)
}
export function setZoomFactor(zoomFactor: number): void {
	WindowManager.setZoomFactor(zoomFactor)
}
export function onDidChangeZoomLevel(callback: (zoomLevel: number) => void): IDisposable {
	return WindowManager.onDidChangeZoomLevel(callback)
}
export function setFullscreen(fullscreen: boolean): void {
	WindowManager.setFullscreen(fullscreen)
}
export function isFullscreen(): boolean {
	return WindowManager.isFullscreen()
}
export function onDidChangeFullscreen(callback: () => void): IDisposable {
	return WindowManager.onDidChangeFullscreen(callback)
}

const userAgent = navigator.userAgent

export const isIE = (userAgent.indexOf('Trident') >= 0)
export const isEdge = (userAgent.indexOf('Edge/') >= 0)
export const isEdgeOrIE = isIE || isEdge

export const isOpera = (userAgent.indexOf('Opera') >= 0)
export const isFirefox = (userAgent.indexOf('Firefox') >= 0)
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0)
export const isChrome = (userAgent.indexOf('Chrome') >= 0)
export const isSafari = (userAgent.indexOf('Chrome') === -1) && (userAgent.indexOf('Safari') >= 0)
export const isIPad = (userAgent.indexOf('iPad') >= 0)

export const canUseTranslate3d = !isFirefox

export const enableEmptySelectionClipboard = isWebKit

export function supportsExecCommand(command: string): boolean {
	return ( isIE && document.queryCommandSupported(command) )
}
