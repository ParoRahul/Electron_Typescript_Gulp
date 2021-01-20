'use strict'

import 'css!./media/statusbar'

/* import { IDisposable, dispose } from '../../../common/disposable'
import * as DOM from '../../base/DOM'
import { Registry } from '../../service/compRegister'
import { Builder, $ } from '../../base/builder'
import { Component } from '../component'

import { IStatusbarService, IStatusbarEntry, EStatusbarAlignment } from './statusbar'
import { IInstantiationService } from '../../../common/ioc/instantiation' */

/* export class StatusbarPart extends Component implements IStatusbarService {

	private static PRIORITY_PROP = 'priority';
	private static ALIGNMENT_PROP = 'alignment';

	private toDispose: IDisposable[];
	private statusItemsContainer: Builder;
	private statusMsgDispose: IDisposable;

	constructor(
		private readonly id: string,
		private readonly instantiationService: IInstantiationService) {
		super(id, { hasTitle: false })
		this.toDispose = []
	}

	addEntry(entry: IStatusbarEntry, alignment: EStatusbarAlignment, priority: number = 0): IDisposable {

		// Render entry in status bar
		const el = this.doCreateStatusItem(alignment, priority)
		const item = this.instantiationService.createInstance(StatusBarEntryItem, entry)
		const toDispose = item.render(el)

		// Insert according to priority
		const container = this.statusItemsContainer.getHTMLElement()
		const neighbours = this.getEntries(alignment)
		let inserted = false
		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]
			const nPriority = $(neighbour).getProperty(StatusbarPart.PRIORITY_PROP)
			if (
				alignment === EStatusbarAlignment.LEFT && nPriority < priority ||
				alignment === EStatusbarAlignment.RIGHT && nPriority > priority
			) {
				container.insertBefore(el, neighbour)
				inserted = true
				break
			}
		}

		if (!inserted) {
			container.appendChild(el)
		}

		return {
			dispose: () => {
				$(el).destroy()

				if (toDispose) {
					toDispose.dispose()
				}
			}
		}
	}

	private getEntries(alignment: EStatusbarAlignment): HTMLElement[] {
		const entries: HTMLElement[] = []
		const container = this.statusItemsContainer.getHTMLElement()
		const children = container.children
		for (let i = 0; i < children.length; i++) {
			const childElement = <HTMLElement>children.item(i)
			if ($(childElement).getProperty(StatusbarPart.ALIGNMENT_PROP) === alignment) {
				entries.push(childElement)
			}
		}
		return entries
	}

	createContentArea(parent: Builder): Builder {
		this.statusItemsContainer = $(parent)
		// Fill in initial items that were contributed from the registry
		const registry = Registry.as<IStatusbarRegistry>(Extensions.Statusbar)
		const leftDescriptors = registry.items.filter(d => d.alignment === EStatusbarAlignment.LEFT).sort((a, b) => b.priority - a.priority)
		const rightDescriptors = registry.items.filter(d => d.alignment === EStatusbarAlignment.RIGHT).sort((a, b) => a.priority - b.priority)
		const descriptors = rightDescriptors.concat(leftDescriptors) // right first because they float
		this.toDispose.push(...descriptors.map(descriptor => {
			const item = this.instantiationService.createInstance(descriptor.syncDescriptor)
			const el = this.doCreateStatusItem(descriptor.alignment, descriptor.priority)
			const dispose = item.render(el)
			this.statusItemsContainer.append(el)
			return dispose
		}))
		return this.statusItemsContainer
	}

	private doCreateStatusItem(alignment:EStatusbarAlignment, priority: number = 0): HTMLElement {
		const el = document.createElement('div')
		DOM.addClass(el, 'statusbar-item')
		if (alignment ===EStatusbarAlignment.RIGHT) {
			DOM.addClass(el, 'right')
		} else {
			DOM.addClass(el, 'left')
		}
		$(el).setProperty(StatusbarPart.PRIORITY_PROP, priority)
		$(el).setProperty(StatusbarPart.ALIGNMENT_PROP, alignment)
		return el
	}

	setStatusMessage(message: string, autoDisposeAfter: number = -1, delayBy: number = 0): IDisposable {
		if (this.statusMsgDispose) {
			this.statusMsgDispose.dispose() // dismiss any previous
		}
		let statusDispose: IDisposable
		let showHandle = setTimeout(() => {
			statusDispose = this.addEntry({ text: message },EStatusbarAlignment.LEFT, Number.MIN_VALUE)
			showHandle = null
		}, delayBy)
		let hideHandle: number
		// Dispose function takes care of timeouts and actual entry
		const dispose = {
			dispose: () => {
				if (showHandle) {
					clearTimeout(showHandle)
				}
				if (hideHandle) {
					clearTimeout(hideHandle)
				}
				if (statusDispose) {
					statusDispose.dispose()
				}
			}
		}
		this.statusMsgDispose = dispose
		if (typeof autoDisposeAfter === 'number' && autoDisposeAfter > 0) {
			hideHandle = window.setTimeout(() => dispose.dispose(), autoDisposeAfter)
		}
		return dispose
	}

	dispose(): void {
		this.toDispose = dispose(this.toDispose)
		super.dispose()
	}

}
 */

/*class StatusBarEntryItem implements IStatusbarItem {
 	private entry: IStatusbarEntry;

	constructor(
		entry: IStatusbarEntry,
		@IKeybindingService private keybindingService: IKeybindingService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IMessageService private messageService: IMessageService,
		@ITelemetryService private telemetryService: ITelemetryService,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService
	) {
		this.entry = entry;
	}

	public render(el: HTMLElement): IDisposable {
		let toDispose: IDisposable[] = [];
		dom.addClass(el, 'statusbar-entry');

		// Text Container
		let textContainer: HTMLElement;
		if (this.entry.command) {
			textContainer = document.createElement('a');

			$(textContainer).on('click', () => this.executeCommand(this.entry.command), toDispose);
		} else {
			textContainer = document.createElement('span');
		}

		// Label
		new OcticonLabel(textContainer).text = this.entry.text;

		// Tooltip
		if (this.entry.tooltip) {
			$(textContainer).title(this.entry.tooltip);
		}

		// Color
		if (this.entry.color) {
			$(textContainer).color(this.entry.color);
		}

		el.appendChild(textContainer);

		return {
			dispose: () => {
				toDispose = disposeAll(toDispose);
			}
		};
	}

	private executeCommand(id: string) {
		let action: IAction;
		let activeEditor = this.editorService.getActiveEditor();

		// Lookup built in commands
		let builtInActionDescriptor = (<IWorkbenchActionRegistry>Registry.as(ActionExtensions.WorkbenchActions)).getWorkbenchAction(id);
		if (builtInActionDescriptor) {
			action = this.instantiationService.createInstance(builtInActionDescriptor.syncDescriptor);
		}

		// Lookup editor commands
		if (!action) {
			let activeEditorControl = <any>(activeEditor ? activeEditor.getControl() : null);
			if (activeEditorControl && types.isFunction(activeEditorControl.getAction)) {
				action = activeEditorControl.getAction(id);
			}
		}

		// Some actions or commands might only be enabled for an active editor, so focus it first
		if (activeEditor) {
			activeEditor.focus();
		}

		// Run it if enabled
		if (action) {
			if (action.enabled) {
				this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'status bar' });
				(action.run() || TPromise.as(null)).done(() => {
					action.dispose();
				}, (err) => this.messageService.show(Severity.Error, toErrorMessage(err)));
			} else {
				this.messageService.show(Severity.Warning, nls.localize('canNotRun', "Command '{0}' can not be run from here.", action.label || id));
			}
		}

		// Fallback to the keybinding service for any other case
		else {
			this.keybindingService.executeCommand(id).done(undefined, err => this.messageService.show(Severity.Error, toErrorMessage(err)));
		}
	}
}*/