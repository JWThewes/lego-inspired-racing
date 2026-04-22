import { describe, it, expect, beforeEach, vi } from 'vitest';
import { System } from '../src/core/System.js';
import { Entity } from '../src/core/Entity.js';
import { Component } from '../src/core/Component.js';

// Mock components
class PositionComponent extends Component {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

class VelocityComponent extends Component {
  constructor(vx = 0, vy = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}

// Mock system
class MovementSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['PositionComponent', 'VelocityComponent'];
  }

  update(deltaTime, entities) {
    for (const entity of entities) {
      const pos = entity.getComponent('PositionComponent');
      const vel = entity.getComponent('VelocityComponent');
      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    }
  }
}

describe('System', () => {
  it('should not allow direct instantiation', () => {
    expect(() => new System()).toThrow('System is an abstract class');
  });

  it('should allow subclass instantiation', () => {
    const system = new MovementSystem();
    expect(system).toBeInstanceOf(System);
  });

  it('should have default priority of 0', () => {
    const system = new MovementSystem();
    expect(system.priority).toBe(0);
  });

  it('should throw error if update not implemented', () => {
    class BadSystem extends System {}
    const system = new BadSystem();
    expect(() => system.update(0, [])).toThrow('System.update() must be implemented');
  });

  it('should match entity with required components', () => {
    const system = new MovementSystem();
    const entity = new Entity();

    entity.addComponent(new PositionComponent());
    entity.addComponent(new VelocityComponent());

    expect(system.matchesEntity(entity)).toBe(true);
  });

  it('should not match entity missing required components', () => {
    const system = new MovementSystem();
    const entity = new Entity();

    entity.addComponent(new PositionComponent());
    // Missing VelocityComponent

    expect(system.matchesEntity(entity)).toBe(false);
  });

  it('should call init on initialization', () => {
    const system = new MovementSystem();
    const mockWorld = {};

    const initSpy = vi.spyOn(system, 'init');
    system.init(mockWorld);

    expect(initSpy).toHaveBeenCalledWith(mockWorld);
  });

  it('should update entities correctly', () => {
    const system = new MovementSystem();
    const entity = new Entity();

    const pos = new PositionComponent(0, 0);
    const vel = new VelocityComponent(10, 20);

    entity.addComponent(pos);
    entity.addComponent(vel);

    system.update(1, [entity]);

    expect(pos.x).toBe(10);
    expect(pos.y).toBe(20);
  });

  it('should handle multiple entities', () => {
    const system = new MovementSystem();

    const entity1 = new Entity();
    entity1.addComponent(new PositionComponent(0, 0));
    entity1.addComponent(new VelocityComponent(5, 10));

    const entity2 = new Entity();
    entity2.addComponent(new PositionComponent(100, 200));
    entity2.addComponent(new VelocityComponent(-5, -10));

    system.update(2, [entity1, entity2]);

    expect(entity1.getComponent('PositionComponent').x).toBe(10);
    expect(entity1.getComponent('PositionComponent').y).toBe(20);
    expect(entity2.getComponent('PositionComponent').x).toBe(90);
    expect(entity2.getComponent('PositionComponent').y).toBe(180);
  });
});
