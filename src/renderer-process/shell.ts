'use strict'

import 'css!./media/shell'

import * as aria from './base/aria/aria'

import * as objects from '../common/objects'
import { IDisposable, dispose } from '../common/disposable'
import { Builder, $} from './base/builder'
import * as errors from './base/errors'

import { IOptions } from './options'
import { Workbench, IWorkbenchStartedInfo } from './workbench'

import { IStorageService, DStorageService } from './service/storage/storage'
import { StorageService, inMemoryLocalStorageInstance } from './service/storage/storageService'
import { IWorkspaceContextService, DWorkspaceContextService } from './service/workspace/workspace'
import { IEnvironmentService, DEnvironmentService } from '../common/node/environmentService'
import { IWindowService, DWindowService, WindowService } from './service/window/windowService'
import { MessageService } from './service/message/messageService'
import { DMessageService, DChoiceService } from './service/message/message'
import { ILogService, DLogService } from '../main-process/logService'
import { IInstantiationService } from '../common/ioc/instantiation'
import { InstantiationService }  from '../common/ioc/instantiationService'
import { ServiceCollection }  from '../common/ioc/serviceCollection'




export class WorkbenchShell implements IDisposable{

    private options: IOptions;

    private contentsContainer: Builder;
    private content: HTMLElement;

    private previousErrorValue: string;
    private previousErrorTime: number;

    private toUnbind: IDisposable[];

    private workbench: Workbench;
    private storageService : IStorageService
    private windowService : IWindowService
    private messageService : MessageService
    private instantiationService : IInstantiationService

    constructor(private readonly container: HTMLElement,
                private readonly environmentService: IEnvironmentService,
                private readonly contextService: IWorkspaceContextService,
                private readonly logService: ILogService,
                options: IOptions) {
        this.container = container
        this.options = objects.mixin({}, options)
        this.contentsContainer = null
        this.previousErrorValue =''
        this.previousErrorTime = 0
        this.workbench = null
        this.storageService = null
        this.instantiationService = null
        this.messageService =null
        this.windowService = null
        this.logService.log(options)
    }

    startUP() {
        errors.setUnexpectedErrorHandler((error: unknown) => {
            this.onUnexpectedError(error)
        })

        $(this.container).addClass('app-shell')
        this.content = $('.app-shell-content').appendTo(this.container).getHTMLElement()
        this.contentsContainer = this.createMainElement($(this.content))
        this.logService.log('WorkbenchShell Renderer Process')
    }

    private initiateServiceCollection(container: HTMLElement): ServiceCollection{
        const disableWorkspaceStorage = this.contextService.hasWorkspace()
        this.storageService = new StorageService(window.localStorage,
                                disableWorkspaceStorage ? inMemoryLocalStorageInstance : window.localStorage,
                                this.contextService)
        const serviceCollection = new ServiceCollection()
        serviceCollection.set(DEnvironmentService, this.environmentService)
        serviceCollection.set(DWorkspaceContextService, this.contextService)
        serviceCollection.set(DStorageService, this.storageService)
        serviceCollection.set(DLogService, this.logService)
        this.instantiationService = new InstantiationService(serviceCollection,true)
        this.windowService = this.instantiationService.createInstance(WindowService,this.options.windowID)
        serviceCollection.set(DWindowService, this.windowService)
        this.messageService = this.instantiationService.createInstance(MessageService,container)
        serviceCollection.set(DMessageService, this.messageService)
		serviceCollection.set(DChoiceService, this.messageService)
        return serviceCollection
    }

    private createMainElement(parent: Builder): Builder{
        aria.setARIAContainer(document.body)
        const workbenchContainer = $(parent).div()
        const serviceCollection = this.initiateServiceCollection(parent.getHTMLElement())
        this.workbench = new Workbench( parent.getHTMLElement(),
                                        workbenchContainer.getHTMLElement(),
                                        this.options,
                                        serviceCollection )
        this.workbench.startup({
            onWorkbenchStarted: (info: IWorkbenchStartedInfo) => {
                // run workbench started logic
                this.onWorkbenchStarted(info)
            }
        })
        return workbenchContainer
    }

    private onWorkbenchStarted(info: IWorkbenchStartedInfo): void {
        console.dir(info)
    }

    //private applyTheme() {}

    //private registerEventListeners() {}

    onUnexpectedError(error: unknown): void{
        const errorMsg = errors.getErrorMessage(error)
		if (!errorMsg) {
			return
		}
		const now = new Date().getTime()
		if (errorMsg === this.previousErrorValue && now - this.previousErrorTime <= 1000) {
			return
		}
		this.previousErrorTime = now
		this.previousErrorValue = errorMsg
		// Log to console
		this.logService.error(errorMsg)
		// Show to user if friendly message provided
		/* if (error.friendlyMessage && this.messageServiceInstance) {
			this.messageServiceInstance.show(Severity.Error, error.friendlyMessage);
		} */
    }

    dispose(){
        this.toUnbind = dispose(this.toUnbind)
        $(this.container).empty().dispose()
        if (this.workbench) {
			this.workbench.dispose()
		}
    }

}