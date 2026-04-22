import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * AssetManager - Centralized asset loading with progress tracking and error handling
 * Manages loading of 3D models, textures, audio, and other game assets
 */
export class AssetManager {
  constructor() {
    this.assets = new Map();
    this.loadingProgress = new Map();
    this.errors = [];

    // Initialize loaders
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.loadingManager = new THREE.LoadingManager();

    // Configure loading manager callbacks
    this._setupLoadingManager();

    // Bind loaders to loading manager
    this.gltfLoader.manager = this.loadingManager;
    this.textureLoader.manager = this.loadingManager;
    this.audioLoader.manager = this.loadingManager;

    // Loading state
    this.isLoading = false;
    this.totalAssets = 0;
    this.loadedAssets = 0;

    // Callbacks
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Setup loading manager event handlers
   * @private
   */
  _setupLoadingManager() {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Started loading: ${url}`);
      this.totalAssets = itemsTotal;
      this.loadedAssets = itemsLoaded;
    };

    this.loadingManager.onLoad = () => {
      console.log('All assets loaded');
      this.isLoading = false;
      if (this.onCompleteCallback) {
        this.onCompleteCallback(this.assets, this.errors);
      }
    };

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.loadedAssets = itemsLoaded;
      this.totalAssets = itemsTotal;
      const progress = (itemsLoaded / itemsTotal) * 100;

      console.log(`Loading progress: ${progress.toFixed(1)}% (${itemsLoaded}/${itemsTotal})`);

      if (this.onProgressCallback) {
        this.onProgressCallback(progress, itemsLoaded, itemsTotal, url);
      }
    };

    this.loadingManager.onError = (url) => {
      const error = { url, message: `Failed to load: ${url}` };
      this.errors.push(error);
      console.error(error.message);

      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };
  }

  /**
   * Load all game assets
   * @param {Object} assetManifest - Manifest of assets to load
   * @returns {Promise<Map>} Promise that resolves with loaded assets
   */
  async loadAssets(assetManifest) {
    this.isLoading = true;
    this.errors = [];
    this.assets.clear();

    const startTime = performance.now();

    try {
      // Load all asset types in parallel
      const loadPromises = [];

      // Load GLTF models
      if (assetManifest.models) {
        for (const [key, path] of Object.entries(assetManifest.models)) {
          loadPromises.push(this.loadModel(key, path));
        }
      }

      // Load textures
      if (assetManifest.textures) {
        for (const [key, path] of Object.entries(assetManifest.textures)) {
          loadPromises.push(this.loadTexture(key, path));
        }
      }

      // Load audio files
      if (assetManifest.audio) {
        for (const [key, path] of Object.entries(assetManifest.audio)) {
          loadPromises.push(this.loadAudio(key, path));
        }
      }

      // Wait for all assets to load
      await Promise.allSettled(loadPromises);

      const endTime = performance.now();
      const loadTime = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`Asset loading completed in ${loadTime}s`);
      console.log(`Loaded: ${this.assets.size} assets`);

      if (this.errors.length > 0) {
        console.warn(`Errors: ${this.errors.length} assets failed to load`);
      }

      return this.assets;

    } catch (error) {
      console.error('Critical error during asset loading:', error);
      throw error;
    }
  }

  /**
   * Load a GLTF model
   * @param {string} key - Asset identifier
   * @param {string} path - Path to GLTF file
   * @returns {Promise<void>}
   */
  loadModel(key, path) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          this.assets.set(key, { type: 'model', data: gltf, path });
          console.log(`Model loaded: ${key}`);
          resolve();
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          this.loadingProgress.set(key, percent);
        },
        (error) => {
          const err = { key, path, message: error.message };
          this.errors.push(err);
          console.error(`Failed to load model ${key}:`, error);
          reject(err);
        }
      );
    });
  }

  /**
   * Load a texture
   * @param {string} key - Asset identifier
   * @param {string} path - Path to texture file
   * @returns {Promise<void>}
   */
  loadTexture(key, path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          this.assets.set(key, { type: 'texture', data: texture, path });
          console.log(`Texture loaded: ${key}`);
          resolve();
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          this.loadingProgress.set(key, percent);
        },
        (error) => {
          const err = { key, path, message: error.message || 'Failed to load texture' };
          this.errors.push(err);
          console.error(`Failed to load texture ${key}:`, error);
          reject(err);
        }
      );
    });
  }

  /**
   * Load an audio file
   * @param {string} key - Asset identifier
   * @param {string} path - Path to audio file
   * @returns {Promise<void>}
   */
  loadAudio(key, path) {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        path,
        (buffer) => {
          this.assets.set(key, { type: 'audio', data: buffer, path });
          console.log(`Audio loaded: ${key}`);
          resolve();
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          this.loadingProgress.set(key, percent);
        },
        (error) => {
          const err = { key, path, message: error.message || 'Failed to load audio' };
          this.errors.push(err);
          console.error(`Failed to load audio ${key}:`, error);
          reject(err);
        }
      );
    });
  }

  /**
   * Get a loaded asset by key
   * @param {string} key - Asset identifier
   * @returns {*} The loaded asset or undefined
   */
  getAsset(key) {
    const asset = this.assets.get(key);
    return asset ? asset.data : undefined;
  }

  /**
   * Check if an asset is loaded
   * @param {string} key - Asset identifier
   * @returns {boolean}
   */
  hasAsset(key) {
    return this.assets.has(key);
  }

  /**
   * Get loading progress as percentage
   * @returns {number} Progress from 0 to 100
   */
  getProgress() {
    if (this.totalAssets === 0) return 0;
    return (this.loadedAssets / this.totalAssets) * 100;
  }

  /**
   * Get all loaded assets
   * @returns {Map} Map of all assets
   */
  getAllAssets() {
    return this.assets;
  }

  /**
   * Get all loading errors
   * @returns {Array} Array of error objects
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Set progress callback
   * @param {Function} callback - Called with (progress, loaded, total, url)
   */
  onProgress(callback) {
    this.onProgressCallback = callback;
  }

  /**
   * Set completion callback
   * @param {Function} callback - Called with (assets, errors)
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
  }

  /**
   * Set error callback
   * @param {Function} callback - Called with (error)
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Clear all loaded assets
   */
  clear() {
    // Dispose of Three.js resources
    this.assets.forEach((asset) => {
      if (asset.data && asset.data.dispose) {
        asset.data.dispose();
      }
    });

    this.assets.clear();
    this.loadingProgress.clear();
    this.errors = [];
  }

  /**
   * Destroy the asset manager and clean up resources
   */
  destroy() {
    this.clear();
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
    this.onErrorCallback = null;
  }
}
