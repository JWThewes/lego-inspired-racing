/**
 * Weather presets define visual and performance characteristics for each weather type
 */
export const WeatherPresets = {
  clear: {
    fogDensity: 0.0,
    fogColor: 0xffffff,
    particleCount: 0,
    particleSpeed: 0,
    particleSize: 0,
    visibility: 1.0,
    description: 'Clear skies, perfect visibility'
  },

  rain: {
    fogDensity: 0.02,
    fogColor: 0x888888,
    particleCount: 2000, // Reduced for performance
    particleSpeed: 50,
    particleSize: 0.1,
    particleLength: 2.0, // Streaky rain effect
    visibility: 0.8,
    windEffect: 0.3,
    description: 'Rain with reduced visibility'
  },

  snow: {
    fogDensity: 0.03,
    fogColor: 0xcccccc,
    particleCount: 1500,
    particleSpeed: 10,
    particleSize: 0.3,
    particleLength: 0.3, // Round snowflakes
    visibility: 0.7,
    windEffect: 0.5,
    description: 'Snow with moderate visibility reduction'
  },

  fog: {
    fogDensity: 0.08,
    fogColor: 0xaaaaaa,
    particleCount: 0,
    particleSpeed: 0,
    particleSize: 0,
    visibility: 0.4,
    description: 'Heavy fog, severely reduced visibility'
  }
};

/**
 * Get weather preset by name
 * @param {string} weatherType - Weather type name
 * @returns {Object} Weather preset configuration
 */
export function getWeatherPreset(weatherType) {
  return WeatherPresets[weatherType] || WeatherPresets.clear;
}

/**
 * Get all available weather types
 * @returns {Array<string>} Array of weather type names
 */
export function getAvailableWeatherTypes() {
  return Object.keys(WeatherPresets);
}

/**
 * Get random weather type (excluding current)
 * @param {string} currentWeather - Current weather to exclude
 * @returns {string} Random weather type
 */
export function getRandomWeather(currentWeather = '') {
  const types = getAvailableWeatherTypes().filter(type => type !== currentWeather);
  return types[Math.floor(Math.random() * types.length)];
}
