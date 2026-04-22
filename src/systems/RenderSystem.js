import { System } from '../core/System.js';
import * as THREE from 'three';

/**
 * RenderSystem - Manages Three.js rendering
 * Responsibilities:
 * - Initialize Three.js scene, renderer, and lighting
 * - Sync entity transforms with Three.js meshes
 * - Render the scene every frame
 * - Optimize for 60 FPS on low-end devices
 */
export class RenderSystem extends System {
  constructor(canvasElement) {
    super();
    this.requiredComponents = ['TransformComponent', 'MeshComponent'];
    this.priority = 1000; // Render last, after all logic updates

    this.canvasElement = canvasElement;
    this.scene = null;
    this.renderer = null;
    this.activeCamera = null;

    // Performance tracking
    this.frameCount = 0;
    this.lastFPSUpdate = 0;
    this.currentFPS = 60;
  }

  /**
   * Initialize the render system
   * @param {World} world - The game world
   */
  init(world) {
    this.world = world;

    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasElement,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    this.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', this._handleResize.bind(this));

    console.log('RenderSystem initialized');
  }

  /**
   * Update the render system
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities with TransformComponent and MeshComponent
   */
  update(deltaTime, entities) {
    // Sync entity transforms with Three.js meshes
    for (const entity of entities) {
      const transform = entity.getComponent('TransformComponent');
      const meshComp = entity.getComponent('MeshComponent');

      if (meshComp.mesh && meshComp.visible) {
        // Update mesh position, rotation, scale from transform
        meshComp.mesh.position.copy(transform.position);
        meshComp.mesh.rotation.copy(transform.rotation);
        meshComp.mesh.scale.copy(transform.scale);

        // Add to scene if not already added
        if (!meshComp.mesh.parent) {
          this.scene.add(meshComp.mesh);
        }
      } else if (meshComp.mesh && !meshComp.visible) {
        // Remove from scene if invisible
        if (meshComp.mesh.parent) {
          this.scene.remove(meshComp.mesh);
        }
      }
    }

    // Render the scene with active camera
    if (this.activeCamera) {
      this.renderer.render(this.scene, this.activeCamera);
    }

    // Track FPS
    this._updateFPS(deltaTime);
  }

  /**
   * Set the active camera
   * @param {THREE.Camera} camera - Three.js camera to use for rendering
   */
  setActiveCamera(camera) {
    this.activeCamera = camera;
  }

  /**
   * Get the Three.js scene
   * @returns {THREE.Scene} The scene
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the Three.js renderer
   * @returns {THREE.WebGLRenderer} The renderer
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Get current FPS
   * @returns {number} Frames per second
   */
  getFPS() {
    return this.currentFPS;
  }

  /**
   * Handle window resize
   * @private
   */
  _handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);

    // Update camera aspect ratio if it exists
    if (this.activeCamera && this.activeCamera.isPerspectiveCamera) {
      this.activeCamera.aspect = width / height;
      this.activeCamera.updateProjectionMatrix();
    }
  }

  /**
   * Update FPS counter
   * @private
   * @param {number} deltaTime - Time since last frame
   */
  _updateFPS(deltaTime) {
    this.frameCount++;
    this.lastFPSUpdate += deltaTime;

    if (this.lastFPSUpdate >= 1.0) {
      this.currentFPS = Math.round(this.frameCount / this.lastFPSUpdate);
      this.frameCount = 0;
      this.lastFPSUpdate = 0;
    }
  }

  /**
   * Clean up render system resources
   */
  destroy() {
    window.removeEventListener('resize', this._handleResize.bind(this));

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.scene) {
      this.scene.clear();
    }

    console.log('RenderSystem destroyed');
  }
}
