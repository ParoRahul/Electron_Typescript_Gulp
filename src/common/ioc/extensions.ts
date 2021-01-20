/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SyncDescriptor } from './descriptors'
import { IServiceIdentifier, TBrandedService } from './instantiation'

const _registry: [IServiceIdentifier<any>, SyncDescriptor<any>][] = []

export function registerSingleton<T, Services extends TBrandedService[]>(id: IServiceIdentifier<T>, ctor: new (...services: Services) => T, supportsDelayedInstantiation?: boolean): void {
	_registry.push([id, new SyncDescriptor<T>(ctor as new (...args: any[]) => T, [], supportsDelayedInstantiation)])
}

export function getSingletonServiceDescriptors(): [IServiceIdentifier<any>, SyncDescriptor<any>][] {
	return _registry
}
