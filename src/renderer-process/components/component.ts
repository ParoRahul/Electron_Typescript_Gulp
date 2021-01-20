'use strict'

import 'css!./media/part'
import { Dimension, Builder } from '../base/builder'
import { WorkbenchComponent } from './WorkbenchComponent'

export interface IPartOptions {
	hasTitle?: boolean;
}

const TITLE_HEIGHT = 35

export class ComponentLayout {

	constructor(private container: Builder,
				private options: IPartOptions,
				private titleArea: Builder, private contentArea: Builder) {
	}

	layout(dimension: Dimension): Dimension[] {
		const {width, height} = dimension

		// Return the applied sizes to title and content
		const sizes: Dimension[] = []

		// Title Size: Width (Fill), Height (Variable)
		let titleSize: Dimension
		if (this.options && this.options.hasTitle) {
			titleSize = new Dimension(width, Math.min(height, TITLE_HEIGHT))
		} else {
			titleSize = new Dimension(0, 0)
		}

		// Content Size: Width (Fill), Height (Variable)
		const contentSize = new Dimension(width, height - titleSize.height)

		sizes.push(titleSize)
		sizes.push(contentSize)

		// Content
		if (this.contentArea) {
			this.contentArea.size(contentSize.width, contentSize.height)
		}

		return sizes
	}
}

export abstract class Component extends WorkbenchComponent  {
	private parent: Builder;
	private titleArea: Builder;
	private contentArea: Builder;
	private partLayout: ComponentLayout;

	constructor(id: string, private options: IPartOptions) {
		super(id)
	}

	/**
	 * Note: Clients should not call this method, the workbench calls this
	 * method. Calling it otherwise may result in unexpected behavior.
	 *
	 * Called to create title and content area of the part.
	 */
	create(parent: Builder): void {
		this.parent = parent
		this.titleArea = this.createTitleArea(parent)
		this.contentArea = this.createContentArea(parent)

		this.partLayout = new ComponentLayout(this.parent, this.options, this.titleArea, this.contentArea)
	}

	/**
	 * Returns the overall part container.
	 */
	getContainer(): Builder {
		return this.parent
	}

	/**
	 * Subclasses override to provide a title area implementation.
	 */
	protected createTitleArea(parent: Builder): Builder {
		return null
	}

	/**
	 * Subclasses override to provide a content area implementation.
	 */
	protected createContentArea(parent: Builder): Builder {
		return null
	}

	/**
	 * Returns the content area container.
	 */
	protected getContentArea(): Builder {
		return this.contentArea
	}

	/**
	 * Layout title and content area in the given dimension.
	 */
	layout(dimension: Dimension): Dimension[] {
		return this.partLayout.layout(dimension)
	}

	/**
	 * Returns the part layout implementation.
	 */
	getLayout(): ComponentLayout {
		return this.partLayout
	}
}
