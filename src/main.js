import { Engine } from './core/Engine.js';
import { UIManager, MainMenuUI, VehicleSelectUI, TrackSelectUI, RaceHUD, ResultsUI } from './ui/index.js';

/**
 * Main entry point for the racing game
 */

// Create and initialize the engine
const engine = new Engine({
  targetFPS: 60,
  maxFrameTime: 0.25
});

// Create UI Manager
const uiManager = new UIManager();

// Initialize with setup callback
engine.init((eng) => {
  console.log('Game initializing...');

  // Initialize UI Manager
  const uiContainer = document.getElementById('ui-container');
  uiManager.init(uiContainer);

  // Register UI screens with navigation callbacks
  const mainMenu = new MainMenuUI(() => {
    console.log('Start game clicked');
    uiManager.showScreen('vehicle-select');
  });

  const vehicleSelect = new VehicleSelectUI((vehicleId) => {
    console.log('Vehicle selected:', vehicleId);
    uiManager.showScreen('track-select');
  });

  const trackSelect = new TrackSelectUI((trackId) => {
    console.log('Track selected:', trackId);
    uiManager.showScreen('race-hud');
    // TODO: Start race logic will be added by race system
  });

  const raceHUD = new RaceHUD();

  const results = new ResultsUI(
    () => {
      console.log('Race again clicked');
      uiManager.showScreen('vehicle-select');
    },
    () => {
      console.log('Main menu clicked');
      uiManager.showScreen('main-menu');
    }
  );

  uiManager.registerScreen('main-menu', mainMenu);
  uiManager.registerScreen('vehicle-select', vehicleSelect);
  uiManager.registerScreen('track-select', trackSelect);
  uiManager.registerScreen('race-hud', raceHUD);
  uiManager.registerScreen('results', results);

  // Show main menu on start
  uiManager.showScreen('main-menu');

  // Game initialization will happen here
  // Systems, entities, and initial state setup will be added by other modules

  console.log('Game initialized');
});

// Start the engine
engine.start();

// Make engine and UI manager globally accessible for debugging
window.engine = engine;
window.uiManager = uiManager;

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
