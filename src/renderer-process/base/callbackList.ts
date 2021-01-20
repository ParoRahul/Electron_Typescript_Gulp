/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { IDisposable } from '../../common/disposable'

export class CallbackList {

	private _callbacks: Function[];
	private _contexts: any[];

	add(callback: Function, context: any = null, bucket?: IDisposable[]): void {
		if (!this._callbacks) {
			this._callbacks = []
			this._contexts = []
		}
		this._callbacks.push(callback)
		this._contexts.push(context)

		if (Array.isArray(bucket)) {
			bucket.push({ dispose: () => this.remove(callback, context) })
		}
	}

	remove(callback: Function, context: any = null): void {
		if (!this._callbacks) {
			return
		}

		let foundCallbackWithDifferentContext = false
		for (let i = 0, len = this._callbacks.length; i < len; i++) {
			if (this._callbacks[i] === callback) {
				if (this._contexts[i] === context) {
					// callback & context match => remove it
					this._callbacks.splice(i, 1)
					this._contexts.splice(i, 1)
					return
				} else {
					foundCallbackWithDifferentContext = true
				}
			}
		}

		if (foundCallbackWithDifferentContext) {
			throw new Error('When adding a listener with a context, you should remove it with the same context')
		}
	}

	invoke(...args: any[]): any[] {
		if (!this._callbacks) {
			return undefined
		}

		const ret: any[] = [],
			callbacks = this._callbacks.slice(0),
			contexts = this._contexts.slice(0)

		for (let i = 0, len = callbacks.length; i < len; i++) {
			try {
				ret.push(callbacks[i].apply(contexts[i], args))
			} catch (e) {
				console.error(e)
			}
		}
		return ret
	}

	isEmpty(): boolean {
		return !this._callbacks || this._callbacks.length === 0
	}

	entries(): [Function, any][] {
		if (!this._callbacks) {
			return []
		}
		return this._callbacks.map((fn, index) => <[Function, any]>[fn, this._contexts[index]])
	}

	dispose(): void {
		this._callbacks = undefined
		this._contexts = undefined
	}
}
