import { describe, it, expect, beforeEach } from 'vitest';
import { TransformComponent } from '../src/components/TransformComponent.js';
import * as THREE from 'three';

describe('TransformComponent', () => {
  let transform;

  beforeEach(() => {
    transform = new TransformComponent();
  });

  it('should create with default values', () => {
    expect(transform.position).toBeInstanceOf(THREE.Vector3);
    expect(transform.rotation).toBeInstanceOf(THREE.Euler);
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
    transform = new TransformComponent(pos);

    expect(transform.position.x).toBe(10);
    expect(transform.position.y).toBe(20);
    expect(transform.position.z).toBe(30);
  });

  it('should create with custom rotation', () => {
    const pos = new THREE.Vector3();
    const rot = new THREE.Euler(Math.PI / 2, Math.PI, 0);
    transform = new TransformComponent(pos, rot);

    expect(transform.rotation.x).toBeCloseTo(Math.PI / 2);
    expect(transform.rotation.y).toBeCloseTo(Math.PI);
    expect(transform.rotation.z).toBe(0);
  });

  it('should create with custom scale', () => {
    const pos = new THREE.Vector3();
    const rot = new THREE.Euler();
    const scale = new THREE.Vector3(2, 3, 4);
    transform = new TransformComponent(pos, rot, scale);

    expect(transform.scale.x).toBe(2);
    expect(transform.scale.y).toBe(3);
    expect(transform.scale.z).toBe(4);
  });

  it('should set position', () => {
    transform.setPosition(5, 10, 15);

    expect(transform.position.x).toBe(5);
    expect(transform.position.y).toBe(10);
    expect(transform.position.z).toBe(15);
  });

  it('should set rotation', () => {
    transform.setRotation(0.5, 1.0, 1.5);

    expect(transform.rotation.x).toBe(0.5);
    expect(transform.rotation.y).toBe(1.0);
    expect(transform.rotation.z).toBe(1.5);
  });

  it('should set scale', () => {
    transform.setScale(2, 3, 4);

    expect(transform.scale.x).toBe(2);
    expect(transform.scale.y).toBe(3);
    expect(transform.scale.z).toBe(4);
  });

  it('should clone transform', () => {
    transform.setPosition(10, 20, 30);
    transform.setRotation(1, 2, 3);
    transform.setScale(2, 3, 4);

    const cloned = transform.clone();

    expect(cloned).not.toBe(transform);
    expect(cloned.position).not.toBe(transform.position);
    expect(cloned.rotation).not.toBe(transform.rotation);
    expect(cloned.scale).not.toBe(transform.scale);

    expect(cloned.position.x).toBe(10);
    expect(cloned.position.y).toBe(20);
    expect(cloned.position.z).toBe(30);

    expect(cloned.rotation.x).toBe(1);
    expect(cloned.rotation.y).toBe(2);
    expect(cloned.rotation.z).toBe(3);

    expect(cloned.scale.x).toBe(2);
    expect(cloned.scale.y).toBe(3);
    expect(cloned.scale.z).toBe(4);
  });

  it('should not share vectors with constructor arguments', () => {
    const pos = new THREE.Vector3(1, 2, 3);
    transform = new TransformComponent(pos);

    pos.x = 100;

    expect(transform.position.x).toBe(1); // Should still be original value
  });
});
