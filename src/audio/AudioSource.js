import { Component } from '../core/Component.js';

/**
 * AudioSource Component - Holds audio playback data
 * Manages a single audio source with Web Audio API
 */
export class AudioSource extends Component {
  /**
   * @param {Object} config - Audio configuration
   * @param {string} config.soundId - ID of sound asset to play
   * @param {boolean} config.loop - Whether to loop the sound (default: false)
   * @param {number} config.volume - Base volume (0-1, default: 1)
   * @param {number} config.pitch - Base pitch multiplier (default: 1)
   * @param {boolean} config.playOnStart - Start playing immediately (default: false)
   * @param {boolean} config.spatial - Use 3D spatial audio (default: false)
   * @param {number} config.minDistance - Minimum distance for spatial audio (default: 1)
   * @param {number} config.maxDistance - Maximum distance for spatial audio (default: 10)
   */
  constructor(config = {}) {
    super();

    this.soundId = config.soundId || null;
    this.loop = config.loop !== undefined ? config.loop : false;
    this.volume = config.volume !== undefined ? config.volume : 1.0;
    this.pitch = config.pitch !== undefined ? config.pitch : 1.0;
    this.playOnStart = config.playOnStart !== undefined ? config.playOnStart : false;
    this.spatial = config.spatial !== undefined ? config.spatial : false;
    this.minDistance = config.minDistance !== undefined ? config.minDistance : 1;
    this.maxDistance = config.maxDistance !== undefined ? config.maxDistance : 10;

    // Runtime state (managed by AudioSystem)
    this.isPlaying = false;
    this.isPaused = false;

    // Web Audio API nodes (set by AudioSystem)
    this.audioBuffer = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.pannerNode = null; // For spatial audio

    // Target values for smooth transitions
    this.targetVolume = this.volume;
    this.targetPitch = this.pitch;

    // Playback time tracking
    this.startTime = 0;
    this.pauseTime = 0;
  }

  /**
   * Set target volume (will be smoothly interpolated)
   * @param {number} volume - Target volume (0-1)
   */
  setVolume(volume) {
    this.targetVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set target pitch (will be smoothly interpolated)
   * @param {number} pitch - Target pitch multiplier (0.5-2.0 recommended)
   */
  setPitch(pitch) {
    this.targetPitch = Math.max(0.1, Math.min(4, pitch));
  }

  /**
   * Reset playback state
   */
  reset() {
    this.isPlaying = false;
    this.isPaused = false;
    this.sourceNode = null;
    this.startTime = 0;
    this.pauseTime = 0;
  }
}
