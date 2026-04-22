import { describe, it, expect } from 'vitest';
import {
  WeatherPresets,
  getWeatherPreset,
  getAvailableWeatherTypes,
  getRandomWeather
} from '../../src/weather/WeatherPresets.js';

describe('WeatherPresets', () => {
  it('should have clear weather preset', () => {
    expect(WeatherPresets.clear).toBeDefined();
    expect(WeatherPresets.clear.fogDensity).toBe(0.0);
    expect(WeatherPresets.clear.particleCount).toBe(0);
    expect(WeatherPresets.clear.visibility).toBe(1.0);
  });

  it('should have rain weather preset', () => {
    expect(WeatherPresets.rain).toBeDefined();
    expect(WeatherPresets.rain.fogDensity).toBeGreaterThan(0);
    expect(WeatherPresets.rain.particleCount).toBeGreaterThan(0);
    expect(WeatherPresets.rain.visibility).toBeLessThan(1.0);
  });

  it('should have snow weather preset', () => {
    expect(WeatherPresets.snow).toBeDefined();
    expect(WeatherPresets.snow.fogDensity).toBeGreaterThan(0);
    expect(WeatherPresets.snow.particleCount).toBeGreaterThan(0);
    expect(WeatherPresets.snow.visibility).toBeLessThan(1.0);
  });

  it('should have fog weather preset', () => {
    expect(WeatherPresets.fog).toBeDefined();
    expect(WeatherPresets.fog.fogDensity).toBeGreaterThan(WeatherPresets.rain.fogDensity);
    expect(WeatherPresets.fog.particleCount).toBe(0);
    expect(WeatherPresets.fog.visibility).toBeLessThan(0.5);
  });

  it('should differentiate rain and snow particles', () => {
    const rain = WeatherPresets.rain;
    const snow = WeatherPresets.snow;

    // Rain should be faster and smaller
    expect(rain.particleSpeed).toBeGreaterThan(snow.particleSpeed);
    expect(rain.particleSize).toBeLessThan(snow.particleSize);

    // Rain should have longer streaks
    expect(rain.particleLength).toBeGreaterThan(snow.particleLength);
  });
});

describe('getWeatherPreset', () => {
  it('should return correct preset by name', () => {
    const rainPreset = getWeatherPreset('rain');
    expect(rainPreset).toBe(WeatherPresets.rain);

    const snowPreset = getWeatherPreset('snow');
    expect(snowPreset).toBe(WeatherPresets.snow);
  });

  it('should return clear preset for unknown weather type', () => {
    const unknownPreset = getWeatherPreset('tornado');
    expect(unknownPreset).toBe(WeatherPresets.clear);
  });
});

describe('getAvailableWeatherTypes', () => {
  it('should return all weather type names', () => {
    const types = getAvailableWeatherTypes();

    expect(types).toContain('clear');
    expect(types).toContain('rain');
    expect(types).toContain('snow');
    expect(types).toContain('fog');
    expect(types.length).toBe(4);
  });

  it('should return array of strings', () => {
    const types = getAvailableWeatherTypes();
    expect(Array.isArray(types)).toBe(true);
    types.forEach(type => expect(typeof type).toBe('string'));
  });
});

describe('getRandomWeather', () => {
  it('should return a valid weather type', () => {
    const types = getAvailableWeatherTypes();
    const randomWeather = getRandomWeather();

    expect(types).toContain(randomWeather);
  });

  it('should not return the excluded current weather', () => {
    const results = new Set();

    // Run multiple times to test randomness
    for (let i = 0; i < 20; i++) {
      const weather = getRandomWeather('clear');
      results.add(weather);
      expect(weather).not.toBe('clear');
    }

    // Should get different results (probabilistic test)
    expect(results.size).toBeGreaterThan(1);
  });

  it('should work without current weather parameter', () => {
    const weather = getRandomWeather();
    const types = getAvailableWeatherTypes();

    expect(types).toContain(weather);
  });
});
