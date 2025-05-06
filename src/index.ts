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
  /** The data attribute name used to indicate a parent element */
  parentAttr?: string;
  /** The data attribute name used to connect child elements to their parent */
  childAttr?: string;
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
  private parentAttr: string;
  private childAttr: string;
  private lastParentMap: Map<string, HTMLElement> = new Map();

  /**
   * Creates a new instance of FocusEngine
   * @param options Configuration options
   */
  constructor(options: FocusEngineOptions = {}) {
    this.selector = options.selector || '.focusable[tabindex="0"]';
    this.tabIndexAttr = options.tabIndexAttr ?? 0;
    this.onSelectCallback = options.onSelect;
    this.focusClassName = options.focusClassName || 'focus-engine-active';
    this.parentAttr = options.parentAttr || 'data-focus-parent';
    this.childAttr = options.childAttr || 'data-focus-child-of';

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

        // Store parent relationship information
        const childOfValue = el.getAttribute(this.childAttr);
        if (childOfValue) {
          // Remember which parent this child came from
          this.lastParentMap.set(childOfValue, el);
        }
      };

      el.addEventListener('focus', handler);
      this.focusEventHandlers.set(el, handler);

      // If element is already focused, apply the class
      if (document.activeElement === el) {
        this.updateFocusClass(el);
      }
    });

    // Build parent-child relationships on initialization/update
    this.updateParentChildRelationships();
  }

  /**
   * Updates parent-child relationship tracking
   */
  private updateParentChildRelationships(): void {
    // Find all parent elements
    const parentElements = this.focusableElements.filter((el) => el.hasAttribute(this.parentAttr));

    // For each parent, find its children and set up the relationship
    parentElements.forEach((parentEl) => {
      const parentId = parentEl.getAttribute(this.parentAttr);
      if (!parentId) return;

      // Find children for this parent
      const childElements = this.focusableElements.filter(
        (el) => el.getAttribute(this.childAttr) === parentId
      );

      if (childElements.length > 0) {
        // If we don't have a last visited child for this parent yet, set the first child
        if (!this.lastParentMap.has(parentId)) {
          this.lastParentMap.set(parentId, childElements[0]);
        }
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

          // Removed auto-focus from parent to child during initialization
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

        // Check if this is a parent element and the key is a navigation direction that should go to children
        const shouldNavigateToChildren = this.shouldNavigateToChildren(startElement, direction);

        if (shouldNavigateToChildren) {
          // Navigate from parent to child using arrow keys
          const navigatedToChild = this.navigateToChildren(startElement);
          if (navigatedToChild) {
            return; // Successfully navigated to child, exit early
          }
        }

        // Check for parent-child relationship navigation (child to parent)
        const parentElement = this.checkParentNavigation(startElement, direction);

        if (parentElement) {
          try {
            parentElement.focus({ preventScroll: false });
            this.currentFocusIndex = this.focusableElements.indexOf(parentElement);
            this.updateFocusClass(parentElement);
          } catch (error) {
            console.error('Error focusing parent element:', error);
          }
        } else {
          // No parent navigation, try spatial navigation
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

          // Check if this is a parent element that has children to focus
          const navigatedToChild = this.navigateToChildren(currentFocusedElement);

          // Only call the callback if we didn't navigate to a child
          // This prevents the callback from being called when we're just navigating
          if (!navigatedToChild && this.onSelectCallback) {
            this.onSelectCallback(currentFocusedElement);
          }
        }
      }
    }
  }

  /**
   * Checks if we should navigate to a parent element based on the current element and direction
   * @param currentElement Current focused element
   * @param direction Navigation direction
   * @returns Parent element to focus, or null if no parent navigation should occur
   */
  private checkParentNavigation(
    currentElement: HTMLElement,
    direction: Direction
  ): HTMLElement | null {
    // Check if the current element has a parent relationship
    const childOfValue = currentElement.getAttribute(this.childAttr);

    if (!childOfValue) {
      return null; // Not a child element
    }

    // Find parent elements that match the child's parent ID
    const parentElements = this.focusableElements.filter(
      (el) => el.getAttribute(this.parentAttr) === childOfValue
    );

    if (parentElements.length === 0) {
      return null; // No matching parent found
    }

    // For TV-style navigation, we may want to check direction
    // For example, only navigate to parent when pressing Left if categories are on the left
    // or only when pressing Up if categories are above

    // Determine if this direction should trigger parent navigation
    const shouldNavigateToParent = this.shouldNavigateToParent(
      currentElement,
      direction,
      childOfValue
    );

    if (shouldNavigateToParent) {
      // Find the closest or designated parent
      return parentElements[0]; // For now, just take the first parent
    }

    return null;
  }

  /**
   * Determines if navigation in this direction should go to the parent
   */
  private shouldNavigateToParent(
    currentElement: HTMLElement,
    direction: Direction,
    parentId: string
  ): boolean {
    // Возвращаемся к родителю только при нажатии "влево"
    if (direction !== 'ArrowLeft') {
      return false;
    }

    // Get all elements with the same parent
    const siblingsWithSameParent = this.focusableElements.filter(
      (el) => el.getAttribute(this.childAttr) === parentId && el.offsetParent !== null
    );

    // Проверяем, находится ли элемент на левом краю группы
    const isAtLeftEdge = this.isElementAtLeftEdge(currentElement, siblingsWithSameParent);

    if (!isAtLeftEdge) {
      return false;
    }

    // Найдем родительский элемент
    const parentElements = this.focusableElements.filter(
      (el) => el.getAttribute(this.parentAttr) === parentId && el.offsetParent !== null
    );

    if (parentElements.length === 0) {
      return false;
    }

    // Убедимся, что родительский элемент находится слева от текущего элемента
    const parentElement = parentElements[0];
    const parentRect = this.getRect(parentElement);
    const currentRect = this.getRect(currentElement);

    // Родитель должен быть слева от дочернего элемента
    return parentRect.right <= currentRect.left;
  }

  /**
   * Проверяет, находится ли элемент на левом краю группы
   */
  private isElementAtLeftEdge(element: HTMLElement, siblingGroup: HTMLElement[]): boolean {
    // Если элемент один в группе, он всегда на краю
    if (siblingGroup.length <= 1) {
      return true;
    }

    const elementRect = this.getRect(element);

    // Проверяем, есть ли другие элементы слева от текущего
    const hasLeftSibling = siblingGroup.some((sibling) => {
      if (sibling === element) return false;
      const siblingRect = this.getRect(sibling);
      return (
        siblingRect.right <= elementRect.left &&
        siblingRect.bottom > elementRect.top &&
        siblingRect.top < elementRect.bottom
      );
    });

    return !hasLeftSibling;
  }

  /**
   * Navigates from a parent element to its children
   * @param parentElement The parent element
   * @returns True if navigation to a child occurred
   */
  private navigateToChildren(parentElement: HTMLElement): boolean {
    const parentId = parentElement.getAttribute(this.parentAttr);
    if (!parentId) {
      return false; // Not a parent element
    }

    // Debug log to verify we're entering this method with a parent element
    console.log(`Navigating from parent with ID: ${parentId}`);

    // Find child elements with this parent ID
    // Filter for visible elements - check both offsetParent and computed style
    const childElements = this.focusableElements.filter((el) => {
      if (el.getAttribute(this.childAttr) !== parentId) {
        return false;
      }

      // Check if element is visible
      if (el.offsetParent === null) {
        return false;
      }

      // Also check computed style visibility for more reliability
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }

      return true;
    });

    // Debug log to show how many children we found
    console.log(`Found ${childElements.length} visible child elements`);

    if (childElements.length === 0) {
      // If we couldn't find any visible children, try without the extra style checks
      // as a fallback, in case the elements are just being displayed differently
      const fallbackChildren = this.focusableElements.filter(
        (el) => el.getAttribute(this.childAttr) === parentId && el.offsetParent !== null
      );

      console.log(`Found ${fallbackChildren.length} fallback child elements`);

      if (fallbackChildren.length === 0) {
        console.log('No children found for this parent');
        return false; // No visible children at all
      }

      // Use the fallback children
      return this.focusChild(fallbackChildren, parentId);
    }

    // We have visible children, focus one of them
    return this.focusChild(childElements, parentId);
  }

  /**
   * Helper method to focus the appropriate child based on previous history
   * @param childElements Array of potential child elements to focus
   * @param parentId The parent ID for retrieving last visited child
   * @returns True if a child was successfully focused
   */
  private focusChild(childElements: HTMLElement[], parentId: string): boolean {
    // First check if we have a "last visited" child for this parent
    const lastVisitedChild = this.lastParentMap.get(parentId);

    let targetChild: HTMLElement | undefined;

    if (lastVisitedChild && childElements.includes(lastVisitedChild)) {
      // We have a previously visited child, focus that one
      console.log('Using previously visited child');
      targetChild = lastVisitedChild;
    } else {
      // No previously visited child, go to the first child
      console.log('Using first child element');
      targetChild = childElements[0];
    }

    if (targetChild) {
      try {
        // Ensure the child is visible before trying to focus it
        if (targetChild.offsetParent === null) {
          console.error('Target child is not visible, cannot focus');
          return false;
        }

        console.log(`Focusing child element: ${targetChild.textContent?.trim() || 'unnamed'}`);
        targetChild.focus({ preventScroll: false });
        this.currentFocusIndex = this.focusableElements.indexOf(targetChild);
        this.updateFocusClass(targetChild);

        // Store this child as the last visited for this parent
        this.lastParentMap.set(parentId, targetChild);

        return true;
      } catch (error) {
        console.error('Error focusing child element:', error);
      }
    }

    return false;
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

    // Clear parent tracking
    this.lastParentMap.clear();
  }

  /**
   * Determines if arrow key navigation should move from parent to child elements
   * @param currentElement Current focused element
   * @param direction Navigation direction
   * @returns True if we should navigate to children
   */
  private shouldNavigateToChildren(currentElement: HTMLElement, direction: Direction): boolean {
    // Only navigate to children with ArrowRight
    if (direction !== 'ArrowRight') {
      return false;
    }

    const parentId = currentElement.getAttribute(this.parentAttr);
    if (!parentId) {
      return false; // Not a parent element
    }

    // Find child elements with this parent ID
    const childElements = this.focusableElements.filter(
      (el) => el.getAttribute(this.childAttr) === parentId && el.offsetParent !== null
    );

    if (childElements.length === 0) {
      return false; // No visible children
    }

    // Check if the children are to the right of the parent
    const firstChild = childElements[0];
    const parentRect = this.getRect(currentElement);
    const childRect = this.getRect(firstChild);

    // Child should be to the right of parent
    return childRect.left >= parentRect.right - 5;
  }
}

export default FocusEngine;
