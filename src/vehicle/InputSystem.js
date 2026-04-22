import { System } from '../core/System.js';

/**
 * InputSystem - captures and processes keyboard input for vehicles
 * Supports both arrow keys and WASD controls
 */
export class InputSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['VehicleComponent'];
    this.priority = 5; // Run before vehicle physics

    // Track currently pressed keys
    this.keys = {
      // Throttle/Brake
      ArrowUp: false,
      KeyW: false,
      ArrowDown: false,
      KeyS: false,
      // Steering
      ArrowLeft: false,
      KeyA: false,
      ArrowRight: false,
      KeyD: false
    };

    // Bind event handlers
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  /**
   * Initialize the input system
   * @param {World} world - The game world
   */
  init(world) {
    // Attach keyboard event listeners
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * Update vehicle input state based on keyboard
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities with VehicleComponent
   */
  update(deltaTime, entities) {
    // Calculate input values
    const throttle = this._getThrottleInput();
    const steering = this._getSteeringInput();

    // Apply input to all vehicle entities
    for (const entity of entities) {
      const vehicle = entity.getComponent('VehicleComponent');
      vehicle.throttle = throttle;
      vehicle.steering = steering;
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  /**
   * Handle key down events
   * @private
   */
  _onKeyDown(event) {
    const code = event.code;
    if (code in this.keys) {
      this.keys[code] = true;
      // Prevent default browser behavior for game controls
      event.preventDefault();
    }
  }

  /**
   * Handle key up events
   * @private
   */
  _onKeyUp(event) {
    const code = event.code;
    if (code in this.keys) {
      this.keys[code] = false;
      event.preventDefault();
    }
  }

  /**
   * Calculate throttle input from keyboard state
   * Returns -1 (brake/reverse), 0 (neutral), or 1 (accelerate)
   * @private
   */
  _getThrottleInput() {
    const accelerate = this.keys.ArrowUp || this.keys.KeyW;
    const brake = this.keys.ArrowDown || this.keys.KeyS;

    if (accelerate && !brake) return 1;
    if (brake && !accelerate) return -1;
    return 0;
  }

  /**
   * Calculate steering input from keyboard state
   * Returns -1 (left), 0 (neutral), or 1 (right)
   * @private
   */
  _getSteeringInput() {
    const left = this.keys.ArrowLeft || this.keys.KeyA;
    const right = this.keys.ArrowRight || this.keys.KeyD;

    if (left && !right) return -1;
    if (right && !left) return 1;
    return 0;
  }
}
