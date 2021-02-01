/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Welcome to the  builder. The recommended way to use it is:
 *
 * import Builder = require('vs/base/browser/builder');
 * let $ = Builder.$;
 * $(....).fn(...);
 *
 * See below for examples how to invoke the $():
 *
 * 	$()							- creates an offdom builder
 * 	$(builder)					- wraps the given builder
 * 	$(builder[])				- wraps the given builders into a multibuilder
 * 	$('div')					- creates a div
 * 	$('.big')					- creates a div with class `big`
 * 	$('#head')					- creates a div with id `head`
 * 	$('ul#head')				- creates an unordered list with id `head`
 * 	$('<a href="back"></a>')	- constructs a builder from the given HTML
 * 	$('a', { href: 'back'})		- constructs a builder, similarly to the Builder#element() call
 */

'use strict'

import 'css!../media/builder'


import * as types from '../../common/types'
import { IDisposable, dispose } from '../../common/disposable'
import * as strings from '../../common/strings'
import * as assert from '../../common/assert'
import * as DOM from './dom'
/* import { DPromise } from '../../common/promise' */

import { Promise } from 'bluebird'

export interface IQuickBuilder {
	(): Builder;
	(builders: Builder[]): Builder;
	(element: HTMLElement): Builder;
	(element: HTMLElement[]): Builder;
	(window: Window): Builder;
	(htmlOrQuerySyntax: string): Builder; // Or, MultiBuilder
	(name: string, args?: any, fn?: (builder: Builder) => any): Builder;
	(one: string, two: string, three: string): Builder;
	(builder: Builder): Builder;
}

/**
 * Create a new builder from the element that is uniquely identified by the given identifier. If the
 *  second parameter "offdom" is set to true, the created elements will only be added to the provided
 *  element when the build() method is called.
 */

const DATA_KEY = '_dataKey_'
const DATA_BINDING_ID = '_binding_'
const LISTENER_BINDING_ID = '_listeners_'
const VISIBILITY_BINDING_ID = '_visibility_'

function setData(element: any, value: any, key?: string): void {
	if (!element[DATA_KEY]) {
		element[DATA_KEY] = {}
	}
	if (types.isString(key)) {
		element[DATA_KEY][key] = value
	}
	element[DATA_KEY] = value
}

function hasData(element: any): boolean {
	return !!element[DATA_KEY]
}

function getData(element: any, key?: string): any {
	if (!element[DATA_KEY]) {
		element[DATA_KEY] = {}
	}
	if (types.isString(key)){
		return element[DATA_KEY][key]
	}
	return element[DATA_KEY]
}

function deleteData(element: any, key?: string): void {
	if (types.isString(key)){
		delete element[DATA_KEY][key]
		return
	}
	delete element[DATA_KEY]
}

export class Position {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}

export class Box {
	top: number;
	right: number;
	bottom: number;
	left: number;

	constructor(top: number, right: number, bottom: number, left: number) {
		this.top = top
		this.right = right
		this.bottom = bottom
		this.left = left
	}
}

export class Dimension {
	width: number;
	height: number;

	constructor(width: number, height: number) {
		this.width = width
		this.height = height
	}

	substract(box: Box): Dimension {
		return new Dimension(this.width - box.left - box.right, this.height - box.top - box.bottom)
	}
}

export interface IRange {
	start: number;
	end: number;
}


/**
 *  Wraps around the provided element to manipulate it and add more child elements.
 */

export class Builder implements IDisposable {

	private currentElement: HTMLElement;
	private offdom: boolean;
	private container: HTMLElement;
	private createdElements: HTMLElement[];
	private toUnbind: { [type: string]: IDisposable[]; };
	private captureToUnbind: { [type: string]: any[]; };

	constructor(element?: HTMLElement, offdom?: boolean) {
		this.offdom = offdom

		this.container = element

		this.currentElement = element
		this.createdElements = []

		this.toUnbind = {}
		this.captureToUnbind = {}
	}

	asContainer(): Builder {
		return withBuilder(this, this.offdom)
	}

	clone(): Builder {
		const builder = new Builder(this.container, this.offdom)
		builder.currentElement = this.currentElement
		builder.createdElements = this.createdElements
		builder.captureToUnbind = this.captureToUnbind
		builder.toUnbind = this.toUnbind

		return builder
	}

	build(container?: Builder, index?: number): Builder;
	build(container?: HTMLElement, index?: number): Builder;
	build(container?: any, index?: number): Builder {
		assert.ok(this.offdom, 'This builder was not created off-dom, so build() can not be called.')
		// Use builders own container if present
		if (!container) {
			container = this.container
		}
		// Handle case of passed in Builder
		else if (container instanceof Builder) {
			container = (<Builder>container).getHTMLElement()
		}
		assert.ok(container, 'Builder can only be build() with a container provided.')
		assert.ok(DOM.isHTMLElement(container), 'The container must either be a HTMLElement or a Builder.')

		const htmlContainer = <HTMLElement>container

		// Append
		let i: number, len: number
		const childNodes = htmlContainer.childNodes
		if (types.isNumber(index) && index < childNodes.length) {
			for (i = 0, len = this.createdElements.length; i < len; i++) {
				htmlContainer.insertBefore(this.createdElements[i], childNodes[index++])
			}
		} else {
			for (i = 0, len = this.createdElements.length; i < len; i++) {
				htmlContainer.appendChild(this.createdElements[i])
			}
		}

		return this
	}

	appendTo(container?: Builder, index?: number): Builder;
	appendTo(container?: HTMLElement, index?: number): Builder;
	appendTo(container?: any, index?: number): Builder {

		// Use builders own container if present
		if (!container) {
			container = this.container
		}

		// Handle case of passed in Builder
		else if (container instanceof Builder) {
			container = (<Builder>container).getHTMLElement()
		}

		assert.ok(container, 'Builder can only be build() with a container provided.')
		assert.ok(DOM.isHTMLElement(container), 'The container must either be a HTMLElement or a Builder.')

		const htmlContainer = <HTMLElement>container

		// Remove node from parent, if needed
		if (this.currentElement.parentNode) {
			this.currentElement.parentNode.removeChild(this.currentElement)
		}

		const childNodes = htmlContainer.childNodes
		if (types.isNumber(index) && index < childNodes.length) {
			htmlContainer.insertBefore(this.currentElement, childNodes[index])
		} else {
			htmlContainer.appendChild(this.currentElement)
		}

		return this
	}

	append(child: HTMLElement, index?: number): Builder;
	append(child: Builder, index?: number): Builder;
	append(child: any, index?: number): Builder {
		assert.ok(child, 'Need a child to append')

		if (DOM.isHTMLElement(child)) {
			child = withElement(child)
		}

		assert.ok(child instanceof Builder || child instanceof MultiBuilder, 'Need a child to append');

		(<Builder>child).appendTo(this, index)

		return this
	}

	offDOM(): Builder {
		if (this.currentElement.parentNode) {
			this.currentElement.parentNode.removeChild(this.currentElement)
		}
		return this
	}

	getHTMLElement(): HTMLElement {
		return this.currentElement
	}

	getContainer(): HTMLElement {
		return this.container
	}

	div(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('div', attributes, fn)
	}

	p(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('p', attributes, fn)
	}

	ul(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('ul', attributes, fn)
	}

	ol(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('ol', attributes, fn)
	}

	li(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('li', attributes, fn)
	}

	span(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('span', attributes, fn)
	}

	img(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('img', attributes, fn)
	}

	a(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('a', attributes, fn)
	}

	header(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('header', attributes, fn)
	}

	section(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('section', attributes, fn)
	}

	footer(attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement('footer', attributes, fn)
	}

	element(name: string, attributes?: any, fn?: (builder: Builder) => void): Builder {
		return this.doElement(name, attributes, fn)
	}

	private doElement(name: string, attributesOrFn?: any, fn?: (builder: Builder) => void): Builder {

		const element = document.createElement(name)
		this.currentElement = element
		if (this.offdom) {
			this.createdElements.push(element)
		}
		if (types.isObject(attributesOrFn)) {
			this.attr(attributesOrFn)
		}
		if (types.isFunction(attributesOrFn)) {
			fn = attributesOrFn
		}
		if (types.isFunction(fn)) {
			const builder = new Builder(element)
			fn.call(builder, builder) // Set both 'this' and the first parameter to the new builder
		}
		if (!this.offdom) {
			this.container.appendChild(element)
		}

		return this
	}

	domFocus(): Builder {
		this.currentElement.focus()
		return this
	}

	hasFocus(): boolean {
		const activeElement: Element = document.activeElement
		return (activeElement === this.currentElement)
	}

	domSelect(range: IRange = null): Builder {
		const input = <HTMLInputElement>this.currentElement
		input.select()
		if (range) {
			input.setSelectionRange(range.start, range.end)
		}
		return this
	}

	domBlur(): Builder {
		this.currentElement.blur()
		return this
	}

	domClick(): Builder {
		this.currentElement.click()
		return this
	}


	attr(name: string): string;
	attr(name: string, value: string): Builder;
	attr(name: string, value: boolean): Builder;
	attr(name: string, value: number): Builder;
	attr(attributes: any): Builder;
	attr(firstP: any, secondP?: any): any {

		if (types.isObject(firstP)) {
			for (const prop in firstP) {
				if (firstP.hasOwnProperty(prop)) {
					const value = firstP[prop]
					this.doSetAttr(prop, value)
				}
			}
			return this
		}

		// Get Attribute Value
		if (types.isString(firstP) && !types.isString(secondP)) {
			return this.currentElement.getAttribute(firstP)
		}

		// Set Attribute Value
		if (types.isString(firstP)) {
			if (!types.isString(secondP)) {
				secondP = String(secondP)
			}
			this.doSetAttr(firstP, secondP)
		}

		return this
	}

	private doSetAttr(prop: string, value: any): void {
		if (prop === 'class') {
			prop = 'addClass' // Workaround for the issue that a function name can not be 'class' in ES
		}

		if ((<any>this)[prop]) {
			if (types.isArray(value)) {
				(<any>this)[prop].apply(this, value)
			} else {
				(<any>this)[prop].call(this, value)
			}
		} else {
			this.currentElement.setAttribute(prop, value)
		}
	}

	removeAttribute(prop: string): void {
		this.currentElement.removeAttribute(prop)
	}

	id(id: string): Builder {
		this.currentElement.setAttribute('id', id)
		return this
	}

	src(src: string): Builder {
		this.currentElement.setAttribute('src', src)
		return this
	}

	href(href: string): Builder {
		this.currentElement.setAttribute('href', href)
		return this
	}

	title(title: string): Builder {
		this.currentElement.setAttribute('title', title)
		return this
	}

	name(name: string): Builder {
		this.currentElement.setAttribute('name', name)
		return this
	}

	type(type: string): Builder {
		this.currentElement.setAttribute('type', type)
		return this
	}

	value(value: string): Builder {
		this.currentElement.setAttribute('value', value)
		return this
	}

	alt(alt: string): Builder {
		this.currentElement.setAttribute('alt', alt)
		return this
	}

	draggable(isDraggable: boolean): Builder {
		this.currentElement.setAttribute('draggable', isDraggable ? 'true' : 'false')
		return this
	}

	tabindex(index: number): Builder {
		this.currentElement.setAttribute('tabindex', index.toString())
		return this
	}

	style(name: string): string;
	style(name: string, value: string): Builder;
	style(attributes: any): Builder;
	style(firstP: any, secondP?: any): any {

		// Apply Object Literal to Styles of Element
		if (types.isObject(firstP)) {
			for (const prop in firstP) {
				if (firstP.hasOwnProperty(prop)) {
					const value = firstP[prop]
					this.doSetStyle(prop, value)
				}
			}
		}

		// Get Style Value
		else if (types.isString(firstP) && !types.isString(secondP)) {
			const stylesrg: any = this.cssKeyToJavaScriptProperty(firstP)
			return this.currentElement.style[stylesrg]
		}

		// Set Style Value
		else if (types.isString(firstP) && types.isString(secondP)) {
			this.doSetStyle(firstP, secondP)
		}

		return this
	}

	private doSetStyle(key: string, value: string): void {
		if (key.indexOf('-') >= 0) {
			const segments = key.split('-')
			key = segments[0]
			for (let i = 1; i < segments.length; i++) {
				const segment = segments[i]
				key = key + segment.charAt(0).toUpperCase() + segment.substr(1)
			}
		}
		const stylesrg: any = this.cssKeyToJavaScriptProperty(key)
		this.currentElement.style[stylesrg] = value
	}

	private cssKeyToJavaScriptProperty(key: string): string {
		if (key.indexOf('-') >= 0) {
			const segments = key.split('-')
			key = segments[0]
			for (let i = 1; i < segments.length; i++) {
				const segment = segments[i]
				key = key + segment.charAt(0).toUpperCase() + segment.substr(1)
			}
		}
		else if (key === 'float') {
			key = 'cssFloat'
		}
		return key
	}

	getComputedStyle(): CSSStyleDeclaration {
		return DOM.getComputedStyle(this.currentElement)
	}

	addClass(...classes: string[]): Builder {
		classes.forEach((nameValue: string) => {
			const names = nameValue.split(' ')
			names.forEach((name: string) => {
				DOM.addClass(this.currentElement, name)
			})
		})
		return this
	}

	setClass(className: string, shouldAddClass: boolean = null): Builder {
		if (shouldAddClass === null) {
			this.currentElement.className = className
		} else if (shouldAddClass) {
			this.addClass(className)
		} else {
			this.removeClass(className)
		}
		return this
	}

	hasClass(className: string): boolean {
		return DOM.hasClass(this.currentElement, className)
	}

	removeClass(...classes: string[]): Builder {
		classes.forEach((nameValue: string) => {
			const names = nameValue.split(' ')
			names.forEach((name: string) => {
				DOM.removeClass(this.currentElement, name)
			})
		})
		return this
	}

	swapClass(classA: string, classB: string): Builder {
		if (this.hasClass(classA)) {
			this.removeClass(classA)
			this.addClass(classB)
		} else {
			this.removeClass(classB)
			this.addClass(classA)
		}
		return this
	}

	toggleClass(className: string): Builder {
		if (this.hasClass(className)) {
			this.removeClass(className)
		} else {
			this.addClass(className)
		}
		return this
	}

	color(color: string): Builder {
		this.currentElement.style.color = color
		return this
	}

	background(color: string): Builder {
		this.currentElement.style.backgroundColor = color
		return this
	}

	clear(clear: string): Builder {
		this.currentElement.style.clear = clear
		return this
	}

	normal(): Builder {
		this.currentElement.style.fontStyle = 'normal'
		this.currentElement.style.fontWeight = 'normal'
		this.currentElement.style.textDecoration = 'none'
		return this
	}

	italic(): Builder {
		this.currentElement.style.fontStyle = 'italic'
		return this
	}

	bold(): Builder {
		this.currentElement.style.fontWeight = 'bold'
		return this
	}

	underline(): Builder {
		this.currentElement.style.textDecoration = 'underline'
		return this
	}

	overflow(overflow: string): Builder {
		this.currentElement.style.overflow = overflow
		return this
	}

	display(display: string): Builder {
		this.currentElement.style.display = display
		return this
	}

	disable(): Builder {
		this.currentElement.setAttribute('disabled', 'disabled')
		return this
	}

	enable(): Builder {
		this.currentElement.removeAttribute('disabled')
		return this
	}

	show(): Builder {
		if (this.hasClass('builder-hidden')) {
			this.removeClass('builder-hidden')
		}
		this.attr('aria-hidden', 'false')
		this.cancelVisibilityPromise()
		return this
	}

	showDelayed(delay: number): Builder {
		// Cancel any pending showDelayed() invocation
		this.cancelVisibilityPromise()
		const promise = Promise.delay(delay)
		this.setProperty(VISIBILITY_BINDING_ID, promise)
		if (!this.captureToUnbind['promise']) {
			this.captureToUnbind['promise'] = []
		}
		this.captureToUnbind['promise'].push( promise)
		promise.then(() => {
			this.removeProperty(VISIBILITY_BINDING_ID)
			this.show()
		})
		return this
	}

	hide(): Builder {
		if (!this.hasClass('builder-hidden')) {
			this.addClass('builder-hidden')
		}
		this.attr('aria-hidden', 'true')
		this.cancelVisibilityPromise()
		return this
	}

	isHidden(): boolean {
		return this.hasClass('builder-hidden') || this.currentElement.style.display === 'none'
	}

	toggleVisibility(): Builder {
		this.cancelVisibilityPromise()
		this.swapClass('builder-visible', 'builder-hidden')
		if (this.isHidden()) {
			this.attr('aria-hidden', 'true')
		}
		else {
			this.attr('aria-hidden', 'false')
		}
		return this
	}

	private cancelVisibilityPromise(): void {
		const promise = this.getProperty(VISIBILITY_BINDING_ID)
		if (promise) {
			promise.cancel()
			this.removeProperty(VISIBILITY_BINDING_ID)
		}
	}

	private toPixel(obj: any): string {
		if (obj.toString().indexOf('px') === -1) {
			return obj.toString() + 'px'
		}
		return obj
	}

	size(width: number, height?: number): Builder;
	size(width: string, height?: string): Builder;
	size(width: any, height?: any): Builder {
		if (!types.isUndefinedOrNull(width)) {
			this.currentElement.style.width = this.toPixel(width)
		}
		if (!types.isUndefinedOrNull(height)) {
			this.currentElement.style.height = this.toPixel(height)
		}
		return this
	}

	minSize(width: number, height?: number): Builder;
	minSize(width: string, height?: string): Builder;
	minSize(width: any, height?: any): Builder {
		if (!types.isUndefinedOrNull(width)) {
			this.currentElement.style.minWidth = this.toPixel(width)
		}
		if (!types.isUndefinedOrNull(height)) {
			this.currentElement.style.minHeight = this.toPixel(height)
		}
		return this
	}

	maxSize(width: number, height?: number): Builder;
	maxSize(width: string, height?: string): Builder;
	maxSize(width: any, height?: any): Builder {
		if (!types.isUndefinedOrNull(width)) {
			this.currentElement.style.maxWidth = this.toPixel(width)
		}
		if (!types.isUndefinedOrNull(height)) {
			this.currentElement.style.maxHeight = this.toPixel(height)
		}
		return this
	}


	textAlign(textAlign: string): Builder {
		this.currentElement.style.textAlign = textAlign
		return this
	}

	verticalAlign(valign: string): Builder {
		this.currentElement.style.verticalAlign = valign
		return this
	}

	innerHtml(html: string, append?: boolean): Builder {
		if (append) {
			this.currentElement.innerHTML += html
		} else {
			this.currentElement.innerHTML = html
		}
		return this
	}

	text(text: string, append?: boolean): Builder {
		if (append) {
			if (this.currentElement.children.length === 0) {
				this.currentElement.textContent += text
			}
			else {
				this.currentElement.appendChild(document.createTextNode(text))
			}
		} else {
			this.currentElement.textContent = text
		}
		return this
	}

	safeInnerHtml(html: string, append?: boolean): Builder {
		return this.innerHtml(strings.escape(html), append)
	}

	bind(object: any): Builder {
		bindElement(this.currentElement, object)
		return this
	}

	unbind(): Builder {
		unbindElement(this.currentElement)
		return this
	}

	getBinding(): any {
		return getBindingFromElement(this.currentElement)
	}

	setProperty(key: string, value: any): Builder {
		setPropertyOnElement(this.currentElement, key, value)
		return this
	}

	getProperty(key: string, fallback?: any): any {
		return getPropertyFromElement(this.currentElement, key, fallback)
	}

	removeProperty(key: string): Builder {
		if (hasData(this.currentElement)) {
			// delete data(this.currentElement)[key]
			deleteData(this.currentElement, key)
		}
		return this
	}

	parent(offdom?: boolean): Builder {
		assert.ok(!this.offdom, 'Builder was created with offdom = true and thus has no parent set')
		return withElement(<HTMLElement>this.currentElement.parentNode, offdom)
	}

	children(offdom?: boolean): MultiBuilder {
		const children = this.currentElement.children
		const builders: Builder[] = []
		for (let i = 0; i < children.length; i++) {
			builders.push(withElement(<HTMLElement>children.item(i), offdom))
		}
		return new MultiBuilder(builders)
	}

	child(index = 0): Builder {
		const children = this.currentElement.children
		return withElement(<HTMLElement>children.item(index))
	}

	removeChild(builder: Builder): Builder {
		if (this.currentElement === builder.parent().getHTMLElement()) {
			this.currentElement.removeChild(builder.getHTMLElement())
		}
		return this
	}

	select(selector: string, offdom?: boolean): MultiBuilder {
		assert.ok(types.isString(selector), 'Expected String as parameter')
		const elements = this.currentElement.querySelectorAll(selector)
		const builders: Builder[] = []
		for (let i = 0; i < elements.length; i++) {
			builders.push(withElement(<HTMLElement>elements.item(i), offdom))
		}
		return new MultiBuilder(builders)
	}

	matches(selector: string): boolean {
		const element = this.currentElement
		const matches = (<any>element).webkitMatchesSelector ||
						(<any>element).mozMatchesSelector ||
						(<any>element).msMatchesSelector ||
						(<any>element).oMatchesSelector
		return matches && matches.call(element, selector)
	}

	isEmpty(): boolean {
		return !this.currentElement.childNodes || this.currentElement.childNodes.length === 0
	}

	empty(): Builder {
		this.unbindDescendants(this.currentElement)
		this.clearChildren()
		if (this.offdom) {
			this.createdElements = []
		}
		return this
	}

	private unbindDescendants(current: HTMLElement): void {
		if (current && current.children) {
			for (let i = 0, length = current.children.length; i < length; i++) {
				const element = current.children.item(i)
				if (hasData(<HTMLElement>element)) {
					const listeners: IDisposable[] = getData(<HTMLElement>element,LISTENER_BINDING_ID)
					if (types.isArray(listeners)) {
						while (listeners.length) {
							listeners.pop().dispose()
						}
					}
					//delete element[DATA_KEY]
					deleteData(element, DATA_KEY)
				}
				this.unbindDescendants(<HTMLElement>element)
			}
		}
	}

	clearChildren(): Builder {
		if (this.currentElement) {
			DOM.clearNode(this.currentElement)
		}
		return this
	}

	destroy(): void {
		if (this.currentElement) {
			if (this.currentElement.parentNode) {
				this.currentElement.parentNode.removeChild(this.currentElement)
			}
			this.empty()
			if (hasData(this.currentElement)) {
				const listeners: IDisposable[] = getData(this.currentElement,LISTENER_BINDING_ID)
				if (types.isArray(listeners)) {
					while (listeners.length) {
						listeners.pop().dispose()
					}
				}
				// delete this.currentElement[DATA_KEY]
				deleteData(this.currentElement)
			}
		}
		let type: string
		for (type in this.toUnbind) {
			if (this.toUnbind.hasOwnProperty(type) && types.isArray(this.toUnbind[type])) {
				this.toUnbind[type] = dispose(this.toUnbind[type])
			}
		}
		for (type in this.captureToUnbind) {
			if (this.captureToUnbind.hasOwnProperty(type) && types.isArray(this.captureToUnbind[type])) {
				this.captureToUnbind[type] = dispose(this.captureToUnbind[type])
			}
		}
		this.currentElement = null
		this.container = null
		this.offdom = null
		this.createdElements = null
		this.captureToUnbind = null
		this.toUnbind = null
	}

	dispose(): void {
		this.destroy()
	}

	getTotalSize(): Dimension {
		const totalWidth = DOM.getTotalWidth(this.currentElement)
		const totalHeight = DOM.getTotalHeight(this.currentElement)
		return new Dimension(totalWidth, totalHeight)
	}

	getContentSize(): Dimension {
		const contentWidth = DOM.getContentWidth(this.currentElement)
		const contentHeight = DOM.getContentHeight(this.currentElement)
		return new Dimension(contentWidth, contentHeight)
	}

	getClientArea(): Dimension {
		if (this.currentElement !== document.body) {
			return new Dimension(this.currentElement.clientWidth, this.currentElement.clientHeight)
		}
		if (window.innerWidth && window.innerHeight) {
			return new Dimension(window.innerWidth, window.innerHeight)
		}
		if (document.body && document.body.clientWidth && document.body.clientWidth) {
			return new Dimension(document.body.clientWidth, document.body.clientHeight)
		}
		if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientHeight) {
			return new Dimension(document.documentElement.clientWidth, document.documentElement.clientHeight)
		}
		throw new Error('Unable to figure out browser width and height')
	}

	on(type: string, fn: (e: Event, builder: Builder, unbind: IDisposable) => void, listenerToUnbindContainer?: IDisposable[], useCapture?: boolean): Builder;
	on(typeArray: string[], fn: (e: Event, builder: Builder, unbind: IDisposable) => void, listenerToUnbindContainer?: IDisposable[], useCapture?: boolean): Builder;
	on(arg1: any, fn: (e: Event, builder: Builder, unbind: IDisposable) => void, listenerToUnbindContainer?: IDisposable[], useCapture?: boolean): Builder {

		// Event Type Array
		if (types.isArray(arg1)) {
			arg1.forEach((type: string) => {
				this.on(type, fn, listenerToUnbindContainer, useCapture)
			})
		}

		// Single Event Type
		else {
			const type = arg1

			// Add Listener
			const unbind: IDisposable = DOM.addDisposableListener(this.currentElement, type, (e: Event) => {
				fn(e, this, unbind) // Pass in Builder as Second Argument
			}, useCapture || false)

			// Remember for off() use
			if (useCapture) {
				if (!this.captureToUnbind[type]) {
					this.captureToUnbind[type] = []
				}
				this.captureToUnbind[type].push(unbind)
			} else {
				if (!this.toUnbind[type]) {
					this.toUnbind[type] = []
				}
				this.toUnbind[type].push(unbind)
			}

			// Bind to Element
			const listenerBinding: IDisposable[] = this.getProperty(LISTENER_BINDING_ID, [])
			listenerBinding.push(unbind)
			this.setProperty(LISTENER_BINDING_ID, listenerBinding)

			// Add to Array if passed in
			if (listenerToUnbindContainer && types.isArray(listenerToUnbindContainer)) {
				listenerToUnbindContainer.push(unbind)
			}
		}

		return this
	}

	/**
	 *  Removes all listeners from all elements created by the builder for the given event type.
	 */
	off(type: string, useCapture?: boolean): Builder;
	off(typeArray: string[], useCapture?: boolean): Builder;
	off(arg1: any, useCapture?: boolean): Builder {

		// Event Type Array
		if (types.isArray(arg1)) {
			arg1.forEach((type: string) => {
				this.off(type)
			})
		}

		// Single Event Type
		else {
			const type = arg1
			if (useCapture) {
				if (this.captureToUnbind[type]) {
					this.captureToUnbind[type] = dispose(this.captureToUnbind[type])
				}
			} else {
				if (this.toUnbind[type]) {
					this.toUnbind[type] = dispose(this.toUnbind[type])
				}
			}
		}

		return this
	}

}

/**
 *  The multi builder provides the same methods as the builder, but allows to call
 *  them on an array of builders.
 */

export class MultiBuilder extends Builder {

	length: number;

	private builders: Builder[];

	constructor(multiBuilder: MultiBuilder);
	constructor(builder: Builder);
	constructor(builders: Builder[]);
	constructor(elements: HTMLElement[]);
	constructor(builders: any) {
		assert.ok(types.isArray(builders) || builders instanceof MultiBuilder, 'Expected Array or MultiBuilder as parameter')

		super()
		this.length = 0
		this.builders = []

		// Add Builders to Array
		if (types.isArray(builders)) {
			for (let i = 0; i < builders.length; i++) {
				if (builders[i] instanceof HTMLElement) {
					this.push(withElement(builders[i]))
				} else {
					this.push(builders[i])
				}
			}
		} else {
			for (let i = 0; i < (<MultiBuilder>builders).length; i++) {
				this.push((<MultiBuilder>builders).item(i))
			}
		}

		// Mixin Builder functions to operate on all builders
		const $outer = this
		const propertyFn = (prop: string) => {
			(<any>$outer)[prop] = function (): any {
				const args = Array.prototype.slice.call(arguments)

				let returnValues: any[]
				let mergeBuilders = false

				for (let i = 0; i < $outer.length; i++) {
					const res = (<any>$outer.item(i))[prop].apply($outer.item(i), args)

					// Merge MultiBuilders into one
					if (res instanceof MultiBuilder) {
						if (!returnValues) {
							returnValues = []
						}
						mergeBuilders = true

						for (let j = 0; j < (<MultiBuilder>res).length; j++) {
							returnValues.push((<MultiBuilder>res).item(j))
						}
					}

					// Any other Return Type (e.g. boolean, integer)
					else if (!types.isUndefined(res) && !(res instanceof Builder)) {
						if (!returnValues) {
							returnValues = []
						}

						returnValues.push(res)
					}
				}

				if (returnValues && mergeBuilders) {
					return new MultiBuilder(returnValues)
				}

				return returnValues || $outer
			}
		}

		for (const prop in Builder.prototype) {
			if (prop !== 'clone' && prop !== 'and') { // Skip methods that are explicitly defined in MultiBuilder
				if (Builder.prototype.hasOwnProperty(prop) && types.isFunction((<any>Builder).prototype[prop])) {
					propertyFn(prop)
				}
			}
		}
	}

	item(i: number): Builder {
		return this.builders[i]
	}

	push(...items: Builder[]): void {
		for (let i = 0; i < items.length; i++) {
			this.builders.push(items[i])
		}

		this.length = this.builders.length
	}

	pop(): Builder {
		const element = this.builders.pop()
		this.length = this.builders.length

		return element
	}

	concat(items: Builder[]): Builder[] {
		const elements = this.builders.concat(items)
		this.length = this.builders.length

		return elements
	}

	shift(): Builder {
		const element = this.builders.shift()
		this.length = this.builders.length

		return element
	}

	unshift(item: Builder): number {
		const res = this.builders.unshift(item)
		this.length = this.builders.length

		return res
	}

	slice(start: number, end?: number): Builder[] {
		const elements = this.builders.slice(start, end)
		this.length = this.builders.length

		return elements
	}

	splice(start: number, deleteCount?: number): Builder[] {
		const elements = this.builders.splice(start, deleteCount)
		this.length = this.builders.length

		return elements
	}

	clone(): MultiBuilder {
		return new MultiBuilder(this)
	}

	and(element: HTMLElement): MultiBuilder;
	and(builder: Builder): MultiBuilder;
	and(obj: any): MultiBuilder {

		// Convert HTMLElement to Builder as necessary
		if (!(obj instanceof Builder) && !(obj instanceof MultiBuilder)) {
			obj = new Builder((<HTMLElement>obj))
		}

		const builders: Builder[] = []
		if (obj instanceof MultiBuilder) {
			for (let i = 0; i < (<MultiBuilder>obj).length; i++) {
				builders.push((<MultiBuilder>obj).item(i))
			}
		} else {
			builders.push(obj)
		}

		this.push.apply(this, builders)

		return this
	}
}

function withBuilder(builder: Builder, offdom?: boolean): Builder {
	if (builder instanceof MultiBuilder) {
		return new MultiBuilder((<MultiBuilder>builder))
	}

	return new Builder(builder.getHTMLElement(), offdom)
}

function withElement(element: HTMLElement, offdom?: boolean): Builder {
	return new Builder(element, offdom)
}

function offDOM(): Builder {
	return new Builder(null, true)
}

// Binding functions

/**
 *  Allows to store arbritary data into element.
 */
export function setPropertyOnElement(element: HTMLElement, key: string, value: any): void {
	setData(element,value, key)
}

/**
 *  Allows to get arbritary data from element.
 */
export function getPropertyFromElement(element: HTMLElement, key: string, fallback?: any): any {
	if (hasData(element)) {
		const value = getData(element,key)
		if (!types.isUndefined(value)) {
			return value
		}
	}
	return fallback
}

/**
 *  Removes a property from an element.
 */
export function removePropertyFromElement(element: HTMLElement, key: string): void {
	if (hasData(element)) {
		deleteData(element,key)
	}
}

/**
 *  Adds the provided object as property to the given element. Call getBinding()
 *  to retrieve it again.
 */
export function bindElement(element: HTMLElement, object: any): void {
	setPropertyOnElement(element, DATA_BINDING_ID, object)
}

/**
 *  Removes the binding of the given element.
 */
export function unbindElement(element: HTMLElement): void {
	removePropertyFromElement(element, DATA_BINDING_ID)
}

/**
 *  Returns the object that was passed into the bind() call for the element.
 */
export function getBindingFromElement(element: HTMLElement): any {
	return getPropertyFromElement(element, DATA_BINDING_ID)
}

export const Binding = {
	setPropertyOnElement: setPropertyOnElement,
	getPropertyFromElement: getPropertyFromElement,
	removePropertyFromElement: removePropertyFromElement,
	bindElement: bindElement,
	unbindElement: unbindElement,
	getBindingFromElement: getBindingFromElement
}

export function withElementById(id: string, offdom?: boolean): Builder {
	assert.ok(types.isString(id), 'Expected String as parameter')

	const element = document.getElementById(id)
	if (element) {
		return new Builder(element, offdom)
	}

	return null
}

export const Build = {
	withElementById: withElementById
}

//const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((.([\w\-]+))*)/
const SELECTOR_REGEX = /([\w-]+)?(#([\w-]+))?((.([\w-]+))*)/

export const $: IQuickBuilder = function (arg?: any): Builder {

	if (types.isUndefined(arg)) {
		return offDOM()
	}

	// Falsified values cause error otherwise
	if (!arg) {
		throw new Error('Bad use of $')
	}

	// Wrap the given element
	if (DOM.isHTMLElement(arg) || arg === window) {
		return withElement(arg)
	}

	// Wrap the given builders
	if (types.isArray(arg)) {
		return new MultiBuilder(arg)
	}

	// Wrap the given builder
	if (arg instanceof Builder) {
		return withBuilder((<Builder>arg))
	}

	if (types.isString(arg)) {

		// Use the argument as HTML code
		if (arg[0] === '<') {
			let element: Node
			const container = document.createElement('div')
			//container.innerHTML = strings.format.apply(strings, arguments)
			container.innerHTML = strings.format(arg)

			if (container.children.length === 0) {
				throw new Error('Bad use of $')
			}

			if (container.children.length === 1) {
				element = container.firstChild
				container.removeChild(element)

				return withElement(<HTMLElement>element)
			}

			const builders: Builder[] = []
			while (container.firstChild) {
				element = container.firstChild
				container.removeChild(element)
				builders.push(withElement(<HTMLElement>element))
			}

			return new MultiBuilder(builders)
		}

		// Use the argument as a selector constructor
		else if (arguments.length === 1) {
			const match = SELECTOR_REGEX.exec(arg)
			if (!match) {
				throw new Error('Bad use of $')
			}

			const tag = match[1] || 'div'
			const id = match[3] || undefined
			const classes = (match[4] || '').replace(/\./g, ' ')

			const props: any = {}
			if (id) {
				props['id'] = id
			}

			if (classes) {
				props['class'] = classes
			}

			return offDOM().element(tag, props)
		}

		// Use the arguments as the arguments to Builder#element(...)
		else {
			const result = offDOM()
			// result.element.apply(result, arguments)
			result.element(<string>arg)
			return result
		}
	} else {
		throw new Error('Bad use of $')
	}
}
