import { Track } from './Track.js';
import { trackConfigs } from './trackData.js';

/**
 * TrackManager - Manages track loading, unloading, and track entities
 * Handles track selection and provides track data to game systems
 */
export class TrackManager {
  constructor(assetManager) {
    this.assetManager = assetManager;
    this.tracks = new Map();
    this.currentTrack = null;
    this.scene = null;

    // Initialize tracks from configs
    this._initializeTracks();
  }

  /**
   * Initialize track instances from track configurations
   * @private
   */
  _initializeTracks() {
    trackConfigs.forEach((config) => {
      const track = new Track(config);
      this.tracks.set(config.id, track);
    });

    console.log(`TrackManager initialized with ${this.tracks.size} tracks`);
  }

  /**
   * Set the scene reference for adding/removing track meshes
   * @param {THREE.Scene} scene - Three.js scene
   */
  setScene(scene) {
    this.scene = scene;
  }

  /**
   * Load a specific track
   * @param {string} trackId - Track identifier
   * @returns {Promise<Track>}
   */
  async loadTrack(trackId) {
    const track = this.tracks.get(trackId);

    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }

    if (track.loaded) {
      console.log(`Track ${trackId} already loaded`);
      return track;
    }

    console.log(`Loading track: ${track.name}`);

    try {
      await track.load(this.assetManager);
      console.log(`Track ${track.name} loaded successfully`);
      return track;
    } catch (error) {
      console.error(`Failed to load track ${trackId}:`, error);
      throw error;
    }
  }

  /**
   * Set the current active track
   * @param {string} trackId - Track identifier
   * @returns {Promise<Track>}
   */
  async setCurrentTrack(trackId) {
    // Unload previous track if exists
    if (this.currentTrack) {
      this.unloadTrack(this.currentTrack.id);
    }

    // Load new track
    const track = await this.loadTrack(trackId);
    this.currentTrack = track;

    // Add to scene if scene is set
    if (this.scene) {
      track.addToScene(this.scene);
    }

    console.log(`Current track set to: ${track.name}`);
    return track;
  }

  /**
   * Unload a specific track
   * @param {string} trackId - Track identifier
   */
  unloadTrack(trackId) {
    const track = this.tracks.get(trackId);

    if (!track) {
      console.warn(`Track ${trackId} not found`);
      return;
    }

    if (!track.loaded) {
      console.log(`Track ${trackId} already unloaded`);
      return;
    }

    // Remove from scene if it's the current track
    if (this.currentTrack && this.currentTrack.id === trackId && this.scene) {
      track.removeFromScene(this.scene);
    }

    track.unload();

    if (this.currentTrack && this.currentTrack.id === trackId) {
      this.currentTrack = null;
    }

    console.log(`Track ${trackId} unloaded`);
  }

  /**
   * Get current active track
   * @returns {Track|null}
   */
  getCurrentTrack() {
    return this.currentTrack;
  }

  /**
   * Get track by ID
   * @param {string} trackId - Track identifier
   * @returns {Track|undefined}
   */
  getTrack(trackId) {
    return this.tracks.get(trackId);
  }

  /**
   * Get all available tracks
   * @returns {Array<Track>}
   */
  getAllTracks() {
    return Array.from(this.tracks.values());
  }

  /**
   * Get track info for all tracks (for UI display)
   * @returns {Array<Object>}
   */
  getTrackList() {
    return this.getAllTracks().map(track => track.getInfo());
  }

  /**
   * Create track entity in the world
   * @param {World} world - ECS World instance
   * @param {string} trackId - Track identifier
   * @returns {Entity}
   */
  createTrackEntity(world, trackId) {
    const track = this.tracks.get(trackId);

    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }

    if (!track.loaded) {
      throw new Error(`Track ${trackId} must be loaded before creating entity`);
    }

    // Create entity
    const entity = world.createEntity();

    // Add Transform component
    const TransformComponent = world.getComponentClass('Transform');
    if (TransformComponent) {
      entity.addComponent(new TransformComponent({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      }));
    }

    // Add Mesh component
    const MeshComponent = world.getComponentClass('Mesh');
    if (MeshComponent) {
      entity.addComponent(new MeshComponent({
        mesh: track.mesh
      }));
    }

    // Add Track-specific component (custom component for track data)
    // This would be defined in a separate component file
    // For now, store track reference on entity
    entity.trackData = {
      trackId: track.id,
      waypoints: track.waypoints,
      spawnPositions: track.spawnPositions,
      bounds: track.bounds
    };

    track.entities.push(entity);

    console.log(`Track entity created for ${track.name}`);
    return entity;
  }

  /**
   * Get spawn position for vehicle
   * @param {number} index - Spawn index (0 = player, 1+ = AI)
   * @returns {Object|null} {position: Vector3, rotation: Euler}
   */
  getSpawnPosition(index) {
    if (!this.currentTrack) {
      console.warn('No current track set');
      return null;
    }

    return this.currentTrack.getSpawnPosition(index);
  }

  /**
   * Get waypoint from current track
   * @param {number} index - Waypoint index
   * @returns {THREE.Vector3|null}
   */
  getWaypoint(index) {
    if (!this.currentTrack) {
      console.warn('No current track set');
      return null;
    }

    return this.currentTrack.getWaypoint(index);
  }

  /**
   * Get all waypoints from current track
   * @returns {Array<THREE.Vector3>}
   */
  getAllWaypoints() {
    if (!this.currentTrack) {
      console.warn('No current track set');
      return [];
    }

    return this.currentTrack.waypoints.map((wp, index) =>
      this.currentTrack.getWaypoint(index)
    );
  }

  /**
   * Get next waypoint for AI navigation
   * @param {number} currentIndex - Current waypoint index
   * @returns {Object|null} {waypoint: Vector3, index: number}
   */
  getNextWaypoint(currentIndex) {
    if (!this.currentTrack) {
      console.warn('No current track set');
      return null;
    }

    return this.currentTrack.getNextWaypoint(currentIndex);
  }

  /**
   * Get closest waypoint to a position
   * @param {THREE.Vector3} position - Position to check from
   * @returns {Object|null} {waypoint: Vector3, index: number, distance: number}
   */
  getClosestWaypoint(position) {
    if (!this.currentTrack) {
      console.warn('No current track set');
      return null;
    }

    return this.currentTrack.getClosestWaypoint(position);
  }

  /**
   * Check if position is within current track bounds
   * @param {THREE.Vector3} position - Position to check
   * @returns {boolean}
   */
  isInBounds(position) {
    if (!this.currentTrack) {
      return false;
    }

    return this.currentTrack.isInBounds(position);
  }

  /**
   * Unload all tracks and clean up
   */
  destroy() {
    this.tracks.forEach((track) => {
      if (track.loaded) {
        this.unloadTrack(track.id);
      }
    });

    this.tracks.clear();
    this.currentTrack = null;
    this.scene = null;

    console.log('TrackManager destroyed');
  }
}
