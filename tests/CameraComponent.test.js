import { describe, it, expect, beforeEach } from 'vitest';
import { CameraComponent } from '../src/components/CameraComponent.js';
import { Entity } from '../src/core/Entity.js';
import * as THREE from 'three';

describe('CameraComponent', () => {
  let cameraComp;

  beforeEach(() => {
    cameraComp = new CameraComponent();
  });

  it('should create with default values', () => {
    expect(cameraComp.type).toBe('perspective');
    expect(cameraComp.fov).toBe(75);
    expect(cameraComp.near).toBe(0.1);
    expect(cameraComp.far).toBe(1000);
    expect(cameraComp.followDistance).toBe(10);
    expect(cameraComp.followHeight).toBe(5);
    expect(cameraComp.lookAheadDistance).toBe(2);
    expect(cameraComp.positionSmoothing).toBe(0.1);
    expect(cameraComp.rotationSmoothing).toBe(0.15);
    expect(cameraComp.camera).toBeNull();
    expect(cameraComp.target).toBeNull();
    expect(cameraComp.isActive).toBe(true);
  });

  it('should create with custom config', () => {
    cameraComp = new CameraComponent({
      fov: 90,
      near: 1,
      far: 500,
      followDistance: 15,
      followHeight: 8,
      lookAheadDistance: 5,
      positionSmoothing: 0.2,
      rotationSmoothing: 0.3,
      isActive: false
    });

    expect(cameraComp.fov).toBe(90);
    expect(cameraComp.near).toBe(1);
    expect(cameraComp.far).toBe(500);
    expect(cameraComp.followDistance).toBe(15);
    expect(cameraComp.followHeight).toBe(8);
    expect(cameraComp.lookAheadDistance).toBe(5);
    expect(cameraComp.positionSmoothing).toBe(0.2);
    expect(cameraComp.rotationSmoothing).toBe(0.3);
    expect(cameraComp.isActive).toBe(false);
  });

  it('should set target entity', () => {
    const entity = new Entity();
    cameraComp.setTarget(entity);

    expect(cameraComp.target).toBe(entity);
  });

  it('should create perspective camera', () => {
    const camera = cameraComp.createCamera();

    expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
    expect(cameraComp.camera).toBe(camera);
    expect(camera.fov).toBe(75);
    expect(camera.near).toBe(0.1);
    expect(camera.far).toBe(1000);
  });

  it('should create camera with custom settings', () => {
    cameraComp = new CameraComponent({
      fov: 60,
      near: 0.5,
      far: 2000
    });

    const camera = cameraComp.createCamera();

    expect(camera.fov).toBe(60);
    expect(camera.near).toBe(0.5);
    expect(camera.far).toBe(2000);
  });

  it('should update aspect ratio', () => {
    cameraComp.createCamera();

    cameraComp.updateAspect(16 / 9);

    expect(cameraComp.aspect).toBe(16 / 9);
    expect(cameraComp.camera.aspect).toBe(16 / 9);
  });

  it('should handle aspect update without camera', () => {
    expect(() => {
      cameraComp.updateAspect(16 / 9);
    }).not.toThrow();

    expect(cameraComp.aspect).toBe(16 / 9);
  });

  it('should warn about orthographic camera', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    cameraComp = new CameraComponent({ type: 'orthographic' });
    const camera = cameraComp.createCamera();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Orthographic camera not implemented')
    );
    expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);

    consoleSpy.mockRestore();
  });
});
