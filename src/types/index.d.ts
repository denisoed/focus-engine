/**
 * Type definitions for FocusEngine
 */

declare module 'focus-engine' {
  /**
   * Direction types for navigation
   */
  export type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

  /**
   * Type for parent position
   */
  export type ParentPosition = 'left' | 'right';

  /**
   * Options for configuring the FocusEngine
   */
  export interface FocusEngineOptions {
    /** CSS selector for focusable elements */
    selector?: string;
    /** Attribute to use for tabindex */
    tabIndexAttr?: string | number;
    /** Auto-initialize the engine on creation */
    autoInit?: boolean;
    /** Callback function when an element is selected (Enter key is pressed) */
    onSelect?: (element: HTMLElement) => void;
    /** CSS class name to apply to the focused element */
    focusClassName?: string;
    /** The data attribute name used to indicate a parent element */
    parentAttr?: string;
    /** The data attribute name used to connect child elements to their parent */
    childAttr?: string;
    /** Position of parents relative to their children (default: 'left') */
    parentPosition?: ParentPosition;
  }

  /**
   * Represents a point with x and y coordinates
   */
  export interface Point {
    x: number;
    y: number;
  }

  /**
   * FocusEngine class that handles spatial keyboard navigation
   */
  export class FocusEngine {
    /**
     * Creates a new instance of FocusEngine
     * @param options Configuration options
     */
    constructor(options?: FocusEngineOptions);

    /**
     * Initializes the FocusEngine by finding focusable elements and setting up event listeners
     */
    init(): void;

    /**
     * Finds and stores all focusable elements matching the selector
     */
    updateFocusableElements(): void;

    /**
     * Sets focus to the first visible focusable element
     */
    setInitialFocus(): void;

    /**
     * Destroys the FocusEngine instance by removing event listeners
     */
    destroy(): void;

    /**
     * Gets the currently focused element index
     */
    getCurrentFocusIndex(): number;
  }

  export default FocusEngine;
}
