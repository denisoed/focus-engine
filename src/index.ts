/**
 * FocusEngine - A TypeScript library for spatial keyboard navigation
 * This library allows for intuitive keyboard navigation between focusable elements on a page,
 * simulating a spatial relationship based on element positions.
 */

/**
 * Represents a point with x and y coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Direction types for navigation
 */
export type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

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
}

/**
 * FocusEngine class that handles spatial keyboard navigation
 */
export class FocusEngine {
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex: number = -1;
  private selector: string;
  private tabIndexAttr: string | number;
  private onSelectCallback?: (element: HTMLElement) => void;
  private initialized: boolean = false;
  private keydownHandler: (event: KeyboardEvent) => void;
  private focusEventHandlers: Map<HTMLElement, EventListenerOrEventListenerObject> = new Map();
  private focusClassName: string;
  private previouslyFocusedElement: HTMLElement | null = null;

  /**
   * Creates a new instance of FocusEngine
   * @param options Configuration options
   */
  constructor(options: FocusEngineOptions = {}) {
    this.selector = options.selector || '.focusable[tabindex="0"]';
    this.tabIndexAttr = options.tabIndexAttr ?? 0;
    this.onSelectCallback = options.onSelect;
    this.focusClassName = options.focusClassName || 'focus-engine-active';

    // Create a bound handler function that preserves this context
    this.keydownHandler = this.handleKeyDown.bind(this);

    if (options.autoInit !== false) {
      // Delayed initialization for proper DOM handling
      setTimeout(() => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
          this.init();
        }
      }, 0);
    }
  }

  /**
   * Initializes the FocusEngine by finding focusable elements and setting up event listeners
   */
  public init(): void {
    if (this.initialized) return;

    // If tabIndexAttr is specified, set the attribute for the corresponding elements
    if (this.tabIndexAttr !== undefined) {
      const elementsWithoutTabIndex = document.querySelectorAll('.focusable:not([tabindex])');
      elementsWithoutTabIndex.forEach((el) => {
        el.setAttribute('tabindex', String(this.tabIndexAttr));
      });
    }

    this.updateFocusableElements();
    this.setupEventListeners();

    // Call with a small delay for proper DOM rendering
    setTimeout(() => {
      this.setInitialFocus();
    }, 100);

    this.initialized = true;

    // Принудительно переустановим фокус, если он не был установлен
    setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        this.setInitialFocus();
      } else if (this.focusableElements.includes(document.activeElement as HTMLElement)) {
        // If focus is already on one of our elements, apply the class
        this.updateFocusClass(document.activeElement as HTMLElement);
      }
    }, 300);
  }

  /**
   * Finds and stores all focusable elements matching the selector
   */
  public updateFocusableElements(): void {
    // Очищаем старые обработчики фокуса перед обновлением элементов
    this.clearFocusEventListeners();

    this.focusableElements = Array.from(document.querySelectorAll(this.selector)) as HTMLElement[];

    // Update focus event listeners
    this.focusableElements.forEach((el, index) => {
      const handler = () => {
        this.currentFocusIndex = index;
        this.updateFocusClass(el);
      };

      el.addEventListener('focus', handler);
      this.focusEventHandlers.set(el, handler);

      // If element is already focused, apply the class
      if (document.activeElement === el) {
        this.updateFocusClass(el);
      }
    });
  }

  /**
   * Updates the CSS class on the focused element
   */
  private updateFocusClass(element: HTMLElement): void {
    // Remove class from previously focused element
    if (this.previouslyFocusedElement && this.previouslyFocusedElement !== element) {
      this.previouslyFocusedElement.classList.remove(this.focusClassName);
    }

    // Add class to newly focused element
    element.classList.add(this.focusClassName);
    this.previouslyFocusedElement = element;
  }

  /**
   * Clears focus event listeners
   */
  private clearFocusEventListeners(): void {
    this.focusEventHandlers.forEach((handler, element) => {
      element.removeEventListener('focus', handler as EventListener);
    });
    this.focusEventHandlers.clear();
  }

  /**
   * Sets focus to the first visible focusable element
   */
  public setInitialFocus(): void {
    if (this.focusableElements.length > 0) {
      const firstVisibleElement = this.focusableElements.find((el) => el.offsetParent !== null);
      if (firstVisibleElement) {
        try {
          firstVisibleElement.focus({ preventScroll: false });
          this.currentFocusIndex = this.focusableElements.indexOf(firstVisibleElement);
          this.updateFocusClass(firstVisibleElement);
        } catch (error) {
          console.error('Error setting initial focus:', error);
        }
      } else if (this.focusableElements[0]) {
        try {
          this.focusableElements[0].focus({ preventScroll: false });
          this.currentFocusIndex = 0;
          this.updateFocusClass(this.focusableElements[0]);
        } catch (error) {
          console.error('Error setting fallback focus:', error);
        }
      }
    }
  }

  /**
   * Sets up keyboard event listeners
   */
  private setupEventListeners(): void {
    // Remove the old handler if it exists
    document.removeEventListener('keydown', this.keydownHandler);

    // Add a new handler
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Handles keydown events for navigation
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const currentFocusedElement = document.activeElement as HTMLElement;
    const direction = event.key as Direction;

    // Only for navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(direction)) {
      // If there is no focus or focus is not on one of our elements
      if (!currentFocusedElement || !this.focusableElements.includes(currentFocusedElement)) {
        if (
          this.currentFocusIndex !== -1 &&
          this.focusableElements[this.currentFocusIndex] &&
          this.focusableElements[this.currentFocusIndex].offsetParent !== null
        ) {
          try {
            const element = this.focusableElements[this.currentFocusIndex];
            element.focus({ preventScroll: false });
            this.updateFocusClass(element);
          } catch (error) {
            console.error('Error restoring focus:', error);
            this.setInitialFocus();
          }
        } else {
          this.setInitialFocus();
        }
      } else {
        // Ensure the class is applied to the currently focused element
        this.updateFocusClass(currentFocusedElement);
      }

      // Arrow handling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
        event.preventDefault(); // Prevent page scrolling

        // Define the starting element for navigation
        const startElement =
          document.activeElement &&
          this.focusableElements.includes(document.activeElement as HTMLElement)
            ? (document.activeElement as HTMLElement)
            : this.focusableElements.find((el) => el.offsetParent !== null);

        if (!startElement) return; // No visible elements for navigation

        const nextElement = this.findNextFocusable(startElement, direction);

        if (nextElement) {
          try {
            nextElement.focus({ preventScroll: false });
            this.currentFocusIndex = this.focusableElements.indexOf(nextElement);
            this.updateFocusClass(nextElement);
          } catch (error) {
            console.error('Error focusing next element:', error);
          }
        }
      }

      // Обработка клавиши Enter
      if (event.key === 'Enter') {
        if (currentFocusedElement && this.focusableElements.includes(currentFocusedElement)) {
          // Применяем визуальный эффект
          currentFocusedElement.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (document.activeElement === currentFocusedElement) {
              currentFocusedElement.style.transform = 'scale(1.05)';
            } else {
              currentFocusedElement.style.transform = '';
            }
          }, 100);

          // Call the callback function if it was provided
          if (this.onSelectCallback) {
            this.onSelectCallback(currentFocusedElement);
          }
        }
      }
    }
  }

  /**
   * Finds the next element to focus in the given direction
   */
  private findNextFocusable(currentElement: HTMLElement, direction: Direction): HTMLElement | null {
    if (!currentElement) return null;

    const currentRect = this.getRect(currentElement);
    const currentCenter = this.getCenter(currentRect);

    let bestCandidate: HTMLElement | null = null;
    let minDistance = Infinity;

    // Filter out the current element and invisible elements
    const visibleFocusableElements = this.focusableElements.filter(
      (el) => el !== currentElement && el.offsetParent !== null
    );

    visibleFocusableElements.forEach((candidate) => {
      const candidateRect = this.getRect(candidate);
      const candidateCenter = this.getCenter(candidateRect);

      // Calculate the difference in center coordinates
      const dx = candidateCenter.x - currentCenter.x;
      const dy = candidateCenter.y - currentCenter.y;

      let isSuitable = false;
      let distance = Infinity;

      switch (direction) {
        case 'ArrowUp':
          if (dy < 0) {
            if (candidateRect.right > currentRect.left && candidateRect.left < currentRect.right) {
              isSuitable = true;
              distance = Math.abs(dy) + Math.abs(dx) * 0.3;
              if (Math.abs(dx) < Math.min(currentRect.width, candidateRect.width) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
        case 'ArrowDown':
          if (dy > 0) {
            if (candidateRect.right > currentRect.left && candidateRect.left < currentRect.right) {
              isSuitable = true;
              distance = Math.abs(dy) + Math.abs(dx) * 0.3;
              if (Math.abs(dx) < Math.min(currentRect.width, candidateRect.width) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
        case 'ArrowLeft':
          if (dx < 0) {
            if (candidateRect.bottom > currentRect.top && candidateRect.top < currentRect.bottom) {
              isSuitable = true;
              distance = Math.abs(dx) + Math.abs(dy) * 0.3;
              if (Math.abs(dy) < Math.min(currentRect.height, candidateRect.height) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
        case 'ArrowRight':
          if (dx > 0) {
            if (candidateRect.bottom > currentRect.top && candidateRect.top < currentRect.bottom) {
              isSuitable = true;
              distance = Math.abs(dx) + Math.abs(dy) * 0.3;
              if (Math.abs(dy) < Math.min(currentRect.height, candidateRect.height) / 4) {
                distance *= 0.8;
              }
            }
          }
          break;
      }

      // Check if the candidate is not completely "behind" the current element
      if (isSuitable) {
        const projectionPoint = this.getProjection(currentRect, candidateRect, direction);

        // Check if projection falls inside the candidate
        let projectionOnCandidateAxis;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
          projectionOnCandidateAxis =
            projectionPoint >= candidateRect.left && projectionPoint <= candidateRect.right;
        } else {
          projectionOnCandidateAxis =
            projectionPoint >= candidateRect.top && projectionPoint <= candidateRect.bottom;
        }

        if (!projectionOnCandidateAxis) {
          // If the projection does not fall, the candidate may be too far
          distance *= 1.5;
        }
      }

      if (isSuitable && distance < minDistance) {
        minDistance = distance;
        bestCandidate = candidate;
      }
    });

    return bestCandidate;
  }

  /**
   * Gets the bounding rectangle of an element
   */
  private getRect(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  /**
   * Calculates the center point of a rectangle
   */
  private getCenter(rect: DOMRect): Point {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  /**
   * Calculates the projection of a rectangle's center onto the axis of another
   * in the given direction
   */
  private getProjection(
    currentRect: DOMRect,
    candidateRect: DOMRect,
    direction: Direction
  ): number {
    // Get only the necessary candidateCenter, currentCenter is not used in this method
    const candidateCenter = this.getCenter(candidateRect);

    switch (direction) {
      case 'ArrowUp':
      case 'ArrowDown':
        // Project the candidate's center on the current horizontal line
        if (candidateCenter.x < currentRect.left) return currentRect.left;
        if (candidateCenter.x > currentRect.right) return currentRect.right;
        return candidateCenter.x;
      case 'ArrowLeft':
      case 'ArrowRight':
        // Project the candidate's center on the current vertical line
        if (candidateCenter.y < currentRect.top) return currentRect.top;
        if (candidateCenter.y > currentRect.bottom) return currentRect.bottom;
        return candidateCenter.y;
      default:
        return 0;
    }
  }

  /**
   * Gets the currently focused element index
   * @returns The index of the currently focused element, or -1 if none is focused
   */
  public getCurrentFocusIndex(): number {
    return this.currentFocusIndex;
  }

  /**
   * Destroys the FocusEngine instance by removing event listeners
   */
  public destroy(): void {
    document.removeEventListener('keydown', this.keydownHandler);
    this.clearFocusEventListeners();

    // Remove focus class from the last focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.classList.remove(this.focusClassName);
      this.previouslyFocusedElement = null;
    }

    this.initialized = false;
  }
}

export default FocusEngine;
