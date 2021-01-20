/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as DOM  from './dom'

/* import {IMouseEvent} from './mouseEvent' */


export interface IHtmlContentElement {
	/**
	 * supports **bold**, __italics__, and [[actions]]
	 */
	formattedText?:string;
	text?: string;
	className?: string;
	style?: string;
	customStyle?: any;
	tagName?: string;
	children?: IHtmlContentElement[];
	isText?: boolean;
	role?: string;
	markdown?: string;
	code?: { language: string; value: string; };
}


export type TRenderableContent = string | IHtmlContentElement | IHtmlContentElement[];

export interface IRenderOptions {
	actionCallback?: (content: string, event?: MouseEvent) => void;
	codeBlockRenderer?: (modeId: string, value: string) => string;
}

enum EFormatType {
	Invalid,
	Root,
	Text,
	Bold,
	Italics,
	Action,
	ActionClose,
	NewLine
}

interface IFormatParseTree {
	type: EFormatType;
	content?: string;
	index?: number;
	children?: IFormatParseTree[];
}

const SAFE_TAG_NAMES = {
	a: true,
	b: true,
	blockquote: true,
	code: true,
	del: true,
	dd: true,
	div: true,
	dl: true,
	dt: true,
	em: true,
	h1h2h3i: true,
	img: true,
	kbd: true,
	li: true,
	ol: true,
	p: true,
	pre: true,
	s: true,
	span: true,
	sup: true,
	sub: true,
	strong: true,
	strike: true,
	ul: true,
	br: true,
	hr: true,
}

function getSafeTagName(tagName: string): string {
	if (!tagName) {
		return null
	}
	if (SAFE_TAG_NAMES.hasOwnProperty(tagName)) {
		return tagName
	}
	return null
}

function formatTagType(char: string): EFormatType {
	switch (char) {
		case '*':
			return EFormatType.Bold
		case '_':
			return EFormatType.Italics
		case '[':
			return EFormatType.Action
		case ']':
			return EFormatType.ActionClose
		default:
			return EFormatType.Invalid
	}
}


function isFormatTag(char: string): boolean {
	return formatTagType(char) !== EFormatType.Invalid
}


class StringStream {
	private source: string;
	private index: number;

	constructor(source: string) {
		this.source = source
		this.index = 0
	}

	eos(): boolean {
		return this.index >= this.source.length
	}

	next(): string {
		const next = this.peek()
		this.advance()
		return next
	}

	peek(): string {
		return this.source[this.index]
	}

	advance(): void {
		this.index++
	}
}



function renderFormattedText(element: Node,
								treeNode: IFormatParseTree,
								actionCallback?: (content: string, event?: MouseEvent) => void) {
	let child: Node

	if (treeNode.type === EFormatType.Text) {
		child = document.createTextNode(treeNode.content)
	}
	else if (treeNode.type === EFormatType.Bold) {
		child = document.createElement('b')
	}
	else if (treeNode.type === EFormatType.Italics) {
		child = document.createElement('i')
	}
	else if (treeNode.type === EFormatType.Action) {
		const a = document.createElement('a')
		a.href = '#'
		DOM.addStandardDisposableListener(a, 'click', (event) => {
			actionCallback(String(treeNode.index), event)
		})

		child = a
	}
	else if (treeNode.type === EFormatType.NewLine) {
		child = document.createElement('br')
	}
	else if (treeNode.type === EFormatType.Root) {
		child = element
	}

	if (element !== child) {
		element.appendChild(child)
	}

	if (Array.isArray(treeNode.children)) {
		treeNode.children.forEach((nodeChild) => {
			renderFormattedText(child, nodeChild, actionCallback)
		})
	}
}

function parseFormattedText(content: string): IFormatParseTree {

	const root: IFormatParseTree = {
		type: EFormatType.Root,
		children: []
	}

	let actionItemIndex = 0
	let current = root
	const stack: IFormatParseTree[] = []
	const stream = new StringStream(content)

	while (!stream.eos()) {
		let next = stream.next()

		const isEscapedFormatType = (next === '\\' && formatTagType(stream.peek()) !== EFormatType.Invalid)
		if (isEscapedFormatType) {
			next = stream.next() // unread the backslash if it escapes a format tag type
		}

		if (!isEscapedFormatType && isFormatTag(next) && next === stream.peek()) {
			stream.advance()

			if (current.type === EFormatType.Text) {
				current = stack.pop()
			}

			const type = formatTagType(next)
			if (current.type === type || (current.type === EFormatType.Action && type === EFormatType.ActionClose)) {
				current = stack.pop()
			} else {
				const newCurrent: IFormatParseTree = {
					type: type,
					children: []
				}

				if (type === EFormatType.Action) {
					newCurrent.index = actionItemIndex
					actionItemIndex++
				}

				current.children.push(newCurrent)
				stack.push(current)
				current = newCurrent
			}
		} else if (next === '\n') {
			if (current.type === EFormatType.Text) {
				current = stack.pop()
			}

			current.children.push({
				type: EFormatType.NewLine
			})

		} else {
			if (current.type !== EFormatType.Text) {
				const textCurrent: IFormatParseTree = {
					type: EFormatType.Text,
					content: next
				}
				current.children.push(textCurrent)
				stack.push(current)
				current = textCurrent

			} else {
				current.content += next
			}
		}
	}

	if (current.type === EFormatType.Text) {
		current = stack.pop()
	}

	if (stack.length) {
		// incorrectly formatted string literal
	}

	return root
}

function _renderHtml(content: IHtmlContentElement, options: IRenderOptions = {}): Node {

	const { actionCallback} = options

	if (content.isText) {
		return document.createTextNode(content.text)
	}

	const tagName = getSafeTagName(content.tagName) || 'div'
	const element = document.createElement(tagName) as HTMLElement

	if (content.className) {
		element.className = content.className
	}
	if (content.text) {
		element.textContent = content.text
	}
	if (content.style) {
		element.setAttribute('style', content.style)
	}
	if (content.customStyle) {
		Object.keys(content.customStyle).forEach((key: string) => {
			//element.style[key] = content.customStyle[key]
			element.style.setProperty(key,content.customStyle[key])
		})
	}
	if (content.children) {
		content.children.forEach((child) => {
			element.appendChild(renderHtml(child, options))
		})
	}
	if (content.formattedText) {
		renderFormattedText(element, parseFormattedText(content.formattedText), actionCallback)
	}


	return element
}

/**
 * Create html nodes for the given content element.
 *
 * @param content a html element description
 * @param actionCallback a callback function for any action links in the string. Argument is the zero-based index of the clicked action.
 */
export function renderHtml(content: TRenderableContent, options: IRenderOptions = {}): Node {
	if (typeof content === 'string') {
		return _renderHtml({ isText: true, text: content }, options)
	} else if (Array.isArray(content)) {
		return _renderHtml({ children: content }, options)
	} else if (content) {
		return _renderHtml(content, options)
	}
}
