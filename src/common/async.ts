/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IDisposable } from './disposable'
import { CPromise } from './promise'



export function nfcall<T>(fn: Function, ...args: any[]): CPromise<T>;
export function nfcall(fn: Function, ...args: any[]): any {
	return new Promise((c, e) => fn(...args, (err: unknown, result: any) => err ? e(err) : c(result)))
}

export interface IdleDeadline {
	readonly didTimeout: boolean;
	timeRemaining(): number;
}
/**
 * Execute the callback the next time the browser is idle
 */
export let runWhenIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable

export class IdleValue<T> {

	private readonly _executor: () => void;
	private readonly _handle: IDisposable;

	private _didRun: boolean = false;
	private _value?: T;
	private _error: any;

	constructor(executor: () => T) {
		this._executor = () => {
			try {
				this._value = executor()
			} catch (err) {
				this._error = err
			} finally {
				this._didRun = true
			}
		}
		this._handle = runWhenIdle(() => this._executor())
	}

	dispose(): void {
		this._handle.dispose()
	}

	getValue(): T {
		if (!this._didRun) {
			this._handle.dispose()
			this._executor()
		}
		if (this._error) {
			throw this._error
		}
		return this._value!
	}
}
