import { Component } from '../core/Component.js';
import * as THREE from 'three';

/**
 * Transform component - Holds position, rotation, and scale
 * Used for syncing with physics and rendering
 */
export class Transform extends Component {
  constructor(position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3(1, 1, 1)) {
    super();

    this.position = position.clone();
    this.rotation = rotation.clone();
    this.scale = scale.clone();

    // Previous frame values for interpolation
    this.prevPosition = position.clone();
    this.prevRotation = rotation.clone();
  }

  /**
   * Set position from Vector3 or x, y, z
   * @param {THREE.Vector3|number} x - Vector3 or x coordinate
   * @param {number} [y] - y coordinate
   * @param {number} [z] - z coordinate
   */
  setPosition(x, y, z) {
    if (x instanceof THREE.Vector3) {
      this.position.copy(x);
    } else {
      this.position.set(x, y, z);
    }
  }

  /**
   * Set rotation from Quaternion or Euler angles
   * @param {THREE.Quaternion|THREE.Euler|number} x - Quaternion, Euler, or x angle
   * @param {number} [y] - y angle
   * @param {number} [z] - z angle
   */
  setRotation(x, y, z) {
    if (x instanceof THREE.Quaternion) {
      this.rotation.copy(x);
    } else if (x instanceof THREE.Euler) {
      this.rotation.setFromEuler(x);
    } else {
      const euler = new THREE.Euler(x, y, z);
      this.rotation.setFromEuler(euler);
    }
  }

  /**
   * Set scale from Vector3 or uniform scale or x, y, z
   * @param {THREE.Vector3|number} x - Vector3, uniform scale, or x scale
   * @param {number} [y] - y scale
   * @param {number} [z] - z scale
   */
  setScale(x, y, z) {
    if (x instanceof THREE.Vector3) {
      this.scale.copy(x);
    } else if (y === undefined && z === undefined) {
      this.scale.set(x, x, x);
    } else {
      this.scale.set(x, y, z);
    }
  }

  /**
   * Store current transform as previous frame
   */
  storePrevious() {
    this.prevPosition.copy(this.position);
    this.prevRotation.copy(this.rotation);
  }

  /**
   * Get interpolated position between previous and current
   * @param {number} alpha - Interpolation factor (0-1)
   * @returns {THREE.Vector3} Interpolated position
   */
  getInterpolatedPosition(alpha) {
    return new THREE.Vector3().lerpVectors(this.prevPosition, this.position, alpha);
  }

  /**
   * Get interpolated rotation between previous and current
   * @param {number} alpha - Interpolation factor (0-1)
   * @returns {THREE.Quaternion} Interpolated rotation
   */
  getInterpolatedRotation(alpha) {
    return new THREE.Quaternion().slerpQuaternions(this.prevRotation, this.rotation, alpha);
  }
}
