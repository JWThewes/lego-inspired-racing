import { Engine } from './core/Engine.js';
import { AssetManager, LoadingUI } from './assets/index.js';
import { assetManifest, devAssetManifest } from './assets/assetManifest.js';

/**
 * Main entry point for the racing game
 */

// Create asset manager and loading UI
const assetManager = new AssetManager();
const loadingUI = new LoadingUI();

// Create engine
const engine = new Engine({
  targetFPS: 60,
  maxFrameTime: 0.25
});

// Setup asset loading callbacks
assetManager.onProgress((progress, loaded, total, url) => {
  loadingUI.updateProgress(progress, loaded, total);
});

assetManager.onError((error) => {
  loadingUI.addError(error);
});

assetManager.onComplete((assets, errors) => {
  console.log('Asset loading complete');
  console.log(`Loaded ${assets.size} assets`);

  if (errors.length > 0) {
    console.warn(`${errors.length} errors occurred during loading`);
    loadingUI.setComplete(true);
  } else {
    loadingUI.setComplete(false);
  }

  // Initialize engine after assets are loaded
  initializeGame();
});

/**
 * Initialize the game after assets are loaded
 */
function initializeGame() {
  engine.init((eng) => {
    console.log('Game initializing...');

    // Make asset manager accessible to engine
    eng.assetManager = assetManager;

    // Game initialization will happen here
    // Systems, entities, and initial state setup will be added by other modules

    console.log('Game initialized');
  });

  // Start the engine
  engine.start();
}

// Show loading screen and start asset loading
loadingUI.show();
loadingUI.updateStatus('Loading game assets...');

// Use development manifest (empty) for now - actual assets will be added later
assetManager.loadAssets(devAssetManifest).catch((error) => {
  console.error('Critical error during asset loading:', error);
  loadingUI.updateStatus('Critical error occurred. Check console for details.');
});

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
