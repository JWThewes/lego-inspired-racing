/**
 * Entity class - Unique identifier in the ECS system
 * Entities are containers for components
 */
export class Entity {
  static _nextId = 0;

  constructor() {
    this.id = Entity._nextId++;
    this.components = new Map();
    this.active = true;
  }

  /**
   * Add a component to this entity
   * @param {Component} component - Component instance to add
   * @returns {Entity} This entity for chaining
   */
  addComponent(component) {
    const componentName = component.constructor.name;
    this.components.set(componentName, component);
    return this;
  }

  /**
   * Get a component by its class name
   * @param {string} componentName - Name of the component class
   * @returns {Component|undefined} The component or undefined
   */
  getComponent(componentName) {
    return this.components.get(componentName);
  }

  /**
   * Check if entity has a component
   * @param {string} componentName - Name of the component class
   * @returns {boolean} True if entity has the component
   */
  hasComponent(componentName) {
    return this.components.has(componentName);
  }

  /**
   * Remove a component from this entity
   * @param {string} componentName - Name of the component class
   * @returns {boolean} True if component was removed
   */
  removeComponent(componentName) {
    return this.components.delete(componentName);
  }

  /**
   * Destroy this entity
   */
  destroy() {
    this.active = false;
    this.components.clear();
  }
}
