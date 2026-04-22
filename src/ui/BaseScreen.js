/**
 * BaseScreen - Base class for all UI screens
 * Provides common functionality for show/hide/cleanup
 */
export class BaseScreen {
  constructor(id) {
    this.id = id;
    this.container = null;
    this.visible = false;
  }

  /**
   * Create the DOM structure for this screen
   * Must be implemented by subclasses
   */
  create() {
    throw new Error('BaseScreen.create() must be implemented by subclass');
  }

  /**
   * Show this screen
   */
  show() {
    if (!this.container) {
      this.container = this.create();
      this.container.id = this.id;
      this.container.className = 'ui-screen';
      this.container.style.display = 'none';
    }

    this.container.style.display = 'flex';
    this.visible = true;
    this.onShow();
  }

  /**
   * Hide this screen
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.visible = false;
    this.onHide();
  }

  /**
   * Cleanup resources when screen is destroyed
   */
  destroy() {
    this.onDestroy();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.visible = false;
  }

  /**
   * Update screen - called every frame when visible
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    // Override in subclasses if needed
  }

  /**
   * Hook called when screen is shown
   */
  onShow() {
    // Override in subclasses if needed
  }

  /**
   * Hook called when screen is hidden
   */
  onHide() {
    // Override in subclasses if needed
  }

  /**
   * Hook called when screen is destroyed
   */
  onDestroy() {
    // Override in subclasses if needed
  }

  /**
   * Get the DOM container element
   */
  getContainer() {
    return this.container;
  }
}
