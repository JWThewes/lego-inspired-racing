import { System } from '../core/System.js';
import * as THREE from 'three';

/**
 * CameraSystem - Third-person camera that follows the player
 * Responsibilities:
 * - Create and manage cameras for entities with CameraComponent
 * - Follow target entity smoothly
 * - Maintain consistent camera distance and angle
 * - Handle camera rotation
 */
export class CameraSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['CameraComponent', 'TransformComponent'];
    this.priority = 900; // Update before rendering

    this.cameras = new Map(); // Map entity ID to camera data
    this.activeCamera = null;
    this.activeCameraEntity = null;

    // Smoothed camera position and look-at target
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
  }

  /**
   * Initialize the camera system
   * @param {World} world - The game world
   */
  init(world) {
    this.world = world;
    console.log('CameraSystem initialized');
  }

  /**
   * Update the camera system
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities with CameraComponent and TransformComponent
   */
  update(deltaTime, entities) {
    // Process all camera entities
    for (const entity of entities) {
      const cameraComp = entity.getComponent('CameraComponent');
      const transform = entity.getComponent('TransformComponent');

      // Create camera if it doesn't exist
      if (!cameraComp.camera) {
        cameraComp.createCamera();
        this.cameras.set(entity.id, {
          entity,
          camera: cameraComp.camera,
          component: cameraComp
        });
        console.log(`Camera created for entity ${entity.id}`);
      }

      // Set active camera if this is marked active
      if (cameraComp.isActive && this.activeCamera !== cameraComp.camera) {
        this.setActiveCamera(entity);
      }

      // Update camera following target
      if (cameraComp.isActive && cameraComp.target) {
        this._updateFollowCamera(deltaTime, cameraComp, transform);
      } else if (!cameraComp.target) {
        // No target, just use transform position
        cameraComp.camera.position.copy(transform.position);
      }
    }
  }

  /**
   * Update camera to follow target entity
   * @private
   * @param {number} deltaTime - Time since last update
   * @param {CameraComponent} cameraComp - Camera component
   * @param {TransformComponent} cameraTransform - Camera's transform
   */
  _updateFollowCamera(deltaTime, cameraComp, cameraTransform) {
    const target = cameraComp.target;
    const targetTransform = target.getComponent('TransformComponent');

    if (!targetTransform) {
      console.warn('Camera target has no TransformComponent');
      return;
    }

    // Calculate ideal camera position behind and above target
    const targetPosition = targetTransform.position;
    const targetRotation = targetTransform.rotation;

    // Create offset vector (behind and above target)
    const offset = new THREE.Vector3(
      0,
      cameraComp.followHeight,
      cameraComp.followDistance
    );

    // Rotate offset by target's rotation (so camera follows behind target)
    offset.applyEuler(targetRotation);

    // Calculate ideal camera position
    const idealPosition = new THREE.Vector3()
      .copy(targetPosition)
      .add(offset);

    // Smoothly interpolate to ideal position
    const smoothing = 1 - Math.pow(cameraComp.positionSmoothing, deltaTime * 60);
    this.currentPosition.lerp(idealPosition, smoothing);

    // Calculate look-at point (ahead of target)
    const lookAhead = new THREE.Vector3(0, 0, -cameraComp.lookAheadDistance);
    lookAhead.applyEuler(targetRotation);

    const idealLookAt = new THREE.Vector3()
      .copy(targetPosition)
      .add(lookAhead);

    // Smoothly interpolate look-at target
    const lookSmoothing = 1 - Math.pow(cameraComp.rotationSmoothing, deltaTime * 60);
    this.currentLookAt.lerp(idealLookAt, lookSmoothing);

    // Apply to camera
    cameraComp.camera.position.copy(this.currentPosition);
    cameraComp.camera.lookAt(this.currentLookAt);

    // Update camera transform component to match
    cameraTransform.position.copy(this.currentPosition);
  }

  /**
   * Set the active camera
   * @param {Entity} entity - Entity with camera to make active
   */
  setActiveCamera(entity) {
    const cameraComp = entity.getComponent('CameraComponent');

    if (!cameraComp || !cameraComp.camera) {
      console.warn('Entity does not have a valid camera');
      return;
    }

    // Deactivate previous camera
    if (this.activeCameraEntity) {
      const prevCameraComp = this.activeCameraEntity.getComponent('CameraComponent');
      if (prevCameraComp) {
        prevCameraComp.isActive = false;
      }
    }

    // Activate new camera
    this.activeCamera = cameraComp.camera;
    this.activeCameraEntity = entity;
    cameraComp.isActive = true;

    // Initialize smoothed position to current camera position
    this.currentPosition.copy(cameraComp.camera.position);

    // Notify render system of active camera
    const renderSystem = this._getRenderSystem();
    if (renderSystem) {
      renderSystem.setActiveCamera(this.activeCamera);
    }

    console.log(`Active camera set to entity ${entity.id}`);
  }

  /**
   * Get the active camera
   * @returns {THREE.Camera|null} Active Three.js camera
   */
  getActiveCamera() {
    return this.activeCamera;
  }

  /**
   * Get the render system from world
   * @private
   * @returns {RenderSystem|null} Render system
   */
  _getRenderSystem() {
    if (!this.world) return null;

    for (const system of this.world.systems) {
      if (system.constructor.name === 'RenderSystem') {
        return system;
      }
    }

    return null;
  }

  /**
   * Clean up camera system resources
   */
  destroy() {
    this.cameras.clear();
    this.activeCamera = null;
    this.activeCameraEntity = null;

    console.log('CameraSystem destroyed');
  }
}
