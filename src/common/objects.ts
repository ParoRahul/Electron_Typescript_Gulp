/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as Types from './types'

export function mixin(destination: any, source: any, overwrite = true): any {
	if (!Types.isObject(destination)) {
		return source
	}

	if (Types.isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (key in destination) {
				if (overwrite) {
					if (Types.isObject(destination[key]) && Types.isObject(source[key])) {
						mixin(destination[key], source[key], overwrite)
					} else {
						destination[key] = source[key]
					}
				}
			} else {
				destination[key] = source[key]
			}
		})
	}
	return destination
}

export function assign(destination: any, ...sources: any[]): any {
	sources.forEach(source => Object.keys(source).forEach((key) => destination[key] = source[key]))
	return destination
}

export function isEmpty(object: Object){
	for(const key in object) {
        if(object.hasOwnProperty(key))
            return false
      }
      return true
}