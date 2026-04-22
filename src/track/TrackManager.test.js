import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrackManager } from './TrackManager.js';
import * as THREE from 'three';

describe('TrackManager', () => {
  let mockAssetManager;
  let trackManager;

  beforeEach(() => {
    mockAssetManager = {
      getAsset: vi.fn().mockReturnValue(null) // Return null to use placeholders
    };

    trackManager = new TrackManager(mockAssetManager);
  });

  describe('constructor', () => {
    it('should initialize with tracks', () => {
      expect(trackManager.tracks.size).toBeGreaterThan(0);
      expect(trackManager.currentTrack).toBeNull();
    });

    it('should have city, desert, and forest tracks', () => {
      expect(trackManager.tracks.has('track-city')).toBe(true);
      expect(trackManager.tracks.has('track-desert')).toBe(true);
      expect(trackManager.tracks.has('track-forest')).toBe(true);
    });
  });

  describe('setScene', () => {
    it('should set scene reference', () => {
      const mockScene = {};
      trackManager.setScene(mockScene);

      expect(trackManager.scene).toBe(mockScene);
    });
  });

  describe('loadTrack', () => {
    it('should load a track by ID', async () => {
      const track = await trackManager.loadTrack('track-city');

      expect(track).toBeDefined();
      expect(track.loaded).toBe(true);
      expect(track.id).toBe('track-city');
    });

    it('should throw error for non-existent track', async () => {
      await expect(trackManager.loadTrack('track-nonexistent')).rejects.toThrow();
    });

    it('should not reload already loaded track', async () => {
      await trackManager.loadTrack('track-city');
      const track = await trackManager.loadTrack('track-city');

      expect(mockAssetManager.getAsset).toHaveBeenCalledTimes(1);
    });
  });

  describe('setCurrentTrack', () => {
    it('should set and load current track', async () => {
      const track = await trackManager.setCurrentTrack('track-desert');

      expect(trackManager.currentTrack).toBe(track);
      expect(track.id).toBe('track-desert');
      expect(track.loaded).toBe(true);
    });

    it('should unload previous track when setting new one', async () => {
      await trackManager.setCurrentTrack('track-city');
      const firstTrack = trackManager.currentTrack;

      await trackManager.setCurrentTrack('track-desert');

      expect(firstTrack.loaded).toBe(false);
      expect(trackManager.currentTrack.id).toBe('track-desert');
    });

    it('should add track to scene if scene is set', async () => {
      const mockScene = {
        add: vi.fn(),
        remove: vi.fn()
      };

      trackManager.setScene(mockScene);
      await trackManager.setCurrentTrack('track-city');

      expect(mockScene.add).toHaveBeenCalledWith(trackManager.currentTrack.mesh);
    });
  });

  describe('unloadTrack', () => {
    it('should unload a track', async () => {
      await trackManager.loadTrack('track-city');
      const track = trackManager.getTrack('track-city');

      trackManager.unloadTrack('track-city');

      expect(track.loaded).toBe(false);
    });

    it('should handle unloading non-existent track', () => {
      expect(() => trackManager.unloadTrack('track-nonexistent')).not.toThrow();
    });

    it('should clear current track reference if unloading current', async () => {
      await trackManager.setCurrentTrack('track-city');

      trackManager.unloadTrack('track-city');

      expect(trackManager.currentTrack).toBeNull();
    });
  });

  describe('getCurrentTrack', () => {
    it('should return current track', async () => {
      await trackManager.setCurrentTrack('track-forest');

      const current = trackManager.getCurrentTrack();

      expect(current).toBe(trackManager.currentTrack);
      expect(current.id).toBe('track-forest');
    });

    it('should return null if no current track', () => {
      expect(trackManager.getCurrentTrack()).toBeNull();
    });
  });

  describe('getTrack', () => {
    it('should get track by ID', () => {
      const track = trackManager.getTrack('track-city');

      expect(track).toBeDefined();
      expect(track.id).toBe('track-city');
    });

    it('should return undefined for non-existent track', () => {
      expect(trackManager.getTrack('track-nonexistent')).toBeUndefined();
    });
  });

  describe('getAllTracks', () => {
    it('should return all tracks', () => {
      const tracks = trackManager.getAllTracks();

      expect(Array.isArray(tracks)).toBe(true);
      expect(tracks.length).toBe(3);
    });
  });

  describe('getTrackList', () => {
    it('should return track info for all tracks', () => {
      const trackList = trackManager.getTrackList();

      expect(Array.isArray(trackList)).toBe(true);
      expect(trackList.length).toBe(3);
      expect(trackList[0]).toHaveProperty('id');
      expect(trackList[0]).toHaveProperty('name');
      expect(trackList[0]).toHaveProperty('theme');
    });
  });

  describe('getSpawnPosition', () => {
    it('should return spawn position from current track', async () => {
      await trackManager.setCurrentTrack('track-city');
      const spawn = trackManager.getSpawnPosition(0);

      expect(spawn).toBeDefined();
      expect(spawn.position).toBeInstanceOf(THREE.Vector3);
      expect(spawn.rotation).toBeInstanceOf(THREE.Euler);
    });

    it('should return null if no current track', () => {
      expect(trackManager.getSpawnPosition(0)).toBeNull();
    });
  });

  describe('getWaypoint', () => {
    it('should return waypoint from current track', async () => {
      await trackManager.setCurrentTrack('track-city');
      const waypoint = trackManager.getWaypoint(0);

      expect(waypoint).toBeInstanceOf(THREE.Vector3);
    });

    it('should return null if no current track', () => {
      expect(trackManager.getWaypoint(0)).toBeNull();
    });
  });

  describe('getAllWaypoints', () => {
    it('should return all waypoints from current track', async () => {
      await trackManager.setCurrentTrack('track-city');
      const waypoints = trackManager.getAllWaypoints();

      expect(Array.isArray(waypoints)).toBe(true);
      expect(waypoints.length).toBeGreaterThan(0);
      expect(waypoints[0]).toBeInstanceOf(THREE.Vector3);
    });

    it('should return empty array if no current track', () => {
      expect(trackManager.getAllWaypoints()).toEqual([]);
    });
  });

  describe('getNextWaypoint', () => {
    it('should return next waypoint from current track', async () => {
      await trackManager.setCurrentTrack('track-city');
      const result = trackManager.getNextWaypoint(0);

      expect(result).toBeDefined();
      expect(result.waypoint).toBeInstanceOf(THREE.Vector3);
      expect(result.index).toBe(1);
    });

    it('should return null if no current track', () => {
      expect(trackManager.getNextWaypoint(0)).toBeNull();
    });
  });

  describe('getClosestWaypoint', () => {
    it('should return closest waypoint from current track', async () => {
      await trackManager.setCurrentTrack('track-city');
      const position = new THREE.Vector3(0, 0, 0);
      const result = trackManager.getClosestWaypoint(position);

      expect(result).toBeDefined();
      expect(result.waypoint).toBeInstanceOf(THREE.Vector3);
      expect(result.index).toBeDefined();
      expect(result.distance).toBeDefined();
    });

    it('should return null if no current track', () => {
      const position = new THREE.Vector3(0, 0, 0);
      expect(trackManager.getClosestWaypoint(position)).toBeNull();
    });
  });

  describe('isInBounds', () => {
    it('should check if position is in bounds of current track', async () => {
      await trackManager.setCurrentTrack('track-city');
      const position = new THREE.Vector3(0, 0, 0);

      expect(trackManager.isInBounds(position)).toBe(true);
    });

    it('should return false if no current track', () => {
      const position = new THREE.Vector3(0, 0, 0);
      expect(trackManager.isInBounds(position)).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should unload all tracks and clean up', async () => {
      await trackManager.loadTrack('track-city');
      await trackManager.loadTrack('track-desert');

      trackManager.destroy();

      expect(trackManager.tracks.size).toBe(0);
      expect(trackManager.currentTrack).toBeNull();
    });
  });
});
