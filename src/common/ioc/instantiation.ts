/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ServiceCollection } from './serviceCollection'
import * as descriptors from './descriptors'

/**
 * Identifies a service of type T
 */
export interface IServiceIdentifier<T> {
	(...args: any[]): void;
	type: T;
}

export type TBrandedService = { _serviceBrand: undefined };

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace _util {

	export const serviceIds = new Map<string, IServiceIdentifier<any>>()

	export const DI_TARGET = 'TARGET'
	export const DI_DEPENDENCIES = 'DEPENDENCIES'

	export function getServiceDependencies(ctor: any): { id: IServiceIdentifier<any>, index: number, optional: boolean }[] {
		return ctor[DI_DEPENDENCIES] || []
	}
}

export interface IConstructorSignature0<T> {
	new(...services: TBrandedService[]): T;
}

export interface IConstructorSignature1<A1, T> {
	new <Services extends TBrandedService[]>(first: A1, ...services: Services): T;
}

export interface IConstructorSignature2<A1, A2, T> {
	new(first: A1, second: A2, ...services: TBrandedService[]): T;
}

export interface IConstructorSignature3<A1, A2, A3, T> {
	new(first: A1, second: A2, third: A3, ...services: TBrandedService[]): T;
}

export interface IConstructorSignature4<A1, A2, A3, A4, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, ...services: TBrandedService[]): T;
}

export interface IConstructorSignature5<A1, A2, A3, A4, A5, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, ...services: TBrandedService[]): T;
}

export interface IConstructorSignature6<A1, A2, A3, A4, A5, A6, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, ...services: TBrandedService[]): T;
}

export interface IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, seventh: A7, ...services: TBrandedService[]): T;
}

export interface IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T> {
	new(first: A1, second: A2, third: A3, fourth: A4, fifth: A5, sixth: A6, seventh: A7, eigth: A8, ...services: TBrandedService[]): T;
}

export interface IServicesAccessor {
	get<T>(id: IServiceIdentifier<T>): T;
	get<T>(id: IServiceIdentifier<T>, isOptional: typeof optional): T | undefined;
}

export const IInstantiationService = createDecorator<IInstantiationService>('instantiationService')

/**
 * Given a list of arguments as a tuple, attempt to extract the leading, non-service arguments
 * to their own tuple.
 */
type GetLeadingNonServiceArgs<Args> =
	Args extends [...TBrandedService[]] ? []
	: Args extends [infer A1, ...TBrandedService[]] ? [A1]
	: Args extends [infer A1, infer A2, ...TBrandedService[]] ? [A1, A2]
	: Args extends [infer A1, infer A2, infer A3, ...TBrandedService[]] ? [A1, A2, A3]
	: Args extends [infer A1, infer A2, infer A3, infer A4, ...TBrandedService[]] ? [A1, A2, A3, A4]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, ...TBrandedService[]] ? [A1, A2, A3, A4, A5]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, ...TBrandedService[]] ? [A1, A2, A3, A4, A5, A6]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, ...TBrandedService[]] ? [A1, A2, A3, A4, A5, A6, A7]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, infer A8, ...TBrandedService[]] ? [A1, A2, A3, A4, A5, A6, A7, A8]
	: never;

export interface IInstantiationService {

	_serviceBrand: undefined;

	/**
	 * Synchronously creates an instance that is denoted by
	 * the descriptor
	 */
	createInstance<T>(descriptor: descriptors.ISyncDescriptor0<T>): T;
	createInstance<A1, T>(descriptor: descriptors.ISyncDescriptor1<A1, T>, a1: A1): T;
	createInstance<A1, A2, T>(descriptor: descriptors.ISyncDescriptor2<A1, A2, T>, a1: A1, a2: A2): T;
	createInstance<A1, A2, A3, T>(descriptor: descriptors.ISyncDescriptor3<A1, A2, A3, T>, a1: A1, a2: A2, a3: A3): T;
	createInstance<A1, A2, A3, A4, T>(descriptor: descriptors.ISyncDescriptor4<A1, A2, A3, A4, T>, a1: A1, a2: A2, a3: A3, a4: A4): T;
	createInstance<A1, A2, A3, A4, A5, T>(descriptor: descriptors.ISyncDescriptor5<A1, A2, A3, A4, A5, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): T;
	createInstance<A1, A2, A3, A4, A5, A6, T>(descriptor: descriptors.ISyncDescriptor6<A1, A2, A3, A4, A5, A6, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): T;
	createInstance<A1, A2, A3, A4, A5, A6, A7, T>(descriptor: descriptors.ISyncDescriptor7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7): T;
	createInstance<A1, A2, A3, A4, A5, A6, A7, A8, T>(descriptor: descriptors.ISyncDescriptor8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8): T;

	createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(t: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;

	/**
	 *
	 */
	invokeFunction<R, TS extends any[] = []>(fn: (accessor: IServicesAccessor, ...args: TS) => R, ...args: TS): R;

	/**
	 * Creates a child of this service which inherts all current services
	 * and adds/overwrites the given services
	 */
	createChild(services: ServiceCollection): IInstantiationService;
}



function storeServiceDependency(id: Function, target: Function, index: number, optional: boolean): void {
	if ((target as any)[_util.DI_TARGET] === target) {
		(target as any)[_util.DI_DEPENDENCIES].push({ id, index, optional })
	} else {
		(target as any)[_util.DI_DEPENDENCIES] = [{ id, index, optional }];
		(target as any)[_util.DI_TARGET] = target
	}
}

/**
 * The *only* valid way to create a {{IServiceIdentifier}}.
 */
export function createDecorator<T>(serviceId: string): IServiceIdentifier<T> {

	if (_util.serviceIds.has(serviceId)) {
		return _util.serviceIds.get(serviceId)!
	}

	const id = <any>function (target: Function, key: string, index: number): any {
		if (arguments.length !== 3) {
			throw new Error('@IServiceName-decorator can only be used to decorate a parameter')
		}
		storeServiceDependency(id, target, index, false)
	}

	id.toString = () => serviceId

	_util.serviceIds.set(serviceId, id)
	return id
}

/**
 * Mark a service dependency as optional.
 */
export function optional<T>(serviceIdentifier: IServiceIdentifier<T>) {

	return function (target: Function, key: string, index: number) {
		if (arguments.length !== 3) {
			throw new Error('@optional-decorator can only be used to decorate a parameter')
		}
		storeServiceDependency(serviceIdentifier, target, index, true)
	}
}
