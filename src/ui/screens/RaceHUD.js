import { BaseScreen } from '../BaseScreen.js';

/**
 * RaceHUD - In-race heads-up display with speedometer and position
 */
export class RaceHUD extends BaseScreen {
  constructor() {
    super('race-hud-screen');
    this.currentSpeed = 0;
    this.currentPosition = 1;
    this.totalRacers = 4;
    this.lapTime = 0;
    this.speedElement = null;
    this.positionElement = null;
    this.lapTimeElement = null;
  }

  create() {
    const container = document.createElement('div');
    container.className = 'screen race-hud-screen';

    // Top bar with position and lap time
    const topBar = document.createElement('div');
    topBar.className = 'hud-top-bar';

    const position = document.createElement('div');
    position.className = 'hud-position';
    position.setAttribute('data-testid', 'race-position');
    this.positionElement = position;

    const lapTime = document.createElement('div');
    lapTime.className = 'hud-lap-time';
    lapTime.setAttribute('data-testid', 'race-lap-time');
    this.lapTimeElement = lapTime;

    topBar.appendChild(position);
    topBar.appendChild(lapTime);

    // Speedometer (bottom center)
    const speedometer = document.createElement('div');
    speedometer.className = 'hud-speedometer';

    const speedLabel = document.createElement('div');
    speedLabel.className = 'speed-label';
    speedLabel.textContent = 'SPEED';

    const speedValue = document.createElement('div');
    speedValue.className = 'speed-value';
    speedValue.setAttribute('data-testid', 'race-speed');
    this.speedElement = speedValue;

    const speedUnit = document.createElement('div');
    speedUnit.className = 'speed-unit';
    speedUnit.textContent = 'km/h';

    speedometer.appendChild(speedLabel);
    speedometer.appendChild(speedValue);
    speedometer.appendChild(speedUnit);

    container.appendChild(topBar);
    container.appendChild(speedometer);

    return container;
  }

  /**
   * Update the speed display
   * @param {number} speed - Current speed in km/h
   */
  updateSpeed(speed) {
    this.currentSpeed = Math.round(speed);
    if (this.speedElement) {
      this.speedElement.textContent = this.currentSpeed;
    }
  }

  /**
   * Update the position display
   * @param {number} position - Current race position (1st, 2nd, etc.)
   * @param {number} total - Total number of racers
   */
  updatePosition(position, total = 4) {
    this.currentPosition = position;
    this.totalRacers = total;

    if (this.positionElement) {
      const suffix = this.getOrdinalSuffix(position);
      this.positionElement.innerHTML = `
        <span class="position-number">${position}</span>
        <span class="position-suffix">${suffix}</span>
        <span class="position-total"> / ${total}</span>
      `;
    }
  }

  /**
   * Update the lap time display
   * @param {number} time - Current lap time in seconds
   */
  updateLapTime(time) {
    this.lapTime = time;
    if (this.lapTimeElement) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const milliseconds = Math.floor((time % 1) * 100);
      this.lapTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
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

  onShow() {
    console.log('Race HUD shown');
    this.currentSpeed = 0;
    this.currentPosition = 1;
    this.lapTime = 0;
    this.updateSpeed(0);
    this.updatePosition(1, this.totalRacers);
    this.updateLapTime(0);
  }

  onHide() {
    console.log('Race HUD hidden');
  }

  update(deltaTime) {
    // HUD updates are driven by external game state
    // This is called every frame if needed for animations
  }
}
