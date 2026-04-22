import * as THREE from 'three';
import { TrackPlaceholders } from './TrackPlaceholders.js';

/**
 * Track class - Represents a racing track with mesh, collision, waypoints, and spawn positions
 * Handles track loading and entity creation
 */
export class Track {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.theme = config.theme;
    this.description = config.description;
    this.previewImage = config.previewImage;

    // 3D mesh and collision
    this.mesh = null;
    this.collisionMesh = null;
    this.physicsBody = null;

    // Track data
    this.waypoints = config.waypoints || [];
    this.spawnPositions = config.spawnPositions || [];
    this.bounds = config.bounds || { min: new THREE.Vector3(-100, -10, -100), max: new THREE.Vector3(100, 50, 100) };

    // Asset paths
    this.modelPath = config.modelPath;
    this.collisionModelPath = config.collisionModelPath;

    // State
    this.loaded = false;
    this.entities = [];
  }

  /**
   * Load track model from asset manager
   * @param {AssetManager} assetManager - Asset manager instance
   * @returns {Promise<void>}
   */
  async load(assetManager) {
    if (this.loaded) {
      console.warn(`Track ${this.id} is already loaded`);
      return;
    }

    try {
      // Try to load track model from asset manager
      const trackModel = assetManager.getAsset(this.id);

      if (trackModel && trackModel.scene) {
        // Clone the GLTF scene for this track instance
        this.mesh = trackModel.scene.clone();
        this.mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        console.log(`Track ${this.name} loaded from GLTF model`);
      } else {
        // Fallback to placeholder geometry if model not found
        console.warn(`Track model ${this.id} not found, using placeholder geometry`);
        this.mesh = TrackPlaceholders.createPlaceholderTrack(this.id, this.theme);
      }

      // Create collision mesh (simplified version for physics)
      this.collisionMesh = this._createCollisionMesh();

      this.loaded = true;
      console.log(`Track ${this.name} loaded successfully`);

    } catch (error) {
      console.error(`Failed to load track ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Create collision mesh from track geometry
   * @private
   * @returns {THREE.Mesh}
   */
  _createCollisionMesh() {
    // Create a simplified collision mesh based on track bounds
    // In a real implementation, this would use the actual track geometry
    const geometry = new THREE.BoxGeometry(
      this.bounds.max.x - this.bounds.min.x,
      2, // Ground thickness
      this.bounds.max.z - this.bounds.min.z
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      visible: false
    });

    const collisionMesh = new THREE.Mesh(geometry, material);
    collisionMesh.position.y = -1; // Position below track surface

    return collisionMesh;
  }

  /**
   * Create physics body for track collision (Cannon.js)
   * @param {World} physicsWorld - Cannon.js world instance
   * @returns {Body}
   */
  createPhysicsBody(physicsWorld) {
    // Note: This requires cannon-es to be installed
    // For now, return null and let physics system handle this
    // Real implementation would create a Trimesh or compound shape from collision mesh

    console.warn('Track physics body creation requires Cannon.js integration');
    return null;
  }

  /**
   * Get spawn position for a vehicle
   * @param {number} index - Position index (0 = player, 1+ = AI opponents)
   * @returns {Object} Position and rotation {position: Vector3, rotation: Euler}
   */
  getSpawnPosition(index) {
    if (index >= this.spawnPositions.length) {
      console.warn(`Spawn position ${index} not found, using default`);
      return {
        position: new THREE.Vector3(0, 1, 0),
        rotation: new THREE.Euler(0, 0, 0)
      };
    }

    const spawn = this.spawnPositions[index];
    return {
      position: new THREE.Vector3(spawn.position.x, spawn.position.y, spawn.position.z),
      rotation: new THREE.Euler(spawn.rotation.x, spawn.rotation.y, spawn.rotation.z)
    };
  }

  /**
   * Get waypoint at index
   * @param {number} index - Waypoint index
   * @returns {THREE.Vector3}
   */
  getWaypoint(index) {
    if (index >= this.waypoints.length) {
      return null;
    }

    const wp = this.waypoints[index];
    return new THREE.Vector3(wp.x, wp.y, wp.z);
  }

  /**
   * Get next waypoint after given index (wraps around)
   * @param {number} currentIndex - Current waypoint index
   * @returns {Object} {waypoint: Vector3, index: number}
   */
  getNextWaypoint(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.waypoints.length;
    return {
      waypoint: this.getWaypoint(nextIndex),
      index: nextIndex
    };
  }

  /**
   * Get closest waypoint to a position
   * @param {THREE.Vector3} position - Position to check from
   * @returns {Object} {waypoint: Vector3, index: number, distance: number}
   */
  getClosestWaypoint(position) {
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < this.waypoints.length; i++) {
      const wp = this.getWaypoint(i);
      const distance = position.distanceTo(wp);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return {
      waypoint: this.getWaypoint(closestIndex),
      index: closestIndex,
      distance: closestDistance
    };
  }

  /**
   * Add track mesh to scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  addToScene(scene) {
    if (!this.loaded) {
      console.warn('Track not loaded, cannot add to scene');
      return;
    }

    scene.add(this.mesh);

    // Optionally add collision mesh for debugging
    // scene.add(this.collisionMesh);
  }

  /**
   * Remove track mesh from scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  removeFromScene(scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
    }
    if (this.collisionMesh) {
      scene.remove(this.collisionMesh);
    }
  }

  /**
   * Check if position is within track bounds
   * @param {THREE.Vector3} position - Position to check
   * @returns {boolean}
   */
  isInBounds(position) {
    return (
      position.x >= this.bounds.min.x && position.x <= this.bounds.max.x &&
      position.y >= this.bounds.min.y && position.y <= this.bounds.max.y &&
      position.z >= this.bounds.min.z && position.z <= this.bounds.max.z
    );
  }

  /**
   * Unload track and clean up resources
   */
  unload() {
    if (this.mesh) {
      this.mesh.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.mesh = null;
    }

    if (this.collisionMesh) {
      this.collisionMesh.geometry.dispose();
      this.collisionMesh.material.dispose();
      this.collisionMesh = null;
    }

    this.physicsBody = null;
    this.entities = [];
    this.loaded = false;

    console.log(`Track ${this.name} unloaded`);
  }

  /**
   * Get track info for UI display
   * @returns {Object}
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      theme: this.theme,
      description: this.description,
      previewImage: this.previewImage,
      waypointCount: this.waypoints.length,
      spawnCount: this.spawnPositions.length
    };
  }
}
