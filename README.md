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
```

## API

### FocusEngine

The main class of the library.

#### Constructor

```typescript
new FocusEngine(options?: FocusOptions)
```

#### Options

-

#### Methods

-

#### Focus Style Options

```typescript
interface FocusStyleOptions {
  type?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
  color?: string;
  opacity?: number;
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

The demo allows testing all functionality of the library

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
