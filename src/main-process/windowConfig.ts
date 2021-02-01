'use strict'

import { IParsedArgument } from '../common/node/argumentParser'

export interface IOpenFileRequest {
	filesToOpen?: string[];
	filesToCreate?: string[];
}

export interface IWindowConfiguration extends IParsedArgument , IOpenFileRequest {
	mainPid: number;
	windowId: number;
	appRoot: string;
	zoomLevel?: number;
	fullscreen?: boolean;
	highContrast?: boolean;
	baseTheme?: string;
	maximized?: boolean;
	workspacePath?: string
}