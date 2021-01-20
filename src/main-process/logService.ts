'use strict'

import { createDecorator } from '../common/ioc/instantiation'
import { IEnvironmentService } from '../common/node/environmentService'

export interface ILogService{
	_serviceBrand: undefined;
	log(...args: any[]): void ;
	error(...args: any[]): void;
	warn(...args: any[]): void;
}

export const DLogService = createDecorator<ILogService>('ILogService')

export class LogService implements ILogService {

	_serviceBrand: undefined;

	constructor( private environment: IEnvironmentService) {
		if (this.environment.verbose || !this.environment.isBuilt) {
			this.log('LogService Instantiate')
		}
	}

	log(...args: any[]): void {
		if (this.environment.verbose || !this.environment.isBuilt) {
			console.log(`LOG: ${new Date().toLocaleTimeString()}: `, ...args)
		}
	}

	error(...args: any[]): void {
		console.error(`ERROR: ${new Date().toLocaleTimeString()}`, ...args)
		//console.dir(args)
	}

	warn(...args: any[]): void {
		console.warn(`WARNING: ${new Date().toLocaleTimeString()}`, ...args)
	}

}