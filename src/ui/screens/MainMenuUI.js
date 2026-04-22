import { BaseScreen } from '../BaseScreen.js';

/**
 * MainMenuUI - Main menu screen with title and start button
 */
export class MainMenuUI extends BaseScreen {
  constructor(onStartClick) {
    super('main-menu-screen');
    this.onStartClick = onStartClick;
  }

  create() {
    const container = document.createElement('div');
    container.className = 'screen main-menu-screen';

    // Title
    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'RACING GAME';
    title.setAttribute('data-testid', 'game-title');

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'game-subtitle';
    subtitle.textContent = 'Get Ready to Race!';
    subtitle.setAttribute('data-testid', 'game-subtitle');

    // Start button
    const startButton = document.createElement('button');
    startButton.className = 'btn btn-primary btn-large';
    startButton.textContent = 'START GAME';
    startButton.setAttribute('data-testid', 'start-button');
    startButton.addEventListener('click', () => {
      if (this.onStartClick) {
        this.onStartClick();
      }
    });

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(startButton);

    return container;
  }

  onShow() {
    console.log('Main menu shown');
  }

  onHide() {
    console.log('Main menu hidden');
  }
}
