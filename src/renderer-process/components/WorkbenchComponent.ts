/* eslint-disable @typescript-eslint/no-explicit-any */

'use strict'

import { IDisposable, dispose, Disposable } from '../../common/disposable'
import { EScope, Memento } from '../service/storage/memento'
import { IStorageService } from '../service/storage/storage'

/**
 * Base class of any core/ui component in the workbench. Examples include services, extensions, parts, viewlets and quick open.
 * Provides some convinience methods to participate in the workbench lifecycle (dispose, shutdown) and
 * loading and saving settings through memento.
 */
export interface IWorkbenchComponent extends IDisposable {

	/**
	* The unique identifier of this component.
	*/
	getId(): string;

	/**
	* Called when the browser containing the container is closed.
	*
	* Use this function to store settings that you want to restore next time. Should not be used to free resources
	* because dispose() is being called for this purpose and shutdown() has a chance to be vetoed by the user.
	*/
	shutdown(): void;

	/**
	* Called when the UI component is being removed from the container. Free up resources from here.
	*/
	dispose(): void;
}

export class WorkbenchComponent extends Disposable implements IWorkbenchComponent {
	private _toUnbind: IDisposable[];
	private id: string;
	private componentMemento: Memento;

	constructor(id: string) {
		super()

		this._toUnbind = []
		this.id = id
		this.componentMemento = new Memento(this.id)
	}

	protected get toUnbind(): IDisposable[] {
		return this._toUnbind
	}

	getId(): string {
		return this.id
	}

	/**
	* Returns a JSON Object that represents the data of this memento. The optional
	* parameter scope allows to specify the scope of the memento to load. If not
	* provided, the scope will be global, Scope.WORKSPACE can be used to
	* scope the memento to the workspace.
	*
	* Mementos are shared across components with the same id. This means that multiple components
	* with the same id will store data into the same data structure.
	*/
	protected getMemento(storageService: IStorageService, scope: EScope = EScope.GLOBAL): any {
		return this.componentMemento.getMemento(storageService, scope)
	}

	/**
	* Saves all data of the mementos that have been loaded to the local storage. This includes
	* global and workspace scope.
	*
	* Mementos are shared across components with the same id. This means that multiple components
	* with the same id will store data into the same data structure.
	*/
	protected saveMemento(): void {
		this.componentMemento.saveMemento()
	}

	shutdown(): void {
		// Save Memento
		this.saveMemento()
	}

	dispose(): void {
		this._toUnbind = dispose(this._toUnbind)
		super.dispose()
	}
}