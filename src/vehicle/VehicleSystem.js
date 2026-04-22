import { System } from '../core/System.js';

/**
 * VehicleSystem - applies arcade-style vehicle physics
 * Handles acceleration, steering, speed limits, and drag
 */
export class VehicleSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['VehicleComponent'];
    this.priority = 10; // Run after input system
  }

  /**
   * Update vehicle physics
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities with VehicleComponent
   */
  update(deltaTime, entities) {
    for (const entity of entities) {
      const vehicle = entity.getComponent('VehicleComponent');

      // Apply arcade-style physics
      this._applyThrottle(vehicle, deltaTime);
      this._applySteering(vehicle, deltaTime);
      this._applyDrag(vehicle, deltaTime);
      this._updatePosition(vehicle, deltaTime);
      this._clampSpeed(vehicle);
    }
  }

  /**
   * Apply throttle/brake input to vehicle velocity
   * @private
   */
  _applyThrottle(vehicle, deltaTime) {
    if (vehicle.throttle !== 0) {
      // Calculate acceleration direction based on current rotation
      const accelMagnitude = vehicle.throttle > 0
        ? vehicle.acceleration
        : vehicle.brakeForce;

      const accelAmount = vehicle.throttle * accelMagnitude * deltaTime;

      // Apply acceleration in the direction the vehicle is facing
      vehicle.velocity.x += Math.sin(vehicle.rotation) * accelAmount;
      vehicle.velocity.z += Math.cos(vehicle.rotation) * accelAmount;
    }
  }

  /**
   * Apply steering input to vehicle rotation
   * Arcade-style: turn rate based on speed (slower = sharper turns)
   * @private
   */
  _applySteering(vehicle, deltaTime) {
    if (vehicle.steering !== 0 && vehicle.speed > 0.1) {
      // Speed-based turn rate: slower = tighter turns (arcade feel)
      const speedFactor = Math.min(vehicle.speed / vehicle.maxSpeed, 1.0);
      const turnRate = vehicle.turnSpeed * (0.3 + 0.7 * speedFactor);

      vehicle.rotation += vehicle.steering * turnRate * deltaTime;

      // Normalize rotation to 0-2π range
      vehicle.rotation = vehicle.rotation % (Math.PI * 2);
      if (vehicle.rotation < 0) {
        vehicle.rotation += Math.PI * 2;
      }
    }
  }

  /**
   * Apply drag/friction to vehicle velocity
   * Creates natural deceleration when not accelerating
   * @private
   */
  _applyDrag(vehicle, deltaTime) {
    // Apply drag coefficient (arcade-style friction)
    const dragFactor = Math.pow(vehicle.drag, deltaTime * 60); // Frame-rate independent
    vehicle.velocity.x *= dragFactor;
    vehicle.velocity.z *= dragFactor;

    // Stop completely when very slow (prevent infinite deceleration)
    if (Math.abs(vehicle.velocity.x) < 0.01) vehicle.velocity.x = 0;
    if (Math.abs(vehicle.velocity.z) < 0.01) vehicle.velocity.z = 0;
  }

  /**
   * Update vehicle position based on velocity
   * @private
   */
  _updatePosition(vehicle, deltaTime) {
    vehicle.position.x += vehicle.velocity.x * deltaTime;
    vehicle.position.z += vehicle.velocity.z * deltaTime;

    // Calculate current speed magnitude
    vehicle.speed = Math.sqrt(
      vehicle.velocity.x * vehicle.velocity.x +
      vehicle.velocity.z * vehicle.velocity.z
    );
  }

  /**
   * Clamp vehicle speed to max speed limit
   * @private
   */
  _clampSpeed(vehicle) {
    if (vehicle.speed > vehicle.maxSpeed) {
      const scale = vehicle.maxSpeed / vehicle.speed;
      vehicle.velocity.x *= scale;
      vehicle.velocity.z *= scale;
      vehicle.speed = vehicle.maxSpeed;
    }
  }
}
