import { Engine } from './core/Engine.js';

/**
 * Main entry point for the racing game
 */

// Create and initialize the engine
const engine = new Engine({
  targetFPS: 60,
  maxFrameTime: 0.25
});

// Initialize with setup callback
engine.init((eng) => {
  console.log('Game initializing...');

  // Game initialization will happen here
  // Systems, entities, and initial state setup will be added by other modules

  console.log('Game initialized');
});

// Start the engine
engine.start();

// Make engine globally accessible for debugging
window.engine = engine;

// Handle page visibility to pause/resume
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page hidden - consider pausing');
    // State management will handle actual pausing
  } else {
    console.log('Page visible - consider resuming');
  }
});

// Handle window unload
window.addEventListener('beforeunload', () => {
  engine.shutdown();
});
