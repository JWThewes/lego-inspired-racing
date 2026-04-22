import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIManager } from '../../src/ui/UIManager.js';
import { BaseScreen } from '../../src/ui/BaseScreen.js';

// Mock screen for testing
class MockScreen extends BaseScreen {
  constructor(id) {
    super(id);
    this.showCalled = false;
    this.hideCalled = false;
    this.destroyCalled = false;
  }

  create() {
    const container = document.createElement('div');
    container.id = this.id;
    return container;
  }

  show() {
    super.show();
    this.showCalled = true;
  }

  hide() {
    super.hide();
    this.hideCalled = true;
  }

  destroy() {
    super.destroy();
    this.destroyCalled = true;
  }
}

describe('UIManager', () => {
  let uiManager;
  let container;

  beforeEach(() => {
    uiManager = new UIManager();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (uiManager) {
      uiManager.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('init', () => {
    it('should initialize with a container', () => {
      uiManager.init(container);
      expect(uiManager.container).toBe(container);
      expect(container.className).toBe('ui-container');
    });
  });

  describe('registerScreen', () => {
    it('should register a screen', () => {
      uiManager.init(container);
      const screen = new MockScreen('test-screen');
      uiManager.registerScreen('test', screen);

      expect(uiManager.getScreen('test')).toBe(screen);
      expect(container.children.length).toBe(1);
    });

    it('should replace existing screen with same name', () => {
      uiManager.init(container);
      const screen1 = new MockScreen('test-screen-1');
      const screen2 = new MockScreen('test-screen-2');

      uiManager.registerScreen('test', screen1);
      uiManager.registerScreen('test', screen2);

      expect(uiManager.getScreen('test')).toBe(screen2);
      expect(screen1.destroyCalled).toBe(true);
    });
  });

  describe('showScreen', () => {
    it('should show the specified screen', () => {
      uiManager.init(container);
      const screen = new MockScreen('test-screen');
      uiManager.registerScreen('test', screen);

      uiManager.showScreen('test');

      expect(screen.showCalled).toBe(true);
      expect(uiManager.currentScreen).toBe(screen);
    });

    it('should hide current screen when showing new screen', () => {
      uiManager.init(container);
      const screen1 = new MockScreen('screen-1');
      const screen2 = new MockScreen('screen-2');

      uiManager.registerScreen('screen1', screen1);
      uiManager.registerScreen('screen2', screen2);

      uiManager.showScreen('screen1');
      uiManager.showScreen('screen2');

      expect(screen1.hideCalled).toBe(true);
      expect(screen2.showCalled).toBe(true);
      expect(uiManager.currentScreen).toBe(screen2);
    });

    it('should handle non-existent screen gracefully', () => {
      uiManager.init(container);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      uiManager.showScreen('non-existent');

      expect(consoleSpy).toHaveBeenCalledWith('Screen non-existent not found');
      consoleSpy.mockRestore();
    });
  });

  describe('hideCurrentScreen', () => {
    it('should hide the current screen', () => {
      uiManager.init(container);
      const screen = new MockScreen('test-screen');
      uiManager.registerScreen('test', screen);

      uiManager.showScreen('test');
      uiManager.hideCurrentScreen();

      expect(screen.hideCalled).toBe(true);
      expect(uiManager.currentScreen).toBe(null);
    });

    it('should do nothing if no current screen', () => {
      uiManager.init(container);
      expect(() => uiManager.hideCurrentScreen()).not.toThrow();
    });
  });

  describe('update', () => {
    it('should update the current screen', () => {
      uiManager.init(container);
      const screen = new MockScreen('test-screen');
      screen.update = vi.fn();
      uiManager.registerScreen('test', screen);

      uiManager.showScreen('test');
      uiManager.update(0.016);

      expect(screen.update).toHaveBeenCalledWith(0.016);
    });

    it('should not update if no current screen', () => {
      uiManager.init(container);
      expect(() => uiManager.update(0.016)).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('should destroy all screens', () => {
      uiManager.init(container);
      const screen1 = new MockScreen('screen-1');
      const screen2 = new MockScreen('screen-2');

      uiManager.registerScreen('screen1', screen1);
      uiManager.registerScreen('screen2', screen2);

      uiManager.destroy();

      expect(screen1.destroyCalled).toBe(true);
      expect(screen2.destroyCalled).toBe(true);
      expect(uiManager.screens.size).toBe(0);
      expect(uiManager.currentScreen).toBe(null);
    });

    it('should clear container HTML', () => {
      uiManager.init(container);
      const screen = new MockScreen('test-screen');
      uiManager.registerScreen('test', screen);

      uiManager.destroy();

      expect(container.innerHTML).toBe('');
    });
  });
});
