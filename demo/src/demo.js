import { FocusEngine } from '../../src/index.ts';

document.addEventListener('DOMContentLoaded', () => {
  // Reference to log panel content
  const logContent = document.getElementById('log-content');

  // Current parent position
  let currentParentPosition = 'left';

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
      parentPosition: currentParentPosition, // Use current parent position
      onSelect: (element) => {
        logEvent(`Element selected: ${element.textContent}`);
      },
    });

    logEvent(`FocusEngine initialized with parent position: ${currentParentPosition}`);

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

  // Function to apply layout changes based on parent position
  function applyParentPositionLayout(position) {
    const demoLayout = document.querySelector('.demo-layout');

    // Remove any previous position classes
    demoLayout.classList.remove('parent-left', 'parent-right');

    // Add the new position class
    demoLayout.classList.add(`parent-${position}`);

    logEvent(`Layout changed to parent-${position}`);
  }

  // Initial setup
  applyParentPositionLayout(currentParentPosition);
  initializeEngine();

  // Handle parent position change
  const parentPositionSelect = document.getElementById('parent-position');
  if (parentPositionSelect) {
    parentPositionSelect.addEventListener('change', () => {
      const newPosition = parentPositionSelect.value;
      logEvent(`Changing parent position to: ${newPosition}`);

      // Update current position
      currentParentPosition = newPosition;

      // Apply layout changes
      applyParentPositionLayout(newPosition);

      // Reinitialize engine with new position
      if (engine) {
        engine.destroy();
      }
      initializeEngine();
    });
  }

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

  // TV Remote Control Functionality
  function initializeRemoteControl() {
    // Get remote control buttons
    const remoteUp = document.getElementById('remote-up');
    const remoteDown = document.getElementById('remote-down');
    const remoteLeft = document.getElementById('remote-left');
    const remoteRight = document.getElementById('remote-right');
    const remoteOk = document.getElementById('remote-ok');
    const remoteBack = document.getElementById('remote-back');

    // Add event listeners to buttons
    if (remoteUp) {
      remoteUp.addEventListener('click', () => {
        engine.triggerArrowUp();
        logEvent('Remote button pressed: ArrowUp (using triggerArrowUp)');
      });
    }

    if (remoteDown) {
      remoteDown.addEventListener('click', () => {
        engine.triggerArrowDown();
        logEvent('Remote button pressed: ArrowDown (using triggerArrowDown)');
      });
    }

    if (remoteLeft) {
      remoteLeft.addEventListener('click', () => {
        engine.triggerArrowLeft();
        logEvent('Remote button pressed: ArrowLeft (using triggerArrowLeft)');
      });
    }

    if (remoteRight) {
      remoteRight.addEventListener('click', () => {
        engine.triggerArrowRight();
        logEvent('Remote button pressed: ArrowRight (using triggerArrowRight)');
      });
    }

    if (remoteOk) {
      remoteOk.addEventListener('click', () => {
        if (!engine) {
          logEvent('Remote OK: FocusEngine is not initialized');
          return;
        }

        // Use triggerEnter method
        engine.triggerEnter();
        logEvent('Remote button pressed: Enter (using triggerEnter)');

        // Get the active element
        const activeElement = engine.activeElement || document.activeElement;

        if (activeElement && activeElement.classList.contains('focusable')) {
          // Simulate a click on the active element
          activeElement.click();
          logEvent(`Remote OK: Selected ${activeElement.textContent.trim()}`);

          // If element is a parent, manually trigger the category selection
          if (activeElement.classList.contains('category-item')) {
            const parentId = activeElement.getAttribute('data-focus-parent');
            if (parentId) {
              console.log('parentId', parentId);
              // showCategory(parentId);
            }
          }
        } else {
          logEvent('Remote OK: No focusable element active');
        }
      });
    }

    if (remoteBack) {
      remoteBack.addEventListener('click', () => {
        if (!engine) {
          logEvent('Remote Back: FocusEngine is not initialized');
          return;
        }

        // Use the new triggerBack method
        engine.triggerBack();
        logEvent('Remote button pressed: Back (using triggerBack)');

        // Get updated active element after back action
        const activeElement = engine.activeElement || document.activeElement;
        if (activeElement && activeElement.classList.contains('focusable')) {
          logEvent(`Remote Back: Navigated to ${activeElement.textContent.trim()}`);
        } else {
          logEvent('Remote Back: No navigation occurred');
        }
      });
    }

    logEvent('TV Remote Control initialized');
  }

  // Initialize the remote control
  initializeRemoteControl();

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
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(event.key)
    ) {
      logEvent(`Key pressed: ${event.key}`);

      if (event.key === 'Enter') {
        engine.triggerEnter();
      } else if (event.key === 'ArrowUp') {
        engine.triggerArrowUp();
      } else if (event.key === 'ArrowDown') {
        engine.triggerArrowDown();
      } else if (event.key === 'ArrowLeft') {
        engine.triggerArrowLeft();
      } else if (event.key === 'ArrowRight') {
        engine.triggerArrowRight();
      } else if (event.key === 'Escape') {
        engine.triggerBack();
      }
    }
  });
});
