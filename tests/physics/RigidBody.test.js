import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RigidBody } from '../../src/physics/RigidBody.js';
import * as CANNON from 'cannon-es';

describe('RigidBody Component', () => {
  let rigidBody;

  beforeEach(() => {
    rigidBody = new RigidBody();
  });

  describe('Constructor', () => {
    it('should create with default properties', () => {
      expect(rigidBody.mass).toBe(1);
      expect(rigidBody.type).toBe('dynamic');
      expect(rigidBody.linearDamping).toBe(0.01);
      expect(rigidBody.angularDamping).toBe(0.01);
      expect(rigidBody.fixedRotation).toBe(false);
      expect(rigidBody.body).toBeNull();
    });

    it('should create with custom mass', () => {
      const customRigidBody = new RigidBody({ mass: 10 });
      expect(customRigidBody.mass).toBe(10);
    });

    it('should create static body with mass 0', () => {
      const staticBody = new RigidBody({ mass: 0, type: 'static' });
      expect(staticBody.mass).toBe(0);
      expect(staticBody.type).toBe('static');
    });

    it('should create with custom shape', () => {
      const customShape = new CANNON.Sphere(1);
      const customRigidBody = new RigidBody({ shape: customShape });
      expect(customRigidBody.shape).toBe(customShape);
    });

    it('should create with custom damping', () => {
      const customRigidBody = new RigidBody({
        linearDamping: 0.5,
        angularDamping: 0.3
      });
      expect(customRigidBody.linearDamping).toBe(0.5);
      expect(customRigidBody.angularDamping).toBe(0.3);
    });

    it('should create with fixed rotation', () => {
      const customRigidBody = new RigidBody({ fixedRotation: true });
      expect(customRigidBody.fixedRotation).toBe(true);
    });

    it('should create with collision filtering', () => {
      const customRigidBody = new RigidBody({
        collisionFilterGroup: 2,
        collisionFilterMask: 4
      });
      expect(customRigidBody.collisionFilterGroup).toBe(2);
      expect(customRigidBody.collisionFilterMask).toBe(4);
    });
  });

  describe('createBody', () => {
    it('should create Cannon.js body with correct properties', () => {
      const position = new CANNON.Vec3(1, 2, 3);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);

      const body = rigidBody.createBody(position, quaternion);

      expect(body).toBeInstanceOf(CANNON.Body);
      expect(body.mass).toBe(1);
      expect(body.position.x).toBe(1);
      expect(body.position.y).toBe(2);
      expect(body.position.z).toBe(3);
    });

    it('should create static body type', () => {
      const staticRigidBody = new RigidBody({ mass: 0, type: 'static' });
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);

      const body = staticRigidBody.createBody(position, quaternion);

      expect(body.type).toBe(CANNON.Body.STATIC);
    });

    it('should create kinematic body type', () => {
      const kinematicRigidBody = new RigidBody({ type: 'kinematic' });
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);

      const body = kinematicRigidBody.createBody(position, quaternion);

      expect(body.type).toBe(CANNON.Body.KINEMATIC);
    });

    it('should create dynamic body type', () => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);

      const body = rigidBody.createBody(position, quaternion);

      expect(body.type).toBe(CANNON.Body.DYNAMIC);
    });

    it('should store reference to created body', () => {
      const position = new CANNON.Vec3(1, 2, 3);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);

      rigidBody.createBody(position, quaternion);

      expect(rigidBody.body).not.toBeNull();
      expect(rigidBody.body).toBeInstanceOf(CANNON.Body);
    });
  });

  describe('applyForce', () => {
    beforeEach(() => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);
      rigidBody.createBody(position, quaternion);
    });

    it('should apply force to body', () => {
      const force = new CANNON.Vec3(10, 0, 0);
      const spy = vi.spyOn(rigidBody.body, 'applyForce');

      rigidBody.applyForce(force);

      expect(spy).toHaveBeenCalledWith(force, undefined);
    });

    it('should apply force at world point', () => {
      const force = new CANNON.Vec3(10, 0, 0);
      const worldPoint = new CANNON.Vec3(1, 1, 1);
      const spy = vi.spyOn(rigidBody.body, 'applyForce');

      rigidBody.applyForce(force, worldPoint);

      expect(spy).toHaveBeenCalledWith(force, worldPoint);
    });
  });

  describe('applyImpulse', () => {
    beforeEach(() => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);
      rigidBody.createBody(position, quaternion);
    });

    it('should apply impulse to body', () => {
      const impulse = new CANNON.Vec3(5, 0, 0);
      const spy = vi.spyOn(rigidBody.body, 'applyImpulse');

      rigidBody.applyImpulse(impulse);

      expect(spy).toHaveBeenCalledWith(impulse, undefined);
    });

    it('should apply impulse at world point', () => {
      const impulse = new CANNON.Vec3(5, 0, 0);
      const worldPoint = new CANNON.Vec3(1, 1, 1);
      const spy = vi.spyOn(rigidBody.body, 'applyImpulse');

      rigidBody.applyImpulse(impulse, worldPoint);

      expect(spy).toHaveBeenCalledWith(impulse, worldPoint);
    });
  });

  describe('setVelocity', () => {
    beforeEach(() => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);
      rigidBody.createBody(position, quaternion);
    });

    it('should set linear velocity', () => {
      rigidBody.setVelocity(10, 5, 2);

      expect(rigidBody.body.velocity.x).toBe(10);
      expect(rigidBody.body.velocity.y).toBe(5);
      expect(rigidBody.body.velocity.z).toBe(2);
    });
  });

  describe('setAngularVelocity', () => {
    beforeEach(() => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);
      rigidBody.createBody(position, quaternion);
    });

    it('should set angular velocity', () => {
      rigidBody.setAngularVelocity(1, 2, 3);

      expect(rigidBody.body.angularVelocity.x).toBe(1);
      expect(rigidBody.body.angularVelocity.y).toBe(2);
      expect(rigidBody.body.angularVelocity.z).toBe(3);
    });
  });

  describe('getVelocity', () => {
    it('should return null when no body exists', () => {
      expect(rigidBody.getVelocity()).toBeNull();
    });

    it('should return velocity when body exists', () => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);
      rigidBody.createBody(position, quaternion);
      rigidBody.setVelocity(5, 10, 15);

      const velocity = rigidBody.getVelocity();

      expect(velocity.x).toBe(5);
      expect(velocity.y).toBe(10);
      expect(velocity.z).toBe(15);
    });
  });

  describe('getAngularVelocity', () => {
    it('should return null when no body exists', () => {
      expect(rigidBody.getAngularVelocity()).toBeNull();
    });

    it('should return angular velocity when body exists', () => {
      const position = new CANNON.Vec3(0, 0, 0);
      const quaternion = new CANNON.Quaternion(0, 0, 0, 1);
      rigidBody.createBody(position, quaternion);
      rigidBody.setAngularVelocity(1, 2, 3);

      const angularVelocity = rigidBody.getAngularVelocity();

      expect(angularVelocity.x).toBe(1);
      expect(angularVelocity.y).toBe(2);
      expect(angularVelocity.z).toBe(3);
    });
  });

  describe('Collision callbacks', () => {
    it('should allow setting collision start callback', () => {
      const callback = vi.fn();
      rigidBody.onCollisionStart = callback;

      expect(rigidBody.onCollisionStart).toBe(callback);
    });

    it('should allow setting collision end callback', () => {
      const callback = vi.fn();
      rigidBody.onCollisionEnd = callback;

      expect(rigidBody.onCollisionEnd).toBe(callback);
    });
  });
});
