import { Component } from '../core/Component.js';
import * as THREE from 'three';

/**
 * TransformComponent - Stores position, rotation, and scale for an entity
 * Used by rendering and physics systems to position objects in 3D space
 */
export class TransformComponent extends Component {
  constructor(position = new THREE.Vector3(), rotation = new THREE.Euler(), scale = new THREE.Vector3(1, 1, 1)) {
    super();

    // Position in 3D space
    this.position = position.clone();

    // Rotation as Euler angles (radians)
    this.rotation = rotation.clone();

    // Scale factors for each axis
    this.scale = scale.clone();
  }

  /**
   * Set position from x, y, z values
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }

  /**
   * Set rotation from x, y, z values (in radians)
   * @param {number} x - X rotation (pitch)
   * @param {number} y - Y rotation (yaw)
   * @param {number} z - Z rotation (roll)
   */
  setRotation(x, y, z) {
    this.rotation.set(x, y, z);
  }

  /**
   * Set scale from x, y, z values
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   */
  setScale(x, y, z) {
    this.scale.set(x, y, z);
  }

  /**
   * Clone this transform
   * @returns {TransformComponent} Cloned transform
   */
  clone() {
    return new TransformComponent(this.position, this.rotation, this.scale);
  }
}
