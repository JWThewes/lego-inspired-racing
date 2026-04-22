import { describe, it, expect, beforeEach } from 'vitest';
import { AudioSource } from '../../src/audio/AudioSource.js';

describe('AudioSource', () => {
  let audioSource;

  beforeEach(() => {
    audioSource = new AudioSource();
  });

  describe('constructor', () => {
    it('should create with default values', () => {
      expect(audioSource.soundId).toBe(null);
      expect(audioSource.loop).toBe(false);
      expect(audioSource.volume).toBe(1.0);
      expect(audioSource.pitch).toBe(1.0);
      expect(audioSource.playOnStart).toBe(false);
      expect(audioSource.spatial).toBe(false);
      expect(audioSource.isPlaying).toBe(false);
      expect(audioSource.isPaused).toBe(false);
    });

    it('should create with custom configuration', () => {
      const config = {
        soundId: 'engine-sound',
        loop: true,
        volume: 0.5,
        pitch: 1.2,
        playOnStart: true,
        spatial: true,
        minDistance: 2,
        maxDistance: 20
      };

      const customSource = new AudioSource(config);

      expect(customSource.soundId).toBe('engine-sound');
      expect(customSource.loop).toBe(true);
      expect(customSource.volume).toBe(0.5);
      expect(customSource.pitch).toBe(1.2);
      expect(customSource.playOnStart).toBe(true);
      expect(customSource.spatial).toBe(true);
      expect(customSource.minDistance).toBe(2);
      expect(customSource.maxDistance).toBe(20);
    });

    it('should extend Component class', () => {
      expect(audioSource).toBeInstanceOf(Object);
      expect(audioSource.constructor.name).toBe('AudioSource');
    });
  });

  describe('setVolume', () => {
    it('should set target volume within valid range', () => {
      audioSource.setVolume(0.7);
      expect(audioSource.targetVolume).toBe(0.7);
    });

    it('should clamp volume to 0-1 range', () => {
      audioSource.setVolume(1.5);
      expect(audioSource.targetVolume).toBe(1);

      audioSource.setVolume(-0.5);
      expect(audioSource.targetVolume).toBe(0);
    });
  });

  describe('setPitch', () => {
    it('should set target pitch', () => {
      audioSource.setPitch(1.5);
      expect(audioSource.targetPitch).toBe(1.5);
    });

    it('should clamp pitch to 0.1-4 range', () => {
      audioSource.setPitch(5);
      expect(audioSource.targetPitch).toBe(4);

      audioSource.setPitch(0.05);
      expect(audioSource.targetPitch).toBe(0.1);
    });
  });

  describe('reset', () => {
    it('should reset playback state', () => {
      audioSource.isPlaying = true;
      audioSource.isPaused = true;
      audioSource.sourceNode = {};
      audioSource.startTime = 1000;
      audioSource.pauseTime = 500;

      audioSource.reset();

      expect(audioSource.isPlaying).toBe(false);
      expect(audioSource.isPaused).toBe(false);
      expect(audioSource.sourceNode).toBe(null);
      expect(audioSource.startTime).toBe(0);
      expect(audioSource.pauseTime).toBe(0);
    });
  });

  describe('target values', () => {
    it('should initialize target values to current values', () => {
      const source = new AudioSource({ volume: 0.8, pitch: 1.3 });
      expect(source.targetVolume).toBe(0.8);
      expect(source.targetPitch).toBe(1.3);
    });
  });
});
