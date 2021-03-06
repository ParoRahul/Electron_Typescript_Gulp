/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as fs from 'fs'

import { Promise } from 'bluebird'

export function convert2Promise<T>(fn: Function, ...args: any[]): Promise<T>;
export function convert2Promise<T>(fn: Function, ...args: any[]): any {
	return new Promise(function (resolve, reject) {
		fn(...args, (error: unknown, result: T) => error ? reject(error) : resolve(result) )
	})
}

export function realpath(path: string): Promise<string> {
	return new Promise<string>(function (resolve, reject) {
		fs.realpath(path, (error: unknown, resolvedPath: string) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(resolvedPath)
			}
		})
	})
}

export function status(path: string): Promise<fs.Stats> {
	return new Promise<fs.Stats>(function (resolve, reject) {
		fs.stat(path, (error: unknown, status: fs.Stats) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(status)
			}
		})
	})
}
