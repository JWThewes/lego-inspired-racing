# Racing Game

A browser-based 3D racing game built with Three.js and a custom Entity-Component-System (ECS) architecture.

## Core Engine Foundation

The core engine provides:

- **ECS Framework**: Entity-Component-System architecture for flexible game object management
- **State Management**: Robust state machine for game state transitions (menu, playing, paused, etc.)
- **Game Loop**: Fixed timestep game loop for consistent physics and gameplay
- **Engine**: Main engine class with initialization, update loop, and shutdown

## Architecture

### Entity-Component-System (ECS)

- **Entity**: Unique identifiers that contain components
- **Component**: Pure data containers (no logic)
- **System**: Logic that operates on entities with specific components
- **World**: Container managing all entities and systems

### State Management

- **StateManager**: Handles transitions between game states
- Each state has `enter`, `update`, and `exit` lifecycle methods
- Supports passing data between states

### Game Loop

- Fixed timestep at 60 FPS for consistent physics
- Accumulator pattern prevents spiral of death
- Separate fixed update (physics/logic) and variable render
- FPS counter for performance monitoring

## Development

### Setup

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
/
├── src/
│   ├── core/           # ECS framework and engine
│   │   ├── Entity.js
│   │   ├── Component.js
│   │   ├── System.js
│   │   ├── World.js
│   │   ├── StateManager.js
│   │   ├── Engine.js
│   │   └── index.js
│   └── main.js         # Entry point
├── tests/              # Unit tests
├── index.html          # HTML entry point
├── package.json
└── vite.config.js
```

## Technologies

- **Three.js**: 3D graphics rendering
- **Vite**: Build tool and dev server
- **Vitest**: Unit testing framework
- **ES6+ JavaScript**: Modern JavaScript features
