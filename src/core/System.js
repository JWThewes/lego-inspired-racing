/**
 * System base class - Contains logic that operates on entities with specific components
 * Systems implement game logic and behavior
 */
export class System {
  constructor() {
    if (this.constructor === System) {
      throw new Error('System is an abstract class and cannot be instantiated directly');
    }
    this.requiredComponents = [];
    this.priority = 0; // Lower number = higher priority
  }

  /**
   * Initialize the system
   * @param {World} world - The game world
   */
  init(world) {
    // Override in subclasses if needed
  }

  /**
   * Update the system
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities that match required components
   */
  update(deltaTime, entities) {
    throw new Error('System.update() must be implemented by subclass');
  }

  /**
   * Clean up system resources
   */
  destroy() {
    // Override in subclasses if needed
  }

  /**
   * Check if an entity matches this system's required components
   * @param {Entity} entity - Entity to check
   * @returns {boolean} True if entity has all required components
   */
  matchesEntity(entity) {
    return this.requiredComponents.every(componentName =>
      entity.hasComponent(componentName)
    );
  }
}
