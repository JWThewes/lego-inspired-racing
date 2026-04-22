import { BaseScreen } from '../BaseScreen.js';

/**
 * TrackSelectUI - Track selection screen with preview images
 */
export class TrackSelectUI extends BaseScreen {
  constructor(onTrackSelected) {
    super('track-select-screen');
    this.onTrackSelected = onTrackSelected;
    this.selectedTrackId = null;
    this.tracks = [
      {
        id: 'city-track',
        name: 'City Circuit',
        theme: 'Urban racing through city streets',
        difficulty: 'Easy',
        previewColor: '#888888'
      },
      {
        id: 'desert-track',
        name: 'Desert Dash',
        theme: 'Sandy dunes and open roads',
        difficulty: 'Medium',
        previewColor: '#f4a460'
      },
      {
        id: 'forest-track',
        name: 'Forest Run',
        theme: 'Winding paths through trees',
        difficulty: 'Hard',
        previewColor: '#228b22'
      }
    ];
  }

  create() {
    const container = document.createElement('div');
    container.className = 'screen track-select-screen';

    // Title
    const title = document.createElement('h2');
    title.className = 'screen-title';
    title.textContent = 'CHOOSE YOUR TRACK';
    title.setAttribute('data-testid', 'track-select-title');

    // Track cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'track-cards-container';
    cardsContainer.setAttribute('data-testid', 'track-cards-container');

    // Create a card for each track
    this.tracks.forEach(track => {
      const card = this.createTrackCard(track);
      cardsContainer.appendChild(card);
    });

    // Start button
    const startButton = document.createElement('button');
    startButton.className = 'btn btn-primary btn-large';
    startButton.textContent = 'START RACE';
    startButton.setAttribute('data-testid', 'start-race-button');
    startButton.disabled = true;
    startButton.addEventListener('click', () => {
      if (this.selectedTrackId && this.onTrackSelected) {
        this.onTrackSelected(this.selectedTrackId);
      }
    });
    this.startButton = startButton;

    container.appendChild(title);
    container.appendChild(cardsContainer);
    container.appendChild(startButton);

    return container;
  }

  createTrackCard(track) {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.setAttribute('data-testid', `track-card-${track.id}`);

    // Preview image (placeholder colored box)
    const preview = document.createElement('div');
    preview.className = 'track-preview';
    preview.style.backgroundColor = track.previewColor;
    preview.setAttribute('data-testid', `track-preview-${track.id}`);

    // Track info
    const info = document.createElement('div');
    info.className = 'track-info';

    const name = document.createElement('h3');
    name.className = 'track-name';
    name.textContent = track.name;

    const theme = document.createElement('p');
    theme.className = 'track-theme';
    theme.textContent = track.theme;

    const difficulty = document.createElement('span');
    difficulty.className = `track-difficulty difficulty-${track.difficulty.toLowerCase()}`;
    difficulty.textContent = `Difficulty: ${track.difficulty}`;

    info.appendChild(name);
    info.appendChild(theme);
    info.appendChild(difficulty);

    // Select button
    const selectButton = document.createElement('button');
    selectButton.className = 'btn btn-secondary';
    selectButton.textContent = 'SELECT';
    selectButton.setAttribute('data-testid', `select-track-${track.id}`);
    selectButton.addEventListener('click', () => this.selectTrack(track.id));

    card.appendChild(preview);
    card.appendChild(info);
    card.appendChild(selectButton);

    return card;
  }

  selectTrack(trackId) {
    this.selectedTrackId = trackId;

    // Update card styles
    const cards = this.container.querySelectorAll('.track-card');
    cards.forEach(card => {
      const cardId = card.getAttribute('data-testid').replace('track-card-', '');
      if (cardId === trackId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // Enable start button
    if (this.startButton) {
      this.startButton.disabled = false;
    }
  }

  onShow() {
    console.log('Track select shown');
    this.selectedTrackId = null;
    if (this.startButton) {
      this.startButton.disabled = true;
    }
  }

  onHide() {
    console.log('Track select hidden');
  }
}
