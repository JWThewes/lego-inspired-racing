import { System } from '../core/System.js';

/**
 * CollisionSystem - Detects collisions and triggers callbacks
 * Works with PhysicsSystem to handle collision events
 */
export class CollisionSystem extends System {
  constructor() {
    super();

    this.requiredComponents = ['Transform', 'RigidBody'];
    this.priority = 11; // Runs after PhysicsSystem

    // Track active collisions
    this.activeCollisions = new Map(); // Key: "bodyId1-bodyId2", Value: collision data

    // Reference to physics system
    this.physicsSystem = null;
  }

  /**
   * Initialize collision system
   * @param {World} world - Game world
   */
  init(world) {
    // Find physics system
    this.physicsSystem = world.systems.find(s => s.constructor.name === 'PhysicsSystem');

    if (!this.physicsSystem) {
      console.warn('CollisionSystem: PhysicsSystem not found. Collision detection will not work.');
      return;
    }

    // Set up collision event listeners on Cannon.js world
    const cannonWorld = this.physicsSystem.world;

    cannonWorld.addEventListener('beginContact', (event) => {
      this._handleCollisionStart(event);
    });

    cannonWorld.addEventListener('endContact', (event) => {
      this._handleCollisionEnd(event);
    });

    console.log('CollisionSystem initialized');
  }

  /**
   * Update collision system
   * @param {number} deltaTime - Time since last update
   * @param {Array<Entity>} entities - Entities with collision components
   */
  update(deltaTime, entities) {
    // Process any pending collision events
    // Most collision handling is done via Cannon.js events
    // This update can be used for custom collision logic if needed
  }

  /**
   * Handle collision start event
   * @private
   * @param {Object} event - Cannon.js collision event
   */
  _handleCollisionStart(event) {
    const { bodyA, bodyB, contact } = event;

    // Get entities from bodies
    const entityA = this.physicsSystem.getEntityByBody(bodyA);
    const entityB = this.physicsSystem.getEntityByBody(bodyB);

    if (!entityA || !entityB) return;

    // Create collision pair key (sorted to ensure consistency)
    const pairKey = this._getCollisionPairKey(bodyA.id, bodyB.id);

    // Store collision data
    const collisionData = {
      entityA,
      entityB,
      bodyA,
      bodyB,
      contact,
      startTime: performance.now()
    };

    this.activeCollisions.set(pairKey, collisionData);

    // Trigger callbacks on RigidBody components
    const rigidBodyA = entityA.getComponent('RigidBody');
    const rigidBodyB = entityB.getComponent('RigidBody');

    if (rigidBodyA && rigidBodyA.onCollisionStart) {
      rigidBodyA.onCollisionStart({
        entity: entityA,
        otherEntity: entityB,
        body: bodyA,
        otherBody: bodyB,
        contact
      });
    }

    if (rigidBodyB && rigidBodyB.onCollisionStart) {
      rigidBodyB.onCollisionStart({
        entity: entityB,
        otherEntity: entityA,
        body: bodyB,
        otherBody: bodyA,
        contact
      });
    }
  }

  /**
   * Handle collision end event
   * @private
   * @param {Object} event - Cannon.js collision event
   */
  _handleCollisionEnd(event) {
    const { bodyA, bodyB } = event;

    // Get entities from bodies
    const entityA = this.physicsSystem.getEntityByBody(bodyA);
    const entityB = this.physicsSystem.getEntityByBody(bodyB);

    if (!entityA || !entityB) return;

    // Create collision pair key
    const pairKey = this._getCollisionPairKey(bodyA.id, bodyB.id);

    // Get collision data
    const collisionData = this.activeCollisions.get(pairKey);

    // Remove from active collisions
    this.activeCollisions.delete(pairKey);

    // Trigger callbacks on RigidBody components
    const rigidBodyA = entityA.getComponent('RigidBody');
    const rigidBodyB = entityB.getComponent('RigidBody');

    if (rigidBodyA && rigidBodyA.onCollisionEnd) {
      rigidBodyA.onCollisionEnd({
        entity: entityA,
        otherEntity: entityB,
        body: bodyA,
        otherBody: bodyB,
        duration: collisionData ? performance.now() - collisionData.startTime : 0
      });
    }

    if (rigidBodyB && rigidBodyB.onCollisionEnd) {
      rigidBodyB.onCollisionEnd({
        entity: entityB,
        otherEntity: entityA,
        body: bodyB,
        otherBody: bodyA,
        duration: collisionData ? performance.now() - collisionData.startTime : 0
      });
    }
  }

  /**
   * Get consistent collision pair key
   * @private
   * @param {number} bodyIdA - First body ID
   * @param {number} bodyIdB - Second body ID
   * @returns {string} Collision pair key
   */
  _getCollisionPairKey(bodyIdA, bodyIdB) {
    // Sort IDs to ensure consistent key regardless of order
    const [id1, id2] = bodyIdA < bodyIdB ? [bodyIdA, bodyIdB] : [bodyIdB, bodyIdA];
    return `${id1}-${id2}`;
  }

  /**
   * Check if two entities are currently colliding
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   * @returns {boolean} True if colliding
   */
  areColliding(entityA, entityB) {
    const bodyA = this.physicsSystem.getBodyByEntity(entityA);
    const bodyB = this.physicsSystem.getBodyByEntity(entityB);

    if (!bodyA || !bodyB) return false;

    const pairKey = this._getCollisionPairKey(bodyA.id, bodyB.id);
    return this.activeCollisions.has(pairKey);
  }

  /**
   * Get all entities currently colliding with a given entity
   * @param {Entity} entity - Entity to check
   * @returns {Array<Entity>} Array of colliding entities
   */
  getCollidingEntities(entity) {
    const body = this.physicsSystem.getBodyByEntity(entity);
    if (!body) return [];

    const collidingEntities = [];

    for (const [pairKey, collisionData] of this.activeCollisions.entries()) {
      if (collisionData.bodyA.id === body.id) {
        collidingEntities.push(collisionData.entityB);
      } else if (collisionData.bodyB.id === body.id) {
        collidingEntities.push(collisionData.entityA);
      }
    }

    return collidingEntities;
  }

  /**
   * Get collision data between two entities
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   * @returns {Object|null} Collision data or null
   */
  getCollisionData(entityA, entityB) {
    const bodyA = this.physicsSystem.getBodyByEntity(entityA);
    const bodyB = this.physicsSystem.getBodyByEntity(entityB);

    if (!bodyA || !bodyB) return null;

    const pairKey = this._getCollisionPairKey(bodyA.id, bodyB.id);
    return this.activeCollisions.get(pairKey) || null;
  }

  /**
   * Clean up collision system
   */
  destroy() {
    this.activeCollisions.clear();
    console.log('CollisionSystem destroyed');
  }
}
