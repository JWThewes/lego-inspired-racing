import { describe, it, expect, beforeEach } from 'vitest';
import { VehicleSystem } from '../../src/vehicle/VehicleSystem.js';
import { VehicleComponent } from '../../src/vehicle/VehicleComponent.js';
import { Entity } from '../../src/core/Entity.js';
import { BALANCED } from '../../src/vehicle/VehiclePresets.js';

describe('VehicleSystem', () => {
  let system;
  let entity;
  let vehicle;

  beforeEach(() => {
    system = new VehicleSystem();
    entity = new Entity();
    vehicle = new VehicleComponent(BALANCED);
    entity.addComponent(vehicle);
  });

  it('should have correct required components', () => {
    expect(system.requiredComponents).toEqual(['VehicleComponent']);
  });

  it('should have appropriate priority', () => {
    expect(system.priority).toBe(10);
  });

  it('should accelerate forward when throttle is positive', () => {
    vehicle.throttle = 1;
    vehicle.rotation = 0; // Facing forward (0 degrees)

    system.update(0.1, [entity]);

    expect(vehicle.speed).toBeGreaterThan(0);
    expect(vehicle.velocity.z).toBeGreaterThan(0);
  });

  it('should decelerate when throttle is negative', () => {
    // Start with some forward velocity
    vehicle.velocity.z = 10;
    vehicle.speed = 10;
    vehicle.throttle = -1;
    vehicle.rotation = 0;

    const initialSpeed = vehicle.speed;
    system.update(0.1, [entity]);

    // Speed should decrease due to braking
    expect(vehicle.speed).toBeLessThan(initialSpeed);
  });

  it('should turn right when steering is positive', () => {
    vehicle.velocity.z = 10; // Need speed to turn
    vehicle.speed = 10;
    vehicle.steering = 1;
    vehicle.rotation = 0;

    system.update(0.1, [entity]);

    expect(vehicle.rotation).toBeGreaterThan(0);
  });

  it('should turn left when steering is negative', () => {
    vehicle.velocity.z = 10;
    vehicle.speed = 10;
    vehicle.steering = -1;
    vehicle.rotation = 0;

    system.update(0.1, [entity]);

    // Rotation wraps around 0-2π, so negative rotation becomes near 2π
    expect(vehicle.rotation).toBeGreaterThan(Math.PI); // Wrapped to upper range
    expect(vehicle.rotation).toBeLessThan(Math.PI * 2);
  });

  it('should not turn when speed is too low', () => {
    vehicle.velocity.z = 0.05; // Very slow
    vehicle.speed = 0.05;
    vehicle.steering = 1;
    vehicle.rotation = 0;

    system.update(0.1, [entity]);

    expect(vehicle.rotation).toBe(0);
  });

  it('should apply drag to reduce velocity over time', () => {
    vehicle.velocity.x = 10;
    vehicle.velocity.z = 10;
    vehicle.throttle = 0; // No input

    const initialVelX = vehicle.velocity.x;
    const initialVelZ = vehicle.velocity.z;

    system.update(0.1, [entity]);

    expect(Math.abs(vehicle.velocity.x)).toBeLessThan(Math.abs(initialVelX));
    expect(Math.abs(vehicle.velocity.z)).toBeLessThan(Math.abs(initialVelZ));
  });

  it('should stop completely when velocity is very low', () => {
    vehicle.velocity.x = 0.005;
    vehicle.velocity.z = 0.005;
    vehicle.throttle = 0;

    system.update(0.1, [entity]);

    expect(vehicle.velocity.x).toBe(0);
    expect(vehicle.velocity.z).toBe(0);
  });

  it('should update position based on velocity', () => {
    vehicle.velocity.x = 5;
    vehicle.velocity.z = 10;
    vehicle.position.x = 0;
    vehicle.position.z = 0;
    vehicle.drag = 1.0; // Disable drag for this test

    system.update(0.1, [entity]);

    expect(vehicle.position.x).toBeCloseTo(0.5);
    expect(vehicle.position.z).toBeCloseTo(1.0);
  });

  it('should clamp speed to max speed', () => {
    // Set velocity that exceeds max speed
    vehicle.velocity.x = 30;
    vehicle.velocity.z = 30;
    vehicle.maxSpeed = 20;

    system.update(0.01, [entity]);

    expect(vehicle.speed).toBeLessThanOrEqual(vehicle.maxSpeed);
  });

  it('should calculate speed correctly from velocity', () => {
    vehicle.velocity.x = 3;
    vehicle.velocity.z = 4;
    vehicle.drag = 1.0; // Disable drag for this test

    system.update(0.01, [entity]);

    expect(vehicle.speed).toBeCloseTo(5); // 3-4-5 triangle
  });

  it('should normalize rotation to 0-2π range', () => {
    vehicle.velocity.z = 10;
    vehicle.speed = 10;
    vehicle.steering = 1;
    vehicle.rotation = Math.PI * 2 - 0.1;

    system.update(0.5, [entity]); // Large deltaTime to wrap around

    expect(vehicle.rotation).toBeGreaterThanOrEqual(0);
    expect(vehicle.rotation).toBeLessThan(Math.PI * 2);
  });

  it('should handle multiple entities', () => {
    const entity2 = new Entity();
    const vehicle2 = new VehicleComponent(BALANCED);
    entity2.addComponent(vehicle2);

    vehicle.throttle = 1;
    vehicle2.throttle = -1;

    system.update(0.1, [entity, entity2]);

    expect(vehicle.speed).toBeGreaterThan(0);
    expect(vehicle2.speed).toBeGreaterThan(0);
  });

  it('should accelerate in the direction vehicle is facing', () => {
    vehicle.throttle = 1;
    vehicle.rotation = Math.PI / 2; // Facing right (90 degrees)

    system.update(0.1, [entity]);

    expect(vehicle.velocity.x).toBeGreaterThan(0); // Should move in +X direction
    expect(Math.abs(vehicle.velocity.z)).toBeLessThan(0.1); // Minimal Z movement
  });
});
