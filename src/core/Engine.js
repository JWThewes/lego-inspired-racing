import { World } from './World.js';
import { StateManager } from './StateManager.js';

/**
 * Engine - Main game engine with fixed timestep game loop
 * Handles initialization, game loop, and shutdown
 */
export class Engine {
  constructor(config = {}) {
    this.config = {
      targetFPS: 60,
      maxFrameTime: 0.25, // Maximum frame time to prevent spiral of death
      ...config
    };

    this.world = new World();
    this.stateManager = new StateManager();

    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1 / this.config.targetFPS;

    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;

    // Bind update loop to maintain context
    this._boundUpdate = this._update.bind(this);
  }

  /**
   * Initialize the engine
   * @param {Function} initCallback - Optional callback for initialization
   */
  init(initCallback) {
    console.log('Engine initializing...');

    if (initCallback) {
      initCallback(this);
    }

    console.log('Engine initialized');
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) {
      console.warn('Engine is already running');
      return;
    }

    console.log('Engine starting...');
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;

    requestAnimationFrame(this._boundUpdate);
  }

  /**
   * Stop the game loop
   */
  stop() {
    console.log('Engine stopping...');
    this.running = false;
  }

  /**
   * Main game loop with fixed timestep
   * @private
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  _update(timestamp) {
    if (!this.running) return;

    const currentTime = timestamp / 1000; // Convert to seconds
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death
    if (deltaTime > this.config.maxFrameTime) {
      deltaTime = this.config.maxFrameTime;
    }

    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedTimeStep) {
      this._fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Variable timestep render
    this._render(deltaTime);

    // Update FPS counter
    this._updateFPS(currentTime);

    // Continue loop
    requestAnimationFrame(this._boundUpdate);
  }

  /**
   * Fixed timestep update for physics and game logic
   * @private
   * @param {number} deltaTime - Fixed time step
   */
  _fixedUpdate(deltaTime) {
    // Update state manager
    this.stateManager.update(deltaTime);

    // Update world (ECS systems)
    this.world.update(deltaTime);
  }

  /**
   * Variable timestep render
   * @private
   * @param {number} deltaTime - Time since last frame
   */
  _render(deltaTime) {
    // Rendering will be handled by rendering systems in the ECS
    // This is just a placeholder for potential frame-rate independent rendering
  }

  /**
   * Update FPS counter
   * @private
   * @param {number} currentTime - Current time in seconds
   */
  _updateFPS(currentTime) {
    this.frameCount++;

    if (currentTime - this.fpsUpdateTime >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * Get current FPS
   * @returns {number} Current frames per second
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Shutdown the engine
   */
  shutdown() {
    console.log('Engine shutting down...');
    this.stop();

    this.stateManager.destroy();
    this.world.destroy();

    console.log('Engine shutdown complete');
  }

  /**
   * Get the world instance
   * @returns {World} The game world
   */
  getWorld() {
    return this.world;
  }

  /**
   * Get the state manager instance
   * @returns {StateManager} The state manager
   */
  getStateManager() {
    return this.stateManager;
  }
}
