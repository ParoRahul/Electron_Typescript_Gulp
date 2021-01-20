'use strict'

import path from 'path'
import os from 'os'

import { IParsedArgument } from './argumentParser'

import { createDecorator } from '../ioc/instantiation'

import { app } from 'electron'


export interface IEnvironmentService {

	_serviceBrand: undefined;
	args: IParsedArgument;
	execPath: string;
	appRoot: string;
	userHome: string;
	userDataPath: string;
	appSettingsHome: string;
	appSettingsPath: string;
	backupHome: string;
	backupWorkspacesPath: string;
	isBuilt: boolean;
	verbose: boolean;
	isWindows: boolean;
	isMacintosh: boolean;
	isLinux: boolean;
	isDevelopment: boolean;
	//nodeCachedDataDir: string;
}

export const DEnvironmentService = createDecorator<IEnvironmentService>('EnvironmentService')

export class EnvironmentService implements IEnvironmentService{

	_serviceBrand: undefined;

	get args(): IParsedArgument { return this._args }

	get appRoot(): string { return app.getAppPath() }

	get execPath(): string { return app.getPath('exe') }

	get userHome(): string { return os.homedir() }

	// get userProductHome(): string { return path.join(this.userHome, product.dataFolderName); }

	get userDataPath(): string { return app.getPath('userData') }

	// get appNameLong(): string { return product.nameLong; }

	// get appQuality(): string { return product.quality; }

	get appSettingsHome(): string { return this.userDataPath  }

	get appSettingsPath(): string { return path.join(this.appSettingsHome,'settings.json') }

	//get appKeybindingsPath(): string { return path.join(this.appSettingsHome, 'keybindings.json'); }

	get backupHome(): string { return path.join(this.userDataPath, 'Backups') }

	get backupWorkspacesPath(): string { return path.join(this.backupHome, 'workspaces.json') }

	get isBuilt(): boolean { return !process.env['MYAPP_DEV'] }

	get verbose(): boolean { return this._args.verbose? this._args.verbose : true }

	get isWindows(): boolean { return process.platform === 'win32'? true : false  }

	get isMacintosh(): boolean { return process.platform === 'darwin'? true : false  }

	get isLinux(): boolean { return process.platform === 'linux'? true : false  }

	get isDevelopment():boolean { return process.env['NODE_ENV'] == 'development'? true: false }

	// get nodeCachedDataDir(): string { return process.env['APP_NODE_CACHED_DATA_DIR']! }

	constructor(private readonly _args: IParsedArgument) {
		if (this._args.verbose || (process.env['NODE_ENV'] == 'development')) {
			console.log(`LOG: ${new Date().toLocaleTimeString()} EnvironmentService Instantiate`)
		}
	}
}
