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
}
```

#### Methods

- `init(): void` - Initializes the FocusEngine by finding focusable elements and setting up event listeners
- `updateFocusableElements(): void` - Updates the list of focusable elements, useful after DOM changes
- `setInitialFocus(): void` - Sets focus to the first visible focusable element
- `destroy(): void` - Removes all event listeners and cleans up resources

#### Navigation

FocusEngine handles the following keyboard interactions:

- **Arrow keys** (Up, Down, Left, Right) - Navigate between focusable elements based on their position on screen
- **Enter key** - Selects the currently focused element (triggers the `onSelect` callback)

The navigation algorithm intelligently determines the most appropriate element to focus based on:

- Direction of navigation
- Spatial relationship between elements
- Visual overlap between elements
- Distance between elements

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
