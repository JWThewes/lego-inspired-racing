import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsSystem } from '../../src/physics/PhysicsSystem.js';
import { World } from '../../src/core/World.js';
import { Entity } from '../../src/core/Entity.js';
import { Transform } from '../../src/physics/Transform.js';
import { RigidBody } from '../../src/physics/RigidBody.js';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

describe('PhysicsSystem', () => {
  let physicsSystem;
  let world;

  beforeEach(() => {
    physicsSystem = new PhysicsSystem();
    world = new World();
    physicsSystem.init(world);
  });

  describe('Constructor', () => {
    it('should create with default configuration', () => {
      expect(physicsSystem.requiredComponents).toContain('Transform');
      expect(physicsSystem.requiredComponents).toContain('RigidBody');
      expect(physicsSystem.priority).toBe(10);
    });

    it('should create with custom gravity', () => {
      const customSystem = new PhysicsSystem({
        gravity: new CANNON.Vec3(0, -20, 0)
      });
      customSystem.init(world);

      expect(customSystem.gravity.y).toBe(-20);
    });

    it('should create with custom timestep', () => {
      const customSystem = new PhysicsSystem({
        fixedTimeStep: 1 / 120
      });

      expect(customSystem.fixedTimeStep).toBe(1 / 120);
    });
  });

  describe('init', () => {
    it('should create Cannon.js world', () => {
      expect(physicsSystem.world).toBeDefined();
      expect(physicsSystem.world).toBeInstanceOf(CANNON.World);
    });

    it('should set world gravity', () => {
      expect(physicsSystem.world.gravity.y).toBe(-9.82);
    });

    it('should configure broadphase algorithm', () => {
      expect(physicsSystem.world.broadphase).toBeInstanceOf(CANNON.SAPBroadphase);
    });

    it('should set up default contact material', () => {
      expect(physicsSystem.world.defaultContactMaterial).toBeDefined();
    });
  });

  describe('update', () => {
    let entity;

    beforeEach(() => {
      entity = new Entity();
      entity.addComponent(new Transform());
      entity.addComponent(new RigidBody({ mass: 1 }));
      world.addEntity(entity);
    });

    it('should add new entities to physics world', () => {
      const entities = [entity];
      physicsSystem.update(0.016, entities);

      expect(physicsSystem.entityBodyMap.has(entity.id)).toBe(true);
      expect(physicsSystem.world.bodies.length).toBe(1);
    });

    it('should step the physics simulation', () => {
      const entities = [entity];
      const initialTime = physicsSystem.world.time;

      physicsSystem.update(0.016, entities);

      expect(physicsSystem.world.time).toBeGreaterThan(initialTime);
    });

    it('should sync physics to transform', () => {
      const entities = [entity];
      const transform = entity.getComponent('Transform');
      const rigidBody = entity.getComponent('RigidBody');

      // Add entity to physics
      physicsSystem.update(0.016, entities);

      // Apply force to move the body
      rigidBody.applyImpulse(new CANNON.Vec3(0, 10, 0));

      // Update physics
      physicsSystem.update(0.016, entities);

      // Transform should have been updated
      expect(transform.position.y).toBeGreaterThan(0);
    });

    it('should remove entities no longer in entity list', () => {
      const entities = [entity];
      physicsSystem.update(0.016, entities);

      expect(physicsSystem.entityBodyMap.has(entity.id)).toBe(true);

      // Update with empty entity list
      physicsSystem.update(0.016, []);

      expect(physicsSystem.entityBodyMap.has(entity.id)).toBe(false);
      expect(physicsSystem.world.bodies.length).toBe(0);
    });

    it('should handle multiple entities', () => {
      const entity2 = new Entity();
      entity2.addComponent(new Transform(new THREE.Vector3(5, 0, 0)));
      entity2.addComponent(new RigidBody({ mass: 2 }));
      world.addEntity(entity2);

      const entities = [entity, entity2];
      physicsSystem.update(0.016, entities);

      expect(physicsSystem.entityBodyMap.size).toBe(2);
      expect(physicsSystem.world.bodies.length).toBe(2);
    });
  });

  describe('setGravity', () => {
    it('should update world gravity', () => {
      physicsSystem.setGravity(0, -20, 0);

      expect(physicsSystem.world.gravity.x).toBe(0);
      expect(physicsSystem.world.gravity.y).toBe(-20);
      expect(physicsSystem.world.gravity.z).toBe(0);
    });
  });

  describe('getEntityByBody', () => {
    let entity;

    beforeEach(() => {
      entity = new Entity();
      entity.addComponent(new Transform());
      entity.addComponent(new RigidBody({ mass: 1 }));
      world.addEntity(entity);

      const entities = [entity];
      physicsSystem.update(0.016, entities);
    });

    it('should return entity for given body', () => {
      const body = physicsSystem.entityBodyMap.get(entity.id);
      const foundEntity = physicsSystem.getEntityByBody(body);

      expect(foundEntity).toBe(entity);
    });

    it('should return undefined for unknown body', () => {
      const unknownBody = new CANNON.Body();
      const foundEntity = physicsSystem.getEntityByBody(unknownBody);

      expect(foundEntity).toBeUndefined();
    });
  });

  describe('getBodyByEntity', () => {
    let entity;

    beforeEach(() => {
      entity = new Entity();
      entity.addComponent(new Transform());
      entity.addComponent(new RigidBody({ mass: 1 }));
      world.addEntity(entity);

      const entities = [entity];
      physicsSystem.update(0.016, entities);
    });

    it('should return body for given entity', () => {
      const body = physicsSystem.getBodyByEntity(entity);

      expect(body).toBeInstanceOf(CANNON.Body);
      expect(body.mass).toBe(1);
    });

    it('should return undefined for unknown entity', () => {
      const unknownEntity = new Entity();
      const body = physicsSystem.getBodyByEntity(unknownEntity);

      expect(body).toBeUndefined();
    });
  });

  describe('raycast', () => {
    let entity;

    beforeEach(() => {
      entity = new Entity();
      entity.addComponent(new Transform(new THREE.Vector3(0, 0, 0)));
      entity.addComponent(new RigidBody({
        mass: 0,
        type: 'static',
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
      }));
      world.addEntity(entity);

      const entities = [entity];
      physicsSystem.update(0.016, entities);
    });

    it('should detect raycast hit', () => {
      const from = new THREE.Vector3(0, 5, 0);
      const to = new THREE.Vector3(0, -5, 0);

      const result = physicsSystem.raycast(from, to);

      expect(result).not.toBeNull();
      expect(result.point).toBeDefined();
      expect(result.entity).toBe(entity);
    });

    it('should return null when no hit', () => {
      const from = new THREE.Vector3(10, 5, 0);
      const to = new THREE.Vector3(10, -5, 0);

      const result = physicsSystem.raycast(from, to);

      expect(result).toBeNull();
    });
  });

  describe('destroy', () => {
    let entity;

    beforeEach(() => {
      entity = new Entity();
      entity.addComponent(new Transform());
      entity.addComponent(new RigidBody({ mass: 1 }));
      world.addEntity(entity);

      const entities = [entity];
      physicsSystem.update(0.016, entities);
    });

    it('should remove all bodies from world', () => {
      expect(physicsSystem.world.bodies.length).toBe(1);

      physicsSystem.destroy();

      expect(physicsSystem.world.bodies.length).toBe(0);
    });

    it('should clear entity-body mappings', () => {
      expect(physicsSystem.entityBodyMap.size).toBe(1);
      expect(physicsSystem.bodyEntityMap.size).toBe(1);

      physicsSystem.destroy();

      expect(physicsSystem.entityBodyMap.size).toBe(0);
      expect(physicsSystem.bodyEntityMap.size).toBe(0);
    });
  });

  describe('Body synchronization', () => {
    it('should sync position from physics to transform', () => {
      const entity = new Entity();
      const transform = new Transform(new THREE.Vector3(0, 10, 0));
      entity.addComponent(transform);
      entity.addComponent(new RigidBody({ mass: 1 }));
      world.addEntity(entity);

      const entities = [entity];
      physicsSystem.update(0.016, entities);

      // Physics should pull the body down with gravity
      for (let i = 0; i < 60; i++) {
        physicsSystem.update(0.016, entities);
      }

      // After 1 second of falling, Y should be less than initial
      expect(transform.position.y).toBeLessThan(10);
    });

    it('should sync rotation from physics to transform', () => {
      const entity = new Entity();
      const transform = new Transform();
      const rigidBody = new RigidBody({ mass: 1 });
      entity.addComponent(transform);
      entity.addComponent(rigidBody);
      world.addEntity(entity);

      const entities = [entity];
      physicsSystem.update(0.016, entities);

      // Apply angular velocity
      rigidBody.setAngularVelocity(0, 5, 0);

      // Update physics
      for (let i = 0; i < 10; i++) {
        physicsSystem.update(0.016, entities);
      }

      // Rotation should have changed
      expect(transform.rotation.y).not.toBe(0);
    });
  });
});
