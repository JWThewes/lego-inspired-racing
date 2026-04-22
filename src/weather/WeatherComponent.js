import { Component } from '../core/Component.js';

/**
 * WeatherComponent - stores current weather state and transition information
 * Pure data container for weather properties
 */
export class WeatherComponent extends Component {
  constructor(initialWeather = 'clear') {
    super();

    // Current weather state
    this.currentWeather = initialWeather;
    this.targetWeather = initialWeather;

    // Transition state
    this.isTransitioning = false;
    this.transitionProgress = 0; // 0 to 1
    this.transitionDuration = 3.0; // seconds

    // Weather timing
    this.timeSinceWeatherChange = 0;
    this.nextWeatherChangeIn = 30; // seconds until next random weather change
    this.minWeatherDuration = 20; // minimum seconds between changes
    this.maxWeatherDuration = 60; // maximum seconds between changes

    // Weather intensity (0 to 1)
    this.intensity = 1.0;
    this.targetIntensity = 1.0;

    // Enable/disable automatic weather changes
    this.autoWeatherChanges = true;
  }

  /**
   * Start transitioning to a new weather type
   * @param {string} weatherType - Target weather type ('clear', 'rain', 'snow', 'fog')
   * @param {number} duration - Transition duration in seconds
   */
  startTransition(weatherType, duration = 3.0) {
    if (weatherType === this.currentWeather) {
      return; // Already at target weather
    }

    this.targetWeather = weatherType;
    this.transitionDuration = duration;
    this.transitionProgress = 0;
    this.isTransitioning = true;
  }

  /**
   * Update transition progress
   * @param {number} deltaTime - Time since last update in seconds
   * @returns {boolean} True if transition is complete
   */
  updateTransition(deltaTime) {
    if (!this.isTransitioning) {
      return false;
    }

    this.transitionProgress += deltaTime / this.transitionDuration;

    if (this.transitionProgress >= 1.0) {
      this.transitionProgress = 1.0;
      this.currentWeather = this.targetWeather;
      this.isTransitioning = false;
      this.timeSinceWeatherChange = 0;
      return true;
    }

    return false;
  }
}
