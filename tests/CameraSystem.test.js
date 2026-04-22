import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CameraSystem } from '../src/systems/CameraSystem.js';
import { RenderSystem } from '../src/systems/RenderSystem.js';
import { World } from '../src/core/World.js';
import { Entity } from '../src/core/Entity.js';
import { CameraComponent } from '../src/components/CameraComponent.js';
import { TransformComponent } from '../src/components/TransformComponent.js';
import * as THREE from 'three';

describe('CameraSystem', () => {
  let cameraSystem;
  let world;
  let mockCanvas;

  beforeEach(() => {
    // Mock window
    global.window = {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    mockCanvas = { getContext: vi.fn() };

    world = new World();
    cameraSystem = new CameraSystem();
    cameraSystem.init(world);
  });

  it('should have correct priority', () => {
    expect(cameraSystem.priority).toBe(900);
  });

  it('should have required components', () => {
    expect(cameraSystem.requiredComponents).toEqual([
      'CameraComponent',
      'TransformComponent'
    ]);
  });

  it('should create camera for entity', () => {
    const entity = new Entity();
    const cameraComp = new CameraComponent();
    const transform = new TransformComponent();

    entity.addComponent(cameraComp);
    entity.addComponent(transform);

    expect(cameraComp.camera).toBeNull();

    cameraSystem.update(0.016, [entity]);

    expect(cameraComp.camera).toBeInstanceOf(THREE.PerspectiveCamera);
  });

  it('should set active camera', () => {
    const entity = new Entity();
    const cameraComp = new CameraComponent();
    const transform = new TransformComponent();

    entity.addComponent(cameraComp);
    entity.addComponent(transform);

    cameraSystem.update(0.016, [entity]);

    expect(cameraComp.isActive).toBe(true);
    expect(cameraSystem.activeCamera).toBe(cameraComp.camera);
  });

  it('should update camera position without target', () => {
    const entity = new Entity();
    const cameraComp = new CameraComponent();
    const transform = new TransformComponent();
    transform.setPosition(10, 20, 30);

    entity.addComponent(cameraComp);
    entity.addComponent(transform);

    cameraSystem.update(0.016, [entity]);

    expect(cameraComp.camera.position.x).toBe(10);
    expect(cameraComp.camera.position.y).toBe(20);
    expect(cameraComp.camera.position.z).toBe(30);
  });

  it('should follow target entity', () => {
    // Create camera entity
    const cameraEntity = new Entity();
    const cameraComp = new CameraComponent();
    const cameraTransform = new TransformComponent();
    cameraEntity.addComponent(cameraComp);
    cameraEntity.addComponent(cameraTransform);

    // Create target entity
    const targetEntity = new Entity();
    const targetTransform = new TransformComponent();
    targetTransform.setPosition(0, 0, 0);
    targetEntity.addComponent(targetTransform);

    // Set target
    cameraComp.setTarget(targetEntity);

    // Update camera system
    cameraSystem.update(0.016, [cameraEntity]);

    // Camera should be behind and above target
    expect(cameraComp.camera.position.z).toBeGreaterThan(0);
    expect(cameraComp.camera.position.y).toBeGreaterThan(0);
  });

  it('should smooth camera movement', () => {
    // Create camera entity
    const cameraEntity = new Entity();
    const cameraComp = new CameraComponent({
      positionSmoothing: 0.5 // Higher = slower
    });
    const cameraTransform = new TransformComponent();
    cameraEntity.addComponent(cameraComp);
    cameraEntity.addComponent(cameraTransform);

    // Create target entity
    const targetEntity = new Entity();
    const targetTransform = new TransformComponent();
    targetTransform.setPosition(0, 0, 0);
    targetEntity.addComponent(targetTransform);

    // Set target
    cameraComp.setTarget(targetEntity);

    // First update
    cameraSystem.update(0.016, [cameraEntity]);
    const pos1 = cameraComp.camera.position.clone();

    // Move target
    targetTransform.setPosition(100, 0, 0);

    // Second update - camera should move but not instantly
    cameraSystem.update(0.016, [cameraEntity]);
    const pos2 = cameraComp.camera.position.clone();

    // Camera should have moved
    expect(pos2.x).toBeGreaterThan(pos1.x);

    // But not all the way to target + offset
    expect(pos2.x).toBeLessThan(100);
  });

  it('should switch active camera', () => {
    // Create first camera
    const camera1Entity = new Entity();
    const camera1Comp = new CameraComponent();
    const camera1Transform = new TransformComponent();
    camera1Entity.addComponent(camera1Comp);
    camera1Entity.addComponent(camera1Transform);

    // Create second camera
    const camera2Entity = new Entity();
    const camera2Comp = new CameraComponent({ isActive: false });
    const camera2Transform = new TransformComponent();
    camera2Entity.addComponent(camera2Comp);
    camera2Entity.addComponent(camera2Transform);

    // Update both
    cameraSystem.update(0.016, [camera1Entity, camera2Entity]);

    expect(camera1Comp.isActive).toBe(true);
    expect(camera2Comp.isActive).toBe(false);
    expect(cameraSystem.activeCamera).toBe(camera1Comp.camera);

    // Switch to camera 2
    cameraSystem.setActiveCamera(camera2Entity);

    expect(camera1Comp.isActive).toBe(false);
    expect(camera2Comp.isActive).toBe(true);
    expect(cameraSystem.activeCamera).toBe(camera2Comp.camera);
  });

  it('should notify render system of active camera', () => {
    const renderSystem = new RenderSystem(mockCanvas);
    world.addSystem(renderSystem);
    world.addSystem(cameraSystem);

    const setActiveCameraSpy = vi.spyOn(renderSystem, 'setActiveCamera');

    const entity = new Entity();
    const cameraComp = new CameraComponent();
    const transform = new TransformComponent();
    entity.addComponent(cameraComp);
    entity.addComponent(transform);

    cameraSystem.update(0.016, [entity]);

    expect(setActiveCameraSpy).toHaveBeenCalledWith(cameraComp.camera);
  });

  it('should get active camera', () => {
    const entity = new Entity();
    const cameraComp = new CameraComponent();
    const transform = new TransformComponent();
    entity.addComponent(cameraComp);
    entity.addComponent(transform);

    cameraSystem.update(0.016, [entity]);

    expect(cameraSystem.getActiveCamera()).toBe(cameraComp.camera);
  });

  it('should handle target without transform', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const cameraEntity = new Entity();
    const cameraComp = new CameraComponent();
    const cameraTransform = new TransformComponent();
    cameraEntity.addComponent(cameraComp);
    cameraEntity.addComponent(cameraTransform);

    const targetEntity = new Entity(); // No transform
    cameraComp.setTarget(targetEntity);

    expect(() => {
      cameraSystem.update(0.016, [cameraEntity]);
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Camera target has no TransformComponent')
    );

    consoleSpy.mockRestore();
  });

  it('should clean up on destroy', () => {
    const entity = new Entity();
    const cameraComp = new CameraComponent();
    const transform = new TransformComponent();
    entity.addComponent(cameraComp);
    entity.addComponent(transform);

    cameraSystem.update(0.016, [entity]);

    expect(cameraSystem.cameras.size).toBeGreaterThan(0);

    cameraSystem.destroy();

    expect(cameraSystem.cameras.size).toBe(0);
    expect(cameraSystem.activeCamera).toBeNull();
  });
});
