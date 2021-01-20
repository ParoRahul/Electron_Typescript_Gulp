'use strict'

import * as strings from '../../../common/strings'

export enum ESeverity {
	Ignore = 0,
	Info = 1,
	Warning = 2,
	Error = 3
}


const _error = 'error',
	_warning = 'warning',
	_warn = 'warn',
	_info = 'info'

const _displayStrings: { [value: number]: string; } = Object.create(null)
_displayStrings[ESeverity.Error] = "Error"
_displayStrings[ESeverity.Warning] = "Warning"
_displayStrings[ESeverity.Info] = "Info"

/**
 * Parses 'error', 'warning', 'warn', 'info' in call casings
 * and falls back to ignore.
 */
export function fromValue(value: string): ESeverity {
	if (!value) {
		return ESeverity.Ignore
	}

	if (strings.equalsIgnoreCase(_error, value)) {
		return ESeverity.Error
	}

	if (strings.equalsIgnoreCase(_warning, value) || strings.equalsIgnoreCase(_warn, value)) {
		return ESeverity.Warning
	}

	if (strings.equalsIgnoreCase(_info, value)) {
		return ESeverity.Info
	}

	return ESeverity.Ignore
}

export function toString(value: ESeverity): string {
	return _displayStrings[value] || strings.empty
}

export function compare(a: ESeverity, b: ESeverity): number {
	return b - a
}

