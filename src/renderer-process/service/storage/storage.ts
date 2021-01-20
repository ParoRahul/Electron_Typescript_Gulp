/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { createDecorator } from '../../../common/ioc/instantiation'

export enum EStorageScope {
	GLOBAL,
	WORKSPACE
}

export interface IStorageService {

	_serviceBrand: undefined;

	store(key: string, value: any, scope?: EStorageScope): void;

	swap(key: string, valueA: any, valueB: any, scope?: EStorageScope, defaultValue?: any): void;

	remove(key: string, scope?: EStorageScope): void;

	get(key: string, scope?: EStorageScope, defaultValue?: string): string;

	getInteger(key: string, scope?: EStorageScope, defaultValue?: number): number;

	getBoolean(key: string, scope?: EStorageScope, defaultValue?: boolean): boolean;
}



export const nullStorageService: IStorageService = {
	_serviceBrand: undefined,
	store() { return undefined },
	swap() { return undefined },
	remove() { return undefined },
	get(a, b, defaultValue) { return defaultValue },
	getInteger(a, b, defaultValue) { return defaultValue },
	getBoolean(a, b, defaultValue) { return defaultValue }
}

export const DStorageService = createDecorator<IStorageService>('StorageService')