/**
 * StateManager - Manages game state transitions
 * Handles different game states (menu, playing, paused, game over, etc.)
 */
export class StateManager {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
  }

  /**
   * Register a new state
   * @param {string} name - State name
   * @param {Object} state - State object with enter, update, exit methods
   * @returns {StateManager} This state manager for chaining
   */
  addState(name, state) {
    if (!state.enter || !state.update || !state.exit) {
      throw new Error(`State ${name} must have enter, update, and exit methods`);
    }
    this.states.set(name, state);
    return this;
  }

  /**
   * Transition to a new state
   * @param {string} stateName - Name of the state to transition to
   * @param {Object} data - Optional data to pass to the new state
   */
  setState(stateName, data = {}) {
    const newState = this.states.get(stateName);
    if (!newState) {
      throw new Error(`State ${stateName} not found`);
    }

    // Exit current state
    if (this.currentState) {
      const currentStateName = this._getStateName(this.currentState);
      this.currentState.exit();
      this.previousState = currentStateName;
    }

    // Enter new state
    this.currentState = newState;
    this.currentState.enter(data);
  }

  /**
   * Update the current state
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    if (this.currentState) {
      this.currentState.update(deltaTime);
    }
  }

  /**
   * Get the name of the current state
   * @returns {string|null} Current state name or null
   */
  getCurrentStateName() {
    return this._getStateName(this.currentState);
  }

  /**
   * Get the name of the previous state
   * @returns {string|null} Previous state name or null
   */
  getPreviousStateName() {
    return this.previousState;
  }

  /**
   * Helper to get state name from state object
   * @private
   * @param {Object} state - State object
   * @returns {string|null} State name or null
   */
  _getStateName(state) {
    if (!state) return null;
    for (const [name, s] of this.states.entries()) {
      if (s === state) return name;
    }
    return null;
  }

  /**
   * Check if a specific state is currently active
   * @param {string} stateName - State name to check
   * @returns {boolean} True if the state is active
   */
  isState(stateName) {
    return this.getCurrentStateName() === stateName;
  }

  /**
   * Clean up all states
   */
  destroy() {
    if (this.currentState) {
      this.currentState.exit();
    }
    this.states.clear();
    this.currentState = null;
    this.previousState = null;
  }
}
