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
      onSelect: (element) => {
        logEvent(`Element selected: ${element.textContent}`);
      },
    });

    logEvent('FocusEngine initialized');

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

  // Handle add element button
  const addElementButton = document.getElementById('add-element');
  if (addElementButton) {
    addElementButton.addEventListener('click', () => {
      const container = document.querySelector('.grid-container');
      if (container) {
        // Generate random properties for variety
        const sizes = ['small', 'medium', 'large', 'wide', 'tall'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

        // Create new element
        const newElement = document.createElement('div');
        newElement.className = `focusable item-${randomSize}`;
        newElement.setAttribute('tabindex', '0');
        newElement.textContent = `New ${randomSize.charAt(0).toUpperCase() + randomSize.slice(1)}`;
        container.appendChild(newElement);

        // Update the engine to recognize the new element
        if (engine) {
          engine.updateFocusableElements();
          logEvent(`Added new element: ${newElement.textContent}`);
        }
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
    }
  });

  // Keyboard event logging for debugging
  document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
      logEvent(`Key pressed: ${event.key}`);
    }
  });
});
