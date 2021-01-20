/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

export function ok(value: any, message?: string): void {
	if (!value || value === null) {
		throw new Error(message ? 'Assertion failed (' + message + ')' : 'Assertion Failed')
	}
}
