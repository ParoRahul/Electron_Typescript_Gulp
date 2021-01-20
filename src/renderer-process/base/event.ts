/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDisposable } from '../../common/disposable'
import { CallbackList } from './callbackList'
import * as errors from './errors'

export interface IEvent<T> {
	(listener: (e: T) => any, disposables?: IDisposable[], thisArgs?: any): IDisposable;
}

export interface IEmitterOptions {
	onFirstListenerAdd?: Function;
	onFirstListenerDidAdd?: Function;
	onLastListenerRemove?: Function;
}

export class Emitter<T> {

	private static _noop = function () {return};

	private _event: IEvent<T>;
	private _callbacks: CallbackList;
	private _disposed: boolean;

	constructor(private _options?: IEmitterOptions) {

	}

	/**
	 * For the public to allow to subscribe
	 * to events from this Emitter
	 */
	get event(): IEvent<T> {
		if (this._event) {
			return this._event
		}
		this._event = (listener: (e: T) => any, disposables?: IDisposable[], thisArgs?: any ) => {
			if (!this._callbacks) {
				this._callbacks = new CallbackList()
			}
			const firstListener = this._callbacks.isEmpty()
			if (firstListener && this._options && this._options.onFirstListenerAdd) {
				this._options.onFirstListenerAdd(this)
			}
			this._callbacks.add(listener, thisArgs)
			if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
				this._options.onFirstListenerDidAdd(this)
			}
			const result: IDisposable = {
				dispose: () => {
					result.dispose = Emitter._noop
					if (!this._disposed) {
						this._callbacks.remove(listener, thisArgs)
						if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
							this._options.onLastListenerRemove(this)
						}
					}
				}
			}
			if (Array.isArray(disposables)) {
				disposables.push(result)
			}
			return result
		}
		return this._event
	}

	/**
	 * To be kept private to fire an event to
	 * subscribers
	 */
	fire(event?: T): any {
		if (this._callbacks) {
			this._callbacks.invoke.call(this._callbacks, event)
		}
	}

	dispose(): void {
		if (this._callbacks) {
			this._callbacks.dispose()
			this._callbacks = undefined
			this._disposed = true
		}
	}
}

export class EmitterEvent {

	private _type: string;
	private _data: any;

	constructor(eventType: string = null, data: any = null) {
		this._type = eventType
		this._data = data
	}

	getType(): string {
		return this._type
	}

	getData(): any {
		return this._data
	}
}

export interface IListenerUnbind {
	():void;
}

export interface IListenerCallback {
	(value: any): void;
}

export interface IBulkListenerCallback {
	(value: EmitterEvent[]): void;
}

export interface IEventEmitter extends IDisposable {
	addListener2(eventType: string, listener: IListenerCallback): IDisposable;
	addOneTimeDisposableListener(eventType: string, listener: IListenerCallback): IDisposable;
	addBulkListener2(listener: IBulkListenerCallback): IDisposable;
	addEmitter2(eventEmitter: IEventEmitter): IDisposable;
}

export interface IListenersMap {
	[key: string]: IListenerCallback[];
}

function safeInvokeNoArg<T>(func: Function): T {
	try {
		return func()
	} catch (e) {
		errors.onUnexpectedError(e)
	}
	return undefined
}

function safeInvoke1Arg(func: Function, arg1: any): any {
	try {
		return func(arg1)
	} catch (e) {
		errors.onUnexpectedError(e)
	}
}

export class EventEmitter implements IEventEmitter {

	protected _listeners: IListenersMap;
	protected _bulkListeners: IListenerCallback[];
	private _collectedEvents: EmitterEvent[];
	private _deferredCnt: number;
	private _allowedEventTypes: { [eventType: string]: boolean; };

	constructor(allowedEventTypes: string[] = null) {
		this._listeners = {}
		this._bulkListeners = []
		this._collectedEvents = []
		this._deferredCnt = 0
		if (allowedEventTypes) {
			this._allowedEventTypes = {}
			for (let i = 0; i < allowedEventTypes.length; i++) {
				this._allowedEventTypes[allowedEventTypes[i]] = true
			}
		} else {
			this._allowedEventTypes = null
		}
	}

	dispose(): void {
		this._listeners = {}
		this._bulkListeners = []
		this._collectedEvents = []
		this._deferredCnt = 0
		this._allowedEventTypes = null
	}

	private addListener(eventType: string, listener: IListenerCallback): IDisposable {
		if (eventType === '*') {
			throw new Error('Use addBulkListener(listener) to register your listener!')
		}

		if (this._allowedEventTypes && !this._allowedEventTypes.hasOwnProperty(eventType)) {
			throw new Error('This object will never emit this event type!')
		}

		if (this._listeners.hasOwnProperty(eventType)) {
			this._listeners[eventType].push(listener)
		} else {
			this._listeners[eventType] = [listener]
		}
		let bound = this
		return {
			dispose: () => {
				if (!bound) {
					// Already called
					return
				}
				bound._removeListener(eventType, listener)
				// Prevent leakers from holding on to the event emitter
				bound = null
				listener = null
			}
		}
	}

	addListener2(eventType: string, listener: IListenerCallback): IDisposable {
		return this.addListener(eventType, listener)
	}

	addOneTimeDisposableListener(eventType: string, listener: IListenerCallback): IDisposable {
		const disposable = this.addListener(eventType, value => {
			disposable.dispose()
			listener(value)
		})
		return disposable
	}

	protected addBulkListener(listener: IBulkListenerCallback): IDisposable {
		this._bulkListeners.push(listener)
		return {
			dispose: () => {
				this._removeBulkListener(listener)
			}
		}
	}

	addBulkListener2(listener: IBulkListenerCallback): IDisposable {
		return this.addBulkListener(listener)
	}

	private addEmitter(eventEmitter: IEventEmitter): IDisposable {
		return eventEmitter.addBulkListener2((events: EmitterEvent[]): void => {
			const newEvents = events
			if (this._deferredCnt === 0) {
				this._emitEvents(<EmitterEvent[]>newEvents)
			} else {
				// Collect for later
				newEvents.forEach(events => {this._collectedEvents.push(events)})
			}
		})
	}

	addEmitter2(eventEmitter: IEventEmitter): IDisposable {
		return this.addEmitter(eventEmitter)
	}

	private _removeListener(eventType: string, listener: IListenerCallback): void {
		if (this._listeners.hasOwnProperty(eventType)) {
			const listeners = this._listeners[eventType]
			for (let i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i] === listener) {
					listeners.splice(i, 1)
					break
				}
			}
		}
	}

	private _removeBulkListener(listener: IBulkListenerCallback): void {
		for (let i = 0, len = this._bulkListeners.length; i < len; i++) {
			if (this._bulkListeners[i] === listener) {
				this._bulkListeners.splice(i, 1)
				break
			}
		}
	}

	protected _emitToSpecificTypeListeners(eventType: string, data: any): void {
		if (this._listeners.hasOwnProperty(eventType)) {
			const listeners = this._listeners[eventType].slice(0)
			for (let i = 0, len = listeners.length; i < len; i++) {
				safeInvoke1Arg(listeners[i], data)
			}
		}
	}

	protected _emitToBulkListeners(events: EmitterEvent[]): void {
		const bulkListeners = this._bulkListeners.slice(0)
		for (let i = 0, len = bulkListeners.length; i < len; i++) {
			safeInvoke1Arg(bulkListeners[i], events)
		}
	}

	protected _emitEvents(events: EmitterEvent[]): void {
		if (this._bulkListeners.length > 0) {
			this._emitToBulkListeners(events)
		}
		for (let i = 0, len = events.length; i < len; i++) {
			const e = events[i]
			this._emitToSpecificTypeListeners(e.getType(), e.getData())
		}
	}

	emit(eventType: string, data: any = {}): void {
		if (this._allowedEventTypes && !this._allowedEventTypes.hasOwnProperty(eventType)) {
			throw new Error('Cannot emit this event type because it wasn\'t white-listed!')
		}
		// Early return if no listeners would get this
		if (!this._listeners.hasOwnProperty(eventType) && this._bulkListeners.length === 0) {
			return
		}
		const emitterEvent = new EmitterEvent(eventType, data)

		if (this._deferredCnt === 0) {
			this._emitEvents([emitterEvent])
		} else {
			// Collect for later
			this._collectedEvents.push(emitterEvent)
		}
	}

	protected _beginDeferredEmit(): void {
		this._deferredCnt = this._deferredCnt + 1
	}

	protected _endDeferredEmit(): void {
		this._deferredCnt = this._deferredCnt - 1

		if (this._deferredCnt === 0) {
			this._emitCollected()
		}
	}

	deferredEmit<T>(callback: () => T): T {
		this._beginDeferredEmit()

		const result: T = safeInvokeNoArg<T>(callback)

		this._endDeferredEmit()

		return result
	}

	private _emitCollected(): void {
		// Flush collected events
		const events = this._collectedEvents
		this._collectedEvents = []

		if (events.length > 0) {
			this._emitEvents(events)
		}
	}
}

export class Event {
	time: number;
	originalEvent: Event;
	source: any;

	constructor(originalEvent?: Event) {
		this.time = (new Date()).getTime()
		this.originalEvent = originalEvent
		this.source = null
	}
}

export class PropertyChangeEvent extends Event {
	key: string;
	oldValue: any;
	newValue: any;

	constructor(key?: string, oldValue?: any, newValue?: any, originalEvent?: Event) {
		super(originalEvent)

		this.key = key
		this.oldValue = oldValue
		this.newValue = newValue
	}
}

export class ViewerEvent extends Event {
	element: any;

	constructor(element: any, originalEvent?: Event) {
		super(originalEvent)

		this.element = element
	}
}

export interface ISelectionEvent {
	selection: any[];
	payload?: any;
	source: any;
}

export interface IFocusEvent {
	focus: any;
	payload?: any;
	source: any;
}

export interface IHighlightEvent {
	highlight: any;
	payload?: any;
	source: any;
}

export const EventType = {
	PROPERTY_CHANGED: 'propertyChanged',
	SELECTION: 'selection',
	FOCUS: 'focus',
	BLUR: 'blur',
	HIGHLIGHT: 'highlight',
	EXPAND: 'expand',
	COLLAPSE: 'collapse',
	TOGGLE: 'toggle',
	CONTENTS_CHANGED: 'contentsChanged',
	BEFORE_RUN: 'beforeRun',
	RUN: 'run',
	EDIT: 'edit',
	SAVE: 'save',
	CANCEL: 'cancel',
	CHANGE: 'change',
	DISPOSE: 'dispose',
}

