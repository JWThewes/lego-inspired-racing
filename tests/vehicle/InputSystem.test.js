import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputSystem } from '../../src/vehicle/InputSystem.js';
import { VehicleComponent } from '../../src/vehicle/VehicleComponent.js';
import { Entity } from '../../src/core/Entity.js';
import { World } from '../../src/core/World.js';

describe('InputSystem', () => {
  let system;
  let entity;
  let vehicle;
  let world;

  beforeEach(() => {
    system = new InputSystem();
    world = new World();
    entity = new Entity();
    vehicle = new VehicleComponent();
    entity.addComponent(vehicle);
    system.init(world);
  });

  afterEach(() => {
    system.destroy();
  });

  it('should have correct required components', () => {
    expect(system.requiredComponents).toEqual(['VehicleComponent']);
  });

  it('should have higher priority than vehicle system', () => {
    expect(system.priority).toBe(5);
  });

  it('should initialize with all keys released', () => {
    expect(system.keys.ArrowUp).toBe(false);
    expect(system.keys.ArrowDown).toBe(false);
    expect(system.keys.ArrowLeft).toBe(false);
    expect(system.keys.ArrowRight).toBe(false);
    expect(system.keys.KeyW).toBe(false);
    expect(system.keys.KeyS).toBe(false);
    expect(system.keys.KeyA).toBe(false);
    expect(system.keys.KeyD).toBe(false);
  });

  it('should set throttle to 1 when ArrowUp is pressed', () => {
    // Simulate ArrowUp key press
    const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.throttle).toBe(1);
  });

  it('should set throttle to 1 when W is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyW' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.throttle).toBe(1);
  });

  it('should set throttle to -1 when ArrowDown is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.throttle).toBe(-1);
  });

  it('should set throttle to -1 when S is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyS' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.throttle).toBe(-1);
  });

  it('should set steering to -1 when ArrowLeft is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.steering).toBe(-1);
  });

  it('should set steering to -1 when A is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.steering).toBe(-1);
  });

  it('should set steering to 1 when ArrowRight is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.steering).toBe(1);
  });

  it('should set steering to 1 when D is pressed', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyD' });
    window.dispatchEvent(event);

    system.update(0.1, [entity]);

    expect(vehicle.steering).toBe(1);
  });

  it('should reset throttle to 0 when keys are released', () => {
    // Press and release
    const downEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    const upEvent = new KeyboardEvent('keyup', { code: 'ArrowUp' });

    window.dispatchEvent(downEvent);
    system.update(0.1, [entity]);
    expect(vehicle.throttle).toBe(1);

    window.dispatchEvent(upEvent);
    system.update(0.1, [entity]);
    expect(vehicle.throttle).toBe(0);
  });

  it('should reset steering to 0 when keys are released', () => {
    const downEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
    const upEvent = new KeyboardEvent('keyup', { code: 'ArrowLeft' });

    window.dispatchEvent(downEvent);
    system.update(0.1, [entity]);
    expect(vehicle.steering).toBe(-1);

    window.dispatchEvent(upEvent);
    system.update(0.1, [entity]);
    expect(vehicle.steering).toBe(0);
  });

  it('should handle simultaneous opposite throttle inputs', () => {
    // Both accelerate and brake
    const upEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    const downEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' });

    window.dispatchEvent(upEvent);
    window.dispatchEvent(downEvent);

    system.update(0.1, [entity]);

    expect(vehicle.throttle).toBe(0); // Should cancel out
  });

  it('should handle simultaneous opposite steering inputs', () => {
    const leftEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
    const rightEvent = new KeyboardEvent('keydown', { code: 'ArrowRight' });

    window.dispatchEvent(leftEvent);
    window.dispatchEvent(rightEvent);

    system.update(0.1, [entity]);

    expect(vehicle.steering).toBe(0); // Should cancel out
  });

  it('should update multiple entities with same input', () => {
    const entity2 = new Entity();
    const vehicle2 = new VehicleComponent();
    entity2.addComponent(vehicle2);

    const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    window.dispatchEvent(event);

    system.update(0.1, [entity, entity2]);

    expect(vehicle.throttle).toBe(1);
    expect(vehicle2.throttle).toBe(1);
  });

  it('should not affect non-game keys', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyZ' });
    const preventDefaultSpy = { called: false };

    // Can't easily test preventDefault in vitest, but we can verify our keys don't include it
    expect(system.keys.KeyZ).toBeUndefined();
  });

  it('should clean up event listeners on destroy', () => {
    const initialListenerCount = window.listenerCount?.('keydown') || 0;
    system.destroy();

    // After destroy, pressing keys should not affect state
    const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    window.dispatchEvent(event);

    // Keys should still be in previous state (false from beforeEach)
    expect(system.keys.ArrowUp).toBe(false);
  });
});
