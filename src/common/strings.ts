/* eslint-disable no-constant-condition */
'use strict'

/**
 * The empty string.
 */
export const empty = ''

export function rtrim(haystack: string, needle: string): string {
	if (!haystack || !needle) {
		return haystack
	}
	const needleLen = needle.length,
		haystackLen = haystack.length

	if (needleLen === 0 || haystackLen === 0) {
		return haystack
	}
	let offset = haystackLen,
		idx = -1
	while (true) {
		idx = haystack.lastIndexOf(needle, offset - 1)
		if (idx === -1 || idx + needleLen !== offset) {
			break
		}
		if (idx === 0) {
			return ''
		}
		offset = idx
	}
	return haystack.substring(0, offset)
}

export function escape(html: string): string {
	return html.replace(/[<|>|&]/g, function (match) {
		switch (match) {
			case '<': return '&lt;'
			case '>': return '&gt;'
			case '&': return '&amp;'
			default: return match
		}
	})
}

const _formatRegexp = /{(\d+)}/g

/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
export function format(value: string, ...args: any[]): string {
	if (args.length === 0) {
		return value
	}
	return value.replace(_formatRegexp, function (match, group) {
		const idx = parseInt(group, 10)
		return isNaN(idx) || idx < 0 || idx >= args.length ?
			match :
			args[idx]
	})
}

function isAsciiChar(code: number): boolean {
	return (code >= 97 && code <= 122) || (code >= 65 && code <= 90)
}

export function equalsIgnoreCase(a: string, b: string): boolean {

	const len1 = a.length,
		len2 = b.length

	if (len1 !== len2) {
		return false
	}

	for (let i = 0; i < len1; i++) {

		const codeA = a.charCodeAt(i),
			codeB = b.charCodeAt(i)

		if (codeA === codeB) {
			continue

		} else if (isAsciiChar(codeA) && isAsciiChar(codeB)) {
			const diff = Math.abs(codeA - codeB)
			if (diff !== 0 && diff !== 32) {
				return false
			}
		} else {
			if (String.fromCharCode(codeA).toLocaleLowerCase() !== String.fromCharCode(codeB).toLocaleLowerCase()) {
				return false
			}
		}
	}

	return true
}