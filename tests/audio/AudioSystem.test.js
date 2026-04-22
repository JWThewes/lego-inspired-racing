import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioSystem } from '../../src/audio/AudioSystem.js';
import { AudioSource } from '../../src/audio/AudioSource.js';
import { Entity } from '../../src/core/Entity.js';
import { Transform } from '../../src/physics/Transform.js';
import * as THREE from 'three';

// Mock Web Audio API
const mockAudioContext = {
  createBufferSource: vi.fn(() => ({
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null
  })),
  createGain: vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn()
  })),
  createPanner: vi.fn(() => ({
    panningModel: 'HRTF',
    distanceModel: 'inverse',
    refDistance: 1,
    maxDistance: 10,
    rolloffFactor: 1,
    positionX: { value: 0 },
    positionY: { value: 0 },
    positionZ: { value: 0 },
    connect: vi.fn()
  })),
  createBuffer: vi.fn(() => ({})),
  decodeAudioData: vi.fn(() => Promise.resolve({})),
  destination: {},
  currentTime: 0,
  state: 'running',
  listener: {
    positionX: { value: 0 },
    positionY: { value: 0 },
    positionZ: { value: 0 },
    forwardX: { value: 0 },
    forwardY: { value: 0 },
    forwardZ: { value: -1 },
    upX: { value: 0 },
    upY: { value: 1 },
    upZ: { value: 0 }
  },
  close: vi.fn(),
  resume: vi.fn()
};

global.AudioContext = vi.fn(() => mockAudioContext);
global.fetch = vi.fn();

describe('AudioSystem', () => {
  let audioSystem;
  let entity;

  beforeEach(() => {
    audioSystem = new AudioSystem();
    entity = new Entity();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (audioSystem) {
      audioSystem.destroy();
    }
  });

  describe('constructor', () => {
    it('should create with default configuration', () => {
      expect(audioSystem.requiredComponents).toContain('AudioSource');
      expect(audioSystem.masterVolume).toBe(0.7);
      expect(audioSystem.interpolationSpeed).toBe(5);
      expect(audioSystem.priority).toBe(50);
    });

    it('should create with custom configuration', () => {
      const customSystem = new AudioSystem({
        masterVolume: 0.5,
        interpolationSpeed: 10
      });

      expect(customSystem.masterVolume).toBe(0.5);
      expect(customSystem.interpolationSpeed).toBe(10);
    });
  });

  describe('init', () => {
    it('should initialize audio context and master gain', () => {
      audioSystem.init(null);

      expect(audioSystem.audioContext).toBeDefined();
      expect(audioSystem.masterGainNode).toBeDefined();
      expect(audioSystem.masterGainNode.gain.value).toBe(0.7);
    });
  });

  describe('loadSound', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should load and cache audio buffer', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      global.fetch.mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      const buffer = await audioSystem.loadSound('test-sound', '/test.mp3');

      expect(buffer).toBeDefined();
      expect(audioSystem.audioBuffers.has('test-sound')).toBe(true);
    });

    it('should return cached buffer if already loaded', async () => {
      const cachedBuffer = {};
      audioSystem.audioBuffers.set('test-sound', cachedBuffer);

      const buffer = await audioSystem.loadSound('test-sound', '/test.mp3');

      expect(buffer).toBe(cachedBuffer);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed load', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(audioSystem.loadSound('test-sound', '/test.mp3'))
        .rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should play audio if playOnStart is true', () => {
      const audioSource = new AudioSource({
        soundId: 'test',
        playOnStart: true
      });
      entity.addComponent(audioSource);

      // Mock audio buffer
      audioSystem.audioBuffers.set('test', {});

      audioSystem.update(0.016, [entity]);

      expect(audioSource.playOnStart).toBe(false);
      expect(audioSource.isPlaying).toBe(true);
    });

    it('should update volume and pitch for playing sources', () => {
      const audioSource = new AudioSource({ soundId: 'test' });
      entity.addComponent(audioSource);

      // Set up playing state
      audioSource.isPlaying = true;
      audioSource.sourceNode = mockAudioContext.createBufferSource();
      audioSource.gainNode = mockAudioContext.createGain();
      audioSource.targetVolume = 0.5;
      audioSource.targetPitch = 1.5;

      audioSystem.update(0.1, [entity]);

      // Volume and pitch should be interpolated
      expect(audioSource.gainNode.gain.value).toBeGreaterThan(0);
      expect(audioSource.sourceNode.playbackRate.value).toBeGreaterThan(1);
    });

    it('should update spatial audio position', () => {
      const audioSource = new AudioSource({
        soundId: 'test',
        spatial: true
      });
      const transform = new Transform(new THREE.Vector3(5, 2, 10));
      entity.addComponent(audioSource);
      entity.addComponent(transform);

      // Set up playing state with spatial audio
      audioSource.isPlaying = true;
      audioSource.sourceNode = mockAudioContext.createBufferSource();
      audioSource.gainNode = mockAudioContext.createGain();
      audioSource.pannerNode = mockAudioContext.createPanner();

      audioSystem.update(0.016, [entity]);

      expect(audioSource.pannerNode.positionX.value).toBe(5);
      expect(audioSource.pannerNode.positionY.value).toBe(2);
      expect(audioSource.pannerNode.positionZ.value).toBe(10);
    });
  });

  describe('play', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should play audio source', () => {
      const audioSource = new AudioSource({ soundId: 'test', volume: 0.8 });
      entity.addComponent(audioSource);

      audioSystem.audioBuffers.set('test', {});
      audioSystem.play(entity);

      expect(audioSource.isPlaying).toBe(true);
      expect(audioSource.sourceNode).toBeDefined();
      expect(audioSource.gainNode).toBeDefined();
    });

    it('should set up spatial audio if enabled', () => {
      const audioSource = new AudioSource({
        soundId: 'test',
        spatial: true
      });
      const transform = new Transform(new THREE.Vector3(1, 2, 3));
      entity.addComponent(audioSource);
      entity.addComponent(transform);

      audioSystem.audioBuffers.set('test', {});
      audioSystem.play(entity);

      expect(audioSource.pannerNode).toBeDefined();
    });

    it('should warn if audio buffer not loaded', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const audioSource = new AudioSource({ soundId: 'missing' });
      entity.addComponent(audioSource);

      audioSystem.play(entity);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('missing'));
      consoleSpy.mockRestore();
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should stop playing audio source', () => {
      const audioSource = new AudioSource({ soundId: 'test' });
      entity.addComponent(audioSource);

      audioSystem.audioBuffers.set('test', {});
      audioSystem.play(entity);

      expect(audioSource.isPlaying).toBe(true);

      audioSystem.stop(entity);

      expect(audioSource.isPlaying).toBe(false);
      expect(audioSource.sourceNode).toBe(null);
    });
  });

  describe('setMasterVolume', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should set master volume', () => {
      audioSystem.setMasterVolume(0.5);

      expect(audioSystem.masterVolume).toBe(0.5);
      expect(audioSystem.masterGainNode.gain.value).toBe(0.5);
    });

    it('should clamp master volume to 0-1 range', () => {
      audioSystem.setMasterVolume(1.5);
      expect(audioSystem.masterVolume).toBe(1);

      audioSystem.setMasterVolume(-0.5);
      expect(audioSystem.masterVolume).toBe(0);
    });
  });

  describe('setListenerPosition', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should set listener position', () => {
      audioSystem.setListenerPosition(10, 5, 20);

      expect(audioSystem.audioContext.listener.positionX.value).toBe(10);
      expect(audioSystem.audioContext.listener.positionY.value).toBe(5);
      expect(audioSystem.audioContext.listener.positionZ.value).toBe(20);
    });
  });

  describe('setListenerOrientation', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should set listener orientation', () => {
      audioSystem.setListenerOrientation(0, 0, -1, 0, 1, 0);

      expect(audioSystem.audioContext.listener.forwardX.value).toBe(0);
      expect(audioSystem.audioContext.listener.forwardY.value).toBe(0);
      expect(audioSystem.audioContext.listener.forwardZ.value).toBe(-1);
      expect(audioSystem.audioContext.listener.upX.value).toBe(0);
      expect(audioSystem.audioContext.listener.upY.value).toBe(1);
      expect(audioSystem.audioContext.listener.upZ.value).toBe(0);
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      audioSystem.init(null);
    });

    it('should clean up all resources', () => {
      const audioSource = new AudioSource({ soundId: 'test' });
      entity.addComponent(audioSource);

      audioSystem.audioBuffers.set('test', {});
      audioSystem.play(entity);

      audioSystem.destroy();

      expect(audioSystem.activeSources.size).toBe(0);
      expect(audioSystem.audioBuffers.size).toBe(0);
    });
  });
});
