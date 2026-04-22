import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MainMenuUI } from '../../../src/ui/screens/MainMenuUI.js';

describe('MainMenuUI', () => {
  let mainMenu;
  let onStartClickMock;

  beforeEach(() => {
    onStartClickMock = vi.fn();
    mainMenu = new MainMenuUI(onStartClickMock);
  });

  describe('create', () => {
    it('should create main menu DOM structure', () => {
      const container = mainMenu.create();

      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.className).toContain('main-menu-screen');

      const title = container.querySelector('[data-testid="game-title"]');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('RACING GAME');

      const subtitle = container.querySelector('[data-testid="game-subtitle"]');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toBe('Get Ready to Race!');

      const startButton = container.querySelector('[data-testid="start-button"]');
      expect(startButton).toBeTruthy();
      expect(startButton.textContent).toBe('START GAME');
    });

    it('should call onStartClick when start button is clicked', () => {
      const container = mainMenu.create();
      const startButton = container.querySelector('[data-testid="start-button"]');

      startButton.click();

      expect(onStartClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not throw if onStartClick is not provided', () => {
      const menuWithoutCallback = new MainMenuUI();
      const container = menuWithoutCallback.create();
      const startButton = container.querySelector('[data-testid="start-button"]');

      expect(() => startButton.click()).not.toThrow();
    });
  });

  describe('show/hide', () => {
    it('should call console.log on show', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mainMenu.create();
      mainMenu.show();

      expect(consoleSpy).toHaveBeenCalledWith('Main menu shown');
      consoleSpy.mockRestore();
    });

    it('should call console.log on hide', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mainMenu.create();
      mainMenu.show();
      mainMenu.hide();

      expect(consoleSpy).toHaveBeenCalledWith('Main menu hidden');
      consoleSpy.mockRestore();
    });
  });

  describe('data-testid attributes', () => {
    it('should have data-testid on all interactive elements', () => {
      const container = mainMenu.create();

      const title = container.querySelector('[data-testid="game-title"]');
      const subtitle = container.querySelector('[data-testid="game-subtitle"]');
      const startButton = container.querySelector('[data-testid="start-button"]');

      expect(title).toBeTruthy();
      expect(subtitle).toBeTruthy();
      expect(startButton).toBeTruthy();
    });
  });
});
