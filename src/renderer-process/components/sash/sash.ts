'use strict'

import 'css!./sash'

import { IDisposable, dispose } from '../../../common/disposable'
import { Builder, $ } from '../../base/builder'
import * as types from '../../../common/types'
import * as DOM from '../../base/dom'
import { EventEmitter  } from '../../base/event'
/* import { StandardMouseEvent } from '../../base/mouseEvent' */


export interface ISashLayoutProvider { }

export interface IVerticalSashLayoutProvider extends ISashLayoutProvider {
	getVerticalSashLeft(sash: Sash): number;
	getVerticalSashTop?(sash: Sash): number;
	getVerticalSashHeight?(sash: Sash): number;
}

export interface IHorizontalSashLayoutProvider extends ISashLayoutProvider {
	getHorizontalSashTop(sash: Sash): number;
	getHorizontalSashLeft?(sash: Sash): number;
	getHorizontalSashWidth?(sash: Sash): number;
}

export interface ISashEvent {
	startX: number;
	currentX: number;
	startY: number;
	currentY: number;
}

export interface ISashOptions {
	baseSize?: number;
	orientation?: Orientation;
}

export enum Orientation {
	VERTICAL,
	HORIZONTAL
}

export class Sash extends EventEmitter {

	private $e: Builder;
	private layoutProvider: ISashLayoutProvider;
	private isDisabled: boolean;
	private hidden: boolean;
	private orientation: Orientation;
	private size: number;

	constructor(container: HTMLElement, layoutProvider: ISashLayoutProvider, options: ISashOptions = {}) {
		super()

		this.$e = $('.app-sash').appendTo(container)

		//this.gesture = new Gesture(this.$e.getHTMLElement())

		/* this.$e.on(DOM.EventType.MOUSE_DOWN, (e: MouseEvent ) => { this.onMouseDown(e) })
		this.$e.on(DOM.EventType.DBLCLICK, (e: MouseEvent) => { this.emit('reset', e) }) */
		//this.$e.on(EventType.Start, (e: GestureEvent) => { this.onTouchStart(e) })

		this.size = options.baseSize || 5
		this.setOrientation(options.orientation || Orientation.VERTICAL)

		this.isDisabled = false
		this.hidden = false
		this.layoutProvider = layoutProvider
	}

	getHTMLElement(): HTMLElement {
		return this.$e.getHTMLElement()
	}

	setOrientation(orientation: Orientation): void {
		this.orientation = orientation

		this.$e.removeClass('horizontal', 'vertical')
		this.$e.addClass(this.getOrientation())

		if (this.orientation === Orientation.HORIZONTAL) {
			this.$e.size(null, this.size)
		} else {
			this.$e.size(this.size)
		}

		if (this.layoutProvider) {
			this.layout()
		}
	}

	private getOrientation(): 'horizontal' | 'vertical' {
		return this.orientation === Orientation.HORIZONTAL ? 'horizontal' : 'vertical'
	}

	private onMouseDown(e: MouseEvent): void {
		DOM.EventHelper.stop(e, false)

		if (this.isDisabled) {
			return
		}

		const iframes: Builder = $(DOM.getElementsByTagName('iframe'))
		if (iframes) {
			iframes.style('pointer-events', 'none') // disable mouse events on iframes as long as we drag the sash
		}

		/* const mouseDownEvent = new StandardMouseEvent(e)
		const startX = mouseDownEvent.posx
		const startY = mouseDownEvent.posy

		const startEvent: ISashEvent = {
			startX: startX,
			currentX: startX,
			startY: startY,
			currentY: startY
		}

		this.$e.addClass('active')
		this.emit('start', startEvent)

		const $window = $(window)
		const containerCSSClass = `${this.getOrientation()}-cursor-container`

		let lastCurrentX = startX
		let lastCurrentY = startY */

		/* $window.on('mousemove', (e: MouseEvent) => {
			DOM.EventHelper.stop(e, false)
			const mouseMoveEvent = new StandardMouseEvent(e)

			const event: ISashEvent = {
				startX: startX,
				currentX: mouseMoveEvent.posx,
				startY: startY,
				currentY: mouseMoveEvent.posy
			}

			lastCurrentX = mouseMoveEvent.posx
			lastCurrentY = mouseMoveEvent.posy

			this.emit('change', event)
		}).once('mouseup', (e: MouseEvent) => {
			DOM.EventHelper.stop(e, false)
			this.$e.removeClass('active')
			this.emit('end')

			$window.off('mousemove')
			document.body.classList.remove(containerCSSClass)

			const iframes = $(DOM.getElementsByTagName('iframe'))
			if (iframes) {
				iframes.style('pointer-events', 'auto')
			}
		}) */

		//document.body.classList.add(containerCSSClass)
	}


	layout(): void {
		let style: { top?: string; left?: string; height?: string; width?: string; }

		if (this.orientation === Orientation.VERTICAL) {
			const verticalProvider = (<IVerticalSashLayoutProvider>this.layoutProvider)
			style = { left: verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + 'px' }

			if (verticalProvider.getVerticalSashTop) {
				style.top = verticalProvider.getVerticalSashTop(this) + 'px'
			}

			if (verticalProvider.getVerticalSashHeight) {
				style.height = verticalProvider.getVerticalSashHeight(this) + 'px'
			}
		} else {
			const horizontalProvider = (<IHorizontalSashLayoutProvider>this.layoutProvider)
			style = { top: horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + 'px' }

			if (horizontalProvider.getHorizontalSashLeft) {
				style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px'
			}

			if (horizontalProvider.getHorizontalSashWidth) {
				style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px'
			}
		}
		this.$e.style(style)
	}

	show(): void {
		this.hidden = false
		this.$e.show()
	}

	hide(): void {
		this.hidden = true
		this.$e.hide()
	}

	isHidden(): boolean {
		return this.hidden
	}

	enable(): void {
		this.$e.removeClass('disabled')
		this.isDisabled = false
	}

	disable(): void {
		this.$e.addClass('disabled')
		this.isDisabled = true
	}

	dispose(): void {
		if (this.$e) {
			this.$e.destroy()
			this.$e = null
		}
		super.dispose()
	}
}
