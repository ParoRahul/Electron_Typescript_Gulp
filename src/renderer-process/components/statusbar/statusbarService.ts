'use strict'

import { IDisposable, } from '../../../common/disposable'

export enum EStatusbarAlignment {
	LEFT, RIGHT
}

/**
 * A declarative way of describing a status bar entry
 */
export interface IStatusbarEntry {

	/**
	 * The text to show for the entry. You can embed icons in the text by leveraging the syntax:
	 *
	 * `My text ${icon name} contains icons like ${icon name} this one.`
	 */
	text: string;

	/**
	 * An optional tooltip text to show when you hover over the entry
	 */
	tooltip?: string;

	/**
	 * An optional color to use for the entry
	 */
	color?: string;

	/**
	 * An optional id of a command that is known to the workbench to execute on click
	 */
	command?: string;
}

export interface IStatusbarService {
	/**
	 * Adds an entry to the statusbar with the given alignment and priority. Use the returned IDisposable
	 * to remove the statusbar entry.
	 */
	addEntry(entry: IStatusbarEntry, alignment: EStatusbarAlignment, priority?: number): IDisposable;
}