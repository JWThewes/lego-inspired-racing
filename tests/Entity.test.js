import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../src/core/Entity.js';
import { Component } from '../src/core/Component.js';

// Mock component for testing
class MockComponent extends Component {
  constructor(value) {
    super();
    this.value = value;
  }
}

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity();
  });

  it('should create entity with unique ID', () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    expect(entity1.id).toBeDefined();
    expect(entity2.id).toBeDefined();
    expect(entity1.id).not.toBe(entity2.id);
  });

  it('should start as active', () => {
    expect(entity.active).toBe(true);
  });

  it('should add component', () => {
    const component = new MockComponent(42);
    entity.addComponent(component);
    expect(entity.hasComponent('MockComponent')).toBe(true);
  });

  it('should return entity for method chaining', () => {
    const component = new MockComponent(42);
    const result = entity.addComponent(component);
    expect(result).toBe(entity);
  });

  it('should get component', () => {
    const component = new MockComponent(42);
    entity.addComponent(component);
    const retrieved = entity.getComponent('MockComponent');
    expect(retrieved).toBe(component);
    expect(retrieved.value).toBe(42);
  });

  it('should return undefined for non-existent component', () => {
    const retrieved = entity.getComponent('NonExistent');
    expect(retrieved).toBeUndefined();
  });

  it('should check if has component', () => {
    const component = new MockComponent(42);
    expect(entity.hasComponent('MockComponent')).toBe(false);
    entity.addComponent(component);
    expect(entity.hasComponent('MockComponent')).toBe(true);
  });

  it('should remove component', () => {
    const component = new MockComponent(42);
    entity.addComponent(component);
    expect(entity.hasComponent('MockComponent')).toBe(true);

    const removed = entity.removeComponent('MockComponent');
    expect(removed).toBe(true);
    expect(entity.hasComponent('MockComponent')).toBe(false);
  });

  it('should return false when removing non-existent component', () => {
    const removed = entity.removeComponent('NonExistent');
    expect(removed).toBe(false);
  });

  it('should destroy entity', () => {
    const component = new MockComponent(42);
    entity.addComponent(component);

    entity.destroy();

    expect(entity.active).toBe(false);
    expect(entity.components.size).toBe(0);
  });

  it('should handle multiple components', () => {
    class AnotherComponent extends Component {
      constructor() {
        super();
        this.name = 'test';
      }
    }

    const comp1 = new MockComponent(42);
    const comp2 = new AnotherComponent();

    entity.addComponent(comp1).addComponent(comp2);

    expect(entity.hasComponent('MockComponent')).toBe(true);
    expect(entity.hasComponent('AnotherComponent')).toBe(true);
    expect(entity.components.size).toBe(2);
  });
});
