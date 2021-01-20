/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as instantiation from './instantiation'

export class SyncDescriptor<T> {

	readonly ctor: any;
	readonly staticArguments: any[];
	readonly supportsDelayedInstantiation: boolean;

	constructor(ctor: new (...args: any[]) => T, 
							staticArguments: any[] = [], 
							supportsDelayedInstantiation: boolean = false) {
		this.ctor = ctor
		this.staticArguments = staticArguments
		this.supportsDelayedInstantiation = supportsDelayedInstantiation
	}
}

export interface ICreateSyncFunc {

	<T>(ctor: instantiation.IConstructorSignature0<T>): ISyncDescriptor0<T>;

	<A1, T>(ctor: instantiation.IConstructorSignature1<A1, T>): ISyncDescriptor1<A1, T>;
	<A1, T>(ctor: instantiation.IConstructorSignature1<A1, T>, a1: A1): ISyncDescriptor0<T>;

	<A1, A2, T>(ctor: instantiation.IConstructorSignature2<A1, A2, T>): ISyncDescriptor2<A1, A2, T>;
	<A1, A2, T>(ctor: instantiation.IConstructorSignature2<A1, A2, T>, a1: A1): ISyncDescriptor1<A2, T>;
	<A1, A2, T>(ctor: instantiation.IConstructorSignature2<A1, A2, T>, a1: A1, a2: A2): ISyncDescriptor0<T>;

	<A1, A2, A3, T>(ctor: instantiation.IConstructorSignature3<A1, A2, A3, T>): ISyncDescriptor3<A1, A2, A3, T>;
	<A1, A2, A3, T>(ctor: instantiation.IConstructorSignature3<A1, A2, A3, T>, a1: A1): ISyncDescriptor2<A2, A3, T>;
	<A1, A2, A3, T>(ctor: instantiation.IConstructorSignature3<A1, A2, A3, T>, a1: A1, a2: A2): ISyncDescriptor1<A3, T>;
	<A1, A2, A3, T>(ctor: instantiation.IConstructorSignature3<A1, A2, A3, T>, a1: A1, a2: A2, a3: A3): ISyncDescriptor0<T>;

	<A1, A2, A3, A4, T>(ctor: instantiation.IConstructorSignature4<A1, A2, A3, A4, T>): ISyncDescriptor4<A1, A2, A3, A4, T>;
	<A1, A2, A3, A4, T>(ctor: instantiation.IConstructorSignature4<A1, A2, A3, A4, T>, a1: A1): ISyncDescriptor3<A2, A3, A4, T>;
	<A1, A2, A3, A4, T>(ctor: instantiation.IConstructorSignature4<A1, A2, A3, A4, T>, a1: A1, a2: A2): ISyncDescriptor2<A3, A4, T>;
	<A1, A2, A3, A4, T>(ctor: instantiation.IConstructorSignature4<A1, A2, A3, A4, T>, a1: A1, a2: A2, a3: A3): ISyncDescriptor1<A4, T>;
	<A1, A2, A3, A4, T>(ctor: instantiation.IConstructorSignature4<A1, A2, A3, A4, T>, a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor0<T>;

	<A1, A2, A3, A4, A5, T>(ctor: instantiation.IConstructorSignature5<A1, A2, A3, A4, A5, T>): ISyncDescriptor5<A1, A2, A3, A4, A5, T>;
	<A1, A2, A3, A4, A5, T>(ctor: instantiation.IConstructorSignature5<A1, A2, A3, A4, A5, T>, a1: A1): ISyncDescriptor4<A2, A3, A4, A5, T>;
	<A1, A2, A3, A4, A5, T>(ctor: instantiation.IConstructorSignature5<A1, A2, A3, A4, A5, T>, a1: A1, a2: A2): ISyncDescriptor3<A3, A4, A5, T>;
	<A1, A2, A3, A4, A5, T>(ctor: instantiation.IConstructorSignature5<A1, A2, A3, A4, A5, T>, a1: A1, a2: A2, a3: A3): ISyncDescriptor2<A4, A5, T>;
	<A1, A2, A3, A4, A5, T>(ctor: instantiation.IConstructorSignature5<A1, A2, A3, A4, A5, T>, a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor1<A5, T>;
	<A1, A2, A3, A4, A5, T>(ctor: instantiation.IConstructorSignature5<A1, A2, A3, A4, A5, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor0<T>;

	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>): ISyncDescriptor6<A1, A2, A3, A4, A5, A6, T>;
	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, a1: A1): ISyncDescriptor5<A2, A3, A4, A5, A6, T>;
	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, a1: A1, a2: A2): ISyncDescriptor4<A3, A4, A5, A6, T>;
	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, a1: A1, a2: A2, a3: A3): ISyncDescriptor3<A4, A5, A6, T>;
	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor2<A5, A6, T>;
	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor1<A6, T>;
	<A1, A2, A3, A4, A5, A6, T>(ctor: instantiation.IConstructorSignature6<A1, A2, A3, A4, A5, A6, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): ISyncDescriptor0<T>;

	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>): ISyncDescriptor7<A1, A2, A3, A4, A5, A6, A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1): ISyncDescriptor6<A2, A3, A4, A5, A6, A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2): ISyncDescriptor5<A3, A4, A5, A6, A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2, a3: A3): ISyncDescriptor4<A4, A5, A6, A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor3<A5, A6, A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor2<A6, A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): ISyncDescriptor1<A7, T>;
	<A1, A2, A3, A4, A5, A6, A7, T>(ctor: instantiation.IConstructorSignature7<A1, A2, A3, A4, A5, A6, A7, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7): ISyncDescriptor0<T>;

	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>): ISyncDescriptor8<A1, A2, A3, A4, A5, A6, A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1): ISyncDescriptor7<A2, A3, A4, A5, A6, A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2): ISyncDescriptor6<A3, A4, A5, A6, A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3): ISyncDescriptor5<A4, A5, A6, A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor4<A5, A6, A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor3<A6, A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): ISyncDescriptor2<A7, A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7): ISyncDescriptor1<A8, T>;
	<A1, A2, A3, A4, A5, A6, A7, A8, T>(ctor: instantiation.IConstructorSignature8<A1, A2, A3, A4, A5, A6, A7, A8, T>, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8): ISyncDescriptor0<T>;
}
export const createSyncDescriptor: ICreateSyncFunc = <T>(ctor: any, ...staticArguments: any[]): any => {
	return new SyncDescriptor<T>(ctor, staticArguments)
}

export interface ISyncDescriptor0<T> {
	ctor: any;
	bind(): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor1<A1, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor2<A1, A2, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor1<A2, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor3<A1, A2, A3, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor2<A2, A3, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor1<A3, T>;
	bind(a1: A1, a2: A2, a3: A3): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor4<A1, A2, A3, A4, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor3<A2, A3, A4, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor2<A3, A4, T>;
	bind(a1: A1, a2: A2, a3: A3): ISyncDescriptor1<A4, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor5<A1, A2, A3, A4, A5, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor4<A2, A3, A4, A5, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor3<A3, A4, A5, T>;
	bind(a1: A1, a2: A2, a3: A3): ISyncDescriptor2<A4, A5, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor1<A5, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor6<A1, A2, A3, A4, A5, A6, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor5<A2, A3, A4, A5, A6, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor4<A3, A4, A5, A6, T>;
	bind(a1: A1, a2: A2, a3: A3): ISyncDescriptor3<A4, A5, A6, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor2<A5, A6, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor1<A6, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor7<A1, A2, A3, A4, A5, A6, A7, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor6<A2, A3, A4, A5, A6, A7, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor5<A3, A4, A5, A6, A7, T>;
	bind(a1: A1, a2: A2, a3: A3): ISyncDescriptor4<A4, A5, A6, A7, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor3<A5, A6, A7, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor2<A6, A7, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): ISyncDescriptor1<A7, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7): ISyncDescriptor0<T>;
}
export interface ISyncDescriptor8<A1, A2, A3, A4, A5, A6, A7, A8, T> {
	ctor: any;
	bind(a1: A1): ISyncDescriptor7<A2, A3, A4, A5, A6, A7, A8, T>;
	bind(a1: A1, a2: A2): ISyncDescriptor6<A3, A4, A5, A6, A7, A8, T>;
	bind(a1: A1, a2: A2, a3: A3): ISyncDescriptor5<A4, A5, A6, A7, A8, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4): ISyncDescriptor4<A5, A6, A7, A8, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): ISyncDescriptor3<A6, A7, A8, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): ISyncDescriptor2<A7, A8, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7): ISyncDescriptor1<A8, T>;
	bind(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8): ISyncDescriptor0<T>;
}
