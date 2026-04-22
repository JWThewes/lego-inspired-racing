import { Component } from '../core/Component.js';

/**
 * Vehicle component - stores vehicle specifications and state
 * Pure data container for vehicle properties
 */
export class VehicleComponent extends Component {
  constructor(specs = {}) {
    super();

    // Vehicle specifications (from preset)
    this.acceleration = specs.acceleration || 15.0; // units/s²
    this.maxSpeed = specs.maxSpeed || 40.0; // units/s
    this.turnSpeed = specs.turnSpeed || 2.5; // radians/s
    this.brakeForce = specs.brakeForce || 25.0; // deceleration units/s²
    this.drag = specs.drag || 0.95; // friction coefficient (0-1)

    // Current vehicle state
    this.velocity = { x: 0, y: 0, z: 0 }; // Current velocity vector
    this.speed = 0; // Current speed magnitude
    this.rotation = 0; // Current rotation in radians
    this.position = { x: 0, y: 0, z: 0 }; // Current position

    // Input state (will be set by InputSystem)
    this.throttle = 0; // -1 (brake/reverse) to 1 (accelerate)
    this.steering = 0; // -1 (left) to 1 (right)

    // Vehicle type identifier
    this.vehicleType = specs.vehicleType || 'default';
  }
}
