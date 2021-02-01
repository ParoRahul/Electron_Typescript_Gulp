/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import { Action } from '../../base/action'
/* import { CPromise } from '../../../common/promise'
 */import { ESeverity } from './severity'

import { createDecorator } from '../../../common/ioc/instantiation'

import { Promise } from 'bluebird'

export interface IMessageWithAction {
	message: string;
	actions: Action[];
}

export interface IConfirmation {
	title?: string;
	type?: 'none' | 'info' | 'error' | 'question' | 'warning';
	message: string;
	detail?: string;
	primaryButton?: string;
	secondaryButton?: string;
}

export const CloseAction = new Action('close.message', "Close", null, true, () => Promise.resolve(true))
export const CancelAction = new Action('close.message', "Cancel", null, true, () => Promise.resolve(true))

export const DMessageService = createDecorator<IMessageService>('messageService')

export interface IMessageService {

	_serviceBrand: any;

	/**
	 * Tells the service to show a message with a given severity
	 * the returned function can be used to hide the message again
	 */
	show(sev: ESeverity, message: string): () => void;
	show(sev: ESeverity, message: Error): () => void;
	show(sev: ESeverity, message: string[]): () => void;
	show(sev: ESeverity, message: Error[]): () => void;
	show(sev: ESeverity, message: IMessageWithAction): () => void;

	/**
	 * Hide any messages showing currently.
	 */
	hideAll(): void;

	/**
	 * Ask the user for confirmation.
	 */
	confirm(confirmation: IConfirmation): boolean;
}


export const DChoiceService = createDecorator<IChoiceService>('choiceService')

export interface IChoiceService {

	_serviceBrand: any;

	/**
	 * Prompt the user for a choice between multiple options.
	 *
	 * @param when `modal` is true, this will block the user until chooses.
	 *
	 * @returns A promise with the selected choice index. The promise is cancellable
	 * which hides the message. The promise can return an error, meaning that
	 * the user refused to choose.
	 *
	 * When `modal` is true and user refused to choose, then promise with index of
	 * `Cancel` option is returned. If there is no such option then promise with
	 * `0` index is returned.
	 */
	choose(severity: ESeverity, message: string, options: string[], modal?: boolean): Promise<number>;
}

export import ESeverity = ESeverity;