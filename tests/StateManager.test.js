import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../src/core/StateManager.js';

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should create empty state manager', () => {
    expect(stateManager.currentState).toBeNull();
    expect(stateManager.previousState).toBeNull();
  });

  it('should add state', () => {
    const mockState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', mockState);
    expect(stateManager.states.has('menu')).toBe(true);
  });

  it('should return state manager for chaining', () => {
    const mockState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    const result = stateManager.addState('menu', mockState);
    expect(result).toBe(stateManager);
  });

  it('should throw error if state missing required methods', () => {
    const badState = { enter: vi.fn() }; // Missing update and exit

    expect(() => {
      stateManager.addState('bad', badState);
    }).toThrow('State bad must have enter, update, and exit methods');
  });

  it('should transition to state', () => {
    const menuState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', menuState);
    stateManager.setState('menu');

    expect(menuState.enter).toHaveBeenCalled();
    expect(stateManager.currentState).toBe(menuState);
  });

  it('should pass data to state on transition', () => {
    const gameState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('game', gameState);
    const data = { level: 1, score: 0 };
    stateManager.setState('game', data);

    expect(gameState.enter).toHaveBeenCalledWith(data);
  });

  it('should throw error for unknown state', () => {
    expect(() => {
      stateManager.setState('unknown');
    }).toThrow('State unknown not found');
  });

  it('should exit previous state on transition', () => {
    const menuState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    const gameState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', menuState);
    stateManager.addState('game', gameState);

    stateManager.setState('menu');
    stateManager.setState('game');

    expect(menuState.exit).toHaveBeenCalled();
    expect(gameState.enter).toHaveBeenCalled();
  });

  it('should track previous state', () => {
    const menuState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    const gameState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', menuState);
    stateManager.addState('game', gameState);

    stateManager.setState('menu');
    expect(stateManager.getPreviousStateName()).toBeNull();

    stateManager.setState('game');
    expect(stateManager.getPreviousStateName()).toBe('menu');
  });

  it('should update current state', () => {
    const gameState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('game', gameState);
    stateManager.setState('game');

    stateManager.update(0.016);

    expect(gameState.update).toHaveBeenCalledWith(0.016);
  });

  it('should not update if no current state', () => {
    // Should not throw
    expect(() => stateManager.update(0.016)).not.toThrow();
  });

  it('should get current state name', () => {
    const menuState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', menuState);
    expect(stateManager.getCurrentStateName()).toBeNull();

    stateManager.setState('menu');
    expect(stateManager.getCurrentStateName()).toBe('menu');
  });

  it('should check if state is active', () => {
    const menuState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', menuState);
    expect(stateManager.isState('menu')).toBe(false);

    stateManager.setState('menu');
    expect(stateManager.isState('menu')).toBe(true);
    expect(stateManager.isState('game')).toBe(false);
  });

  it('should destroy state manager', () => {
    const menuState = {
      enter: vi.fn(),
      update: vi.fn(),
      exit: vi.fn()
    };

    stateManager.addState('menu', menuState);
    stateManager.setState('menu');

    stateManager.destroy();

    expect(menuState.exit).toHaveBeenCalled();
    expect(stateManager.states.size).toBe(0);
    expect(stateManager.currentState).toBeNull();
  });

  it('should handle multiple state transitions', () => {
    const states = ['menu', 'game', 'pause', 'game-over'].map(name => ({
      name,
      state: {
        enter: vi.fn(),
        update: vi.fn(),
        exit: vi.fn()
      }
    }));

    states.forEach(({ name, state }) => {
      stateManager.addState(name, state);
    });

    // Transition through all states
    stateManager.setState('menu');
    stateManager.setState('game');
    stateManager.setState('pause');
    stateManager.setState('game-over');

    expect(stateManager.getCurrentStateName()).toBe('game-over');
    expect(stateManager.getPreviousStateName()).toBe('pause');

    // Verify each state was entered and exited correctly
    states.forEach(({ state }) => {
      expect(state.enter).toHaveBeenCalled();
    });
  });
});
