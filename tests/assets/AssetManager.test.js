import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssetManager } from '../../src/assets/AssetManager.js';

describe('AssetManager', () => {
  let assetManager;

  beforeEach(() => {
    assetManager = new AssetManager();
  });

  afterEach(() => {
    if (assetManager) {
      assetManager.destroy();
    }
  });

  describe('Initialization', () => {
    it('should create an AssetManager instance', () => {
      expect(assetManager).toBeDefined();
      expect(assetManager).toBeInstanceOf(AssetManager);
    });

    it('should initialize with empty asset map', () => {
      expect(assetManager.assets.size).toBe(0);
    });

    it('should initialize loaders', () => {
      expect(assetManager.gltfLoader).toBeDefined();
      expect(assetManager.textureLoader).toBeDefined();
      expect(assetManager.audioLoader).toBeDefined();
      expect(assetManager.loadingManager).toBeDefined();
    });

    it('should initialize loading state', () => {
      expect(assetManager.isLoading).toBe(false);
      expect(assetManager.totalAssets).toBe(0);
      expect(assetManager.loadedAssets).toBe(0);
    });
  });

  describe('Asset Storage', () => {
    it('should store assets in the map', () => {
      const mockAsset = { type: 'test', data: {}, path: '/test.png' };
      assetManager.assets.set('test-asset', mockAsset);

      expect(assetManager.hasAsset('test-asset')).toBe(true);
      expect(assetManager.getAsset('test-asset')).toEqual({});
    });

    it('should return undefined for non-existent assets', () => {
      expect(assetManager.getAsset('non-existent')).toBeUndefined();
    });

    it('should check if asset exists', () => {
      assetManager.assets.set('test', { data: {} });

      expect(assetManager.hasAsset('test')).toBe(true);
      expect(assetManager.hasAsset('missing')).toBe(false);
    });

    it('should return all assets', () => {
      assetManager.assets.set('asset1', { data: {} });
      assetManager.assets.set('asset2', { data: {} });

      const allAssets = assetManager.getAllAssets();
      expect(allAssets.size).toBe(2);
      expect(allAssets.has('asset1')).toBe(true);
      expect(allAssets.has('asset2')).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress correctly', () => {
      assetManager.totalAssets = 10;
      assetManager.loadedAssets = 5;

      expect(assetManager.getProgress()).toBe(50);
    });

    it('should return 0 progress when no assets', () => {
      expect(assetManager.getProgress()).toBe(0);
    });

    it('should return 100 progress when all loaded', () => {
      assetManager.totalAssets = 10;
      assetManager.loadedAssets = 10;

      expect(assetManager.getProgress()).toBe(100);
    });
  });

  describe('Callback Management', () => {
    it('should set progress callback', () => {
      const callback = vi.fn();
      assetManager.onProgress(callback);

      expect(assetManager.onProgressCallback).toBe(callback);
    });

    it('should set complete callback', () => {
      const callback = vi.fn();
      assetManager.onComplete(callback);

      expect(assetManager.onCompleteCallback).toBe(callback);
    });

    it('should set error callback', () => {
      const callback = vi.fn();
      assetManager.onError(callback);

      expect(assetManager.onErrorCallback).toBe(callback);
    });
  });

  describe('Error Handling', () => {
    it('should track loading errors', () => {
      const error = { url: '/test.png', message: 'Failed to load' };
      assetManager.errors.push(error);

      const errors = assetManager.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0]).toEqual(error);
    });

    it('should initialize with empty error array', () => {
      expect(assetManager.getErrors()).toEqual([]);
    });
  });

  describe('Clear and Destroy', () => {
    it('should clear all assets', () => {
      assetManager.assets.set('asset1', { data: {} });
      assetManager.assets.set('asset2', { data: {} });
      assetManager.errors.push({ message: 'error' });

      assetManager.clear();

      expect(assetManager.assets.size).toBe(0);
      expect(assetManager.errors.length).toBe(0);
    });

    it('should dispose of assets with dispose method', () => {
      const mockDispose = vi.fn();
      assetManager.assets.set('asset1', {
        data: { dispose: mockDispose }
      });

      assetManager.clear();

      expect(mockDispose).toHaveBeenCalled();
    });

    it('should destroy and clean up callbacks', () => {
      assetManager.onProgressCallback = vi.fn();
      assetManager.onCompleteCallback = vi.fn();
      assetManager.onErrorCallback = vi.fn();

      assetManager.destroy();

      expect(assetManager.onProgressCallback).toBeNull();
      expect(assetManager.onCompleteCallback).toBeNull();
      expect(assetManager.onErrorCallback).toBeNull();
    });
  });

  describe('Loading Assets', () => {
    it('should handle empty manifest', async () => {
      const manifest = {
        models: {},
        textures: {},
        audio: {}
      };

      const result = await assetManager.loadAssets(manifest);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should set loading state during load', () => {
      const manifest = { models: {}, textures: {}, audio: {} };

      assetManager.loadAssets(manifest);

      expect(assetManager.isLoading).toBe(true);
    });

    it('should clear previous assets before loading', async () => {
      assetManager.assets.set('old-asset', { data: {} });

      const manifest = { models: {}, textures: {}, audio: {} };
      await assetManager.loadAssets(manifest);

      // Old assets should be cleared
      expect(assetManager.hasAsset('old-asset')).toBe(false);
    });

    it('should clear previous errors before loading', async () => {
      assetManager.errors.push({ message: 'old error' });

      const manifest = { models: {}, textures: {}, audio: {} };
      await assetManager.loadAssets(manifest);

      expect(assetManager.errors.length).toBe(0);
    });
  });

  describe('Loading Manager Integration', () => {
    it('should bind loaders to loading manager', () => {
      expect(assetManager.gltfLoader.manager).toBe(assetManager.loadingManager);
      expect(assetManager.textureLoader.manager).toBe(assetManager.loadingManager);
      expect(assetManager.audioLoader.manager).toBe(assetManager.loadingManager);
    });
  });
});
