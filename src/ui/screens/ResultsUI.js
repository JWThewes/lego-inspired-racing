import { BaseScreen } from '../BaseScreen.js';

/**
 * ResultsUI - Race results screen with win/loss message and actions
 */
export class ResultsUI extends BaseScreen {
  constructor(onRaceAgain, onMainMenu) {
    super('results-screen');
    this.onRaceAgain = onRaceAgain;
    this.onMainMenu = onMainMenu;
    this.resultData = null;
  }

  create() {
    const container = document.createElement('div');
    container.className = 'screen results-screen';

    // Result message (will be updated dynamically)
    const resultMessage = document.createElement('div');
    resultMessage.className = 'result-message';
    resultMessage.setAttribute('data-testid', 'result-message');
    this.resultMessageElement = resultMessage;

    // Position
    const position = document.createElement('div');
    position.className = 'result-position';
    position.setAttribute('data-testid', 'result-position');
    this.positionElement = position;

    // Stats container
    const stats = document.createElement('div');
    stats.className = 'result-stats';
    stats.setAttribute('data-testid', 'result-stats');
    this.statsElement = stats;

    // Buttons container
    const buttons = document.createElement('div');
    buttons.className = 'result-buttons';

    // Race again button
    const raceAgainButton = document.createElement('button');
    raceAgainButton.className = 'btn btn-primary btn-large';
    raceAgainButton.textContent = 'RACE AGAIN';
    raceAgainButton.setAttribute('data-testid', 'race-again-button');
    raceAgainButton.addEventListener('click', () => {
      if (this.onRaceAgain) {
        this.onRaceAgain();
      }
    });

    // Main menu button
    const mainMenuButton = document.createElement('button');
    mainMenuButton.className = 'btn btn-secondary btn-large';
    mainMenuButton.textContent = 'MAIN MENU';
    mainMenuButton.setAttribute('data-testid', 'main-menu-button');
    mainMenuButton.addEventListener('click', () => {
      if (this.onMainMenu) {
        this.onMainMenu();
      }
    });

    buttons.appendChild(raceAgainButton);
    buttons.appendChild(mainMenuButton);

    container.appendChild(resultMessage);
    container.appendChild(position);
    container.appendChild(stats);
    container.appendChild(buttons);

    return container;
  }

  /**
   * Show results with specific data
   * @param {Object} data - Result data
   * @param {number} data.position - Final position (1-4)
   * @param {number} data.totalRacers - Total racers
   * @param {number} data.lapTime - Final lap time in seconds
   * @param {boolean} data.won - Whether player won
   */
  showResults(data) {
    this.resultData = data;

    // Update message
    if (this.resultMessageElement) {
      if (data.won || data.position === 1) {
        this.resultMessageElement.textContent = 'YOU WIN!';
        this.resultMessageElement.className = 'result-message win';
      } else {
        this.resultMessageElement.textContent = 'NICE TRY!';
        this.resultMessageElement.className = 'result-message lose';
      }
    }

    // Update position
    if (this.positionElement) {
      const suffix = this.getOrdinalSuffix(data.position);
      this.positionElement.innerHTML = `
        <span class="position-text">You finished</span>
        <span class="position-number">${data.position}${suffix}</span>
        <span class="position-total">out of ${data.totalRacers}</span>
      `;
    }

    // Update stats
    if (this.statsElement) {
      const minutes = Math.floor(data.lapTime / 60);
      const seconds = Math.floor(data.lapTime % 60);
      const milliseconds = Math.floor((data.lapTime % 1) * 100);
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;

      this.statsElement.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Lap Time:</span>
          <span class="stat-value">${timeString}</span>
        </div>
      `;
    }
  }

  /**
   * Get ordinal suffix for position (1st, 2nd, 3rd, etc.)
   */
  getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  onShow(data = {}) {
    console.log('Results screen shown', data);
    if (Object.keys(data).length > 0) {
      this.showResults(data);
    }
  }

  onHide() {
    console.log('Results screen hidden');
  }
}
