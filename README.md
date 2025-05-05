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

This project includes automatic version incrementation when pushing to git.

#### Automatic Version Bump on Git Push

When you push changes to Git, a pre-push hook will automatically increment the patch version in package.json, commit the change, and continue with the push.

#### Manual Version Management

You can also manually control version bumps:

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
