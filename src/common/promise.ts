/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { isFunction, isUndefinedOrNull } from './types'
import { IDisposable } from './disposable'
import { CancelError } from './errors'

export type TRejectHandler = (reason?: unknown) => void

export type TCancelableExcutor<T> = (
		resolve: (value?: T | Promise<T>) => void,
		reject: TRejectHandler ,
		onCancel: Function
	) => void

export interface ICpromise<T>  {
	then<T1=T,T2=never>(onFulfilled?:((value:T)=> T1| PromiseLike<T1>)| undefined| null,
						onRejected?:((reason: unknown)=> T2 |PromiseLike<T2>)|undefined| null
						): Promise<T1|T2>
	catch<T3=never>(onRejected?:((reason: unknown)=> T3 |PromiseLike<T3>)|undefined| null): Promise<T|T3>

	finally(onFinally?: (()=> void| undefined| null), runwhenCancled?: boolean ): Promise<T>

	cancel(reason?: string): void

	isCanceled: boolean;
}

export const defaultCancelHandler: Function = function(){ return }

export const defaultRejectHandler: TRejectHandler = function( reason?: unknown){
	throw new Error(<string> reason || 'Promise was canceled')
}

export const defaultExcutator: TCancelableExcutor<void> = function(resolve,defaultRejectHandler,defaultCancelHandler){
	try{
		resolve()
	} catch( e ){
		defaultRejectHandler()
	}
}


export class CPromise<T> implements ICpromise<T>, IDisposable {

	private _isCanceled : boolean;
	private _isPending: boolean;
	private _rejectOnCancel: boolean;
	private _promise: Promise<T>;
	private _cancelHandlers: Function[];
	private _reject: Function;

	static as(value:any){
		return new CPromise<typeof value>((resolve, reject)=>{
			try{
				resolve(value)
			}
			catch(e: unknown){
				reject(e)
			}
		})
	}

	static wrap(value:any){
		return new CPromise<typeof value>((resolve, reject)=>{
			try{
				resolve(value)
			}
			catch(e: unknown){
				reject(e)
			}
		})
	}

	constructor(executor: TCancelableExcutor<T> ) {
		this._cancelHandlers = []
		this._isPending = true
		this._isCanceled = false
		this._rejectOnCancel = true

		this._promise = new Promise<T>((resolve: Function , reject: Function) => {

			this._reject = reject

			const onResolve = <T>(value:T) => {
				if (!this._isCanceled){
					this._isPending = false
					resolve(value)
				}
			}

			const onReject = (error: unknown ) => {
				this._isPending = false
				reject(error)
			}

			const onCancel = (handler: Function ) => {
				if (!this._isPending) {
					throw new Error('The `onCancel` handler was attached after the promise settled.')
				}
				this._cancelHandlers.push(handler)
			}

			return executor(onResolve, onReject, onCancel)
		})
	}

	then<T1=T, T2=never> (onFulfilled?:((value:T)=> T1| PromiseLike<T1>)| undefined| null,
							onRejected?:((reason: unknown)=> T2 |PromiseLike<T2>)|undefined| null): Promise<T1|T2>{
		return this._promise.then(onFulfilled, onRejected)
	}

	catch<T3=never>(onRejected?:((reason: unknown)=> T3 |PromiseLike<T3>)|undefined| null): Promise<T|T3> {
		return this._promise.catch(onRejected)
	}

	finally(onFinally?: (()=> void| undefined| null), runwhenCancled?: boolean ): Promise<T> {
		return this._promise.finally(onFinally)
	}

	cancel(reason?: string): void {
		if (!this._isPending || this._isCanceled) {
			return
		}
		this._isCanceled = true
		try {
			while (this._cancelHandlers.length){
				const handler = this._cancelHandlers.pop()
				if (isFunction(handler))
					handler()
			}
			this.dispose()
		}
		catch (error: unknown) {
			this._reject(error)
			return
		}
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason))
		}
	}

	get isCanceled() {
		return this._isCanceled
	}

	dispose(){
		if (!this._isCanceled &&this._isPending || !this._isCanceled) {
			return
		}
		while (this._cancelHandlers.length){
			this._cancelHandlers.pop()
		}
		this._cancelHandlers = null
		this._reject = null
	}
}

export class Tpromise<T> implements ICpromise<T> , IDisposable{
	private _isCanceled : boolean;
	private _isPending: boolean;
	private _rejectOnCancel: boolean;
	private _promise: Promise<T>;
	private _cancelHandlers: Function[];
	private _reject: Function;
	private _timeoutId:  null | ReturnType<typeof setTimeout>

	constructor(executor: TCancelableExcutor<T>, private readonly _delay: number ) {
		this._cancelHandlers = []
		this._isPending = true
		this._isCanceled = false
		this._rejectOnCancel = false
		this._timeoutId = null

		this._promise = new Promise<T>((resolve: Function , reject: Function) => {
			this._reject = reject

			const onResolve = <T>(value:T) => {
				this._timeoutId = setTimeout(() => {
					if (!this._isCanceled){
							console.log('This is under Resolve')
							this._isPending = false
							resolve(value)
					}
				}, this._delay)
			}

			const onReject = (error: unknown ) => {
				this._isPending = false
				reject(error)
			}

			const onCancel = (onCancelHandler: Function) => {
				if (!this._isPending) {
					throw new Error('The `onCancel` handler was attached after the promise settled.')
				}
				if (isFunction(onCancelHandler))
					this._cancelHandlers.push(onCancelHandler)
			}

			return executor(onResolve, onReject, onCancel)
		})
	}

	then<T1=T, T2=never> (onFulfilled?:((value:T)=> T1| PromiseLike<T1>)| undefined| null,
							onRejected?:((reason: unknown)=> T2 |PromiseLike<T2>)|undefined| null): Promise<T1|T2>{
		return this._promise.then(onFulfilled, onRejected)
	}

	catch<T3=never>(onRejected?:((reason: unknown)=> T3 |PromiseLike<T3>)|undefined| null): Promise<T|T3> {
		return this._promise.catch(onRejected)
	}

	finally(onFinally?: (()=> void| undefined| null), runwhenCancled?: boolean ): Promise<T> {
		return this._promise.finally(onFinally)
	}

	cancel(reason?: string): void {
		if (!this._isPending || this._isCanceled) {
			return
		}
		this._isCanceled = true
		if (isUndefinedOrNull(this._timeoutId ))
				clearTimeout(this._timeoutId)
		try {
			while (this._cancelHandlers.length){
				const handler = this._cancelHandlers.pop()
				if (isFunction(handler))
						handler()
			}
			this.dispose()
		}
		catch (error) {
			this._reject(error)
			return
		}
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason))
		}
	}

	get isCanceled() {
		return this._isCanceled
	}

	dispose(){
		if (!this._isCanceled &&this._isPending || !this._isCanceled) {
			return
		}
		if (isUndefinedOrNull(this._timeoutId ) ){
			clearTimeout(this._timeoutId)
		}
		while (this._cancelHandlers.length){
			this._cancelHandlers.pop()
		}
		this._timeoutId = null
		this._cancelHandlers = null
		this._reject = null
	}
}

export class DPromise extends Tpromise<void>{

	constructor(delay: number = 0){
		super(defaultExcutator,delay)
	}
}


export type TSimpleDlayPromise = (delay: number)=> Tpromise<void>

export const delayPromise: TSimpleDlayPromise = function( delay:number ){
		return new Tpromise<void>(defaultExcutator,delay)
}

export function truePromise(): Promise<boolean>{
	return new Promise<boolean>((resole,reject)=> {
		try{
			resole(true)
		} catch(e){
			reject()
		}
	})
}

export function nullPromise(): Promise<null>{
	return new Promise<null>((resole,reject)=> {
		try{
			resole(null)
		} catch(e){
			reject()
		}
	})
}

export type TSimpleCancelablePromise = ()=> CPromise<void>

export const simpleCancelablePromise: TSimpleCancelablePromise = function name() {
		return new CPromise<void>(defaultExcutator)
}


function isCpromise(thing: any): thing is CPromise<any> {
	if (!thing) {
		return false
	} else if (thing instanceof CPromise ) {
		return true
	} else if (typeof thing.isCanceled !== 'boolean') {
		return false
	} else if (typeof thing.cancel !== 'function') {
		return false
	} else if (typeof thing.then !== 'function') {
		return false
	} else if (typeof thing.catch !== 'function') {
		return false
	} else if (typeof thing.finally !== 'function') {
		return false
	}  else {
		return true
	}
}

/* action.run(context).then(result=>{
	this.emit(EventType.RUN, <IRunEvent>{ action: action, result: result })
	resultVar=result
},error =>{
	this.emit(EventType.RUN, <IRunEvent>{ action: action, error: error })
}).catch((error)=>{
	this.emit(EventType.RUN, <IRunEvent>{ action: action, error: error })
}).finally(()=> {
	return new CPromise<any>((resolve,reject)=>{
		if (resultVar === null){
			reject()
		} else {
			resolve(resultVar)
		}
	})
}) */

/* new CPromise<any>((resolve, reject)=>{
			try{
				action.run(context).then(result => {
					this.emit(EventType.RUN, <IRunEvent>{ action: action, result: result })
					resolve(result)
				})
			} catch( e: unknown){
				this.emit(EventType.RUN, <IRunEvent>{ action: action, error: e })
				reject(e)
			}
		}) */
		/* return new CPromise<boolean>((resolve, reject)=>{
			try{
				resolve(null)
			}
			catch(e: unknown){
				reject(e)
			}
		}) */