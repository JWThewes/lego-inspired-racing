import { describe, it, expect } from 'vitest';
import { VehicleComponent } from '../../src/vehicle/VehicleComponent.js';
import { BALANCED, SPEEDY } from '../../src/vehicle/VehiclePresets.js';

describe('VehicleComponent', () => {
  it('should create with default values', () => {
    const vehicle = new VehicleComponent();

    expect(vehicle.acceleration).toBe(15.0);
    expect(vehicle.maxSpeed).toBe(40.0);
    expect(vehicle.turnSpeed).toBe(2.5);
    expect(vehicle.brakeForce).toBe(25.0);
    expect(vehicle.drag).toBe(0.95);
    expect(vehicle.vehicleType).toBe('default');
  });

  it('should create with preset specifications', () => {
    const vehicle = new VehicleComponent(BALANCED);

    expect(vehicle.acceleration).toBe(BALANCED.acceleration);
    expect(vehicle.maxSpeed).toBe(BALANCED.maxSpeed);
    expect(vehicle.turnSpeed).toBe(BALANCED.turnSpeed);
    expect(vehicle.brakeForce).toBe(BALANCED.brakeForce);
    expect(vehicle.drag).toBe(BALANCED.drag);
    expect(vehicle.vehicleType).toBe('balanced');
  });

  it('should initialize state to zero', () => {
    const vehicle = new VehicleComponent();

    expect(vehicle.velocity).toEqual({ x: 0, y: 0, z: 0 });
    expect(vehicle.speed).toBe(0);
    expect(vehicle.rotation).toBe(0);
    expect(vehicle.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(vehicle.throttle).toBe(0);
    expect(vehicle.steering).toBe(0);
  });

  it('should create different vehicle types with distinct characteristics', () => {
    const balanced = new VehicleComponent(BALANCED);
    const speedy = new VehicleComponent(SPEEDY);

    // Speedy should be faster
    expect(speedy.maxSpeed).toBeGreaterThan(balanced.maxSpeed);
    expect(speedy.acceleration).toBeGreaterThan(balanced.acceleration);

    // Different types
    expect(balanced.vehicleType).toBe('balanced');
    expect(speedy.vehicleType).toBe('speedy');
  });

  it('should extend Component base class', () => {
    const vehicle = new VehicleComponent();
    expect(vehicle.constructor.name).toBe('VehicleComponent');
  });
});
