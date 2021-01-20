/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { IDisposable, Disposable } from '../../common/disposable'
import { isObject } from '../../common/types'
import { IMouseEvent, StandardMouseEvent } from './mouseEvent'


export function isHTMLElement(o: any): o is HTMLElement {
	if (typeof HTMLElement === 'object') {
		return o instanceof HTMLElement
	}
	return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string'
}

export function getElementsByTagName(tag: string): HTMLElement[] {
	return Array.prototype.slice.call(document.getElementsByTagName(tag), 0)
}

export function clearNode(node: HTMLElement) {
	while (node.firstChild) {
		node.removeChild(node.firstChild)
	}
}

export function safeStringifyDOMAware(obj: any): string {
	const seen: any[] = []
	return JSON.stringify(obj, (key, value) => {
		// HTML elements are never going to serialize nicely
		if (value instanceof Element) {
			return '[Element]'
		}
		if (isObject(value) || Array.isArray(value)) {
			if (seen.indexOf(value) !== -1) {
				return '[Circular]'
			} else {
				seen.push(value)
			}
		}
		return value
	})
}

export function isInDOM(node: Node): boolean {
	while (node) {
		if (node === document.body) {
			return true
		}
		node = node.parentNode
	}
	return false
}

let lastStart: number, lastEnd: number

function _findClassName(node: HTMLElement, className: string): void {
	const classes = node.className
	if (!classes) {
		lastStart = -1
		return
	}
	className = className.trim()
	const classesLen = classes.length,
		classLen = className.length
	if (classLen === 0) {
		lastStart = -1
		return
	}
	if (classesLen < classLen) {
		lastStart = -1
		return
	}
	if (classes === className) {
		lastStart = 0
		lastEnd = classesLen
		return
	}
	let idx = -1,
		idxEnd: number
	const CharCodeSpace = 32
	while ((idx = classes.indexOf(className, idx + 1)) >= 0) {
		idxEnd = idx + classLen
		if ((idx === 0 || classes.charCodeAt(idx - 1) === CharCodeSpace) &&
			classes.charCodeAt(idxEnd) === CharCodeSpace) {
			lastStart = idx
			lastEnd = idxEnd + 1
			return
		}
		// last class
		if (idx > 0 && classes.charCodeAt(idx - 1) === CharCodeSpace && idxEnd === classesLen) {
			lastStart = idx - 1
			lastEnd = idxEnd
			return
		}
		// equal - duplicate of cmp above
		if (idx === 0 && idxEnd === classesLen) {
			lastStart = 0
			lastEnd = idxEnd
			return
		}
	}
	lastStart = -1
}

/**
 * @param node a dom node
 * @param className a class name
 * @return true if the className attribute of the provided node contains the provided className
 */
export function hasClass(node: HTMLElement, className: string): boolean {
	_findClassName(node, className)
	return lastStart !== -1
}

/**
 * Adds the provided className to the provided node. This is a no-op
 * if the class is already set.
 * @param node a dom node
 * @param className a class name
 */
export function addClass(node: HTMLElement, className: string): void {
	if (!node.className) { // doesn't have it for sure
		node.className = className
	} else {
		_findClassName(node, className) // see if it's already there
		if (lastStart === -1) {
			node.className = node.className + ' ' + className
		}
	}
}

/**
 * Removes the className for the provided node. This is a no-op
 * if the class isn't present.
 * @param node a dom node
 * @param className a class name
 */
export function removeClass(node: HTMLElement, className: string): void {
	_findClassName(node, className)
	if (lastStart === -1) {
		return // Prevent styles invalidation if not necessary
	} else {
		node.className = node.className.substring(0, lastStart) + node.className.substring(lastEnd)
	}
}

/**
 * @param node a dom node
 * @param className a class name
 * @param shouldHaveIt
 */
export function toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void {
	_findClassName(node, className)
	if (lastStart !== -1 && (shouldHaveIt === void 0 || !shouldHaveIt)) {
		removeClass(node, className)
	}
	if (lastStart === -1 && (shouldHaveIt === void 0 || shouldHaveIt)) {
		addClass(node, className)
	}
}

export function getComputedStyle(el: HTMLElement): CSSStyleDeclaration {
	return document.defaultView.getComputedStyle(el, null)
}

const convertToPixels: (element: HTMLElement, value: string) => number = (function () {
	return function (element: HTMLElement, value: string): number {
		return parseFloat(value) || 0
	}
})()

function getDimension(element: HTMLElement, cssPropertyName: string, jsPropertyName: string): number {
	const computedStyle: CSSStyleDeclaration = getComputedStyle(element)
	let value = '0'
	if (computedStyle) {
		if (computedStyle.getPropertyValue) {
			value = computedStyle.getPropertyValue(cssPropertyName)
		} else {
			// IE8
			value = (<any>computedStyle).getAttribute(jsPropertyName)
		}
	}
	return convertToPixels(element, value)
}

const sizeUtils = {

	getBorderLeftWidth: function (element: HTMLElement): number {
		return getDimension(element, 'border-left-width', 'borderLeftWidth')
	},
	getBorderTopWidth: function (element: HTMLElement): number {
		return getDimension(element, 'border-top-width', 'borderTopWidth')
	},
	getBorderRightWidth: function (element: HTMLElement): number {
		return getDimension(element, 'border-right-width', 'borderRightWidth')
	},
	getBorderBottomWidth: function (element: HTMLElement): number {
		return getDimension(element, 'border-bottom-width', 'borderBottomWidth')
	},

	getPaddingLeft: function (element: HTMLElement): number {
		return getDimension(element, 'padding-left', 'paddingLeft')
	},
	getPaddingTop: function (element: HTMLElement): number {
		return getDimension(element, 'padding-top', 'paddingTop')
	},
	getPaddingRight: function (element: HTMLElement): number {
		return getDimension(element, 'padding-right', 'paddingRight')
	},
	getPaddingBottom: function (element: HTMLElement): number {
		return getDimension(element, 'padding-bottom', 'paddingBottom')
	},

	getMarginLeft: function (element: HTMLElement): number {
		return getDimension(element, 'margin-left', 'marginLeft')
	},
	getMarginTop: function (element: HTMLElement): number {
		return getDimension(element, 'margin-top', 'marginTop')
	},
	getMarginRight: function (element: HTMLElement): number {
		return getDimension(element, 'margin-right', 'marginRight')
	},
	getMarginBottom: function (element: HTMLElement): number {
		return getDimension(element, 'margin-bottom', 'marginBottom')
	},
	__commaSentinel: false
}

// ----------------------------------------------------------------------------------------
// Position & Dimension

export function getTopLeftOffset(element: HTMLElement): { left: number; top: number; } {

	let offsetParent = element.offsetParent, top = element.offsetTop, left = element.offsetLeft

	while ((element = <HTMLElement>element.parentNode) !== null &&
			element !== document.body && element !== document.documentElement) {
		top -= element.scrollTop
		const c = getComputedStyle(element)
		if (c) {
			left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft
		}

		if (element === offsetParent) {
			left += sizeUtils.getBorderLeftWidth(element)
			top += sizeUtils.getBorderTopWidth(element)
			top += element.offsetTop
			left += element.offsetLeft
			offsetParent = element.offsetParent
		}
	}

	return {
		left: left,
		top: top
	}
}

export interface IDomNodePagePosition {
	left: number;
	top: number;
	width: number;
	height: number;
}

/**
 * Returns the position of a dom node relative to the entire page.
 */

export interface IStandardWindow {
	scrollX: number;
	scrollY: number;
}

export const StandardWindow: IStandardWindow = new class {
	get scrollX(): number {
		if (typeof window.scrollX === 'number') {
			// modern browsers
			return window.scrollX
		} else {
			return document.body.scrollLeft + document.documentElement.scrollLeft
		}
	}

	get scrollY(): number {
		if (typeof window.scrollY === 'number') {
			// modern browsers
			return window.scrollY
		} else {
			return document.body.scrollTop + document.documentElement.scrollTop
		}
	}
}

export function getDomNodePagePosition(domNode: HTMLElement): IDomNodePagePosition {
	const bb = domNode.getBoundingClientRect()
	return {
		left: bb.left + StandardWindow.scrollX,
		top: bb.top + StandardWindow.scrollY,
		width: bb.width,
		height: bb.height
	}
}

export function getContentWidth(element: HTMLElement): number {
	const border = sizeUtils.getBorderLeftWidth(element) + sizeUtils.getBorderRightWidth(element)
	const padding = sizeUtils.getPaddingLeft(element) + sizeUtils.getPaddingRight(element)
	return element.offsetWidth - border - padding
}

export function getTotalWidth(element: HTMLElement): number {
	const margin = sizeUtils.getMarginLeft(element) + sizeUtils.getMarginRight(element)
	return element.offsetWidth + margin
}

export function getTotalScrollWidth(element: HTMLElement): number {
	const margin = sizeUtils.getMarginLeft(element) + sizeUtils.getMarginRight(element)
	return element.scrollWidth + margin
}

export function getContentHeight(element: HTMLElement): number {
	const border = sizeUtils.getBorderTopWidth(element) + sizeUtils.getBorderBottomWidth(element)
	const padding = sizeUtils.getPaddingTop(element) + sizeUtils.getPaddingBottom(element)
	return element.offsetHeight - border - padding
}

export function getTotalHeight(element: HTMLElement): number {
	const margin = sizeUtils.getMarginTop(element) + sizeUtils.getMarginBottom(element)
	return element.offsetHeight + margin
}

// Gets the left coordinate of the specified element relative to the specified parent.

function getRelativeLeft(element: HTMLElement, parent: HTMLElement): number {
	if (element === null) {
		return 0
	}

	const elementPosition = getTopLeftOffset(element)
	const parentPosition = getTopLeftOffset(parent)
	return elementPosition.left - parentPosition.left
}

export function getLargestChildWidth(parent: HTMLElement, children: HTMLElement[]): number {
	const childWidths = children.map((child) => {
		return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0
	})
	const maxWidth = Math.max(...childWidths)
	return maxWidth
}
/*-------------------------------------------------------- */

export function isAncestor(testChild: Node, testAncestor: Node): boolean {
	while (testChild) {
		if (testChild === testAncestor) {
			return true
		}
		testChild = testChild.parentNode
	}

	return false
}

/* ---------------------Event Mangement------------------- */

export interface IEventLike {
	preventDefault(): void;
	stopPropagation(): void;
}

export const EventType = {
	CLICK: 'click',
	DBLCLICK: 'dblclick',
	MOUSE_UP: 'mouseup',
	MOUSE_DOWN: 'mousedown',
	MOUSE_OVER: 'mouseover',
	MOUSE_MOVE: 'mousemove',
	MOUSE_OUT: 'mouseout',
	CONTEXT_MENU: 'contextmenu',
	//
	KEY_DOWN: 'keydown',
	KEY_PRESS: 'keypress',
	KEY_UP: 'keyup',

}


export const EventHelper = {
	stop: function (e: IEventLike, cancelBubble?: boolean) {
		if (e.preventDefault) {
			e.preventDefault()
		} else {
			// IE8
			(<any>e).returnValue = false
		}
		if (cancelBubble) {
			if (e.stopPropagation) {
				e.stopPropagation()
			} else {
				// IE8
				(<any>e).cancelBubble = true
			}
		}
	}
}


export interface IAddStandardDisposableListenerSignature {
	(node: HTMLElement, type: 'click', handler: (event: MouseEvent) => void, useCapture?: boolean): IDisposable;
	(node: HTMLElement, type: 'keydown', handler: (event: KeyboardEvent) => void, useCapture?: boolean): IDisposable;
	(node: HTMLElement, type: 'keypress', handler: (event: KeyboardEvent) => void, useCapture?: boolean): IDisposable;
	(node: HTMLElement, type: 'keyup', handler: (event: KeyboardEvent) => void, useCapture?: boolean): IDisposable;
	/* (node: HTMLElement, type: 'keydown', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
	(node: HTMLElement, type: 'keypress', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
	(node: HTMLElement, type: 'keyup', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable; */
	(node: HTMLElement, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
}
function _wrapAsStandardMouseEvent(handler: (e: IMouseEvent) => void): (e: MouseEvent) => void {
	return function(e: MouseEvent) {
		return handler(new StandardMouseEvent(e))
	}
}
/* function _wrapAsStandardKeyboardEvent(handler: (e: IKeyboardEvent) => void): (e: KeyboardEvent) => void {
	return function(e: KeyboardEvent) {
		return handler(new StandardKeyboardEvent(e))
	}
} */

export const addStandardDisposableListener: IAddStandardDisposableListenerSignature =
function addStandardDisposableListener(node: HTMLElement, type: string,
										handler: (event: any) => void, useCapture?: boolean): IDisposable {
	let wrapHandler = handler

	if (type === 'click') {
		wrapHandler = _wrapAsStandardMouseEvent(handler)
	}/*  else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
		wrapHandler = _wrapAsStandardKeyboardEvent(handler)
	} */

	node.addEventListener(type, wrapHandler, useCapture || false)
	return {
		dispose: function() {
			if (!wrapHandler) {
				// Already removed
				return
			}
			node.removeEventListener(type, wrapHandler, useCapture || false)

			// Prevent leakers from holding on to the dom node or handler func
			wrapHandler = null
			node = null
			handler = null
		}
	}
}

class DomListener extends Disposable {

	private _usedAddEventListener: boolean;
	private _wrapHandler: (e: any) => void;
	private _node: any;
	private _type: string;
	private _useCapture: boolean;

	constructor(node: Element|Window|Document, type: string, handler: (e: any) => void, useCapture?: boolean) {
		super()

		this._node = node
		this._type = type
		this._useCapture = (useCapture || false)

		this._wrapHandler = (e) => {
			e = e || window.event
			handler(e)
		}

		if (typeof this._node.addEventListener === 'function') {
			this._usedAddEventListener = true
			this._node.addEventListener(this._type, this._wrapHandler, this._useCapture)
		} else {
			this._usedAddEventListener = false
			this._node.attachEvent('on' + this._type, this._wrapHandler)
		}
	}

	dispose(): void {
		if (!this._wrapHandler) {
			// Already disposed
			return
		}

		if (this._usedAddEventListener) {
			this._node.removeEventListener(this._type, this._wrapHandler, this._useCapture)
		} else {
			this._node.detachEvent('on' + this._type, this._wrapHandler)
		}

		// Prevent leakers from holding on to the dom or handler func
		this._node = null
		this._wrapHandler = null
	}
}

export function addDisposableListener(node: Element, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export function addDisposableListener(node: Element|Window, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export function addDisposableListener(node: Window, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export function addDisposableListener(node: Document, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export function addDisposableListener(node: any, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable {
	return new DomListener(node, type, handler, useCapture)
}

/*_________________________________ DOM LOADING COMPLETE _____________________*/

export function domContentLoaded(): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		const readyState = document.readyState
		if (readyState === 'complete' || (document && document.body !== null)) {
			window.setImmediate(resolve)
		} else {
			window.addEventListener('DOMContentLoaded', resolve, false)
		}
	})
}