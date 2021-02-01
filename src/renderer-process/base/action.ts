/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { IEvent,IEventEmitter, EventEmitter, Emitter, EventType } from './event'
import { IDisposable } from '../../common/disposable'
/* import { CPromise } from '../../common/promise' */
//import * as Events from 'vs/base/common/events'

import { Promise } from 'bluebird'

export interface IAction extends IDisposable {
	id: string;
	label: string;
	tooltip: string;
	class: string;
	enabled: boolean;
	checked: boolean;
	radio: boolean;
	run(event?: any): Promise<any>;
}

export interface IActionRunner extends IEventEmitter {
	run(action: IAction, context?: any): Promise<any>;
}

export interface IActionItem extends IEventEmitter {
	actionRunner: IActionRunner;
	setActionContext(context: any): void;
	render(element: any /* HTMLElement */): void;
	isEnabled(): boolean;
	focus(): void;
	blur(): void;
	dispose(): void;
}


export interface IActionChangeEvent {
	label?: string;
	tooltip?: string;
	class?: string;
	enabled?: boolean;
	checked?: boolean;
	radio?: boolean;
}


export interface IActionCallback {
	(event?: any): Promise<any>;
}

export interface IActionProvider {
	getAction(id: string): IAction;
}

export class Action implements IAction {

	protected _onDidChange = new Emitter<IActionChangeEvent>();
	protected _id: string;
	protected _label: string;
	protected _tooltip: string;
	protected _cssClass: string;
	protected _enabled: boolean;
	protected _checked: boolean;
	protected _radio: boolean;
	protected _order: number;
	protected _actionCallback: (event?: any) => Promise<any>;

	constructor(id: string, label: string = '',
				cssClass: string = '',
				enabled: boolean = true,
				actionCallback?: IActionCallback ) {
		this._id = id
		this._label = label
		this._cssClass = cssClass
		this._enabled = enabled
		this._actionCallback = actionCallback
	}

	dispose() {
		this._onDidChange.dispose()
	}

	get onDidChange(): IEvent<IActionChangeEvent> {
		return this._onDidChange.event
	}

	get id(): string {
		return this._id
	}

	get label(): string {
		return this._label
	}

	set label(value: string) {
		this._setLabel(value)
	}

	protected _setLabel(value: string): void {
		if (this._label !== value) {
			this._label = value
			this._onDidChange.fire({ label: value })
		}
	}

	get tooltip(): string {
		return this._tooltip
	}

	set tooltip(value: string) {
		this._setTooltip(value)
	}

	protected _setTooltip(value: string): void {
		if (this._tooltip !== value) {
			this._tooltip = value
			this._onDidChange.fire({ tooltip: value })
		}
	}

	get class(): string {
		return this._cssClass
	}

	set class(value: string) {
		this._setClass(value)
	}

	protected _setClass(value: string): void {
		if (this._cssClass !== value) {
			this._cssClass = value
			this._onDidChange.fire({ class: value })
		}
	}

	get enabled(): boolean {
		return this._enabled
	}

	set enabled(value: boolean) {
		this._setEnabled(value)
	}

	protected _setEnabled(value: boolean): void {
		if (this._enabled !== value) {
			this._enabled = value
			this._onDidChange.fire({ enabled: value })
		}
	}

	get checked(): boolean {
		return this._checked
	}

	set checked(value: boolean) {
		this._setChecked(value)
	}

	get radio(): boolean {
		return this._radio
	}

	set radio(value: boolean) {
		this._setRadio(value)
	}

	protected _setChecked(value: boolean): void {
		if (this._checked !== value) {
			this._checked = value
			this._onDidChange.fire({ checked: value })
		}
	}

	protected _setRadio(value: boolean): void {
		if (this._radio !== value) {
			this._radio = value
			this._onDidChange.fire({ radio: value })
		}
	}

	get order(): number {
		return this._order
	}

	set order(value: number) {
		this._order = value
	}

	run(event?: any, data?: any): Promise<any> {
		if (this._actionCallback !== void 0) {
			return this._actionCallback(event)
		}
		//return Promise.as(true)
		return Promise.resolve(true)
	}
}
/**
 * Checks if the provided object is compatible
 * with the IAction interface.
 * @param thing an object
 */
export function isAction(thing: any): thing is IAction {
	if (!thing) {
		return false
	} else if (thing instanceof Action) {
		return true
	} else if (typeof thing.id !== 'string') {
		return false
	} else if (typeof thing.label !== 'string') {
		return false
	} else if (typeof thing.class !== 'string') {
		return false
	} else if (typeof thing.enabled !== 'boolean') {
		return false
	} else if (typeof thing.checked !== 'boolean') {
		return false
	} else if (typeof thing.run !== 'function') {
		return false
	} else {
		return true
	}
}

export interface IRunEvent {
	action: IAction;
	result?: any;
	error?: any;
}


export class ActionRunner extends EventEmitter implements IActionRunner {

	run(action: IAction, context?: any): Promise<any> {
		if (!action.enabled) {
			//return CPromise.as(null)
			return Promise.resolve(null)
		}

		this.emit(EventType.BEFORE_RUN, { action: action })

		let resultVar: any = null
		action.run(context).then(result=>{
			this.emit(EventType.RUN, <IRunEvent>{ action: action, result: result })
			resultVar=result
		},error =>{
			this.emit(EventType.RUN, <IRunEvent>{ action: action, error: error })
		}).catch((error)=>{
			this.emit(EventType.RUN, <IRunEvent>{ action: action, error: error })
		}).finally(()=> {
			return new Promise<any>((resolve,reject)=>{
				if (resultVar === null){
					reject()
				} else {
					resolve(resultVar)
				}
			})
		})
	}
}

