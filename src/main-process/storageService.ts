/* eslint-disable @typescript-eslint/no-explicit-any */

'use strict'

import fs from 'fs'

import { isUndefined, isUndefinedOrNull } from '../common/types'
import { createDecorator } from '../common/ioc/instantiation'
import { IEnvironmentService } from '../common/node/environmentService'
import { ILogService } from './logService'



export interface IStorageDatabase{ [key: string] :any }

export interface IStorageService {
	_serviceBrand: undefined;
	init(): Promise<void>
	getItem<T extends keyof IStorageDatabase>( key:T, defaultValue?: any): IStorageDatabase[T] ;
	setItem(key: string, data?: object | string | number | boolean | undefined | null): void
	removeItem(key: string): void;
}

export const DStorageService = createDecorator<IStorageService>('StorageService')

export class StorageService implements IStorageService {

	_serviceBrand: undefined;

	private _database: IStorageDatabase | null = null;

	private lastFlushedSerializedDatabase: string | null = null;

	private dbPath: string

	constructor(private readonly environment: IEnvironmentService ,
		private readonly logService: ILogService)
	{
		this.dbPath = this.environment.appSettingsPath
		this.logService.log('StorageService Instantiate')
	}

	private get database(): IStorageDatabase {
		if (!this._database) {
			this._database = this.loadSync()
		}
		return this._database
	}

	async init(): Promise<void> {
		if (this._database) {
			return
		}
		const database = await this.loadAsync()
		if (this._database) {
			return
		}
		this._database = database
	}

	private loadSync(): IStorageDatabase {
		try {
			this.lastFlushedSerializedDatabase = fs.readFileSync(this.dbPath).toString()
			return JSON.parse(this.lastFlushedSerializedDatabase)
		} catch (error) {
			this.logService.error(error)
			return {}
		}
	}

	private async loadAsync(): Promise<IStorageDatabase> {
		try {
			this.lastFlushedSerializedDatabase = (await fs.readFileSync(this.dbPath)).toString()
			return JSON.parse(this.lastFlushedSerializedDatabase)
		} catch (error) {
			this.logService.error(error)
			return {}
		}
	}


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	getItem<T extends keyof IStorageDatabase>( key:T, defaultValue?: any): IStorageDatabase[T]{
		return this.database[key]
	}

	setItem(key: string, data?: object | string | number | boolean | undefined | null): void {
		if (isUndefinedOrNull(data)) {
			return this.removeItem(key)
		}
		if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
			if (this.database[key] === data) {
				return
			}
		}
		this.database[key] = data
		this.saveSync()
	}

	removeItem(key: string): void {
		if (!isUndefined(this.database[key])) {
			this.database[key] = undefined
			this.saveSync()
		}
	}

	private saveSync(): void {
		const serializedDatabase = JSON.stringify(this.database, null, 4)
		if (serializedDatabase === this.lastFlushedSerializedDatabase) {
			return // return early if the database has not changed
		}
		try {
			fs.writeFileSync(this.dbPath, serializedDatabase) // permission issue can happen here
			this.lastFlushedSerializedDatabase = serializedDatabase
		} catch (error) {
			this.logService.error(error)
		}
	}
}
