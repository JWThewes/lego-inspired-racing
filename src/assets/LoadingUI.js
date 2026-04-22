/**
 * LoadingUI - Loading screen with progress bar and error display
 * Provides visual feedback during asset loading
 */
export class LoadingUI {
  constructor() {
    this.container = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.errorContainer = null;
    this.errorList = null;

    this._createUI();
  }

  /**
   * Create the loading UI elements
   * @private
   */
  _createUI() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'loading-screen';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    // Create title
    const title = document.createElement('h1');
    title.textContent = 'Racing Game';
    title.style.cssText = `
      color: #fff;
      font-size: 48px;
      margin-bottom: 40px;
      text-shadow: 0 0 20px rgba(255,255,255,0.5);
    `;
    this.container.appendChild(title);

    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      width: 400px;
      max-width: 80vw;
    `;
    this.container.appendChild(progressContainer);

    // Create progress bar background
    const progressBg = document.createElement('div');
    progressBg.style.cssText = `
      width: 100%;
      height: 30px;
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    `;
    progressContainer.appendChild(progressBg);

    // Create progress bar fill
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #00d4ff 0%, #0099ff 100%);
      border-radius: 15px;
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(0,212,255,0.5);
    `;
    progressBg.appendChild(this.progressBar);

    // Create progress text
    this.progressText = document.createElement('div');
    this.progressText.style.cssText = `
      color: #fff;
      font-size: 18px;
      margin-top: 15px;
      text-align: center;
    `;
    this.progressText.textContent = '0%';
    progressContainer.appendChild(this.progressText);

    // Create status text
    this.statusText = document.createElement('div');
    this.statusText.style.cssText = `
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      margin-top: 10px;
      text-align: center;
      min-height: 20px;
    `;
    this.statusText.textContent = 'Initializing...';
    progressContainer.appendChild(this.statusText);

    // Create error container
    this.errorContainer = document.createElement('div');
    this.errorContainer.style.cssText = `
      width: 400px;
      max-width: 80vw;
      margin-top: 30px;
      display: none;
    `;
    this.container.appendChild(this.errorContainer);

    // Create error title
    const errorTitle = document.createElement('div');
    errorTitle.style.cssText = `
      color: #ff6b6b;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    `;
    errorTitle.textContent = 'Loading Errors:';
    this.errorContainer.appendChild(errorTitle);

    // Create error list
    this.errorList = document.createElement('ul');
    this.errorList.style.cssText = `
      color: rgba(255,255,255,0.8);
      font-size: 12px;
      list-style: none;
      padding: 0;
      max-height: 200px;
      overflow-y: auto;
    `;
    this.errorContainer.appendChild(this.errorList);

    // Add to document
    document.body.appendChild(this.container);
  }

  /**
   * Show the loading screen
   */
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }

  /**
   * Hide the loading screen with fade out
   */
  hide() {
    if (this.container) {
      this.container.style.transition = 'opacity 0.5s ease';
      this.container.style.opacity = '0';

      setTimeout(() => {
        this.container.style.display = 'none';
        this.container.style.opacity = '1';
      }, 500);
    }
  }

  /**
   * Update progress bar and text
   * @param {number} progress - Progress from 0 to 100
   * @param {number} loaded - Number of loaded items
   * @param {number} total - Total number of items
   */
  updateProgress(progress, loaded, total) {
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }

    if (this.progressText) {
      this.progressText.textContent = `${Math.round(progress)}%`;
    }

    if (this.statusText) {
      this.statusText.textContent = `Loading assets (${loaded}/${total})...`;
    }
  }

  /**
   * Update status text
   * @param {string} message - Status message
   */
  updateStatus(message) {
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }

  /**
   * Add an error to the error list
   * @param {Object} error - Error object with url and message
   */
  addError(error) {
    if (!this.errorList || !this.errorContainer) return;

    // Show error container
    this.errorContainer.style.display = 'block';

    // Create error item
    const errorItem = document.createElement('li');
    errorItem.style.cssText = `
      padding: 5px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;

    const errorText = error.url || error.path || error.message || 'Unknown error';
    errorItem.textContent = `• ${errorText}`;

    this.errorList.appendChild(errorItem);
  }

  /**
   * Set completion state
   * @param {boolean} hasErrors - Whether there were loading errors
   */
  setComplete(hasErrors = false) {
    if (hasErrors) {
      this.updateStatus('Loading completed with errors. Press any key to continue.');

      // Wait for user input before hiding
      const continueHandler = () => {
        this.hide();
        document.removeEventListener('keydown', continueHandler);
        document.removeEventListener('click', continueHandler);
      };

      document.addEventListener('keydown', continueHandler);
      document.addEventListener('click', continueHandler);
    } else {
      this.updateStatus('Loading complete!');

      // Auto-hide after a short delay
      setTimeout(() => {
        this.hide();
      }, 500);
    }
  }

  /**
   * Remove the loading UI from the DOM
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.errorContainer = null;
    this.errorList = null;
  }
}
