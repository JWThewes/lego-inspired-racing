import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Track } from './Track.js';
import * as THREE from 'three';

describe('Track', () => {
  let trackConfig;
  let mockAssetManager;

  beforeEach(() => {
    trackConfig = {
      id: 'track-test',
      name: 'Test Track',
      theme: 'city',
      description: 'A test track',
      previewImage: '/test.png',
      modelPath: '/test.glb',
      collisionModelPath: '/test-collision.glb',
      waypoints: [
        { x: 0, y: 0.5, z: 0 },
        { x: 10, y: 0.5, z: 0 },
        { x: 10, y: 0.5, z: 10 },
        { x: 0, y: 0.5, z: 10 }
      ],
      spawnPositions: [
        { position: { x: 0, y: 1, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        { position: { x: 5, y: 1, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
      ],
      bounds: {
        min: new THREE.Vector3(-50, -5, -50),
        max: new THREE.Vector3(50, 20, 50)
      }
    };

    mockAssetManager = {
      getAsset: vi.fn()
    };
  });

  describe('constructor', () => {
    it('should create a track with config', () => {
      const track = new Track(trackConfig);

      expect(track.id).toBe('track-test');
      expect(track.name).toBe('Test Track');
      expect(track.theme).toBe('city');
      expect(track.waypoints).toHaveLength(4);
      expect(track.spawnPositions).toHaveLength(2);
      expect(track.loaded).toBe(false);
    });

    it('should use default bounds if not provided', () => {
      const configWithoutBounds = { ...trackConfig };
      delete configWithoutBounds.bounds;

      const track = new Track(configWithoutBounds);

      expect(track.bounds.min).toBeDefined();
      expect(track.bounds.max).toBeDefined();
    });
  });

  describe('load', () => {
    it('should load track with placeholder when model not available', async () => {
      mockAssetManager.getAsset.mockReturnValue(null);

      const track = new Track(trackConfig);
      await track.load(mockAssetManager);

      expect(track.loaded).toBe(true);
      expect(track.mesh).toBeDefined();
      expect(track.collisionMesh).toBeDefined();
    });

    it('should not reload if already loaded', async () => {
      mockAssetManager.getAsset.mockReturnValue(null);

      const track = new Track(trackConfig);
      await track.load(mockAssetManager);

      const firstMesh = track.mesh;
      await track.load(mockAssetManager);

      expect(track.mesh).toBe(firstMesh);
    });
  });

  describe('getSpawnPosition', () => {
    it('should return spawn position by index', () => {
      const track = new Track(trackConfig);
      const spawn = track.getSpawnPosition(0);

      expect(spawn.position.x).toBe(0);
      expect(spawn.position.y).toBe(1);
      expect(spawn.position.z).toBe(0);
    });

    it('should return default position for invalid index', () => {
      const track = new Track(trackConfig);
      const spawn = track.getSpawnPosition(999);

      expect(spawn.position).toBeDefined();
      expect(spawn.rotation).toBeDefined();
    });
  });

  describe('getWaypoint', () => {
    it('should return waypoint by index', () => {
      const track = new Track(trackConfig);
      const waypoint = track.getWaypoint(0);

      expect(waypoint).toBeInstanceOf(THREE.Vector3);
      expect(waypoint.x).toBe(0);
      expect(waypoint.y).toBe(0.5);
      expect(waypoint.z).toBe(0);
    });

    it('should return null for invalid index', () => {
      const track = new Track(trackConfig);
      const waypoint = track.getWaypoint(999);

      expect(waypoint).toBeNull();
    });
  });

  describe('getNextWaypoint', () => {
    it('should return next waypoint', () => {
      const track = new Track(trackConfig);
      const result = track.getNextWaypoint(0);

      expect(result.index).toBe(1);
      expect(result.waypoint).toBeInstanceOf(THREE.Vector3);
      expect(result.waypoint.x).toBe(10);
    });

    it('should wrap around at the end', () => {
      const track = new Track(trackConfig);
      const result = track.getNextWaypoint(3);

      expect(result.index).toBe(0);
      expect(result.waypoint.x).toBe(0);
    });
  });

  describe('getClosestWaypoint', () => {
    it('should find closest waypoint to position', () => {
      const track = new Track(trackConfig);
      const position = new THREE.Vector3(9, 0, 1);
      const result = track.getClosestWaypoint(position);

      expect(result.index).toBe(1); // Should be closest to waypoint at (10, 0.5, 0)
      expect(result.distance).toBeDefined();
      expect(result.waypoint).toBeInstanceOf(THREE.Vector3);
    });
  });

  describe('isInBounds', () => {
    it('should return true for position within bounds', () => {
      const track = new Track(trackConfig);
      const position = new THREE.Vector3(0, 0, 0);

      expect(track.isInBounds(position)).toBe(true);
    });

    it('should return false for position outside bounds', () => {
      const track = new Track(trackConfig);
      const position = new THREE.Vector3(100, 0, 0);

      expect(track.isInBounds(position)).toBe(false);
    });
  });

  describe('addToScene and removeFromScene', () => {
    it('should add mesh to scene when loaded', async () => {
      mockAssetManager.getAsset.mockReturnValue(null);

      const track = new Track(trackConfig);
      await track.load(mockAssetManager);

      const mockScene = {
        add: vi.fn(),
        remove: vi.fn()
      };

      track.addToScene(mockScene);
      expect(mockScene.add).toHaveBeenCalledWith(track.mesh);

      track.removeFromScene(mockScene);
      expect(mockScene.remove).toHaveBeenCalledWith(track.mesh);
    });

    it('should warn if adding to scene before loading', () => {
      const track = new Track(trackConfig);
      const mockScene = { add: vi.fn() };
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      track.addToScene(mockScene);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(mockScene.add).not.toHaveBeenCalled();
    });
  });

  describe('getInfo', () => {
    it('should return track info', () => {
      const track = new Track(trackConfig);
      const info = track.getInfo();

      expect(info.id).toBe('track-test');
      expect(info.name).toBe('Test Track');
      expect(info.theme).toBe('city');
      expect(info.waypointCount).toBe(4);
      expect(info.spawnCount).toBe(2);
    });
  });

  describe('unload', () => {
    it('should clean up resources', async () => {
      mockAssetManager.getAsset.mockReturnValue(null);

      const track = new Track(trackConfig);
      await track.load(mockAssetManager);

      expect(track.loaded).toBe(true);

      track.unload();

      expect(track.loaded).toBe(false);
      expect(track.mesh).toBeNull();
      expect(track.collisionMesh).toBeNull();
    });
  });
});
