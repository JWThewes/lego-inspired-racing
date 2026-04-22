/**
 * World class - Container for all entities and systems
 * Manages the ECS lifecycle
 */
export class World {
  constructor() {
    this.entities = [];
    this.systems = [];
    this.entitiesToDestroy = [];
  }

  /**
   * Create and add a new entity to the world
   * @returns {Entity} The newly created entity
   */
  createEntity() {
    const Entity = require('./Entity.js').Entity;
    const entity = new Entity();
    this.entities.push(entity);
    return entity;
  }

  /**
   * Add an existing entity to the world
   * @param {Entity} entity - Entity to add
   * @returns {World} This world for chaining
   */
  addEntity(entity) {
    this.entities.push(entity);
    return this;
  }

  /**
   * Mark an entity for destruction
   * @param {Entity} entity - Entity to destroy
   */
  destroyEntity(entity) {
    this.entitiesToDestroy.push(entity);
  }

  /**
   * Add a system to the world
   * @param {System} system - System to add
   * @returns {World} This world for chaining
   */
  addSystem(system) {
    this.systems.push(system);
    // Sort systems by priority (lower number = higher priority)
    this.systems.sort((a, b) => a.priority - b.priority);
    system.init(this);
    return this;
  }

  /**
   * Update all systems with entities that match their requirements
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    // Process entity destruction queue
    this._processDestroyQueue();

    // Get active entities
    const activeEntities = this.entities.filter(e => e.active);

    // Update each system with matching entities
    for (const system of this.systems) {
      const matchingEntities = activeEntities.filter(entity =>
        system.matchesEntity(entity)
      );
      system.update(deltaTime, matchingEntities);
    }
  }

  /**
   * Clean up destroyed entities
   * @private
   */
  _processDestroyQueue() {
    if (this.entitiesToDestroy.length === 0) return;

    for (const entity of this.entitiesToDestroy) {
      entity.destroy();
      const index = this.entities.indexOf(entity);
      if (index !== -1) {
        this.entities.splice(index, 1);
      }
    }

    this.entitiesToDestroy = [];
  }

  /**
   * Get all entities with specific components
   * @param {...string} componentNames - Component names to filter by
   * @returns {Array<Entity>} Matching entities
   */
  getEntitiesWithComponents(...componentNames) {
    return this.entities.filter(entity =>
      entity.active && componentNames.every(name => entity.hasComponent(name))
    );
  }

  /**
   * Clean up all entities and systems
   */
  destroy() {
    // Destroy all systems
    for (const system of this.systems) {
      system.destroy();
    }
    this.systems = [];

    // Destroy all entities
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities = [];
    this.entitiesToDestroy = [];
  }
}
