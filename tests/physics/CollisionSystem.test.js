import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CollisionSystem } from '../../src/physics/CollisionSystem.js';
import { PhysicsSystem } from '../../src/physics/PhysicsSystem.js';
import { World } from '../../src/core/World.js';
import { Entity } from '../../src/core/Entity.js';
import { Transform } from '../../src/physics/Transform.js';
import { RigidBody } from '../../src/physics/RigidBody.js';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

describe('CollisionSystem', () => {
  let collisionSystem;
  let physicsSystem;
  let world;

  beforeEach(() => {
    world = new World();
    physicsSystem = new PhysicsSystem();
    collisionSystem = new CollisionSystem();

    world.addSystem(physicsSystem);
    world.addSystem(collisionSystem);
  });

  describe('Constructor', () => {
    it('should create with required components', () => {
      expect(collisionSystem.requiredComponents).toContain('Transform');
      expect(collisionSystem.requiredComponents).toContain('RigidBody');
    });

    it('should have priority after PhysicsSystem', () => {
      expect(collisionSystem.priority).toBeGreaterThan(physicsSystem.priority);
    });

    it('should initialize with empty collision tracking', () => {
      expect(collisionSystem.activeCollisions.size).toBe(0);
    });
  });

  describe('init', () => {
    it('should find PhysicsSystem reference', () => {
      expect(collisionSystem.physicsSystem).toBe(physicsSystem);
    });

    it('should warn if PhysicsSystem not found', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const worldWithoutPhysics = new World();
      const collisionSystemAlone = new CollisionSystem();

      worldWithoutPhysics.addSystem(collisionSystemAlone);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('PhysicsSystem not found')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Collision detection', () => {
    let entityA;
    let entityB;

    beforeEach(() => {
      // Create two entities with physics bodies
      entityA = new Entity();
      entityA.addComponent(new Transform(new THREE.Vector3(0, 5, 0)));
      const rigidBodyA = new RigidBody({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
      });
      entityA.addComponent(rigidBodyA);

      entityB = new Entity();
      entityB.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
      const rigidBodyB = new RigidBody({
        mass: 0,
        type: 'static',
        shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5))
      });
      entityB.addComponent(rigidBodyB);

      world.addEntity(entityA);
      world.addEntity(entityB);
    });

    it('should trigger onCollisionStart callback when collision begins', (done) => {
      const rigidBodyA = entityA.getComponent('RigidBody');
      let collisionDetected = false;

      rigidBodyA.onCollisionStart = (data) => {
        collisionDetected = true;
        expect(data.entity).toBe(entityA);
        expect(data.otherEntity).toBe(entityB);
        expect(data.body).toBeDefined();
        expect(data.otherBody).toBeDefined();
        done();
      };

      const entities = [entityA, entityB];

      // Run physics simulation until collision occurs
      const maxIterations = 200;
      let iterations = 0;

      const simulateUntilCollision = () => {
        if (collisionDetected || iterations >= maxIterations) {
          if (!collisionDetected) {
            done(new Error('Collision not detected within expected timeframe'));
          }
          return;
        }

        world.update(0.016);
        iterations++;
        setTimeout(simulateUntilCollision, 0);
      };

      simulateUntilCollision();
    }, 10000);

    it('should track active collisions', (done) => {
      const rigidBodyA = entityA.getComponent('RigidBody');

      rigidBodyA.onCollisionStart = () => {
        expect(collisionSystem.activeCollisions.size).toBeGreaterThan(0);
        done();
      };

      const entities = [entityA, entityB];

      // Run physics simulation until collision
      const maxIterations = 200;
      let iterations = 0;

      const simulateUntilCollision = () => {
        if (iterations >= maxIterations) {
          done(new Error('Collision not detected'));
          return;
        }

        world.update(0.016);
        iterations++;

        if (collisionSystem.activeCollisions.size > 0) {
          return;
        }

        setTimeout(simulateUntilCollision, 0);
      };

      simulateUntilCollision();
    }, 10000);
  });

  describe('areColliding', () => {
    let entityA;
    let entityB;

    beforeEach(() => {
      entityA = new Entity();
      entityA.addComponent(new Transform(new THREE.Vector3(0, 5, 0)));
      entityA.addComponent(new RigidBody({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
      }));

      entityB = new Entity();
      entityB.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
      entityB.addComponent(new RigidBody({
        mass: 0,
        type: 'static',
        shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5))
      }));

      world.addEntity(entityA);
      world.addEntity(entityB);
    });

    it('should return false before collision', () => {
      world.update(0.016);

      const colliding = collisionSystem.areColliding(entityA, entityB);
      expect(colliding).toBe(false);
    });

    it('should return true during collision', (done) => {
      const rigidBodyA = entityA.getComponent('RigidBody');

      rigidBodyA.onCollisionStart = () => {
        const colliding = collisionSystem.areColliding(entityA, entityB);
        expect(colliding).toBe(true);
        done();
      };

      // Simulate until collision
      const maxIterations = 200;
      let iterations = 0;

      const simulate = () => {
        if (iterations >= maxIterations) {
          done(new Error('Collision not detected'));
          return;
        }

        world.update(0.016);
        iterations++;

        if (collisionSystem.activeCollisions.size === 0) {
          setTimeout(simulate, 0);
        }
      };

      simulate();
    }, 10000);
  });

  describe('getCollidingEntities', () => {
    let entityA;
    let entityB;
    let entityC;

    beforeEach(() => {
      entityA = new Entity();
      entityA.addComponent(new Transform(new THREE.Vector3(0, 5, 0)));
      entityA.addComponent(new RigidBody({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
      }));

      entityB = new Entity();
      entityB.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
      entityB.addComponent(new RigidBody({
        mass: 0,
        type: 'static',
        shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5))
      }));

      entityC = new Entity();
      entityC.addComponent(new Transform(new THREE.Vector3(10, 0, 0)));
      entityC.addComponent(new RigidBody({
        mass: 0,
        type: 'static',
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
      }));

      world.addEntity(entityA);
      world.addEntity(entityB);
      world.addEntity(entityC);
    });

    it('should return empty array when no collisions', () => {
      world.update(0.016);

      const collidingEntities = collisionSystem.getCollidingEntities(entityA);
      expect(collidingEntities).toEqual([]);
    });

    it('should return colliding entities during collision', (done) => {
      const rigidBodyA = entityA.getComponent('RigidBody');

      rigidBodyA.onCollisionStart = () => {
        const collidingEntities = collisionSystem.getCollidingEntities(entityA);
        expect(collidingEntities.length).toBeGreaterThan(0);
        expect(collidingEntities).toContain(entityB);
        done();
      };

      // Simulate until collision
      const maxIterations = 200;
      let iterations = 0;

      const simulate = () => {
        if (iterations >= maxIterations) {
          done(new Error('Collision not detected'));
          return;
        }

        world.update(0.016);
        iterations++;

        if (collisionSystem.activeCollisions.size === 0) {
          setTimeout(simulate, 0);
        }
      };

      simulate();
    }, 10000);
  });

  describe('getCollisionData', () => {
    let entityA;
    let entityB;

    beforeEach(() => {
      entityA = new Entity();
      entityA.addComponent(new Transform(new THREE.Vector3(0, 5, 0)));
      entityA.addComponent(new RigidBody({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
      }));

      entityB = new Entity();
      entityB.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
      entityB.addComponent(new RigidBody({
        mass: 0,
        type: 'static',
        shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5))
      }));

      world.addEntity(entityA);
      world.addEntity(entityB);
    });

    it('should return null when no collision', () => {
      world.update(0.016);

      const collisionData = collisionSystem.getCollisionData(entityA, entityB);
      expect(collisionData).toBeNull();
    });

    it('should return collision data during collision', (done) => {
      const rigidBodyA = entityA.getComponent('RigidBody');

      rigidBodyA.onCollisionStart = () => {
        const collisionData = collisionSystem.getCollisionData(entityA, entityB);
        expect(collisionData).not.toBeNull();
        expect(collisionData.entityA).toBeDefined();
        expect(collisionData.entityB).toBeDefined();
        expect(collisionData.startTime).toBeDefined();
        done();
      };

      // Simulate until collision
      const maxIterations = 200;
      let iterations = 0;

      const simulate = () => {
        if (iterations >= maxIterations) {
          done(new Error('Collision not detected'));
          return;
        }

        world.update(0.016);
        iterations++;

        if (collisionSystem.activeCollisions.size === 0) {
          setTimeout(simulate, 0);
        }
      };

      simulate();
    }, 10000);
  });

  describe('destroy', () => {
    it('should clear active collisions', () => {
      // Manually add a collision to test cleanup
      collisionSystem.activeCollisions.set('1-2', { test: 'data' });

      expect(collisionSystem.activeCollisions.size).toBe(1);

      collisionSystem.destroy();

      expect(collisionSystem.activeCollisions.size).toBe(0);
    });
  });
});
