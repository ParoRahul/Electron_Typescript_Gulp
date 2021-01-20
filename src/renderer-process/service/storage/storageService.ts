/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as types from '../../../common/types'
import * as strings from '../../../common/strings'


import { EStorageScope, IStorageService } from './storage'
import { IWorkspaceContextService, IWorkspace } from '../workspace/workspace'

export interface IStorage {
	length: number;
	key(index: number): string;
	clear(): void;
	setItem(key: string, value: any): void;
	getItem(key: string): string;
	removeItem(key: string): void;
}


export class StorageService implements IStorageService {

	_serviceBrand: any;
	private static COMMON_PREFIX = 'storage://';
	/*private*/ static GLOBAL_PREFIX = StorageService.COMMON_PREFIX + 'global/';
	private static WORKSPACE_PREFIX = StorageService.COMMON_PREFIX + 'workspace/';
	private static WORKSPACE_IDENTIFIER = 'workspaceIdentifier';
	private static NO_WORKSPACE_IDENTIFIER = '__$noWorkspace__';


	private workspaceKey: string;

	constructor(
		private readonly globalStorage: IStorage,
		private readonly workspaceStorage: IStorage,
		private readonly contextService: IWorkspaceContextService
	) {
		this.globalStorage = globalStorage
		this.workspaceStorage = this.workspaceStorage || globalStorage

		// Calculate workspace storage key
		const workspace = contextService.getWorkspace()
		this.workspaceKey = this.getWorkspaceKey(workspace)

		// Make sure to delete all workspace storage if the workspace has been recreated meanwhile
		const workspaceUniqueId: number = workspace ? workspace.uid : void 0
		if (types.isNumber(workspaceUniqueId)) {
			this.cleanupWorkspaceScope(workspaceUniqueId, workspace.name)
		}
	}

	private getWorkspaceKey(workspace?: IWorkspace): string {
		let workspaceUri: string = null
		if (workspace && workspace.resource) {
			workspaceUri = workspace.resource.toString()
		}

		return workspaceUri ? this.calculateWorkspaceKey(workspaceUri) : StorageService.NO_WORKSPACE_IDENTIFIER
	}

	private calculateWorkspaceKey(workspaceUrl: string): string {
		const root = 'file:///'
		const index = workspaceUrl.indexOf(root)
		if (index === 0) {
			return strings.rtrim(workspaceUrl.substr(root.length), '/') + '/'
		}

		return workspaceUrl
	}

	private cleanupWorkspaceScope(workspaceId: number, workspaceName: string): void {

		// Get stored identifier from storage
		const id = this.getInteger(StorageService.WORKSPACE_IDENTIFIER, EStorageScope.WORKSPACE)

		// If identifier differs, assume the workspace got recreated and thus clean all storage for this workspace
		if (types.isNumber(id) && workspaceId !== id) {
			const keyPrefix = this.toStorageKey('', EStorageScope.WORKSPACE)
			const toDelete: string[] = []
			const length = this.workspaceStorage.length

			for (let i = 0; i < length; i++) {
				const key = this.workspaceStorage.key(i)
				if (key.indexOf(StorageService.WORKSPACE_PREFIX) < 0) {
					continue // ignore stored things that don't belong to storage service or are defined globally
				}

				// Check for match on prefix
				if (key.indexOf(keyPrefix) === 0) {
					toDelete.push(key)
				}
			}

			if (toDelete.length > 0) {
				console.warn('Clearing previous version of local storage for workspace ', workspaceName)
			}

			// Run the delete
			toDelete.forEach((keyToDelete) => {
				this.workspaceStorage.removeItem(keyToDelete)
			})
		}

		// Store workspace identifier now
		if (workspaceId !== id) {
			this.store(StorageService.WORKSPACE_IDENTIFIER, workspaceId, EStorageScope.WORKSPACE)
		}
	}

	clear(): void {
		this.globalStorage.clear()
		this.workspaceStorage.clear()
	}

	store(key: string, value: any, scope = EStorageScope.GLOBAL): void {
		const storage = (scope === EStorageScope.GLOBAL) ? this.globalStorage : this.workspaceStorage

		if (types.isUndefinedOrNull(value)) {
			this.remove(key, scope) // we cannot store null or undefined, in that case we remove the key
			return
		}

		const storageKey = this.toStorageKey(key, scope)

		// Store
		try {
			storage.setItem(storageKey, value)
		} catch (error) {
			console.error(error)
		}
	}

	get(key: string, scope = EStorageScope.GLOBAL, defaultValue?: any): string {
		const storage = (scope === EStorageScope.GLOBAL) ? this.globalStorage : this.workspaceStorage

		const value = storage.getItem(this.toStorageKey(key, scope))
		if (types.isUndefinedOrNull(value)) {
			return defaultValue
		}

		return value
	}

	remove(key: string, scope = EStorageScope.GLOBAL): void {
		const storage = (scope === EStorageScope.GLOBAL) ? this.globalStorage : this.workspaceStorage
		const storageKey = this.toStorageKey(key, scope)

		// Remove
		storage.removeItem(storageKey)
	}

	swap(key: string, valueA: any, valueB: any, scope = EStorageScope.GLOBAL, defaultValue?: any): void {
		const value = this.get(key, scope)
		if (types.isUndefinedOrNull(value) && defaultValue) {
			this.store(key, defaultValue, scope)
		} else if (value === valueA.toString()) { // Convert to string because store is string based
			this.store(key, valueB, scope)
		} else {
			this.store(key, valueA, scope)
		}
	}

	getInteger(key: string, scope = EStorageScope.GLOBAL, defaultValue?: number): number {
		const value = this.get(key, scope, defaultValue)

		if (types.isUndefinedOrNull(value)) {
			return defaultValue
		}

		return parseInt(value, 10)
	}

	getBoolean(key: string, scope = EStorageScope.GLOBAL, defaultValue?: boolean): boolean {
		const value = this.get(key, scope, defaultValue)

		if (types.isUndefinedOrNull(value)) {
			return defaultValue
		}

		if (types.isString(value)) {
			return value.toLowerCase() === 'true' ? true : false
		}

		return value ? true : false
	}

	private toStorageKey(key: string, scope: EStorageScope): string {
		if (scope === EStorageScope.GLOBAL) {
			return StorageService.GLOBAL_PREFIX + key.toLowerCase()
		}

		return StorageService.WORKSPACE_PREFIX + this.workspaceKey + key.toLowerCase()
	}
}

// In-Memory Local Storage Implementation
export class InMemoryLocalStorage implements IStorage {
	private store: { [key: string]: string; };

	constructor() {
		this.store = {}
	}

	get length(): number {
		return Object.keys(this.store).length
	}

	key(index: number): string {
		const keys = Object.keys(this.store)
		if (keys.length > index) {
			return keys[index]
		}

		return null
	}

	clear(): void {
		this.store = {}
	}

	setItem(key: string, value: any): void {
		this.store[key] = value.toString()
	}

	getItem(key: string): string {
		const item = this.store[key]
		if (!types.isUndefinedOrNull(item)) {
			return item
		}

		return null
	}

	removeItem(key: string): void {
		delete this.store[key]
	}
}

export const inMemoryLocalStorageInstance = new InMemoryLocalStorage()
