import { IEvent } from '../base/event'

export enum EParts {
	ACTIVITYBAR_PART,
	SIDEBAR_PART,
	PANEL_PART,
	EDITOR_PART,
	STATUSBAR_PART,
	TITLEBAR_PART
}

export enum EPosition {
	LEFT,
	RIGHT
}

export interface ILayoutOptions {
	toggleMaximizedPanel?: boolean;
}

export interface IPartService {

	/**
	 * Emits when the visibility of the title bar changes.
	 */
	onTitleBarVisibilityChange: IEvent<void>;

	/**
	 * Emits when the editor part's layout changes.
	 */
	onEditorLayout: IEvent<void>;

	/**
	 * Asks the part service to layout all parts.
	 */
	layout(options?: ILayoutOptions): void;

	/**
	 * Asks the part service to if all parts have been created.
	 */
	isCreated(): boolean;

	/**
	 * Promise is complete when all parts have been created.
	 */
	joinCreation(): Promise<boolean>;

	/**
	 * Returns whether the given part has the keyboard focus or not.
	 */
	hasFocus(part: EParts): boolean;

	/**
	 * Returns the parts HTML element, if there is one.
	 */
	getContainer(part: EParts): HTMLElement;

	/**
	 * Returns iff the part is visible.
	 */
	isVisible(part: EParts): boolean;

	/**
	 * Set activity bar hidden or not
	 */
	setActivityBarHidden(hidden: boolean): void;

	/**
	 * Number of pixels (adjusted for zooming) that the title bar (if visible) pushes down the workbench contents.
	 */
	getTitleBarOffset(): number;

	/**
	 * Set sidebar hidden or not
	 */
	setSideBarHidden(hidden: boolean): Promise<void>;

	/**
	 * Set panel part hidden or not
	 */
	setPanelHidden(hidden: boolean): Promise<void>;

	/**
	 * Maximizes the panel height if the panel is not already maximized.
	 * Shrinks the panel to the default starting size if the panel is maximized.
	 */
	toggleMaximizedPanel(): void;

	/**
	 * Gets the current side bar position. Note that the sidebar can be hidden too.
	 */
	getSideBarPosition(): EPosition;

	/**
	 * Adds a class to the workbench part.
	 */
	addClass(clazz: string): void;

	/**
	 * Removes a class from the workbench part.
	 */
	removeClass(clazz: string): void;

	/**
	 * Returns the identifier of the element that contains the workbench.
	 */
	getWorkbenchElementId(): string;

	/**
	 * Toggles the workbench in and out of zen mode - parts get hidden and window goes fullscreen.
	 */
	toggleZenMode(): void;
}