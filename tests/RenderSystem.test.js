import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RenderSystem } from '../src/systems/RenderSystem.js';
import { World } from '../src/core/World.js';
import { Entity } from '../src/core/Entity.js';
import { TransformComponent } from '../src/components/TransformComponent.js';
import { MeshComponent } from '../src/components/MeshComponent.js';
import * as THREE from 'three';

describe('RenderSystem', () => {
  let renderSystem;
  let world;
  let mockCanvas;
  let originalWindow;

  beforeEach(() => {
    // Mock canvas element
    mockCanvas = {
      getContext: vi.fn()
    };

    // Mock window dimensions
    originalWindow = global.window;
    global.window = {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 2,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    world = new World();
    renderSystem = new RenderSystem(mockCanvas);
    renderSystem.init(world);
  });

  afterEach(() => {
    renderSystem.destroy();
    global.window = originalWindow;
  });

  it('should initialize with scene and renderer', () => {
    expect(renderSystem.scene).toBeInstanceOf(THREE.Scene);
    expect(renderSystem.renderer).toBeInstanceOf(THREE.WebGLRenderer);
    expect(renderSystem.scene.background).toBeInstanceOf(THREE.Color);
  });

  it('should have correct priority', () => {
    expect(renderSystem.priority).toBe(1000);
  });

  it('should have required components', () => {
    expect(renderSystem.requiredComponents).toEqual([
      'TransformComponent',
      'MeshComponent'
    ]);
  });

  it('should sync entity transforms to meshes', () => {
    const entity = new Entity();
    const transform = new TransformComponent();
    transform.setPosition(10, 20, 30);
    transform.setRotation(0.5, 1.0, 1.5);
    transform.setScale(2, 3, 4);

    const mockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial()
    );
    const meshComp = new MeshComponent(mockMesh);

    entity.addComponent(transform);
    entity.addComponent(meshComp);

    renderSystem.update(0.016, [entity]);

    expect(mockMesh.position.x).toBe(10);
    expect(mockMesh.position.y).toBe(20);
    expect(mockMesh.position.z).toBe(30);

    expect(mockMesh.rotation.x).toBe(0.5);
    expect(mockMesh.rotation.y).toBe(1.0);
    expect(mockMesh.rotation.z).toBe(1.5);

    expect(mockMesh.scale.x).toBe(2);
    expect(mockMesh.scale.y).toBe(3);
    expect(mockMesh.scale.z).toBe(4);
  });

  it('should add mesh to scene', () => {
    const entity = new Entity();
    const transform = new TransformComponent();
    const mockMesh = new THREE.Mesh();
    const meshComp = new MeshComponent(mockMesh);

    entity.addComponent(transform);
    entity.addComponent(meshComp);

    expect(mockMesh.parent).toBeNull();

    renderSystem.update(0.016, [entity]);

    expect(mockMesh.parent).toBe(renderSystem.scene);
  });

  it('should not add mesh to scene if already added', () => {
    const entity = new Entity();
    const transform = new TransformComponent();
    const mockMesh = new THREE.Mesh();
    const meshComp = new MeshComponent(mockMesh);

    entity.addComponent(transform);
    entity.addComponent(meshComp);

    renderSystem.update(0.016, [entity]);
    const addSpy = vi.spyOn(renderSystem.scene, 'add');

    renderSystem.update(0.016, [entity]);

    expect(addSpy).not.toHaveBeenCalled();
  });

  it('should remove invisible meshes from scene', () => {
    const entity = new Entity();
    const transform = new TransformComponent();
    const mockMesh = new THREE.Mesh();
    const meshComp = new MeshComponent(mockMesh);

    entity.addComponent(transform);
    entity.addComponent(meshComp);

    renderSystem.update(0.016, [entity]);
    expect(mockMesh.parent).toBe(renderSystem.scene);

    meshComp.hide();
    renderSystem.update(0.016, [entity]);

    expect(mockMesh.parent).toBeNull();
  });

  it('should set active camera', () => {
    const camera = new THREE.PerspectiveCamera();
    renderSystem.setActiveCamera(camera);

    expect(renderSystem.activeCamera).toBe(camera);
  });

  it('should render with active camera', () => {
    const camera = new THREE.PerspectiveCamera();
    renderSystem.setActiveCamera(camera);

    const renderSpy = vi.spyOn(renderSystem.renderer, 'render');

    renderSystem.update(0.016, []);

    expect(renderSpy).toHaveBeenCalledWith(renderSystem.scene, camera);
  });

  it('should not render without active camera', () => {
    const renderSpy = vi.spyOn(renderSystem.renderer, 'render');

    renderSystem.update(0.016, []);

    expect(renderSpy).not.toHaveBeenCalled();
  });

  it('should track FPS', () => {
    const camera = new THREE.PerspectiveCamera();
    renderSystem.setActiveCamera(camera);

    expect(renderSystem.getFPS()).toBe(60);

    // Simulate 60 frames at ~16ms each
    for (let i = 0; i < 60; i++) {
      renderSystem.update(0.016, []);
    }

    // After 1 second, FPS should be calculated
    renderSystem.update(0.04, []); // Push over 1 second

    const fps = renderSystem.getFPS();
    expect(fps).toBeGreaterThan(0);
    expect(fps).toBeLessThanOrEqual(60);
  });

  it('should get scene', () => {
    expect(renderSystem.getScene()).toBe(renderSystem.scene);
  });

  it('should get renderer', () => {
    expect(renderSystem.getRenderer()).toBe(renderSystem.renderer);
  });

  it('should handle window resize', () => {
    const camera = new THREE.PerspectiveCamera(75, 1024 / 768);
    renderSystem.setActiveCamera(camera);

    // Trigger resize
    global.window.innerWidth = 1920;
    global.window.innerHeight = 1080;

    const resizeHandler = global.window.addEventListener.mock.calls.find(
      call => call[0] === 'resize'
    )?.[1];

    if (resizeHandler) {
      resizeHandler();

      expect(camera.aspect).toBe(1920 / 1080);
    }
  });

  it('should clean up on destroy', () => {
    const disposeSpy = vi.spyOn(renderSystem.renderer, 'dispose');
    const clearSpy = vi.spyOn(renderSystem.scene, 'clear');

    renderSystem.destroy();

    expect(disposeSpy).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });
});
