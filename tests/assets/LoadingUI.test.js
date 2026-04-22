import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoadingUI } from '../../src/assets/LoadingUI.js';

describe('LoadingUI', () => {
  let loadingUI;

  beforeEach(() => {
    // Create a fresh DOM for each test
    document.body.innerHTML = '';
    loadingUI = new LoadingUI();
  });

  afterEach(() => {
    if (loadingUI) {
      loadingUI.destroy();
    }
  });

  describe('Initialization', () => {
    it('should create a LoadingUI instance', () => {
      expect(loadingUI).toBeDefined();
      expect(loadingUI).toBeInstanceOf(LoadingUI);
    });

    it('should create UI container', () => {
      expect(loadingUI.container).toBeDefined();
      expect(loadingUI.container.id).toBe('loading-screen');
    });

    it('should create progress bar element', () => {
      expect(loadingUI.progressBar).toBeDefined();
      expect(loadingUI.progressBar.style.width).toBe('0%');
    });

    it('should create progress text element', () => {
      expect(loadingUI.progressText).toBeDefined();
      expect(loadingUI.progressText.textContent).toBe('0%');
    });

    it('should create status text element', () => {
      expect(loadingUI.statusText).toBeDefined();
      expect(loadingUI.statusText.textContent).toBe('Initializing...');
    });

    it('should create error container', () => {
      expect(loadingUI.errorContainer).toBeDefined();
      expect(loadingUI.errorContainer.style.display).toBe('none');
    });

    it('should append container to body', () => {
      const container = document.getElementById('loading-screen');
      expect(container).toBeDefined();
      expect(document.body.contains(container)).toBe(true);
    });
  });

  describe('Show and Hide', () => {
    it('should show loading screen', () => {
      loadingUI.container.style.display = 'none';

      loadingUI.show();

      expect(loadingUI.container.style.display).toBe('flex');
    });

    it('should hide loading screen', () => {
      loadingUI.show();

      loadingUI.hide();

      expect(loadingUI.container.style.opacity).toBe('0');
    });

    it('should set display to none after fade', (done) => {
      loadingUI.show();
      loadingUI.hide();

      setTimeout(() => {
        expect(loadingUI.container.style.display).toBe('none');
        done();
      }, 600);
    });
  });

  describe('Progress Updates', () => {
    it('should update progress bar width', () => {
      loadingUI.updateProgress(50, 5, 10);

      expect(loadingUI.progressBar.style.width).toBe('50%');
    });

    it('should update progress text', () => {
      loadingUI.updateProgress(75, 15, 20);

      expect(loadingUI.progressText.textContent).toBe('75%');
    });

    it('should round progress percentage', () => {
      loadingUI.updateProgress(33.333, 1, 3);

      expect(loadingUI.progressText.textContent).toBe('33%');
    });

    it('should update status text with counts', () => {
      loadingUI.updateProgress(40, 4, 10);

      expect(loadingUI.statusText.textContent).toBe('Loading assets (4/10)...');
    });

    it('should handle 100% progress', () => {
      loadingUI.updateProgress(100, 10, 10);

      expect(loadingUI.progressBar.style.width).toBe('100%');
      expect(loadingUI.progressText.textContent).toBe('100%');
    });
  });

  describe('Status Updates', () => {
    it('should update status message', () => {
      loadingUI.updateStatus('Loading models...');

      expect(loadingUI.statusText.textContent).toBe('Loading models...');
    });

    it('should handle empty status', () => {
      loadingUI.updateStatus('');

      expect(loadingUI.statusText.textContent).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should add error to list', () => {
      const error = { url: '/test.png', message: 'Failed to load' };

      loadingUI.addError(error);

      expect(loadingUI.errorList.children.length).toBe(1);
    });

    it('should show error container when error added', () => {
      const error = { url: '/test.png', message: 'Failed to load' };

      loadingUI.addError(error);

      expect(loadingUI.errorContainer.style.display).toBe('block');
    });

    it('should display error url', () => {
      const error = { url: '/assets/test.png', message: 'Failed' };

      loadingUI.addError(error);

      const errorText = loadingUI.errorList.children[0].textContent;
      expect(errorText).toContain('/assets/test.png');
    });

    it('should handle multiple errors', () => {
      loadingUI.addError({ url: '/test1.png' });
      loadingUI.addError({ url: '/test2.png' });
      loadingUI.addError({ url: '/test3.png' });

      expect(loadingUI.errorList.children.length).toBe(3);
    });

    it('should fallback to path if no url', () => {
      const error = { path: '/assets/model.glb' };

      loadingUI.addError(error);

      const errorText = loadingUI.errorList.children[0].textContent;
      expect(errorText).toContain('/assets/model.glb');
    });

    it('should fallback to message if no url or path', () => {
      const error = { message: 'Network error' };

      loadingUI.addError(error);

      const errorText = loadingUI.errorList.children[0].textContent;
      expect(errorText).toContain('Network error');
    });
  });

  describe('Completion', () => {
    it('should set completion status without errors', () => {
      loadingUI.setComplete(false);

      expect(loadingUI.statusText.textContent).toBe('Loading complete!');
    });

    it('should auto-hide after completion without errors', (done) => {
      vi.useFakeTimers();

      loadingUI.setComplete(false);

      vi.advanceTimersByTime(600);

      expect(loadingUI.container.style.opacity).toBe('0');

      vi.useRealTimers();
      done();
    });

    it('should show continue message with errors', () => {
      loadingUI.setComplete(true);

      expect(loadingUI.statusText.textContent).toContain('Press any key to continue');
    });

    it('should wait for user input when errors exist', () => {
      loadingUI.show();
      loadingUI.setComplete(true);

      // Container should still be visible
      expect(loadingUI.container.style.display).toBe('flex');
    });
  });

  describe('Destroy', () => {
    it('should remove container from DOM', () => {
      const container = loadingUI.container;

      loadingUI.destroy();

      expect(document.body.contains(container)).toBe(false);
    });

    it('should clear all references', () => {
      loadingUI.destroy();

      expect(loadingUI.container).toBeNull();
      expect(loadingUI.progressBar).toBeNull();
      expect(loadingUI.progressText).toBeNull();
      expect(loadingUI.statusText).toBeNull();
      expect(loadingUI.errorContainer).toBeNull();
      expect(loadingUI.errorList).toBeNull();
    });

    it('should handle destroy when already destroyed', () => {
      loadingUI.destroy();

      // Should not throw
      expect(() => loadingUI.destroy()).not.toThrow();
    });
  });
});
