import { describe, it, expect } from 'vitest';
import {
  SPEEDY,
  BALANCED,
  NIMBLE,
  TANK,
  ALL_PRESETS,
  getPresetByType
} from '../../src/vehicle/VehiclePresets.js';

describe('VehiclePresets', () => {
  describe('Individual Presets', () => {
    it('should have SPEEDY preset with high speed', () => {
      expect(SPEEDY.vehicleType).toBe('speedy');
      expect(SPEEDY.maxSpeed).toBe(50.0);
      expect(SPEEDY.acceleration).toBe(20.0);
      expect(SPEEDY.description).toBeDefined();
    });

    it('should have BALANCED preset with moderate stats', () => {
      expect(BALANCED.vehicleType).toBe('balanced');
      expect(BALANCED.maxSpeed).toBe(40.0);
      expect(BALANCED.acceleration).toBe(15.0);
      expect(BALANCED.description).toBeDefined();
    });

    it('should have NIMBLE preset with high turn speed', () => {
      expect(NIMBLE.vehicleType).toBe('nimble');
      expect(NIMBLE.turnSpeed).toBe(3.5);
      expect(NIMBLE.description).toBeDefined();
    });

    it('should have TANK preset with high brake force', () => {
      expect(TANK.vehicleType).toBe('tank');
      expect(TANK.brakeForce).toBe(35.0);
      expect(TANK.description).toBeDefined();
    });
  });

  describe('Preset Characteristics', () => {
    it('should have SPEEDY as fastest vehicle', () => {
      expect(SPEEDY.maxSpeed).toBeGreaterThan(BALANCED.maxSpeed);
      expect(SPEEDY.maxSpeed).toBeGreaterThan(NIMBLE.maxSpeed);
      expect(SPEEDY.maxSpeed).toBeGreaterThan(TANK.maxSpeed);
    });

    it('should have NIMBLE with best turn speed', () => {
      expect(NIMBLE.turnSpeed).toBeGreaterThan(SPEEDY.turnSpeed);
      expect(NIMBLE.turnSpeed).toBeGreaterThan(BALANCED.turnSpeed);
      expect(NIMBLE.turnSpeed).toBeGreaterThan(TANK.turnSpeed);
    });

    it('should have TANK as slowest but most stable', () => {
      expect(TANK.maxSpeed).toBeLessThan(SPEEDY.maxSpeed);
      expect(TANK.maxSpeed).toBeLessThan(BALANCED.maxSpeed);
      expect(TANK.brakeForce).toBeGreaterThan(BALANCED.brakeForce);
    });

    it('should have all presets with required properties', () => {
      const requiredProps = [
        'vehicleType',
        'acceleration',
        'maxSpeed',
        'turnSpeed',
        'brakeForce',
        'drag',
        'description'
      ];

      for (const preset of ALL_PRESETS) {
        for (const prop of requiredProps) {
          expect(preset).toHaveProperty(prop);
        }
      }
    });

    it('should have all presets with positive values', () => {
      for (const preset of ALL_PRESETS) {
        expect(preset.acceleration).toBeGreaterThan(0);
        expect(preset.maxSpeed).toBeGreaterThan(0);
        expect(preset.turnSpeed).toBeGreaterThan(0);
        expect(preset.brakeForce).toBeGreaterThan(0);
        expect(preset.drag).toBeGreaterThan(0);
        expect(preset.drag).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('ALL_PRESETS array', () => {
    it('should contain all 4 vehicle types', () => {
      expect(ALL_PRESETS).toHaveLength(4);
    });

    it('should contain SPEEDY, BALANCED, NIMBLE, and TANK', () => {
      expect(ALL_PRESETS).toContain(SPEEDY);
      expect(ALL_PRESETS).toContain(BALANCED);
      expect(ALL_PRESETS).toContain(NIMBLE);
      expect(ALL_PRESETS).toContain(TANK);
    });

    it('should have unique vehicle types', () => {
      const types = ALL_PRESETS.map(p => p.vehicleType);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(4);
    });
  });

  describe('getPresetByType', () => {
    it('should return SPEEDY for "speedy"', () => {
      expect(getPresetByType('speedy')).toBe(SPEEDY);
    });

    it('should return BALANCED for "balanced"', () => {
      expect(getPresetByType('balanced')).toBe(BALANCED);
    });

    it('should return NIMBLE for "nimble"', () => {
      expect(getPresetByType('nimble')).toBe(NIMBLE);
    });

    it('should return TANK for "tank"', () => {
      expect(getPresetByType('tank')).toBe(TANK);
    });

    it('should return BALANCED for unknown type', () => {
      expect(getPresetByType('unknown')).toBe(BALANCED);
      expect(getPresetByType('')).toBe(BALANCED);
      expect(getPresetByType(null)).toBe(BALANCED);
    });
  });

  describe('Arcade-style gameplay suitability', () => {
    it('should have reasonable speed ranges for children', () => {
      // All speeds should be in a reasonable range (not too fast, not too slow)
      for (const preset of ALL_PRESETS) {
        expect(preset.maxSpeed).toBeGreaterThanOrEqual(30);
        expect(preset.maxSpeed).toBeLessThanOrEqual(60);
      }
    });

    it('should have forgiving drag values', () => {
      // Drag should allow for forgiving arcade-style physics
      for (const preset of ALL_PRESETS) {
        expect(preset.drag).toBeGreaterThanOrEqual(0.9);
        expect(preset.drag).toBeLessThanOrEqual(1.0);
      }
    });

    it('should have distinct enough characteristics', () => {
      // Verify meaningful differences between vehicle types
      const maxSpeeds = ALL_PRESETS.map(p => p.maxSpeed);
      const minSpeed = Math.min(...maxSpeeds);
      const maxSpeed = Math.max(...maxSpeeds);

      // At least 15 units difference between slowest and fastest
      expect(maxSpeed - minSpeed).toBeGreaterThanOrEqual(15);
    });
  });
});
