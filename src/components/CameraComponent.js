import { Component } from '../core/Component.js';
import * as THREE from 'three';

/**
 * CameraComponent - Camera configuration for an entity
 * Used by CameraSystem to create and manage Three.js cameras
 */
export class CameraComponent extends Component {
  constructor(config = {}) {
    super();

    // Camera type: 'perspective' or 'orthographic'
    this.type = config.type || 'perspective';

    // Perspective camera settings
    this.fov = config.fov || 75; // Field of view in degrees
    this.aspect = config.aspect || window.innerWidth / window.innerHeight;
    this.near = config.near || 0.1; // Near clipping plane
    this.far = config.far || 1000; // Far clipping plane

    // Third-person camera settings
    this.followDistance = config.followDistance || 10; // Distance behind target
    this.followHeight = config.followHeight || 5; // Height above target
    this.lookAheadDistance = config.lookAheadDistance || 2; // Look ahead of target

    // Camera smoothing (0 = instant, 1 = no movement)
    this.positionSmoothing = config.positionSmoothing || 0.1;
    this.rotationSmoothing = config.rotationSmoothing || 0.15;

    // Reference to Three.js camera (set by CameraSystem)
    this.camera = null;

    // Target entity to follow (set by gameplay code)
    this.target = null;

    // Whether this is the active camera
    this.isActive = config.isActive !== undefined ? config.isActive : true;
  }

  /**
   * Set the target entity to follow
   * @param {Entity} entity - Entity to follow
   */
  setTarget(entity) {
    this.target = entity;
  }

  /**
   * Create a Three.js camera based on configuration
   * @returns {THREE.Camera} Three.js camera
   */
  createCamera() {
    if (this.type === 'perspective') {
      this.camera = new THREE.PerspectiveCamera(
        this.fov,
        this.aspect,
        this.near,
        this.far
      );
    } else {
      // Orthographic camera not implemented yet
      console.warn('Orthographic camera not implemented, using perspective');
      this.camera = new THREE.PerspectiveCamera(
        this.fov,
        this.aspect,
        this.near,
        this.far
      );
    }

    return this.camera;
  }

  /**
   * Update aspect ratio (e.g., on window resize)
   * @param {number} aspect - New aspect ratio
   */
  updateAspect(aspect) {
    this.aspect = aspect;
    if (this.camera && this.camera.isPerspectiveCamera) {
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    }
  }
}
