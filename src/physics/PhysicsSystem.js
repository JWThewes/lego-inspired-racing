import { System } from '../core/System.js';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

/**
 * PhysicsSystem - Manages Cannon.js physics world and syncs with entities
 * Updates physics simulation and syncs transforms between Cannon.js and Three.js
 */
export class PhysicsSystem extends System {
  /**
   * @param {Object} config - Physics configuration
   * @param {CANNON.Vec3} config.gravity - Gravity vector (default: 0, -9.82, 0)
   * @param {number} config.fixedTimeStep - Fixed timestep for physics (default: 1/60)
   * @param {number} config.maxSubSteps - Max substeps per frame (default: 3)
   * @param {boolean} config.allowSleep - Allow bodies to sleep (default: true)
   * @param {number} config.defaultContactMaterial - Default contact material settings
   */
  constructor(config = {}) {
    super();

    this.requiredComponents = ['Transform', 'RigidBody'];
    this.priority = 10; // Physics runs before other systems

    // Physics configuration
    this.gravity = config.gravity || new CANNON.Vec3(0, -9.82, 0);
    this.fixedTimeStep = config.fixedTimeStep || 1 / 60;
    this.maxSubSteps = config.maxSubSteps || 3;
    this.allowSleep = config.allowSleep !== undefined ? config.allowSleep : true;

    // Cannon.js world
    this.world = null;

    // Default contact material for arcade-style gameplay
    this.defaultContactMaterial = config.defaultContactMaterial || {
      friction: 0.3,
      restitution: 0.3
    };

    // Map entities to bodies for quick lookup
    this.entityBodyMap = new Map();
    this.bodyEntityMap = new Map();
  }

  /**
   * Initialize the physics world
   * @param {World} world - Game world
   */
  init(world) {
    // Create Cannon.js world
    this.world = new CANNON.World({
      gravity: this.gravity
    });

    this.world.allowSleep = this.allowSleep;

    // Set up default contact material
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      this.defaultContactMaterial
    );
    this.world.addContactMaterial(defaultContactMaterial);
    this.world.defaultContactMaterial = defaultContactMaterial;

    // Broadphase algorithm for better performance
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);

    console.log('PhysicsSystem initialized with gravity:', this.gravity);
  }

  /**
   * Update physics simulation
   * @param {number} deltaTime - Time since last update
   * @param {Array<Entity>} entities - Entities with Transform and RigidBody
   */
  update(deltaTime, entities) {
    // Add new entities to physics world
    for (const entity of entities) {
      if (!this.entityBodyMap.has(entity.id)) {
        this._addEntityToPhysics(entity);
      }
    }

    // Remove entities that no longer exist
    const currentEntityIds = new Set(entities.map(e => e.id));
    for (const [entityId, body] of this.entityBodyMap.entries()) {
      if (!currentEntityIds.has(entityId)) {
        this._removeEntityFromPhysics(entityId);
      }
    }

    // Step physics simulation
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);

    // Sync physics back to transforms
    for (const entity of entities) {
      this._syncPhysicsToTransform(entity);
    }
  }

  /**
   * Add an entity to the physics world
   * @private
   * @param {Entity} entity - Entity to add
   */
  _addEntityToPhysics(entity) {
    const transform = entity.getComponent('Transform');
    const rigidBody = entity.getComponent('RigidBody');

    if (!transform || !rigidBody) return;

    // Convert Three.js transform to Cannon.js
    const position = new CANNON.Vec3(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );

    const quaternion = new CANNON.Quaternion(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z,
      transform.rotation.w
    );

    // Create Cannon.js body
    const body = rigidBody.createBody(position, quaternion);

    // Store entity reference on body for collision callbacks
    body.userData = { entityId: entity.id };

    // Add to world
    this.world.addBody(body);

    // Store mappings
    this.entityBodyMap.set(entity.id, body);
    this.bodyEntityMap.set(body.id, entity);
  }

  /**
   * Remove an entity from the physics world
   * @private
   * @param {number} entityId - Entity ID to remove
   */
  _removeEntityFromPhysics(entityId) {
    const body = this.entityBodyMap.get(entityId);
    if (body) {
      this.world.removeBody(body);
      this.bodyEntityMap.delete(body.id);
      this.entityBodyMap.delete(entityId);
    }
  }

  /**
   * Sync physics body state back to transform
   * @private
   * @param {Entity} entity - Entity to sync
   */
  _syncPhysicsToTransform(entity) {
    const transform = entity.getComponent('Transform');
    const rigidBody = entity.getComponent('RigidBody');

    if (!transform || !rigidBody || !rigidBody.body) return;

    const body = rigidBody.body;

    // Store previous transform for interpolation
    transform.storePrevious();

    // Sync position
    transform.position.set(
      body.position.x,
      body.position.y,
      body.position.z
    );

    // Sync rotation
    transform.rotation.set(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
  }

  /**
   * Set world gravity
   * @param {number} x - X gravity
   * @param {number} y - Y gravity
   * @param {number} z - Z gravity
   */
  setGravity(x, y, z) {
    if (this.world) {
      this.world.gravity.set(x, y, z);
    }
  }

  /**
   * Get entity by body
   * @param {CANNON.Body} body - Cannon.js body
   * @returns {Entity|undefined} Entity or undefined
   */
  getEntityByBody(body) {
    return this.bodyEntityMap.get(body.id);
  }

  /**
   * Get body by entity
   * @param {Entity} entity - Entity
   * @returns {CANNON.Body|undefined} Body or undefined
   */
  getBodyByEntity(entity) {
    return this.entityBodyMap.get(entity.id);
  }

  /**
   * Raycast from a point in a direction
   * @param {THREE.Vector3} from - Start position
   * @param {THREE.Vector3} to - End position
   * @returns {Object|null} Hit result or null
   */
  raycast(from, to) {
    const ray = new CANNON.Ray(
      new CANNON.Vec3(from.x, from.y, from.z),
      new CANNON.Vec3(to.x, to.y, to.z)
    );

    const result = new CANNON.RaycastResult();
    this.world.raycastClosest(
      ray.from,
      ray.to,
      {},
      result
    );

    if (result.hasHit) {
      return {
        body: result.body,
        point: new THREE.Vector3(result.hitPointWorld.x, result.hitPointWorld.y, result.hitPointWorld.z),
        normal: new THREE.Vector3(result.hitNormalWorld.x, result.hitNormalWorld.y, result.hitNormalWorld.z),
        distance: result.distance,
        entity: this.getEntityByBody(result.body)
      };
    }

    return null;
  }

  /**
   * Clean up physics world
   */
  destroy() {
    if (this.world) {
      // Remove all bodies
      while (this.world.bodies.length > 0) {
        this.world.removeBody(this.world.bodies[0]);
      }
    }

    this.entityBodyMap.clear();
    this.bodyEntityMap.clear();

    console.log('PhysicsSystem destroyed');
  }
}
