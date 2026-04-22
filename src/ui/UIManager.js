/**
 * UIManager - Manages all UI screens and transitions
 * Handles screen lifecycle and navigation
 */
export class UIManager {
  constructor() {
    this.screens = new Map();
    this.currentScreen = null;
    this.container = null;
  }

  /**
   * Initialize the UI manager
   * @param {HTMLElement} container - Parent container for all UI
   */
  init(container) {
    this.container = container;
    this.container.className = 'ui-container';
  }

  /**
   * Register a screen with the manager
   * @param {string} name - Screen identifier
   * @param {BaseScreen} screen - Screen instance
   */
  registerScreen(name, screen) {
    if (this.screens.has(name)) {
      console.warn(`Screen ${name} already registered, replacing`);
      const existingScreen = this.screens.get(name);
      existingScreen.destroy();
    }

    this.screens.set(name, screen);

    // Create the screen's DOM and add to container
    const screenContainer = screen.getContainer() || screen.create();
    if (screenContainer && this.container) {
      this.container.appendChild(screenContainer);
      screen.container = screenContainer;
      screen.hide(); // Start hidden
    }
  }

  /**
   * Show a specific screen, hiding the current one
   * @param {string} name - Screen name to show
   * @param {Object} data - Optional data to pass to the screen
   */
  showScreen(name, data = {}) {
    const screen = this.screens.get(name);
    if (!screen) {
      console.error(`Screen ${name} not found`);
      return;
    }

    // Hide current screen
    if (this.currentScreen) {
      this.currentScreen.hide();
    }

    // Show new screen
    screen.show(data);
    this.currentScreen = screen;
  }

  /**
   * Hide the current screen
   */
  hideCurrentScreen() {
    if (this.currentScreen) {
      this.currentScreen.hide();
      this.currentScreen = null;
    }
  }

  /**
   * Get a registered screen by name
   * @param {string} name - Screen name
   * @returns {BaseScreen|null}
   */
  getScreen(name) {
    return this.screens.get(name) || null;
  }

  /**
   * Update the current screen
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    if (this.currentScreen && this.currentScreen.visible) {
      this.currentScreen.update(deltaTime);
    }
  }

  /**
   * Cleanup all screens
   */
  destroy() {
    this.screens.forEach(screen => screen.destroy());
    this.screens.clear();
    this.currentScreen = null;

    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
