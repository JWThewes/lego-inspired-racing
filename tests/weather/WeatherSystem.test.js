import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeatherSystem } from '../../src/weather/WeatherSystem.js';
import { WeatherComponent } from '../../src/weather/WeatherComponent.js';
import { Entity } from '../../src/core/Entity.js';
import { World } from '../../src/core/World.js';
import * as THREE from 'three';

describe('WeatherSystem', () => {
  let system;
  let scene;
  let world;

  beforeEach(() => {
    scene = new THREE.Scene();
    world = new World();
    system = new WeatherSystem(scene);
    system.init(world);
  });

  it('should create with required components', () => {
    expect(system.requiredComponents).toContain('WeatherComponent');
    expect(system.priority).toBe(15);
  });

  it('should throw error if created without scene', () => {
    expect(() => new WeatherSystem()).toThrow('WeatherSystem requires a Three.js scene');
  });

  it('should initialize fog in scene', () => {
    expect(scene.fog).toBeDefined();
    expect(scene.fog).toBeInstanceOf(THREE.Fog);
  });

  it('should initialize particle system', () => {
    expect(system.particleSystem).toBeDefined();
    expect(system.particleGeometry).toBeDefined();
    expect(system.particleMaterial).toBeDefined();
  });

  it('should create particle system with correct buffer attributes', () => {
    const positionAttr = system.particleGeometry.getAttribute('position');
    const velocityAttr = system.particleGeometry.getAttribute('velocity');

    expect(positionAttr).toBeDefined();
    expect(velocityAttr).toBeDefined();
    expect(positionAttr.count).toBe(system.maxParticles);
    expect(velocityAttr.count).toBe(system.maxParticles);
  });

  it('should add particle system to scene', () => {
    expect(scene.children).toContain(system.particleSystem);
  });

  it('should start with particles hidden', () => {
    expect(system.particleSystem.visible).toBe(false);
  });

  it('should update weather timing', () => {
    const entity = new Entity();
    const weather = new WeatherComponent();
    entity.addComponent(weather);

    system.update(1.0, [entity]);

    expect(weather.timeSinceWeatherChange).toBe(1.0);
  });

  it('should schedule next weather change after triggering', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('clear');
    weather.autoWeatherChanges = true;
    weather.nextWeatherChangeIn = 1.0; // Set short interval
    entity.addComponent(weather);

    // Update multiple times until weather changes
    let attempts = 0;
    while (!weather.isTransitioning && attempts < 20) {
      system.update(0.1, [entity]);
      attempts++;
    }

    // After enough time, automatic weather change should have triggered
    expect(weather.timeSinceWeatherChange).toBeGreaterThan(0);
    // The next weather change interval should be set to a new value
    expect(weather.nextWeatherChangeIn).toBeGreaterThanOrEqual(weather.minWeatherDuration);
    expect(weather.nextWeatherChangeIn).toBeLessThanOrEqual(weather.maxWeatherDuration);
  });

  it('should not trigger automatic weather change when disabled', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('clear');
    weather.autoWeatherChanges = false;
    weather.nextWeatherChangeIn = 5.0;
    entity.addComponent(weather);

    system.update(5.0, [entity]);

    expect(weather.isTransitioning).toBe(false);
  });

  it('should update transition progress', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('clear');
    weather.startTransition('rain', 2.0);
    entity.addComponent(weather);

    system.update(1.0, [entity]);

    expect(weather.transitionProgress).toBe(0.5);
  });

  it('should apply fog effects for clear weather', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('clear');
    entity.addComponent(weather);

    system.update(0.1, [entity]);

    // Clear weather should have fog pushed very far away
    expect(scene.fog.near).toBeGreaterThan(100);
    expect(scene.fog.far).toBeGreaterThan(100);
  });

  it('should apply fog effects for foggy weather', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('fog');
    entity.addComponent(weather);

    system.update(0.1, [entity]);

    // Fog should be active with reasonable near/far values
    expect(scene.fog.density).toBeGreaterThan(0);
    expect(scene.fog.far).toBeLessThan(2000); // Fog far = 100/density = 100/0.08 = 1250
    expect(scene.fog.far).toBeGreaterThan(100); // Should be closer than clear weather
  });

  it('should show particles for rain weather', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('rain');
    entity.addComponent(weather);

    system.update(0.1, [entity]);

    expect(system.particleSystem.visible).toBe(true);
  });

  it('should hide particles for clear weather', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('clear');
    entity.addComponent(weather);

    system.update(0.1, [entity]);

    expect(system.particleSystem.visible).toBe(false);
  });

  it('should update particle material size', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('snow');
    entity.addComponent(weather);

    const initialSize = system.particleMaterial.size;
    system.update(0.1, [entity]);

    expect(system.particleMaterial.size).toBeGreaterThan(0);
  });

  it('should update camera position', () => {
    const newPosition = new THREE.Vector3(10, 20, 30);
    system.setCameraPosition(newPosition);

    expect(system.cameraPosition.x).toBe(10);
    expect(system.cameraPosition.y).toBe(20);
    expect(system.cameraPosition.z).toBe(30);
  });

  it('should clean up resources on destroy', () => {
    const particleSystem = system.particleSystem;
    const geometry = system.particleGeometry;
    const material = system.particleMaterial;

    const geometryDisposeSpy = vi.spyOn(geometry, 'dispose');
    const materialDisposeSpy = vi.spyOn(material, 'dispose');

    system.destroy();

    expect(geometryDisposeSpy).toHaveBeenCalled();
    expect(materialDisposeSpy).toHaveBeenCalled();
    expect(scene.children).not.toContain(particleSystem);
    expect(system.particleSystem).toBeNull();
  });

  it('should handle multiple entities with weather components', () => {
    const entity1 = new Entity();
    const weather1 = new WeatherComponent('clear');
    entity1.addComponent(weather1);

    const entity2 = new Entity();
    const weather2 = new WeatherComponent('rain');
    entity2.addComponent(weather2);

    system.update(0.1, [entity1, entity2]);

    expect(weather1.timeSinceWeatherChange).toBeGreaterThan(0);
    expect(weather2.timeSinceWeatherChange).toBeGreaterThan(0);
  });

  it('should interpolate fog during transitions', () => {
    const entity = new Entity();
    const weather = new WeatherComponent('clear');
    weather.startTransition('fog', 2.0);
    entity.addComponent(weather);

    // At 50% transition
    system.update(1.0, [entity]);

    // Fog density should be between clear (0) and fog (0.08)
    expect(scene.fog.density).toBeGreaterThan(0);
    expect(scene.fog.density).toBeLessThan(0.08);
  });

  it('should extend System base class', () => {
    expect(system.constructor.name).toBe('WeatherSystem');
    expect(system.matchesEntity).toBeDefined();
    expect(system.update).toBeDefined();
  });
});
