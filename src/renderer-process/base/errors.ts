/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as types from '../../common/types'

export interface IErrorListenerCallback {
	(error: any): void;
}

export interface IErrorListenerUnbind {
	(): void;
}

// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
export class ErrorHandler {
	private unexpectedErrorHandler: (e: any) => void;
	private listeners: IErrorListenerCallback[];

	constructor() {

		this.listeners = []

		this.unexpectedErrorHandler = function (e: any) {
			setTimeout(() => {
				if (e.stack) {
					throw new Error(e.message + '\n\n' + e.stack)
				}
				throw e
			}, 0)
		}
	}

	addListener(listener: IErrorListenerCallback): IErrorListenerUnbind {
		this.listeners.push(listener)
		return () => {
			this._removeListener(listener)
		}
	}

	private emit(e: any): void {
		this.listeners.forEach((listener) => {
			listener(e)
		})
	}

	private _removeListener(listener: IErrorListenerCallback): void {
		this.listeners.splice(this.listeners.indexOf(listener), 1)
	}
	setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
		this.unexpectedErrorHandler = newUnexpectedErrorHandler
	}
	getUnexpectedErrorHandler(): (e: any) => void {
		return this.unexpectedErrorHandler
	}
	onUnexpectedError(e: any): void {
		this.unexpectedErrorHandler(e)
		this.emit(e)
	}
	// For external errors, we don't want the listeners to be called
	onUnexpectedExternalError(e: any): void {
		this.unexpectedErrorHandler(e)
	}
}

export const errorHandler = new ErrorHandler()

export function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
	errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler)
}

export function onUnexpectedError(e: any): void {
	// ignore errors from cancelled promises
	if (!isPromiseCanceledError(e)) {
		errorHandler.onUnexpectedError(e)
	}
}

export function onUnexpectedExternalError(e: any): void {
	// ignore errors from cancelled promises
	if (!isPromiseCanceledError(e)) {
		errorHandler.onUnexpectedExternalError(e)
	}
}

export function onUnexpectedPromiseError(promise: Promise<void>): Promise<void> {
	return promise.then(null, onUnexpectedError)
}

export function transformErrorForSerialization(error: any): any {
	if (error instanceof Error) {
		const {name, message} = error
		const stack: string = (<any>error).stacktrace || (<any>error).stack
		return {
			$isError: true,
			name,
			message,
			stack
		}
	}
	return error
}

const canceledName = 'Canceled'

/**
 * Checks if the given error is a promise in canceled state
 */
export function isPromiseCanceledError(error: any): boolean {
	return error instanceof Error && error.name === canceledName && error.message === canceledName
}

/**
 * Returns an error that signals cancellation.
 */
export function canceled(): Error {
	const error = new Error(canceledName)
	error.name = error.message
	return error
}

/**
 * Returns an error that signals something is not implemented.
 */
export function notImplemented(): Error {
	return new Error('Not Implemented')
}

export function illegalArgument(name?: string): Error {
	if (name) {
		return new Error(`Illegal argument: ${name}`)
	} else {
		return new Error('Illegal argument')
	}
}

export function illegalState(name?: string): Error {
	if (name) {
		return new Error(`Illegal state: ${name}`)
	} else {
		return new Error('Illegal state')
	}
}

export function readonly(name?: string): Error {
	return name
		? new Error(`readonly property '${name} cannot be changed'`)
		: new Error('readonly property cannot be changed')
}

/* export interface IErrorOptions {
	severity?: Severity;
	actions?: IAction[];
}

export function create(message: string, options: IErrorOptions = {}): Error {
	const result = new Error(message)
	if (types.isNumber(options.severity)) {
		(<any>result).severity = options.severity
	}
	if (options.actions) {
		(<any>result).actions = options.actions
	}
	return result
}
 */
export function getErrorMessage(error: any): string {
	if (!error) {
		return 'An unknown error occurred. Please consult the log for more details'
	}
	if (error.message) {
		return error.message
	}
	if (error.stack) {
		return error.stack.split('\n')[0]
	}
	if (types.isString(error)) {
		return error
	}
	return String(error)
}

