'use strict'

import * as platform from '../common/node/platform'
import { IServiceContainer, instantiateService } from './serviceContainer'
import { Application} from './application'


export function instantiateApplication(): Promise<void> {
    console.log(`Platform is ${platform.isWeb ? 'Web': 'node'}`)
    return instantiateService().then((serviceContainer: IServiceContainer) => {
        return new Promise<void>(function (resolve, reject) {
            try {
                const application = new Application(serviceContainer.logService,
                    serviceContainer.environmentService,
                    serviceContainer.storageService,
                    serviceContainer.settingService,
                    serviceContainer.windowsService)
                application.startup()
                resolve()
            } catch (error: unknown) {
                reject(error)
            }
        })
    })
}
