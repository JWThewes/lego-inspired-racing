import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Engine } from '../src/core/Engine.js';

describe('Engine', () => {
  let engine;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new Engine({ targetFPS: 60 });
  });

  afterEach(() => {
    if (engine.running) {
      engine.stop();
    }
    vi.restoreAllMocks();
  });

  it('should create engine with default config', () => {
    expect(engine).toBeDefined();
    expect(engine.config.targetFPS).toBe(60);
    expect(engine.running).toBe(false);
  });

  it('should create engine with custom config', () => {
    const customEngine = new Engine({ targetFPS: 30, maxFrameTime: 0.5 });
    expect(customEngine.config.targetFPS).toBe(30);
    expect(customEngine.config.maxFrameTime).toBe(0.5);
  });

  it('should have world and state manager', () => {
    expect(engine.world).toBeDefined();
    expect(engine.stateManager).toBeDefined();
  });

  it('should initialize with callback', () => {
    const initCallback = vi.fn();
    engine.init(initCallback);
    expect(initCallback).toHaveBeenCalledWith(engine);
  });

  it('should initialize without callback', () => {
    expect(() => engine.init()).not.toThrow();
  });

  it('should start engine', () => {
    const spy = vi.spyOn(window, 'requestAnimationFrame');
    engine.start();

    expect(engine.running).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should not start if already running', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    engine.start();
    engine.start(); // Try to start again

    expect(consoleSpy).toHaveBeenCalledWith('Engine is already running');
    consoleSpy.mockRestore();
  });

  it('should stop engine', () => {
    engine.start();
    engine.stop();
    expect(engine.running).toBe(false);
  });

  it('should get world', () => {
    const world = engine.getWorld();
    expect(world).toBe(engine.world);
  });

  it('should get state manager', () => {
    const stateManager = engine.getStateManager();
    expect(stateManager).toBe(engine.stateManager);
  });

  it('should calculate fixed timestep correctly', () => {
    expect(engine.fixedTimeStep).toBeCloseTo(1 / 60, 5);
  });

  it('should update FPS counter', () => {
    engine.start();

    // Mock performance.now to simulate time passing
    let currentTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      return currentTime;
    });

    // Simulate 60 frames over 1 second
    for (let i = 0; i < 60; i++) {
      currentTime += 16.67; // ~60fps
      engine._update(currentTime);
    }

    // After 1 second, FPS should be calculated
    currentTime += 1000;
    engine._update(currentTime);

    // FPS should be around 60
    expect(engine.getFPS()).toBeGreaterThan(0);
  });

  it('should cap delta time to prevent spiral of death', () => {
    const updateSpy = vi.spyOn(engine.world, 'update');
    engine.start();

    // Simulate a huge time jump
    let currentTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

    engine._update(currentTime);
    currentTime += 10000; // 10 second jump
    engine._update(currentTime);

    // Should cap to maxFrameTime (0.25s), not process 10 seconds
    // This prevents the accumulator from getting too large
    expect(engine.accumulator).toBeLessThan(1.0);
  });

  it('should shutdown cleanly', () => {
    const worldDestroySpy = vi.spyOn(engine.world, 'destroy');
    const stateManagerDestroySpy = vi.spyOn(engine.stateManager, 'destroy');

    engine.start();
    engine.shutdown();

    expect(engine.running).toBe(false);
    expect(worldDestroySpy).toHaveBeenCalled();
    expect(stateManagerDestroySpy).toHaveBeenCalled();
  });

  it('should handle fixed timestep updates', () => {
    const worldUpdateSpy = vi.spyOn(engine.world, 'update');
    const stateUpdateSpy = vi.spyOn(engine.stateManager, 'update');

    engine.start();

    let currentTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

    // First update
    engine._update(currentTime);

    // Advance time by one frame at 60fps
    currentTime += 16.67;
    engine._update(currentTime);

    // Both world and state manager should be updated
    expect(worldUpdateSpy).toHaveBeenCalled();
    expect(stateUpdateSpy).toHaveBeenCalled();
  });

  it('should accumulate time for fixed updates', () => {
    const worldUpdateSpy = vi.spyOn(engine.world, 'update');
    engine.start();

    let currentTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

    engine._update(currentTime);

    // Small time step (less than fixed timestep)
    currentTime += 8; // 8ms
    engine._update(currentTime);

    // Should accumulate but not update yet
    expect(engine.accumulator).toBeGreaterThan(0);
    expect(engine.accumulator).toBeLessThan(engine.fixedTimeStep);

    // Another small step that pushes over the threshold
    currentTime += 10; // Another 10ms
    engine._update(currentTime);

    // Now it should have updated
    expect(worldUpdateSpy).toHaveBeenCalled();
  });
});
