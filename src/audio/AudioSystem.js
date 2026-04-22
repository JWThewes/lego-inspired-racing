import { System } from '../core/System.js';

/**
 * AudioSystem - Manages Web Audio API and audio playback
 * Handles audio source components, pitch/volume control, and spatial audio
 */
export class AudioSystem extends System {
  /**
   * @param {Object} config - Audio system configuration
   * @param {number} config.masterVolume - Master volume (0-1, default: 0.7)
   * @param {number} config.interpolationSpeed - Speed of volume/pitch interpolation (default: 5)
   */
  constructor(config = {}) {
    super();

    this.requiredComponents = ['AudioSource'];
    this.priority = 50; // Audio runs after physics and game logic

    this.masterVolume = config.masterVolume !== undefined ? config.masterVolume : 0.7;
    this.interpolationSpeed = config.interpolationSpeed !== undefined ? config.interpolationSpeed : 5;

    // Web Audio API context
    this.audioContext = null;
    this.masterGainNode = null;

    // Loaded audio buffers
    this.audioBuffers = new Map();

    // Track active sources for cleanup
    this.activeSources = new Set();

    // Audio unlocked state (for mobile browsers)
    this.isUnlocked = false;
  }

  /**
   * Initialize the audio system
   * @param {World} world - Game world
   */
  init(world) {
    // Create Web Audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create master gain node
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = this.masterVolume;
    this.masterGainNode.connect(this.audioContext.destination);

    // Set up audio unlock for mobile browsers
    this._setupAudioUnlock();

    console.log('AudioSystem initialized');
  }

  /**
   * Set up audio unlock for mobile browsers
   * Many mobile browsers require user interaction before playing audio
   * @private
   */
  _setupAudioUnlock() {
    const unlock = () => {
      if (this.isUnlocked) return;

      // Create and immediately stop a silent buffer to unlock audio
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.isUnlocked = true;
      console.log('Audio unlocked');

      // Remove event listeners
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };

    // Add event listeners for user interaction
    document.addEventListener('touchstart', unlock, { once: true, passive: true });
    document.addEventListener('touchend', unlock, { once: true, passive: true });
    document.addEventListener('click', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true, passive: true });
  }

  /**
   * Load an audio file
   * @param {string} soundId - Unique identifier for the sound
   * @param {string} url - URL to audio file
   * @returns {Promise<AudioBuffer>} Loaded audio buffer
   */
  async loadSound(soundId, url) {
    if (this.audioBuffers.has(soundId)) {
      return this.audioBuffers.get(soundId);
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.audioBuffers.set(soundId, audioBuffer);
      console.log(`Loaded sound: ${soundId}`);

      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound ${soundId}:`, error);
      throw error;
    }
  }

  /**
   * Update audio system
   * @param {number} deltaTime - Time since last update
   * @param {Array<Entity>} entities - Entities with AudioSource components
   */
  update(deltaTime, entities) {
    for (const entity of entities) {
      const audioSource = entity.getComponent('AudioSource');

      // Start playing if playOnStart is set
      if (audioSource.playOnStart && !audioSource.isPlaying && !audioSource.isPaused) {
        this.play(entity);
        audioSource.playOnStart = false; // Only play once
      }

      // Update playing sources
      if (audioSource.isPlaying && audioSource.sourceNode) {
        this._updateAudioSource(audioSource, deltaTime, entity);
      }
    }
  }

  /**
   * Update an active audio source (volume, pitch, spatial position)
   * @private
   * @param {AudioSource} audioSource - Audio source component
   * @param {number} deltaTime - Time since last update
   * @param {Entity} entity - Entity with audio source
   */
  _updateAudioSource(audioSource, deltaTime, entity) {
    const t = Math.min(1, this.interpolationSpeed * deltaTime);

    // Smoothly interpolate volume
    if (audioSource.gainNode) {
      const currentVolume = audioSource.gainNode.gain.value;
      const newVolume = currentVolume + (audioSource.targetVolume - currentVolume) * t;
      audioSource.gainNode.gain.value = newVolume;
    }

    // Smoothly interpolate pitch
    if (audioSource.sourceNode && audioSource.sourceNode.playbackRate) {
      const currentPitch = audioSource.sourceNode.playbackRate.value;
      const newPitch = currentPitch + (audioSource.targetPitch - currentPitch) * t;
      audioSource.sourceNode.playbackRate.value = newPitch;
    }

    // Update spatial audio position
    if (audioSource.spatial && audioSource.pannerNode) {
      const transform = entity.getComponent('Transform');
      if (transform) {
        audioSource.pannerNode.positionX.value = transform.position.x;
        audioSource.pannerNode.positionY.value = transform.position.y;
        audioSource.pannerNode.positionZ.value = transform.position.z;
      }
    }
  }

  /**
   * Play a sound on an entity
   * @param {Entity} entity - Entity with AudioSource component
   */
  play(entity) {
    const audioSource = entity.getComponent('AudioSource');
    if (!audioSource) return;

    // Stop current playback if any
    if (audioSource.isPlaying) {
      this.stop(entity);
    }

    // Get audio buffer
    const buffer = this.audioBuffers.get(audioSource.soundId);
    if (!buffer) {
      console.warn(`Audio buffer not loaded: ${audioSource.soundId}`);
      return;
    }

    // Create source node
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = audioSource.loop;
    source.playbackRate.value = audioSource.pitch;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = audioSource.volume;

    // Set up audio graph
    let lastNode = source;

    // Add spatial audio if enabled
    if (audioSource.spatial) {
      const pannerNode = this.audioContext.createPanner();
      pannerNode.panningModel = 'HRTF';
      pannerNode.distanceModel = 'inverse';
      pannerNode.refDistance = audioSource.minDistance;
      pannerNode.maxDistance = audioSource.maxDistance;
      pannerNode.rolloffFactor = 1;

      // Set initial position
      const transform = entity.getComponent('Transform');
      if (transform) {
        pannerNode.positionX.value = transform.position.x;
        pannerNode.positionY.value = transform.position.y;
        pannerNode.positionZ.value = transform.position.z;
      }

      source.connect(pannerNode);
      pannerNode.connect(gainNode);
      audioSource.pannerNode = pannerNode;
      lastNode = pannerNode;
    } else {
      source.connect(gainNode);
    }

    // Connect to master output
    gainNode.connect(this.masterGainNode);

    // Store references
    audioSource.sourceNode = source;
    audioSource.gainNode = gainNode;
    audioSource.audioBuffer = buffer;

    // Handle playback end
    source.onended = () => {
      if (audioSource.isPlaying && !audioSource.loop) {
        audioSource.reset();
        this.activeSources.delete(source);
      }
    };

    // Start playback
    source.start(0);
    audioSource.isPlaying = true;
    audioSource.isPaused = false;
    audioSource.startTime = this.audioContext.currentTime;

    this.activeSources.add(source);
  }

  /**
   * Stop a sound on an entity
   * @param {Entity} entity - Entity with AudioSource component
   */
  stop(entity) {
    const audioSource = entity.getComponent('AudioSource');
    if (!audioSource || !audioSource.sourceNode) return;

    try {
      audioSource.sourceNode.stop();
    } catch (e) {
      // Already stopped
    }

    this.activeSources.delete(audioSource.sourceNode);
    audioSource.reset();
  }

  /**
   * Pause a sound on an entity
   * @param {Entity} entity - Entity with AudioSource component
   */
  pause(entity) {
    const audioSource = entity.getComponent('AudioSource');
    if (!audioSource || !audioSource.isPlaying || audioSource.isPaused) return;

    audioSource.isPaused = true;
    audioSource.pauseTime = this.audioContext.currentTime - audioSource.startTime;
    this.stop(entity);
  }

  /**
   * Resume a paused sound on an entity
   * @param {Entity} entity - Entity with AudioSource component
   */
  resume(entity) {
    const audioSource = entity.getComponent('AudioSource');
    if (!audioSource || !audioSource.isPaused) return;

    audioSource.isPaused = false;
    this.play(entity);

    // Seek to pause time (note: this is simplified, proper seeking would need more work)
    if (audioSource.sourceNode && !audioSource.loop) {
      audioSource.sourceNode.start(0, audioSource.pauseTime);
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Master volume (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
  }

  /**
   * Set listener position (for spatial audio)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   */
  setListenerPosition(x, y, z) {
    if (this.audioContext && this.audioContext.listener.positionX) {
      this.audioContext.listener.positionX.value = x;
      this.audioContext.listener.positionY.value = y;
      this.audioContext.listener.positionZ.value = z;
    }
  }

  /**
   * Set listener orientation (for spatial audio)
   * @param {number} forwardX - Forward vector X
   * @param {number} forwardY - Forward vector Y
   * @param {number} forwardZ - Forward vector Z
   * @param {number} upX - Up vector X
   * @param {number} upY - Up vector Y
   * @param {number} upZ - Up vector Z
   */
  setListenerOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ) {
    if (this.audioContext && this.audioContext.listener.forwardX) {
      this.audioContext.listener.forwardX.value = forwardX;
      this.audioContext.listener.forwardY.value = forwardY;
      this.audioContext.listener.forwardZ.value = forwardZ;
      this.audioContext.listener.upX.value = upX;
      this.audioContext.listener.upY.value = upY;
      this.audioContext.listener.upZ.value = upZ;
    }
  }

  /**
   * Clean up audio system
   */
  destroy() {
    // Stop all active sources
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    }
    this.activeSources.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }

    this.audioBuffers.clear();

    console.log('AudioSystem destroyed');
  }
}
