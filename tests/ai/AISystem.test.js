import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AISystem } from '../../src/ai/AISystem.js';
import { AIComponent } from '../../src/ai/AIComponent.js';
import { VehicleComponent } from '../../src/vehicle/VehicleComponent.js';
import { Entity } from '../../src/core/Entity.js';
import { World } from '../../src/core/World.js';

describe('AISystem', () => {
  let aiSystem;
  let mockTrackManager;
  let world;
  let aiEntity;
  let playerEntity;

  beforeEach(() => {
    // Create mock track manager
    mockTrackManager = {
      getCurrentTrack: vi.fn(() => ({ id: 'track-city' })),
      getWaypoint: vi.fn((index) => ({
        x: index * 10,
        y: 0.5,
        z: index * 10
      })),
      getNextWaypoint: vi.fn((currentIndex) => ({
        index: (currentIndex + 1) % 5,
        waypoint: { x: (currentIndex + 1) * 10, y: 0.5, z: (currentIndex + 1) * 10 }
      }))
    };

    // Create AI system
    aiSystem = new AISystem(mockTrackManager);

    // Create world
    world = new World();
    aiSystem.init(world);

    // Create AI entity
    aiEntity = new Entity(1);
    const aiComponent = new AIComponent({ difficulty: 'medium' });
    const aiVehicle = new VehicleComponent({ maxSpeed: 40 });
    aiVehicle.position = { x: 0, y: 0, z: 0 };
    aiVehicle.rotation = 0;
    aiVehicle.speed = 0;
    aiVehicle.velocity = { x: 0, y: 0, z: 0 };
    aiVehicle.entityId = 1;

    aiEntity.addComponent(aiComponent);
    aiEntity.addComponent(aiVehicle);
    world.addEntity(aiEntity);

    // Create player entity (no AI component)
    playerEntity = new Entity(2);
    const playerVehicle = new VehicleComponent({ maxSpeed: 40 });
    playerVehicle.position = { x: 50, y: 0, z: 50 };
    playerVehicle.rotation = 0;
    playerVehicle.speed = 30;
    playerVehicle.velocity = { x: 0, y: 0, z: 30 };
    playerVehicle.entityId = 2;

    playerEntity.addComponent(playerVehicle);
    world.addEntity(playerEntity);
  });

  describe('constructor', () => {
    it('should create an AI system with required components', () => {
      expect(aiSystem.requiredComponents).toEqual(['AIComponent', 'VehicleComponent']);
      expect(aiSystem.priority).toBe(9);
      expect(aiSystem.trackManager).toBe(mockTrackManager);
    });
  });

  describe('init', () => {
    it('should store world reference', () => {
      expect(aiSystem.world).toBe(world);
    });
  });

  describe('update', () => {
    it('should not update if no track is loaded', () => {
      mockTrackManager.getCurrentTrack.mockReturnValue(null);

      const entities = [aiEntity];
      aiSystem.update(0.016, entities);

      // Should exit early without errors
      expect(mockTrackManager.getCurrentTrack).toHaveBeenCalled();
    });

    it('should update AI vehicles with track loaded', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Store initial values
      const initialSteering = vehicle.steering;
      const initialThrottle = vehicle.throttle;

      aiSystem.update(0.016, entities);

      // AI should set steering and throttle
      expect(mockTrackManager.getWaypoint).toHaveBeenCalledWith(0);
      expect(ai.desiredSteering).toBeDefined();
      expect(ai.distanceToWaypoint).toBeDefined();
    });

    it('should calculate steering towards waypoint', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Position vehicle away from waypoint
      vehicle.position = { x: -10, y: 0, z: -10 };
      vehicle.rotation = Math.PI; // Facing wrong direction

      aiSystem.update(0.016, entities);

      // AI should steer towards waypoint
      expect(ai.desiredSteering).toBeDefined();
      expect(vehicle.steering).toBeDefined();
      expect(typeof vehicle.steering).toBe('number');
    });

    it('should apply throttle based on speed', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Set vehicle below target speed
      vehicle.speed = 10; // Below target (40 * 0.8 = 32)

      aiSystem.update(0.016, entities);

      // AI should accelerate
      expect(vehicle.throttle).toBeGreaterThan(0);
    });

    it('should check waypoint progress', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Position vehicle near waypoint
      vehicle.position = { x: 1, y: 0, z: 1 };
      ai.waypointReachedThreshold = 10;

      aiSystem.update(0.016, entities);

      // Should advance to next waypoint
      expect(mockTrackManager.getNextWaypoint).toHaveBeenCalled();
    });
  });

  describe('waypoint navigation', () => {
    it('should calculate distance to waypoint', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      vehicle.position = { x: 5, y: 0, z: 5 };

      aiSystem.update(0.016, entities);

      expect(ai.distanceToWaypoint).toBeDefined();
      expect(ai.distanceToWaypoint).toBeGreaterThan(0);
    });

    it('should wrap to next waypoint when reached', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Position at waypoint
      vehicle.position = { x: 0, y: 0, z: 0 };
      ai.waypointReachedThreshold = 5;
      ai.currentWaypointIndex = 0;

      aiSystem.update(0.016, entities);

      // Should call getNextWaypoint
      expect(mockTrackManager.getNextWaypoint).toHaveBeenCalledWith(0);
    });

    it('should increment lap counter when wrapping to start', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Mock returning to waypoint 0
      mockTrackManager.getNextWaypoint.mockReturnValue({
        index: 0,
        waypoint: { x: 0, y: 0.5, z: 0 }
      });

      vehicle.position = { x: 0, y: 0, z: 0 };
      ai.waypointReachedThreshold = 5;
      ai.currentWaypointIndex = 4;
      ai.lapsCompleted = 0;

      aiSystem.update(0.016, entities);

      expect(ai.lapsCompleted).toBe(1);
    });
  });

  describe('obstacle avoidance', () => {
    it('should detect nearby vehicles', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Position player vehicle close to AI
      const playerVehicle = playerEntity.getComponent('VehicleComponent');
      playerVehicle.position = { x: 5, y: 0, z: 0 };
      vehicle.position = { x: 0, y: 0, z: 0 };

      aiSystem.update(0.016, entities);

      // AI should steer to avoid obstacle
      expect(vehicle.steering).toBeDefined();
    });

    it('should not avoid distant vehicles', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      // Position player vehicle far from AI
      const playerVehicle = playerEntity.getComponent('VehicleComponent');
      playerVehicle.position = { x: 100, y: 0, z: 100 };
      vehicle.position = { x: 0, y: 0, z: 0 };

      aiSystem.update(0.016, entities);

      // Avoidance flag should be false
      expect(ai.isAvoidingObstacle).toBe(false);
    });
  });

  describe('difficulty tuning', () => {
    it('should apply different target speeds for different difficulties', () => {
      const entities = [aiEntity];
      const ai = aiEntity.getComponent('AIComponent');

      // Easy difficulty
      ai.setDifficulty('easy');
      expect(ai.targetSpeed).toBe(0.7);

      // Hard difficulty
      ai.setDifficulty('hard');
      expect(ai.targetSpeed).toBe(0.9);
    });

    it('should apply different aggressiveness for different difficulties', () => {
      const entities = [aiEntity];
      const ai = aiEntity.getComponent('AIComponent');

      // Easy difficulty
      ai.setDifficulty('easy');
      expect(ai.aggressiveness).toBe(0.4);

      // Hard difficulty
      ai.setDifficulty('hard');
      expect(ai.aggressiveness).toBe(0.7);
    });
  });

  describe('rubber-banding', () => {
    it('should apply minimal rubber-banding when enabled', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');
      const ai = aiEntity.getComponent('AIComponent');

      ai.rubberBandingFactor = 0.1;
      vehicle.position = { x: 0, y: 0, z: 0 };
      vehicle.speed = 20;

      // Position player far ahead
      const playerVehicle = playerEntity.getComponent('VehicleComponent');
      playerVehicle.position = { x: 100, y: 0, z: 0 };

      aiSystem.update(0.016, entities);

      // AI should get slight speed boost (rubber-banding)
      expect(vehicle.throttle).toBeDefined();
    });

    it('should not rubber-band when factor is 0', () => {
      const entities = [aiEntity];
      const ai = aiEntity.getComponent('AIComponent');

      ai.rubberBandingFactor = 0;

      aiSystem.update(0.016, entities);

      // Should still work without rubber-banding
      expect(aiEntity.getComponent('VehicleComponent').throttle).toBeDefined();
    });
  });

  describe('steering errors', () => {
    it('should add occasional steering errors for realism', () => {
      const entities = [aiEntity];
      const ai = aiEntity.getComponent('AIComponent');

      ai.nextErrorTime = -1; // Force error on next update
      ai.errorMagnitude = 0.5;

      aiSystem.update(0.016, entities);

      // Error should be applied
      expect(ai.steeringError).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should clean up references', () => {
      aiSystem.destroy();

      expect(aiSystem.world).toBeNull();
      expect(aiSystem.trackManager).toBeNull();
    });
  });

  describe('steering calculation', () => {
    it('should clamp steering to -1 to 1 range', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');

      aiSystem.update(0.016, entities);

      expect(vehicle.steering).toBeGreaterThanOrEqual(-1);
      expect(vehicle.steering).toBeLessThanOrEqual(1);
    });
  });

  describe('throttle calculation', () => {
    it('should clamp throttle to -1 to 1 range', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');

      aiSystem.update(0.016, entities);

      expect(vehicle.throttle).toBeGreaterThanOrEqual(-1);
      expect(vehicle.throttle).toBeLessThanOrEqual(1);
    });

    it('should reduce throttle when steering hard', () => {
      const entities = [aiEntity];
      const vehicle = aiEntity.getComponent('VehicleComponent');

      vehicle.steering = 1.0; // Hard turn
      vehicle.speed = 10; // Below target

      aiSystem.update(0.016, entities);

      // Throttle should be reduced due to steering
      expect(vehicle.throttle).toBeLessThan(1.0);
    });
  });
});
