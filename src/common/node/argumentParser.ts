'use strict'

import minimist from 'minimist'

export const options: minimist.Opts = {
	string: [
		'locale',
		'userDataDir'
	],
	boolean: [
		'help',
		'version',
		'performance',
		'verbose',
	],
	alias: {
		help: 'h',
		version: 'v',
		performance: 'p',
	}
}

export interface IParsedArgument  {
	help?: boolean;
	version?: boolean;
	locale?: string;
	userDataDir?: string;
	performance?: boolean;
	verbose?: boolean;
}