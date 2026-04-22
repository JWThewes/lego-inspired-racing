/**
 * Asset Manifest
 * Defines all game assets to be loaded
 *
 * Note: Paths should be updated to point to actual asset files
 * This is a placeholder structure for demonstration
 */

export const assetManifest = {
  // 3D Models (GLTF/GLB format)
  models: {
    // Vehicles
    // 'player-car': '/assets/models/vehicles/player-car.glb',
    // 'ai-car-1': '/assets/models/vehicles/ai-car-1.glb',
    // 'ai-car-2': '/assets/models/vehicles/ai-car-2.glb',

    // Tracks (enabled for track system)
    'track-city': '/assets/models/tracks/city-track.glb',
    'track-desert': '/assets/models/tracks/desert-track.glb',
    'track-forest': '/assets/models/tracks/forest-track.glb',

    // Obstacles and props
    // 'obstacle-barrier': '/assets/models/props/barrier.glb',
    // 'obstacle-cone': '/assets/models/props/cone.glb',
  },

  // Textures
  textures: {
    // UI textures
    // 'ui-button': '/assets/textures/ui/button.png',
    // 'ui-background': '/assets/textures/ui/background.png',

    // Track textures
    // 'track-road': '/assets/textures/tracks/road.jpg',
    // 'track-grass': '/assets/textures/tracks/grass.jpg',

    // Skybox
    // 'skybox-nx': '/assets/textures/skybox/nx.jpg',
    // 'skybox-ny': '/assets/textures/skybox/ny.jpg',
    // 'skybox-nz': '/assets/textures/skybox/nz.jpg',
    // 'skybox-px': '/assets/textures/skybox/px.jpg',
    // 'skybox-py': '/assets/textures/skybox/py.jpg',
    // 'skybox-pz': '/assets/textures/skybox/pz.jpg',
  },

  // Audio files
  audio: {
    // Sound effects
    // 'sfx-engine': '/assets/audio/sfx/engine.mp3',
    // 'sfx-drift': '/assets/audio/sfx/drift.mp3',
    // 'sfx-collision': '/assets/audio/sfx/collision.mp3',
    // 'sfx-boost': '/assets/audio/sfx/boost.mp3',

    // Music
    // 'music-menu': '/assets/audio/music/menu-theme.mp3',
    // 'music-race': '/assets/audio/music/race-theme.mp3',
  },
};

/**
 * Example manifest for development/testing
 * Uses placeholder assets that won't fail to load
 */
export const devAssetManifest = {
  models: {
    // Add actual development assets here
  },
  textures: {
    // Add actual development textures here
  },
  audio: {
    // Add actual development audio here
  },
};
