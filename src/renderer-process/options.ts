import * as url from 'url'

export interface IBaseResourceInput {
	/**
	 * Optional options to use when opening the text input.
	 */
	options?: string;
	/**
	 * Label to show for the diff editor
	 */
	label?: string;
	/**
	 * Description to show for the diff editor
	 */
	description?: string;
}

//export interface IResourceInput extends IBaseResourceInput {
export interface IResourceInput {
	/**
	 * The resource URL of the resource to open.
	 */
	resource: url.URL;
	/**
	 * The encoding of the text input if known.
	 */
	encoding?: string;
}


export interface IOptions {
	/**
	 * Instructs the workbench to open the provided files right after startup.
	 */
	filesToOpen?: IResourceInput[];
	/**
	 * Instructs the workbench to create and open the provided files right after startup.
	 */
	filesToCreate?: IResourceInput[];

	windowID : number
}