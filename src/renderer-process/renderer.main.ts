'use strict'

import * as url from 'url'
import * as path from 'path'

import {Promise}  from 'bluebird'

import { IWindowConfiguration } from '../main-process/windowConfig'
import { IParsedArgument } from '../common/node/argumentParser'
import { realpath, status } from '../common/node/fileSystem'
import platform = require('../common/node/platform')
import { domContentLoaded } from './base/dom'
import * as browser from './base/browser'
import * as errors from './base/errors'

import { WorkbenchShell } from './shell'
import { IOptions, IResourceInput } from './options'

import { EnvironmentService } from '../common/node/environmentService'
import { LogService } from '../main-process/logService'
import { IWorkspace } from './service/workspace/workspace'
import { WorkspaceContextService } from './service/workspace/workspaceService'

import { webFrame } from 'electron'

global.Promise = require('bluebird')


function toResourceInput(paths: string[] ): IResourceInput[] {
	return paths.map(p => {
        const resource = url.pathToFileURL(p)
		return {resource} as IResourceInput
	})
}

function getWorkspace(workspacePath: string): Promise<IWorkspace> {
    if (!workspacePath) {
		return new Promise<null>((resolve,reject)=>resolve(null))
    }
    realpath(workspacePath).then(
    (realWorkspacePath: string)=> {
        const workspaceResource = url.pathToFileURL(realWorkspacePath)
        const folderName = path.basename(realWorkspacePath) || realWorkspacePath
        status(realWorkspacePath).then(folderStat => {
			return <IWorkspace>{
				'resource': workspaceResource,
				'name': folderName,
				'uid': platform.isLinux ? folderStat.ino : folderStat.birthtime.getTime()
			}
		})
    },
    (error: unknown)=>{
        errors.onUnexpectedError(error)
		return null
    })
}

function getParsedArguments(configuration: IWindowConfiguration): IParsedArgument{
    return {
        help: configuration.help,
        version: configuration.version,
        locale: configuration.locale,
        userDataDir: configuration.userDataDir,
        performance: configuration.performance,
        verbose: configuration.verbose
    } as IParsedArgument
}

function openWorkbenchshell(configuration: IWindowConfiguration,
                            workspace: IWorkspace, options: IOptions): Promise<void> {

    const parsedArguments =  getParsedArguments(configuration)
    const environmentService = new EnvironmentService(parsedArguments)
    const contextService = new WorkspaceContextService(workspace)
    const logService = new LogService(environmentService)

    return domContentLoaded().then(()=>{
        const workbenchshell = new WorkbenchShell(document.body,
                                            environmentService,
                                            contextService,
                                            logService,
                                            options)
        workbenchshell.startUP()
        //
        /* self.require.config({ onError: (err: unknown) => {
                if ((err as Error).errorCode === 'load') {
                    workbenchshell.onUnexpectedError(loaderError(err))
                }
            }
        }) */
    })
}

export function startUP(configuration: IWindowConfiguration): Promise<void>{
    console.log(configuration)
    browser.setZoomFactor(webFrame.getZoomFactor())
	browser.setZoomLevel(webFrame.getZoomLevel())
    browser.setFullscreen(!!configuration.fullscreen)

    const filesToOpen = (configuration.filesToOpen && configuration.filesToOpen.length) ?
                        toResourceInput(configuration.filesToOpen) : null
    const filesToCreate = (configuration.filesToCreate && configuration.filesToCreate.length) ?
                        toResourceInput(configuration.filesToCreate) : null
	const shellOptions: IOptions = {
		filesToOpen,
        filesToCreate,
        windowID: configuration.windowId
    }
    console.log(`Platform is ${platform.isWeb ? 'web': 'node'}`)
    return getWorkspace(configuration.workspacePath).then(workspace => {
		return openWorkbenchshell(configuration, workspace, shellOptions)
	})

}


