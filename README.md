# FocusEngine

A lightweight TypeScript library for spatial keyboard navigation between UI elements. FocusEngine allows users to navigate UI elements naturally using arrow keys based on their spatial relationship on the screen.

## Installation

```bash
npm install focus-engine
```

## Usage

```typescript
import { FocusEngine } from 'focus-engine';

// Initialize with default options
const focusEngine = new FocusEngine();

// Or with custom options
const customFocusEngine = new FocusEngine({
  selector: '.my-focusable-elements',
  tabIndexAttr: 0,
  autoInit: true,
  onSelect: (element) => {
    console.log('Element selected:', element);
  },
});
```

## API

### FocusEngine

The main class that handles spatial keyboard navigation.

#### Constructor

```typescript
new FocusEngine(options?: FocusEngineOptions)
```

#### Options

```typescript
interface FocusEngineOptions {
  /** CSS selector for focusable elements. Default: '.focusable[tabindex="0"]' */
  selector?: string;

  /** Attribute to use for tabindex. Default: 0 */
  tabIndexAttr?: string | number;

  /** Auto-initialize the engine on creation. Default: true */
  autoInit?: boolean;

  /** Callback function when an element is selected (Enter key is pressed) */
  onSelect?: (element: HTMLElement) => void;

  /** CSS class name to apply to the focused element. Default: 'focus-engine-active' */
  focusClassName?: string;

  /** The data attribute name used to indicate a parent element. Default: 'data-focus-parent' */
  parentAttr?: string;

  /** The data attribute name used to connect child elements to their parent. Default: 'data-focus-child-of' */
  childAttr?: string;

  /** Position of parents relative to their children. Default: 'left' */
  parentPosition?: 'left' | 'right';
}
```

#### Methods

- `init(): void` - Initializes the FocusEngine by finding focusable elements and setting up event listeners
- `updateFocusableElements(): void` - Updates the list of focusable elements, useful after DOM changes
- `setInitialFocus(): void` - Sets focus to the first visible focusable element
- `destroy(): void` - Removes all event listeners and cleans up resources
- `getCurrentFocusIndex(): number` - Returns the index of the currently focused element, or -1 if none is focused
- `triggerArrowUp(): void` - Programmatically triggers an up arrow navigation from the current active element
- `triggerArrowDown(): void` - Programmatically triggers a down arrow navigation from the current active element
- `triggerArrowLeft(): void` - Programmatically triggers a left arrow navigation from the current active element
- `triggerArrowRight(): void` - Programmatically triggers a right arrow navigation from the current active element
- `triggerEnter(): void` - Programmatically triggers an enter key press behavior on the current active element
- `triggerBack(): void` - Programmatically navigates back to the parent element of the current active element (if it exists)

#### Properties

- `activeElement: HTMLElement | null` - Reference to the currently focused element managed by FocusEngine

#### Navigation

FocusEngine handles the following keyboard interactions:

- **Arrow keys** (Up, Down, Left, Right) - Navigate between focusable elements based on their position on screen
- **Enter key** - Selects the currently focused element (triggers the `onSelect` callback)

The navigation algorithm intelligently determines the most appropriate element to focus based on:

- Direction of navigation
- Spatial relationship between elements
- Visual overlap between elements
- Distance between elements

#### Parent Positions

FocusEngine supports different parent positions relative to their child elements. This is useful when creating UI layouts with parent elements located in different positions:

- **'left'** (default) - Parents are located to the left of their child elements. Navigation between parents and children is done using Left/Right arrow keys.
- **'right'** - Parents are located to the right of their child elements. Navigation between parents and children is done using Right/Left arrow keys.

Example usage:

```typescript
// Initialize with parents positioned on the right side
const focusEngine = new FocusEngine({
  parentPosition: 'right',
});
```

## Advanced Usage

### Programmatic Navigation

FocusEngine provides methods to programmatically navigate between elements, which is useful for custom UI controls or remote-style interfaces:

```typescript
// Initialize the engine
const focusEngine = new FocusEngine();

// Create UI controls for a remote-like interface
document.getElementById('remote-up').addEventListener('click', () => {
  focusEngine.triggerArrowUp();
});

document.getElementById('remote-down').addEventListener('click', () => {
  focusEngine.triggerArrowDown();
});

document.getElementById('remote-left').addEventListener('click', () => {
  focusEngine.triggerArrowLeft();
});

document.getElementById('remote-right').addEventListener('click', () => {
  focusEngine.triggerArrowRight();
});

document.getElementById('remote-ok').addEventListener('click', () => {
  focusEngine.triggerEnter();
});

document.getElementById('remote-back').addEventListener('click', () => {
  focusEngine.triggerBack();
});
```

### Accessing the Active Element

You can access the currently focused element through the `activeElement` property:

```typescript
const focusEngine = new FocusEngine();

// Get the current active element
const currentElement = focusEngine.activeElement;

// Check if a specific element is active
if (focusEngine.activeElement === myElement) {
  // Do something with the active element
}
```

## Demo Application

The project includes a demo application for testing the library.

```bash
# Start demo server with hot reload
npm run demo

# Build demo application
npm run build:demo
```

The demo allows testing keyboard navigation between UI elements.

See [demo/README.md](demo/README.md) for more details.

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/focus-engine.git
cd focus-engine

# Install dependencies
npm install

# Start development
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Version Management

#### Manual Version Management

You can manually control version bumps:

```bash
# Bump patch version (0.1.0 -> 0.1.1)
npm run bump:patch

# Bump minor version (0.1.0 -> 0.2.0)
npm run bump:minor

# Bump major version (0.1.0 -> 2.0.0)
npm run bump:major
```

## License

MIT
