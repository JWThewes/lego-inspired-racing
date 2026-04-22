import { System } from '../core/System.js';
import * as THREE from 'three';
import { getWeatherPreset, getRandomWeather } from './WeatherPresets.js';

/**
 * WeatherSystem - manages weather transitions and particle effects
 * Handles fog, rain, snow, and smooth transitions between weather states
 */
export class WeatherSystem extends System {
  constructor(scene) {
    super();
    this.requiredComponents = ['WeatherComponent'];
    this.priority = 15; // Run after vehicle/physics systems

    if (!scene) {
      throw new Error('WeatherSystem requires a Three.js scene');
    }

    this.scene = scene;

    // Particle system resources
    this.particleSystem = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particles = null;

    // Fog reference
    this.fog = null;

    // Performance settings
    this.maxParticles = 2000;
    this.particleSpawnArea = { width: 100, depth: 100, height: 50 };
    this.cameraPosition = new THREE.Vector3();
  }

  /**
   * Initialize the weather system
   * @param {World} world - The game world
   */
  init(world) {
    this.world = world;

    // Create fog (initially disabled)
    this.fog = new THREE.Fog(0xffffff, 10, 100);
    this.scene.fog = this.fog;

    // Create particle system
    this._initParticleSystem();
  }

  /**
   * Initialize particle system for rain/snow effects
   * @private
   */
  _initParticleSystem() {
    // Create geometry with positions and velocities
    this.particleGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.maxParticles * 3);
    const velocities = new Float32Array(this.maxParticles * 3);

    // Initialize particles in spawn area
    for (let i = 0; i < this.maxParticles; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * this.particleSpawnArea.width;
      positions[i3 + 1] = Math.random() * this.particleSpawnArea.height;
      positions[i3 + 2] = (Math.random() - 0.5) * this.particleSpawnArea.depth;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    // Create material
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    // Create particle system
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.particleSystem.visible = false;
    this.scene.add(this.particleSystem);
  }

  /**
   * Update weather system
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities with WeatherComponent
   */
  update(deltaTime, entities) {
    for (const entity of entities) {
      const weather = entity.getComponent('WeatherComponent');

      // Update weather timing
      weather.timeSinceWeatherChange += deltaTime;

      // Trigger automatic weather change if enabled
      if (weather.autoWeatherChanges &&
          weather.timeSinceWeatherChange >= weather.nextWeatherChangeIn &&
          !weather.isTransitioning) {
        this._triggerRandomWeatherChange(weather);
      }

      // Update transition
      if (weather.isTransitioning) {
        weather.updateTransition(deltaTime);
      }

      // Apply weather effects
      this._updateWeatherEffects(weather, deltaTime);
    }
  }

  /**
   * Trigger a random weather change
   * @private
   */
  _triggerRandomWeatherChange(weather) {
    const newWeather = getRandomWeather(weather.currentWeather);
    weather.startTransition(newWeather, weather.transitionDuration);

    // Schedule next change
    weather.nextWeatherChangeIn =
      weather.minWeatherDuration +
      Math.random() * (weather.maxWeatherDuration - weather.minWeatherDuration);
  }

  /**
   * Update weather visual effects based on current weather state
   * @private
   */
  _updateWeatherEffects(weather, deltaTime) {
    // Get current and target presets
    const currentPreset = getWeatherPreset(weather.currentWeather);
    const targetPreset = getWeatherPreset(weather.targetWeather);

    // Interpolate between presets during transition
    const t = weather.isTransitioning ? weather.transitionProgress : 0;
    const currentValues = weather.isTransitioning ?
      this._interpolatePresets(currentPreset, targetPreset, t) :
      currentPreset;

    // Update fog
    this._updateFog(currentValues);

    // Update particle system
    this._updateParticles(currentValues, deltaTime);
  }

  /**
   * Interpolate between two weather presets
   * @private
   */
  _interpolatePresets(from, to, t) {
    return {
      fogDensity: this._lerp(from.fogDensity, to.fogDensity, t),
      fogColor: this._lerpColor(from.fogColor, to.fogColor, t),
      particleCount: Math.floor(this._lerp(from.particleCount, to.particleCount, t)),
      particleSpeed: this._lerp(from.particleSpeed, to.particleSpeed, t),
      particleSize: this._lerp(from.particleSize, to.particleSize, t),
      particleLength: this._lerp(from.particleLength || 0, to.particleLength || 0, t),
      visibility: this._lerp(from.visibility, to.visibility, t),
      windEffect: this._lerp(from.windEffect || 0, to.windEffect || 0, t)
    };
  }

  /**
   * Update fog effects
   * @private
   */
  _updateFog(weatherValues) {
    if (weatherValues.fogDensity > 0) {
      this.fog.density = weatherValues.fogDensity;
      this.fog.color.setHex(weatherValues.fogColor);
      this.fog.near = 10;
      this.fog.far = 100 / weatherValues.fogDensity;
    } else {
      // Disable fog by setting very far distance
      this.fog.near = 1000;
      this.fog.far = 2000;
    }
  }

  /**
   * Update particle system for rain/snow
   * @private
   */
  _updateParticles(weatherValues, deltaTime) {
    const activeParticles = weatherValues.particleCount;

    if (activeParticles === 0) {
      this.particleSystem.visible = false;
      return;
    }

    this.particleSystem.visible = true;

    // Update material properties
    this.particleMaterial.size = weatherValues.particleSize;
    this.particleMaterial.opacity = 0.6 * (activeParticles / this.maxParticles);

    // Update particle positions
    const positions = this.particleGeometry.attributes.position.array;
    const velocities = this.particleGeometry.attributes.velocity.array;

    // Get camera position for particle spawning around player
    const camera = this.world?.camera;
    if (camera) {
      this.cameraPosition.copy(camera.position);
    }

    for (let i = 0; i < activeParticles; i++) {
      const i3 = i * 3;

      // Apply velocity (falling + wind)
      positions[i3] += velocities[i3] * deltaTime;
      positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
      positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

      // Reset particles that fall below ground or go out of bounds
      if (positions[i3 + 1] < 0 ||
          Math.abs(positions[i3] - this.cameraPosition.x) > this.particleSpawnArea.width / 2 ||
          Math.abs(positions[i3 + 2] - this.cameraPosition.z) > this.particleSpawnArea.depth / 2) {

        // Respawn particle above camera
        positions[i3] = this.cameraPosition.x + (Math.random() - 0.5) * this.particleSpawnArea.width;
        positions[i3 + 1] = this.cameraPosition.y + this.particleSpawnArea.height;
        positions[i3 + 2] = this.cameraPosition.z + (Math.random() - 0.5) * this.particleSpawnArea.depth;

        // Set velocity
        velocities[i3] = (Math.random() - 0.5) * weatherValues.windEffect * 2;
        velocities[i3 + 1] = -weatherValues.particleSpeed;
        velocities[i3 + 2] = (Math.random() - 0.5) * weatherValues.windEffect;
      }
    }

    // Hide inactive particles
    for (let i = activeParticles; i < this.maxParticles; i++) {
      const i3 = i * 3;
      positions[i3 + 1] = -1000; // Move far below ground
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
  }

  /**
   * Set camera reference for particle positioning
   * @param {THREE.Vector3} position - Camera position
   */
  setCameraPosition(position) {
    this.cameraPosition.copy(position);
  }

  /**
   * Linear interpolation
   * @private
   */
  _lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Color interpolation
   * @private
   */
  _lerpColor(colorA, colorB, t) {
    const ca = new THREE.Color(colorA);
    const cb = new THREE.Color(colorB);
    return ca.lerp(cb, t).getHex();
  }

  /**
   * Clean up system resources
   */
  destroy() {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleGeometry?.dispose();
      this.particleMaterial?.dispose();
      this.particleSystem = null;
    }
  }
}
