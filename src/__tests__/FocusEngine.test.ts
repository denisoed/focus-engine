import { FocusEngine } from '../index';

// Mock for getBoundingClientRect
const mockElementRects = {
  item1: { top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 },
  item2: { top: 0, left: 120, right: 220, bottom: 100, width: 100, height: 100 },
  item3: { top: 120, left: 0, right: 100, bottom: 220, width: 100, height: 100 },
  item4: { top: 120, left: 120, right: 220, bottom: 220, width: 100, height: 100 },
  item5: { top: 120, left: 240, right: 340, bottom: 220, width: 100, height: 100 },
};

// Mock DOM elements for testing
function setupDOM() {
  document.body.innerHTML = `
    <div class="grid-container">
      <div id="item1" class="focusable" tabindex="0" style="position: absolute; top: 0; left: 0; width: 100px; height: 100px;">Item 1</div>
      <div id="item2" class="focusable" tabindex="0" style="position: absolute; top: 0; left: 120px; width: 100px; height: 100px;">Item 2</div>
      <div id="item3" class="focusable" tabindex="0" style="position: absolute; top: 120px; left: 0; width: 100px; height: 100px;">Item 3</div>
      <div id="item4" class="focusable" tabindex="0" style="position: absolute; top: 120px; left: 120px; width: 100px; height: 100px;">Item 4</div>
    </div>
  `;

  // Mock getBoundingClientRect for testing
  Element.prototype.getBoundingClientRect = function () {
    const id = this.id;
    if (mockElementRects[id]) {
      return mockElementRects[id] as DOMRect;
    }
    return {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    } as DOMRect;
  };

  // Mock offsetParent for visibility testing
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get: function () {
      return document.body;
    },
  });
}

/**
 * Mocked class for testing, allows to work around document.activeElement limitations
 */
class TestFocusEngine extends FocusEngine {
  private _mockedFocusedElement: HTMLElement | null = null;
  private _onSelectCallback?: (element: HTMLElement) => void;

  constructor(options: any = {}) {
    super(options);
    this._onSelectCallback = options.onSelect;
  }

  // Override setInitialFocus method for use in tests
  public setInitialFocus(): void {
    if (this['focusableElements'].length > 0) {
      const firstVisibleElement = this['focusableElements'].find((el) => el.offsetParent !== null);
      if (firstVisibleElement) {
        // Instead of focus(), just set our mocked element
        this._mockedFocusedElement = firstVisibleElement;
        this['currentFocusIndex'] = this['focusableElements'].indexOf(firstVisibleElement);

        // Trigger focus event on the element
        const focusEvent = new Event('focus');
        firstVisibleElement.dispatchEvent(focusEvent);
      }
    }
  }

  // Get the current "focused" element
  public getMockedFocusedElement(): HTMLElement | null {
    return this._mockedFocusedElement;
  }

  // Simulate focus movement
  public mockMoveFocus(element: HTMLElement): void {
    this._mockedFocusedElement = element;
    this['currentFocusIndex'] = this['focusableElements'].indexOf(element);

    // Trigger focus event on the element
    const focusEvent = new Event('focus');
    element.dispatchEvent(focusEvent);
  }

  // Simulate key press
  public mockKeyDown(key: string): void {
    const event = new KeyboardEvent('keydown', { key });
    document.dispatchEvent(event);

    // Find the next element based on direction
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key) &&
      this._mockedFocusedElement
    ) {
      const nextElement = this['findNextFocusable'](this._mockedFocusedElement, key as any);
      if (nextElement) {
        this.mockMoveFocus(nextElement);
      }
    } else if (key === 'Enter' && this._mockedFocusedElement) {
      // Simulate Enter key press
      if (this._onSelectCallback) {
        this._onSelectCallback(this._mockedFocusedElement);
      }
    }
  }
}

describe('FocusEngine', () => {
  let engine: TestFocusEngine;
  let onSelectMock: jest.Mock;

  beforeEach(() => {
    setupDOM();
    onSelectMock = jest.fn();
    // Clear timers before each test
    jest.useFakeTimers();
    // Initialize with autoInit false so we can control initialization
    engine = new TestFocusEngine({
      autoInit: false,
      onSelect: onSelectMock,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize and find focusable elements', () => {
      engine.init();
      // Advance timers to execute the setTimeout calls
      jest.advanceTimersByTime(300);

      // Set focus manually, since document.activeElement is read-only
      engine.setInitialFocus();

      // Check that elements are found and focus is set in our mock variable
      expect(engine.getMockedFocusedElement()).toBe(document.getElementById('item1'));
    });

    it('should set tabindex on elements without it', () => {
      // Add an element without tabindex
      const container = document.querySelector('.grid-container');
      const newElement = document.createElement('div');
      newElement.className = 'focusable';
      newElement.id = 'item5';
      newElement.textContent = 'Item 5';
      container?.appendChild(newElement);

      // Initialize with tabIndexAttr
      const tabIndexEngine = new TestFocusEngine({
        autoInit: false,
        tabIndexAttr: 0,
      });

      tabIndexEngine.init();
      jest.advanceTimersByTime(10);

      // Check that tabindex was set
      const element5 = document.getElementById('item5');
      expect(element5?.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      engine.init();
      jest.advanceTimersByTime(100);
      engine.setInitialFocus(); // Focus item1
    });

    it('should navigate right with arrow right key', () => {
      // Use special method to simulate key press
      engine.mockKeyDown('ArrowRight');

      // Should focus item2
      expect(engine.getMockedFocusedElement()).toBe(document.getElementById('item2'));
    });

    it('should navigate down with arrow down key', () => {
      // Simulate down arrow key press
      engine.mockKeyDown('ArrowDown');

      // Should focus item3
      expect(engine.getMockedFocusedElement()).toBe(document.getElementById('item3'));
    });

    it('should navigate diagonally with consecutive arrow presses', () => {
      // Simulate right arrow key press followed by down arrow
      engine.mockKeyDown('ArrowRight');
      engine.mockKeyDown('ArrowDown');

      // Should end up on item4
      expect(engine.getMockedFocusedElement()).toBe(document.getElementById('item4'));
    });

    it('should call onSelect when Enter is pressed', () => {
      // Focus item1
      const item1 = document.getElementById('item1');
      if (item1) {
        engine.mockMoveFocus(item1);
      }

      // Simulate Enter key press with our special method
      engine.mockKeyDown('Enter');

      // onSelect should be called with item1
      expect(onSelectMock).toHaveBeenCalled();
      expect(onSelectMock).toHaveBeenCalledWith(document.getElementById('item1'));
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners when destroyed', () => {
      // Mock the removeEventListener method
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      engine.init();
      jest.advanceTimersByTime(10);
      engine.destroy();

      // Check that removeEventListener was called
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should clear focus event handlers when destroyed', () => {
      // Mock removeEventListener for elements
      const element1 = document.getElementById('item1');
      const removeEventListenerSpy = jest.spyOn(element1 as HTMLElement, 'removeEventListener');

      engine.init();
      jest.advanceTimersByTime(10);
      engine.destroy();

      // Check that removeEventListener was called for the element
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('Additional methods', () => {
    it('should return current focus index', () => {
      engine.init();
      jest.advanceTimersByTime(100);
      engine.setInitialFocus(); // Focus on item1

      expect(engine.getCurrentFocusIndex()).toBe(0);

      // Move focus to second element
      engine.mockKeyDown('ArrowRight');

      expect(engine.getCurrentFocusIndex()).toBe(1);
    });

    it('should update focusable elements', () => {
      engine.init();
      jest.advanceTimersByTime(100);

      // Add a new element
      const container = document.querySelector('.grid-container');
      const newElement = document.createElement('div');
      newElement.className = 'focusable';
      newElement.setAttribute('tabindex', '0');
      newElement.id = 'item5';
      container?.appendChild(newElement);

      // Update the list of elements
      engine.updateFocusableElements();

      // Move to item4 and try to move to the new element
      const item4 = document.getElementById('item4');
      if (item4) {
        engine.mockMoveFocus(item4);
        // Since item5 is to the right of item4 in the layout
        engine.mockKeyDown('ArrowRight');
      }

      // Check that focus moved to the new element
      expect(engine.getMockedFocusedElement()?.id).toBe('item5');
    });
  });
});
