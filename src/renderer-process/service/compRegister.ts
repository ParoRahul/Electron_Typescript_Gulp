/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as Types from '../../common/types'

import * as Assert from '../../common/assert'

export interface IRegistry {

	/**
	 * Adds the extension functions and properties defined by data to the
	 * platform. The provided id must be unique.
	 * @param id a unique identifier
	 * @param data a contribution
	 */
	add(id: string, data: any): void;

	/**
	 * Returns true iff there is an extension with the provided id.
	 * @param id an extension idenifier
	 */
	knows(id: string): boolean;

	/**
	 * Returns the extension functions and properties defined by the specified key or null.
	 * @param id an extension idenifier
	 */
	as(id: string): any;
}

class RegistryImpl implements IRegistry {

	private data: { [id: string]: any; };

	constructor() {
		this.data = {}
	}

	add(id: string, data: any): void {
		Assert.ok(Types.isString(id))
		Assert.ok(Types.isObject(data))
		Assert.ok(!this.data.hasOwnProperty(id), 'There is already an extension with this id')

		this.data[id] = data
	}

	knows(id: string): boolean {
		return this.data.hasOwnProperty(id)
	}

	as(id: string): any {
		return this.data[id] || null
	}
}

export const Registry = <IRegistry>new RegistryImpl()