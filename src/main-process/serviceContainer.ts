'use strict'

import minimist from 'minimist'

/* import * as errors from '../common/errors' */
import { options, IParsedArgument } from '../common/node/argumentParser'
import { IEnvironmentService, EnvironmentService } from '../common/node/environmentService'
import { ILogService, LogService } from './logService'
import { IStorageService, StorageService } from './storageService'
import { ISettingsService, SettingsService } from './settingsService'
import { IWindowsService, WindowsService } from './windowService'

export interface IServiceContainer{
    parsedArguments: IParsedArgument,
    environmentService: IEnvironmentService,
    logService: ILogService,
    storageService: IStorageService,
    settingService: ISettingsService,
    windowsService: IWindowsService
}

/* const errorHandler = function(error: unknown): typeof error{
    errors.onUnexpectedError(error)
    return error
} */

export function getParseArguments(): Promise<IParsedArgument>{
    return new Promise<IParsedArgument>(function(resolve, reject){
        try{
            const calledWithargs: string[] = (process as NodeJS.Process).argv.slice(2)
            const parsedAguments: IParsedArgument = minimist<IParsedArgument>(calledWithargs,options)
            resolve(parsedAguments)
        } catch( error : unknown){
            reject( error )
        }
    })
}

export function instantiateEnvronmentService(parguments: IParsedArgument ): Promise<IEnvironmentService>{
    return new Promise<IEnvironmentService>(function(resolve, reject){
        try{
            resolve(new EnvironmentService(parguments))
        } catch( error : unknown){
            reject( error )
        }
    })
}

export function instantiateLogService(service: IEnvironmentService ): Promise<ILogService>{
    return new Promise<ILogService>(function(resolve, reject){
        try{
            resolve(new LogService(service))
        } catch( error : unknown){
            reject( error )
        }
    })
}

export function instantiateStorageService(service1: IEnvironmentService,
                                            service2: ILogService ): Promise<IStorageService>{
    return new Promise<IStorageService>(function(resolve, reject){
        try{
            resolve(new StorageService(service1,service2))
        } catch( error : unknown){
            reject( error )
        }
    })
}

export function instantiateSettingsService(service1: IEnvironmentService,
                                            service2: IStorageService ): Promise<ISettingsService>{
    return new Promise<ISettingsService>(function(resolve, reject){
        try{
            resolve(new SettingsService(service1,service2))
        } catch( error : unknown){
            reject( error )
        }
    })
}

export function instantiateWindowService(service1: ILogService,
                                        service2: IEnvironmentService,
                                        service3: IStorageService,
                                        service4: ISettingsService ): Promise<IWindowsService>{
    return new Promise<IWindowsService>(function(resolve, reject){
        try{
            resolve(new WindowsService(service1,service2,service3,service4))
        } catch( error : unknown){
            reject( error )
        }
    })
}

export function instantiateService(): Promise<IServiceContainer> {
    const container :IServiceContainer = {} as IServiceContainer
    return getParseArguments()
    .then((parsedAguments) => {
        container.parsedArguments = parsedAguments
        return instantiateEnvronmentService(parsedAguments)
    }).then((environmentService: IEnvironmentService ) => {
        container.environmentService = environmentService
        return instantiateLogService(environmentService)
    }).then((logService: ILogService)=> {
        container.logService = logService
        return instantiateStorageService(container.environmentService,logService)
    }).then((storageService: IStorageService)=> {
        container.storageService = storageService
        return instantiateSettingsService(container.environmentService,storageService)
    }).then((settingsService: ISettingsService)=> {
        container.settingService = settingsService
        return instantiateWindowService(container.logService,
                                        container.environmentService,
                                        container.storageService,
                                        settingsService)
    }).then((windowService: IWindowsService)=> {
        container.windowsService = windowService
        return new Promise<IServiceContainer>(function(resolve, reject){
                    try{
                        resolve(container)
                    } catch( error : unknown){
                        reject( error )
                    }
        })
    })
}