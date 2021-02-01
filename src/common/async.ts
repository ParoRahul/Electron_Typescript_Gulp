/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Disposable, IDisposable } from './disposable'
import { Promise } from 'bluebird'
import * as platform from './node/platform'


export function nfcall<T>(fn: Function, ...args: any[]): Promise<T>;
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

export class TimeoutTimer extends Disposable {
	private _token: platform.ITimeoutToken;

	constructor() {
		super()
		this._token = -1
	}

	dispose(): void {
		this.cancel()
		super.dispose()
	}

	cancel(): void {
		if (this._token !== -1) {
			platform.clearTimeout(this._token)
			this._token = -1
		}
	}

	cancelAndSet(runner: () => void, timeout: number): void {
		this.cancel()
		this._token = platform.setTimeout(() => {
			this._token = -1
			runner()
		}, timeout)
	}

	setIfNotSet(runner: () => void, timeout: number): void {
		if (this._token !== -1) {
			// timer is already set
			return
		}
		this._token = platform.setTimeout(() => {
			this._token = -1
			runner()
		}, timeout)
	}
}
