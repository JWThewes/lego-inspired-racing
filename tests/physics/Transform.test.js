import { describe, it, expect, beforeEach } from 'vitest';
import { Transform } from '../../src/physics/Transform.js';
import * as THREE from 'three';

describe('Transform Component', () => {
  let transform;

  beforeEach(() => {
    transform = new Transform();
  });

  describe('Constructor', () => {
    it('should create with default position, rotation, and scale', () => {
      expect(transform.position).toBeInstanceOf(THREE.Vector3);
      expect(transform.rotation).toBeInstanceOf(THREE.Quaternion);
      expect(transform.scale).toBeInstanceOf(THREE.Vector3);

      expect(transform.position.x).toBe(0);
      expect(transform.position.y).toBe(0);
      expect(transform.position.z).toBe(0);

      expect(transform.scale.x).toBe(1);
      expect(transform.scale.y).toBe(1);
      expect(transform.scale.z).toBe(1);
    });

    it('should create with custom position', () => {
      const pos = new THREE.Vector3(10, 20, 30);
      const customTransform = new Transform(pos);

      expect(customTransform.position.x).toBe(10);
      expect(customTransform.position.y).toBe(20);
      expect(customTransform.position.z).toBe(30);
    });

    it('should create with custom rotation', () => {
      const pos = new THREE.Vector3();
      const rot = new THREE.Quaternion(0, 0.707, 0, 0.707);
      const customTransform = new Transform(pos, rot);

      expect(customTransform.rotation.x).toBeCloseTo(0);
      expect(customTransform.rotation.y).toBeCloseTo(0.707, 2);
      expect(customTransform.rotation.z).toBeCloseTo(0);
      expect(customTransform.rotation.w).toBeCloseTo(0.707, 2);
    });

    it('should create with custom scale', () => {
      const pos = new THREE.Vector3();
      const rot = new THREE.Quaternion();
      const scale = new THREE.Vector3(2, 3, 4);
      const customTransform = new Transform(pos, rot, scale);

      expect(customTransform.scale.x).toBe(2);
      expect(customTransform.scale.y).toBe(3);
      expect(customTransform.scale.z).toBe(4);
    });

    it('should initialize previous transform values', () => {
      const pos = new THREE.Vector3(5, 10, 15);
      const customTransform = new Transform(pos);

      expect(customTransform.prevPosition.x).toBe(5);
      expect(customTransform.prevPosition.y).toBe(10);
      expect(customTransform.prevPosition.z).toBe(15);
    });
  });

  describe('setPosition', () => {
    it('should set position from Vector3', () => {
      const pos = new THREE.Vector3(1, 2, 3);
      transform.setPosition(pos);

      expect(transform.position.x).toBe(1);
      expect(transform.position.y).toBe(2);
      expect(transform.position.z).toBe(3);
    });

    it('should set position from x, y, z coordinates', () => {
      transform.setPosition(5, 10, 15);

      expect(transform.position.x).toBe(5);
      expect(transform.position.y).toBe(10);
      expect(transform.position.z).toBe(15);
    });
  });

  describe('setRotation', () => {
    it('should set rotation from Quaternion', () => {
      const quat = new THREE.Quaternion(0, 0.707, 0, 0.707);
      transform.setRotation(quat);

      expect(transform.rotation.x).toBeCloseTo(0);
      expect(transform.rotation.y).toBeCloseTo(0.707, 2);
      expect(transform.rotation.z).toBeCloseTo(0);
      expect(transform.rotation.w).toBeCloseTo(0.707, 2);
    });

    it('should set rotation from Euler angles', () => {
      const euler = new THREE.Euler(Math.PI / 2, 0, 0);
      transform.setRotation(euler);

      expect(transform.rotation.x).toBeCloseTo(0.707, 2);
      expect(transform.rotation.w).toBeCloseTo(0.707, 2);
    });

    it('should set rotation from x, y, z angles', () => {
      transform.setRotation(Math.PI / 2, 0, 0);

      expect(transform.rotation.x).toBeCloseTo(0.707, 2);
      expect(transform.rotation.w).toBeCloseTo(0.707, 2);
    });
  });

  describe('setScale', () => {
    it('should set scale from Vector3', () => {
      const scale = new THREE.Vector3(2, 3, 4);
      transform.setScale(scale);

      expect(transform.scale.x).toBe(2);
      expect(transform.scale.y).toBe(3);
      expect(transform.scale.z).toBe(4);
    });

    it('should set uniform scale', () => {
      transform.setScale(2.5);

      expect(transform.scale.x).toBe(2.5);
      expect(transform.scale.y).toBe(2.5);
      expect(transform.scale.z).toBe(2.5);
    });

    it('should set scale from x, y, z values', () => {
      transform.setScale(1, 2, 3);

      expect(transform.scale.x).toBe(1);
      expect(transform.scale.y).toBe(2);
      expect(transform.scale.z).toBe(3);
    });
  });

  describe('storePrevious', () => {
    it('should store current transform as previous', () => {
      transform.setPosition(10, 20, 30);
      transform.storePrevious();

      expect(transform.prevPosition.x).toBe(10);
      expect(transform.prevPosition.y).toBe(20);
      expect(transform.prevPosition.z).toBe(30);
    });

    it('should preserve rotation in previous', () => {
      const quat = new THREE.Quaternion(0, 0.707, 0, 0.707);
      transform.setRotation(quat);
      transform.storePrevious();

      expect(transform.prevRotation.x).toBeCloseTo(0);
      expect(transform.prevRotation.y).toBeCloseTo(0.707, 2);
    });
  });

  describe('getInterpolatedPosition', () => {
    it('should interpolate between previous and current position', () => {
      transform.setPosition(0, 0, 0);
      transform.storePrevious();
      transform.setPosition(10, 10, 10);

      const interpolated = transform.getInterpolatedPosition(0.5);

      expect(interpolated.x).toBeCloseTo(5);
      expect(interpolated.y).toBeCloseTo(5);
      expect(interpolated.z).toBeCloseTo(5);
    });

    it('should return previous position at alpha=0', () => {
      transform.setPosition(0, 0, 0);
      transform.storePrevious();
      transform.setPosition(10, 10, 10);

      const interpolated = transform.getInterpolatedPosition(0);

      expect(interpolated.x).toBeCloseTo(0);
      expect(interpolated.y).toBeCloseTo(0);
      expect(interpolated.z).toBeCloseTo(0);
    });

    it('should return current position at alpha=1', () => {
      transform.setPosition(0, 0, 0);
      transform.storePrevious();
      transform.setPosition(10, 10, 10);

      const interpolated = transform.getInterpolatedPosition(1);

      expect(interpolated.x).toBeCloseTo(10);
      expect(interpolated.y).toBeCloseTo(10);
      expect(interpolated.z).toBeCloseTo(10);
    });
  });

  describe('getInterpolatedRotation', () => {
    it('should interpolate between previous and current rotation', () => {
      const quat1 = new THREE.Quaternion(0, 0, 0, 1);
      const quat2 = new THREE.Quaternion(0, 0.707, 0, 0.707);

      transform.setRotation(quat1);
      transform.storePrevious();
      transform.setRotation(quat2);

      const interpolated = transform.getInterpolatedRotation(0.5);

      expect(interpolated).toBeInstanceOf(THREE.Quaternion);
      // Should be somewhere between the two rotations
      expect(interpolated.y).toBeGreaterThan(0);
      expect(interpolated.y).toBeLessThan(0.707);
    });

    it('should return previous rotation at alpha=0', () => {
      const quat1 = new THREE.Quaternion(0, 0, 0, 1);
      const quat2 = new THREE.Quaternion(0, 0.707, 0, 0.707);

      transform.setRotation(quat1);
      transform.storePrevious();
      transform.setRotation(quat2);

      const interpolated = transform.getInterpolatedRotation(0);

      expect(interpolated.x).toBeCloseTo(0);
      expect(interpolated.y).toBeCloseTo(0);
      expect(interpolated.z).toBeCloseTo(0);
      expect(interpolated.w).toBeCloseTo(1);
    });

    it('should return current rotation at alpha=1', () => {
      const quat1 = new THREE.Quaternion(0, 0, 0, 1);
      const quat2 = new THREE.Quaternion(0, 0.707, 0, 0.707);

      transform.setRotation(quat1);
      transform.storePrevious();
      transform.setRotation(quat2);

      const interpolated = transform.getInterpolatedRotation(1);

      expect(interpolated.x).toBeCloseTo(0);
      expect(interpolated.y).toBeCloseTo(0.707, 2);
      expect(interpolated.z).toBeCloseTo(0);
      expect(interpolated.w).toBeCloseTo(0.707, 2);
    });
  });
});
