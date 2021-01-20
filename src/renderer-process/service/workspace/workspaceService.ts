'use strict'

import * as paths from 'path'
import * as url from 'url'
import {IWorkspaceContextService, IWorkspace} from './workspace'

export class WorkspaceContextService implements IWorkspaceContextService {

	_serviceBrand: undefined;

	constructor(private readonly workspace: IWorkspace) {
		this.workspace = workspace
	}

	getWorkspace(): IWorkspace {
		return this.workspace
	}

	hasWorkspace(): boolean {
		return !!this.workspace
	}

	isInsideWorkspace(resource: url.URL): boolean {
		if (resource && this.workspace) {
			//return nodePath.isEqualOrParent(resource.fsPath, this.workspace.resource.fsPath)
			return true
		}
		return false
	}

	toWorkspaceRelativePath(resource: url.URL, toOSPath?: boolean): string {
		if (this.isInsideWorkspace(resource)) {
			return paths.normalize(paths.relative(this.workspace.resource.pathname, resource.pathname))
			//return 'true'
		}
		return null
	}

	toResource(workspaceRelativePath: string): url.URL {
		if (typeof workspaceRelativePath === 'string' && this.workspace) {
			return url.pathToFileURL(paths.join(this.workspace.resource.pathname, workspaceRelativePath))
			//return 'true'
		}
		return null
	}
}