import { Component } from '../core/Component.js';
import * as CANNON from 'cannon-es';

/**
 * RigidBody component - Physics properties for Cannon.js integration
 * Holds reference to Cannon.js body and physics parameters
 */
export class RigidBody extends Component {
  /**
   * @param {Object} options - RigidBody configuration
   * @param {number} options.mass - Mass in kg (0 = static body)
   * @param {CANNON.Shape} options.shape - Collision shape
   * @param {string} options.type - Body type: 'dynamic', 'static', 'kinematic'
   * @param {number} options.linearDamping - Linear velocity damping (0-1)
   * @param {number} options.angularDamping - Angular velocity damping (0-1)
   * @param {boolean} options.fixedRotation - Prevent rotation
   * @param {CANNON.Material} options.material - Physics material
   */
  constructor(options = {}) {
    super();

    this.mass = options.mass !== undefined ? options.mass : 1;
    this.shape = options.shape || new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    this.type = options.type || 'dynamic';
    this.linearDamping = options.linearDamping !== undefined ? options.linearDamping : 0.01;
    this.angularDamping = options.angularDamping !== undefined ? options.angularDamping : 0.01;
    this.fixedRotation = options.fixedRotation || false;
    this.material = options.material || null;

    // Collision filtering
    this.collisionFilterGroup = options.collisionFilterGroup || 1;
    this.collisionFilterMask = options.collisionFilterMask || -1;

    // Reference to the Cannon.js body (set by PhysicsSystem)
    this.body = null;

    // Collision callbacks
    this.onCollisionStart = null;
    this.onCollisionEnd = null;
  }

  /**
   * Create the Cannon.js body from this component's properties
   * @param {CANNON.Vec3} position - Initial position
   * @param {CANNON.Quaternion} quaternion - Initial rotation
   * @returns {CANNON.Body} The created Cannon.js body
   */
  createBody(position, quaternion) {
    const bodyOptions = {
      mass: this.mass,
      shape: this.shape,
      position: position,
      quaternion: quaternion,
      linearDamping: this.linearDamping,
      angularDamping: this.angularDamping,
      fixedRotation: this.fixedRotation,
      collisionFilterGroup: this.collisionFilterGroup,
      collisionFilterMask: this.collisionFilterMask
    };

    if (this.material) {
      bodyOptions.material = this.material;
    }

    this.body = new CANNON.Body(bodyOptions);

    // Set body type
    if (this.type === 'static') {
      this.body.type = CANNON.Body.STATIC;
    } else if (this.type === 'kinematic') {
      this.body.type = CANNON.Body.KINEMATIC;
    } else {
      this.body.type = CANNON.Body.DYNAMIC;
    }

    return this.body;
  }

  /**
   * Apply force to the body
   * @param {CANNON.Vec3} force - Force vector
   * @param {CANNON.Vec3} [worldPoint] - Point of application in world coords
   */
  applyForce(force, worldPoint) {
    if (this.body) {
      this.body.applyForce(force, worldPoint);
    }
  }

  /**
   * Apply impulse to the body
   * @param {CANNON.Vec3} impulse - Impulse vector
   * @param {CANNON.Vec3} [worldPoint] - Point of application in world coords
   */
  applyImpulse(impulse, worldPoint) {
    if (this.body) {
      this.body.applyImpulse(impulse, worldPoint);
    }
  }

  /**
   * Set linear velocity
   * @param {number} x - X velocity
   * @param {number} y - Y velocity
   * @param {number} z - Z velocity
   */
  setVelocity(x, y, z) {
    if (this.body) {
      this.body.velocity.set(x, y, z);
    }
  }

  /**
   * Set angular velocity
   * @param {number} x - X angular velocity
   * @param {number} y - Y angular velocity
   * @param {number} z - Z angular velocity
   */
  setAngularVelocity(x, y, z) {
    if (this.body) {
      this.body.angularVelocity.set(x, y, z);
    }
  }

  /**
   * Get linear velocity
   * @returns {CANNON.Vec3|null} Current velocity or null if no body
   */
  getVelocity() {
    return this.body ? this.body.velocity : null;
  }

  /**
   * Get angular velocity
   * @returns {CANNON.Vec3|null} Current angular velocity or null if no body
   */
  getAngularVelocity() {
    return this.body ? this.body.angularVelocity : null;
  }
}
