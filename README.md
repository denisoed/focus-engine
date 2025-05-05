# FocusEngine

A lightweight TypeScript library for creating visual focus effects on DOM elements.

## Installation

```bash
npm install focus-engine
```

## Usage

```typescript
import { FocusEngine } from 'focus-engine';

// Initialize with default options
const focusEngine = new FocusEngine();

// Get an element to focus
const element = document.getElementById('my-element');

// Apply focus effect
focusEngine.focus(element);

// Initialize with custom options
const customFocusEngine = new FocusEngine({
  duration: 500, // Duration of effect in ms (default: 1000)
  color: 'rgba(0, 255, 0, 0.5)', // Color of focus effect (default: 'rgba(255, 0, 0, 0.3)')
  element: document.body, // Default element to focus (optional)
});

// Using the default element from options
customFocusEngine.focus();
```

## API

### FocusEngine

The main class of the library.

#### Constructor

```typescript
new FocusEngine(options?: FocusOptions)
```

#### Options

- `element?: HTMLElement | null` - Default element to focus
- `duration?: number` - Duration of effect in milliseconds (default: 1000)
- `color?: string` - Color of focus effect (default: 'rgba(255, 0, 0, 0.3)')

#### Methods

- `focus(element?: HTMLElement): void` - Apply focus effect to the provided element or the default element from options

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

## License

MIT
