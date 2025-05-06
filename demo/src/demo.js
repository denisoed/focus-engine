import { FocusEngine } from '../../src/index.ts';

document.addEventListener('DOMContentLoaded', () => {
  // Reference to log panel content
  const logContent = document.getElementById('log-content');

  // Function to log events
  function logEvent(message) {
    if (!logContent) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContent.appendChild(logEntry);

    // Auto-scroll to bottom
    logContent.scrollTop = logContent.scrollHeight;
  }

  logEvent('Demo initialized');

  // Log focus state
  function logFocusState() {
    const activeElement = document.activeElement;
    logEvent(
      `Active element: ${activeElement ? activeElement.tagName + (activeElement.textContent ? ' - ' + activeElement.textContent.trim() : '') : 'none'}`
    );
  }

  // Log initial focus state
  logFocusState();

  // Initialize FocusEngine
  let engine = null;

  // Function to show a specific category group
  function showCategory(categoryName) {
    // Map from parent-id to category name
    const parentToCategoryMap = {
      'small-items': 'small',
      'medium-items': 'medium',
      'large-items': 'large',
      'wide-items': 'wide',
      'tall-items': 'tall',
    };

    const categoryToShow = parentToCategoryMap[categoryName];

    if (!categoryToShow) {
      logEvent(`Unknown category parent: ${categoryName}`);
      return;
    }

    // Hide all category groups first
    document.querySelectorAll('.category-group').forEach((group) => {
      group.removeAttribute('data-category-active');

      // Check if the group belongs to the selected category
      if (group.getAttribute('data-category') === categoryToShow) {
        group.setAttribute('data-category-active', 'true');
        logEvent(`Showing category: ${categoryToShow}`);
      }
    });
  }

  // Initial setup - show all categories by default
  function showAllCategories() {
    document.querySelectorAll('.category-group').forEach((group) => {
      group.setAttribute('data-category-active', 'true');
    });
    logEvent('Showing all categories');
  }

  function initializeEngine() {
    // Ensure all focusable elements have tabindex attribute
    document.querySelectorAll('.focusable').forEach((el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
        logEvent(`Fixed missing tabindex on: ${el.textContent.trim()}`);
      }
    });

    // Initialize with custom options
    engine = new FocusEngine({
      selector: '.focusable[tabindex="0"]',
      autoInit: true,
      parentAttr: 'data-focus-parent',
      childAttr: 'data-focus-child-of',
      onSelect: (element) => {
        logEvent(`Element selected: ${element.textContent}`);

        // If a category item is selected, show that category
        if (element.classList.contains('category-item')) {
          const parentId = element.getAttribute('data-focus-parent');
          if (parentId) {
            showCategory(parentId);
          }
        }
      },
    });

    logEvent('FocusEngine initialized with parent-child navigation');

    // Default to showing all categories
    showAllCategories();

    // Check focus after some time
    setTimeout(() => {
      logFocusState();

      // If focus is still not set, force it
      if (!document.activeElement || document.activeElement === document.body) {
        logEvent('Forcing focus on first element...');

        const firstFocusable = document.querySelector('.focusable[tabindex="0"]');
        if (firstFocusable) {
          firstFocusable.focus({ preventScroll: false });
          logEvent(`Forced focus on: ${firstFocusable.textContent.trim()}`);
        }
      }
    }, 500);
  }

  // Initial setup
  initializeEngine();

  // Test function to verify parent-to-child navigation
  function testParentToChildNavigation() {
    logEvent('=== Running parent-to-child navigation test ===');

    // First, find a parent element
    const parentElement = document.querySelector('.category-item[data-focus-parent="small-items"]');
    if (!parentElement) {
      logEvent('ERROR: Could not find test parent element');
      return;
    }

    // Test Enter key navigation
    testEnterKeyNavigation(parentElement);

    // After a delay, test arrow key navigation
    setTimeout(() => {
      testArrowKeyNavigation(parentElement);
    }, 1000);
  }

  function testEnterKeyNavigation(parentElement) {
    logEvent('--- Testing Enter key navigation ---');

    // Focus the parent
    parentElement.focus();
    logEvent(`TEST ENTER: Focused parent element: ${parentElement.textContent.trim()}`);

    // Simulate pressing Enter on the parent
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    parentElement.dispatchEvent(enterEvent);

    // Check if focus moved to a child
    setTimeout(() => {
      const activeElement = document.activeElement;
      logEvent(`TEST ENTER: After Enter, focused element is: ${activeElement.textContent.trim()}`);

      const isChild = activeElement.getAttribute('data-focus-child-of') === 'small-items';
      if (isChild) {
        logEvent('TEST ENTER PASSED: Successfully navigated from parent to child with Enter key');
      } else {
        logEvent('TEST ENTER FAILED: Did not navigate to a child element with Enter key');
      }
    }, 100);
  }

  function testArrowKeyNavigation(parentElement) {
    logEvent('--- Testing Arrow key navigation ---');

    // First test that ArrowRight navigates to children
    testRightArrowNavigation(parentElement);

    // After a delay, test that ArrowDown does NOT navigate to children
    setTimeout(() => {
      testDownArrowNavigation(parentElement);
    }, 1000);
  }

  function testRightArrowNavigation(parentElement) {
    // Focus the parent again
    parentElement.focus();
    logEvent(`TEST RIGHT ARROW: Focused parent element: ${parentElement.textContent.trim()}`);

    // Simulate pressing Right Arrow on the parent (should move to children)
    const arrowEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    parentElement.dispatchEvent(arrowEvent);

    // Check if focus moved to a child
    setTimeout(() => {
      const activeElement = document.activeElement;
      logEvent(
        `TEST RIGHT ARROW: After ArrowRight, focused element is: ${activeElement.textContent.trim()}`
      );

      const isChild = activeElement.getAttribute('data-focus-child-of') === 'small-items';
      if (isChild) {
        logEvent(
          'TEST RIGHT ARROW PASSED: Successfully navigated from parent to child with right arrow key'
        );
      } else {
        logEvent(
          'TEST RIGHT ARROW FAILED: Did not navigate to a child element with right arrow key'
        );
      }
    }, 100);
  }

  function testDownArrowNavigation(parentElement) {
    // Focus the parent again
    parentElement.focus();
    logEvent(`TEST DOWN ARROW: Focused parent element: ${parentElement.textContent.trim()}`);

    // Simulate pressing Down Arrow on the parent (should NOT move to children)
    const arrowEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    parentElement.dispatchEvent(arrowEvent);

    // Check that focus did not move to a child
    setTimeout(() => {
      const activeElement = document.activeElement;
      logEvent(
        `TEST DOWN ARROW: After ArrowDown, focused element is: ${activeElement.textContent.trim()}`
      );

      const isParent =
        activeElement === parentElement ||
        (activeElement.classList.contains('category-item') &&
          !activeElement.hasAttribute('data-focus-child-of'));

      const isNextCategory = activeElement.classList.contains('category-item');

      if (isParent || isNextCategory) {
        logEvent(
          'TEST DOWN ARROW PASSED: Correctly did not navigate to child element with down arrow key'
        );
      } else {
        const isChild = activeElement.getAttribute('data-focus-child-of') === 'small-items';
        if (isChild) {
          logEvent(
            'TEST DOWN ARROW FAILED: Incorrectly navigated to child element with down arrow key'
          );
        } else {
          logEvent('TEST DOWN ARROW INCONCLUSIVE: Focus moved to non-child, non-parent element');
        }
      }
    }, 100);
  }

  // Run the test after a delay to ensure engine is initialized
  setTimeout(testParentToChildNavigation, 1000);

  // Handle add element button
  const addElementButton = document.getElementById('add-element');
  if (addElementButton) {
    addElementButton.addEventListener('click', () => {
      const sizes = ['small', 'medium', 'large', 'wide', 'tall'];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

      // Map to parent IDs
      const sizeToParentMap = {
        small: 'small-items',
        medium: 'medium-items',
        large: 'large-items',
        wide: 'wide-items',
        tall: 'tall-items',
      };

      const parentId = sizeToParentMap[randomSize];

      // Find the container for this category
      let container = document.querySelector(`.category-group[data-category="${randomSize}"]`);

      // If container doesn't exist, create it
      if (!container) {
        container = document.createElement('div');
        container.className = 'category-group';
        container.setAttribute('data-category', randomSize);
        document.querySelector('.grid-container').appendChild(container);
      }

      // Count existing items in this category to determine the new item number
      const existingItems = container.querySelectorAll(`.item-${randomSize}`);
      const newItemNumber = existingItems.length + 1;

      // Create new element with consistent naming
      const newElement = document.createElement('div');
      newElement.className = `focusable item-${randomSize}`;
      newElement.setAttribute('tabindex', '0');
      newElement.setAttribute('data-focus-child-of', parentId);
      newElement.textContent = `${randomSize.charAt(0).toUpperCase() + randomSize.slice(1)} Item ${newItemNumber}`;
      container.appendChild(newElement);

      // Update the engine to recognize the new element
      if (engine) {
        engine.updateFocusableElements();
        logEvent(`Added new element: ${newElement.textContent} to category ${randomSize}`);
      }
    });
  }

  // Handle destroy engine button
  const destroyButton = document.getElementById('destroy-engine');
  if (destroyButton) {
    destroyButton.addEventListener('click', () => {
      if (engine) {
        engine.destroy();
        engine = null;
        logEvent('FocusEngine destroyed - keyboard navigation disabled');
      }
    });
  }

  // Handle reinitialize engine button
  const reinitButton = document.getElementById('reinit-engine');
  if (reinitButton) {
    reinitButton.addEventListener('click', () => {
      if (engine) {
        engine.destroy();
      }
      initializeEngine();
      logEvent('FocusEngine reinitialized');
    });
  }

  // Detect and log all focus changes for demo purposes
  document.addEventListener('focusin', (event) => {
    if (event.target.classList.contains('focusable')) {
      logEvent(`Focus moved to: ${event.target.textContent.trim()}`);

      // Log parent-child relationship info when focus changes
      const childOf = event.target.getAttribute('data-focus-child-of');
      const isParent = event.target.getAttribute('data-focus-parent');

      if (childOf) {
        logEvent(`This is a child element of: ${childOf}`);
      }

      if (isParent) {
        logEvent(`This is a parent element with ID: ${isParent}`);
      }
    }
  });

  // Keyboard event logging for debugging
  document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
      logEvent(`Key pressed: ${event.key}`);
    }
  });
});
