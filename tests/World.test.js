import { describe, it, expect, beforeEach, vi } from 'vitest';
import { World } from '../src/core/World.js';
import { Entity } from '../src/core/Entity.js';
import { System } from '../src/core/System.js';
import { Component } from '../src/core/Component.js';

// Mock components
class TestComponent extends Component {
  constructor(value) {
    super();
    this.value = value;
  }
}

// Mock system
class TestSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['TestComponent'];
    this.updateCallCount = 0;
  }

  update(deltaTime, entities) {
    this.updateCallCount++;
    this.lastDeltaTime = deltaTime;
    this.lastEntityCount = entities.length;
  }
}

describe('World', () => {
  let world;

  beforeEach(() => {
    world = new World();
  });

  it('should create empty world', () => {
    expect(world.entities).toEqual([]);
    expect(world.systems).toEqual([]);
  });

  it('should add entity', () => {
    const entity = new Entity();
    world.addEntity(entity);
    expect(world.entities).toContain(entity);
  });

  it('should return world for chaining', () => {
    const entity = new Entity();
    const result = world.addEntity(entity);
    expect(result).toBe(world);
  });

  it('should add system and initialize it', () => {
    const system = new TestSystem();
    const initSpy = vi.spyOn(system, 'init');

    world.addSystem(system);

    expect(world.systems).toContain(system);
    expect(initSpy).toHaveBeenCalledWith(world);
  });

  it('should sort systems by priority', () => {
    class HighPrioritySystem extends TestSystem {
      constructor() {
        super();
        this.priority = 1;
      }
    }

    class LowPrioritySystem extends TestSystem {
      constructor() {
        super();
        this.priority = 10;
      }
    }

    const sys1 = new LowPrioritySystem();
    const sys2 = new HighPrioritySystem();

    world.addSystem(sys1);
    world.addSystem(sys2);

    expect(world.systems[0]).toBe(sys2); // Higher priority (lower number) first
    expect(world.systems[1]).toBe(sys1);
  });

  it('should update systems with matching entities', () => {
    const system = new TestSystem();
    world.addSystem(system);

    const entity1 = new Entity();
    entity1.addComponent(new TestComponent(42));
    world.addEntity(entity1);

    const entity2 = new Entity();
    // No TestComponent
    world.addEntity(entity2);

    world.update(0.016);

    expect(system.updateCallCount).toBe(1);
    expect(system.lastEntityCount).toBe(1); // Only entity1 matches
    expect(system.lastDeltaTime).toBe(0.016);
  });

  it('should destroy entity', () => {
    const entity = new Entity();
    world.addEntity(entity);

    expect(world.entities.length).toBe(1);

    world.destroyEntity(entity);
    world.update(0); // Process destruction queue

    expect(world.entities.length).toBe(0);
    expect(entity.active).toBe(false);
  });

  it('should not update inactive entities', () => {
    const system = new TestSystem();
    world.addSystem(system);

    const entity = new Entity();
    entity.addComponent(new TestComponent(42));
    world.addEntity(entity);

    entity.active = false;

    world.update(0.016);

    expect(system.lastEntityCount).toBe(0); // Inactive entity not counted
  });

  it('should get entities with specific components', () => {
    class AnotherComponent extends Component {}

    const entity1 = new Entity();
    entity1.addComponent(new TestComponent(1));
    world.addEntity(entity1);

    const entity2 = new Entity();
    entity2.addComponent(new TestComponent(2));
    entity2.addComponent(new AnotherComponent());
    world.addEntity(entity2);

    const entity3 = new Entity();
    entity3.addComponent(new AnotherComponent());
    world.addEntity(entity3);

    const results = world.getEntitiesWithComponents('TestComponent', 'AnotherComponent');
    expect(results.length).toBe(1);
    expect(results[0]).toBe(entity2);
  });

  it('should destroy world completely', () => {
    const system = new TestSystem();
    const destroySpy = vi.spyOn(system, 'destroy');

    world.addSystem(system);

    const entity = new Entity();
    world.addEntity(entity);

    world.destroy();

    expect(world.systems.length).toBe(0);
    expect(world.entities.length).toBe(0);
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should handle multiple updates', () => {
    const system = new TestSystem();
    world.addSystem(system);

    const entity = new Entity();
    entity.addComponent(new TestComponent(42));
    world.addEntity(entity);

    world.update(0.016);
    world.update(0.016);
    world.update(0.016);

    expect(system.updateCallCount).toBe(3);
  });
});
