/* eslint-disable @typescript-eslint/no-explicit-any */

import { IServiceIdentifier } from './instantiation'
import { SyncDescriptor } from './descriptors'

export class ServiceCollection {

	private _entries = new Map<IServiceIdentifier<any>, any>();

	constructor(...entries: [IServiceIdentifier<any>, any][]) {
		for (const [id, service] of entries) {
				this.set(id, service)
		}
	}

	set<T>(id: IServiceIdentifier<T>, instanceOrDescriptor: T | SyncDescriptor<T>): T | SyncDescriptor<T> {
		const result = this._entries.get(id)
		this._entries.set(id, instanceOrDescriptor)
		return result
	}

	forEach(callback: (id: IServiceIdentifier<any>, instanceOrDescriptor: any) => any): void {
		this._entries.forEach((value, key) => callback(key, value))
	}

	has(id: IServiceIdentifier<any>): boolean {
		return this._entries.has(id)
	}

	get<T>(id: IServiceIdentifier<T>): T | SyncDescriptor<T> {
		return this._entries.get(id)
	}
}
