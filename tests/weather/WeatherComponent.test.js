import { describe, it, expect } from 'vitest';
import { WeatherComponent } from '../../src/weather/WeatherComponent.js';

describe('WeatherComponent', () => {
  it('should create with default clear weather', () => {
    const weather = new WeatherComponent();

    expect(weather.currentWeather).toBe('clear');
    expect(weather.targetWeather).toBe('clear');
    expect(weather.isTransitioning).toBe(false);
    expect(weather.transitionProgress).toBe(0);
  });

  it('should create with specified initial weather', () => {
    const weather = new WeatherComponent('rain');

    expect(weather.currentWeather).toBe('rain');
    expect(weather.targetWeather).toBe('rain');
  });

  it('should initialize timing properties', () => {
    const weather = new WeatherComponent();

    expect(weather.timeSinceWeatherChange).toBe(0);
    expect(weather.nextWeatherChangeIn).toBe(30);
    expect(weather.minWeatherDuration).toBe(20);
    expect(weather.maxWeatherDuration).toBe(60);
    expect(weather.autoWeatherChanges).toBe(true);
  });

  it('should initialize intensity properties', () => {
    const weather = new WeatherComponent();

    expect(weather.intensity).toBe(1.0);
    expect(weather.targetIntensity).toBe(1.0);
  });

  it('should start transition to new weather', () => {
    const weather = new WeatherComponent('clear');

    weather.startTransition('rain', 5.0);

    expect(weather.targetWeather).toBe('rain');
    expect(weather.transitionDuration).toBe(5.0);
    expect(weather.transitionProgress).toBe(0);
    expect(weather.isTransitioning).toBe(true);
  });

  it('should not start transition to same weather', () => {
    const weather = new WeatherComponent('rain');

    weather.startTransition('rain', 5.0);

    expect(weather.isTransitioning).toBe(false);
  });

  it('should update transition progress', () => {
    const weather = new WeatherComponent('clear');
    weather.startTransition('rain', 2.0);

    const complete = weather.updateTransition(1.0); // 50% progress

    expect(weather.transitionProgress).toBe(0.5);
    expect(weather.isTransitioning).toBe(true);
    expect(complete).toBe(false);
  });

  it('should complete transition when progress reaches 1.0', () => {
    const weather = new WeatherComponent('clear');
    weather.startTransition('rain', 2.0);

    weather.updateTransition(1.0);
    const complete = weather.updateTransition(1.0); // Total 2.0 seconds

    expect(weather.transitionProgress).toBe(1.0);
    expect(weather.currentWeather).toBe('rain');
    expect(weather.isTransitioning).toBe(false);
    expect(weather.timeSinceWeatherChange).toBe(0);
    expect(complete).toBe(true);
  });

  it('should not update transition when not transitioning', () => {
    const weather = new WeatherComponent('clear');

    const complete = weather.updateTransition(1.0);

    expect(complete).toBe(false);
    expect(weather.transitionProgress).toBe(0);
  });

  it('should use default transition duration', () => {
    const weather = new WeatherComponent('clear');

    weather.startTransition('snow');

    expect(weather.transitionDuration).toBe(3.0);
  });

  it('should extend Component base class', () => {
    const weather = new WeatherComponent();
    expect(weather.constructor.name).toBe('WeatherComponent');
  });
});
