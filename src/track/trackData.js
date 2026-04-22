import * as THREE from 'three';

/**
 * Track configuration data
 * Defines 3 distinct racing tracks with themes, waypoints, and spawn positions
 *
 * Track themes: City, Desert, Forest
 * Each track has:
 * - Unique environmental theme
 * - Waypoint path for AI navigation (forms a complete circuit)
 * - Spawn positions for player and AI opponents
 * - Lego-inspired blocky aesthetic
 */

/**
 * City Track - Urban racing through a blocky cityscape
 */
const cityTrackConfig = {
  id: 'track-city',
  name: 'City Circuit',
  theme: 'city',
  description: 'Race through a vibrant city with tall buildings and sharp corners!',
  previewImage: '/assets/images/tracks/city-preview.svg',
  modelPath: '/assets/models/tracks/city-track.glb',
  collisionModelPath: '/assets/models/tracks/city-track-collision.glb',

  // Track bounds (approximate area)
  bounds: {
    min: new THREE.Vector3(-150, -5, -150),
    max: new THREE.Vector3(150, 50, 150)
  },

  // Spawn positions for vehicles (player at index 0, AI at 1+)
  spawnPositions: [
    {
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    },
    {
      position: { x: -5, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    },
    {
      position: { x: 5, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    }
  ],

  // Waypoints for AI navigation - forms a complete circuit
  // City track has sharp 90-degree turns typical of city streets
  waypoints: [
    { x: 0, y: 0.5, z: 0 },      // Start/Finish
    { x: 0, y: 0.5, z: 30 },     // Straight ahead
    { x: 0, y: 0.5, z: 60 },     // Continue straight
    { x: 30, y: 0.5, z: 60 },    // Right turn
    { x: 60, y: 0.5, z: 60 },    // Continue right
    { x: 60, y: 0.5, z: 30 },    // Turn down
    { x: 60, y: 0.5, z: 0 },     // Continue down
    { x: 60, y: 0.5, z: -30 },   // Continue down
    { x: 30, y: 0.5, z: -30 },   // Left turn
    { x: 0, y: 0.5, z: -30 },    // Continue left
    { x: -30, y: 0.5, z: -30 },  // Continue left
    { x: -60, y: 0.5, z: -30 },  // Continue left
    { x: -60, y: 0.5, z: 0 },    // Turn up
    { x: -60, y: 0.5, z: 30 },   // Continue up
    { x: -30, y: 0.5, z: 30 },   // Right turn
    { x: 0, y: 0.5, z: 30 }      // Back to near start
  ]
};

/**
 * Desert Track - Sandy dunes and wide open spaces
 */
const desertTrackConfig = {
  id: 'track-desert',
  name: 'Desert Dunes',
  theme: 'desert',
  description: 'Navigate winding paths through sandy dunes and rocky outcrops!',
  previewImage: '/assets/images/tracks/desert-preview.svg',
  modelPath: '/assets/models/tracks/desert-track.glb',
  collisionModelPath: '/assets/models/tracks/desert-track-collision.glb',

  bounds: {
    min: new THREE.Vector3(-200, -5, -200),
    max: new THREE.Vector3(200, 60, 200)
  },

  spawnPositions: [
    {
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: Math.PI / 4, z: 0 }
    },
    {
      position: { x: -6, y: 0.5, z: -2 },
      rotation: { x: 0, y: Math.PI / 4, z: 0 }
    },
    {
      position: { x: 6, y: 0.5, z: 2 },
      rotation: { x: 0, y: Math.PI / 4, z: 0 }
    }
  ],

  // Waypoints - sweeping curves typical of desert racing
  waypoints: [
    { x: 0, y: 0.5, z: 0 },       // Start/Finish
    { x: 20, y: 0.5, z: 20 },     // Diagonal northeast
    { x: 50, y: 0.5, z: 30 },     // Sweep right
    { x: 80, y: 0.5, z: 20 },     // Continue sweep
    { x: 100, y: 0.5, z: 0 },     // Wide right curve
    { x: 110, y: 0.5, z: -30 },   // Turn back
    { x: 100, y: 0.5, z: -60 },   // Sweeping left
    { x: 70, y: 0.5, z: -80 },    // Continue sweep
    { x: 30, y: 0.5, z: -90 },    // Wide curve
    { x: 0, y: 0.5, z: -80 },     // Heading back
    { x: -30, y: 0.5, z: -60 },   // Sweep left
    { x: -50, y: 0.5, z: -30 },   // Continue
    { x: -60, y: 0.5, z: 0 },     // Wide curve
    { x: -50, y: 0.5, z: 30 },    // Heading home
    { x: -30, y: 0.5, z: 50 },    // Sweep right
    { x: 0, y: 0.5, z: 60 },      // Almost home
    { x: 20, y: 0.5, z: 40 },     // Final curve
    { x: 10, y: 0.5, z: 20 }      // Approach finish
  ]
};

/**
 * Forest Track - Winding path through trees and nature
 */
const forestTrackConfig = {
  id: 'track-forest',
  name: 'Forest Trail',
  theme: 'forest',
  description: 'Wind through tall trees and over wooden bridges in the forest!',
  previewImage: '/assets/images/tracks/forest-preview.svg',
  modelPath: '/assets/models/tracks/forest-track.glb',
  collisionModelPath: '/assets/models/tracks/forest-track-collision.glb',

  bounds: {
    min: new THREE.Vector3(-180, -5, -180),
    max: new THREE.Vector3(180, 70, 180)
  },

  spawnPositions: [
    {
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: -Math.PI / 6, z: 0 }
    },
    {
      position: { x: -5, y: 0.5, z: -3 },
      rotation: { x: 0, y: -Math.PI / 6, z: 0 }
    },
    {
      position: { x: 5, y: 0.5, z: 3 },
      rotation: { x: 0, y: -Math.PI / 6, z: 0 }
    }
  ],

  // Waypoints - tight winding path through forest
  waypoints: [
    { x: 0, y: 0.5, z: 0 },       // Start/Finish
    { x: 10, y: 0.5, z: 15 },     // Slight right
    { x: 15, y: 0.5, z: 35 },     // Winding up
    { x: 10, y: 0.5, z: 55 },     // Curve left
    { x: -5, y: 0.5, z: 70 },     // Sharp left
    { x: -25, y: 0.5, z: 75 },    // Continue left
    { x: -40, y: 0.5, z: 65 },    // Curve down-left
    { x: -50, y: 0.5, z: 45 },    // Winding
    { x: -55, y: 0.5, z: 20 },    // Curve right
    { x: -50, y: 0.5, z: 0 },     // Heading back
    { x: -40, y: 0.5, z: -20 },   // Winding path
    { x: -25, y: 0.5, z: -35 },   // Continue
    { x: -5, y: 0.5, z: -45 },    // Curve right
    { x: 15, y: 0.5, z: -50 },    // Wide right
    { x: 35, y: 0.5, z: -45 },    // Continue right
    { x: 50, y: 0.5, z: -30 },    // Sweeping back
    { x: 55, y: 0.5, z: -10 },    // Almost home
    { x: 50, y: 0.5, z: 10 },     // Final curve
    { x: 35, y: 0.5, z: 20 },     // Heading to finish
    { x: 20, y: 0.5, z: 15 }      // Approach finish
  ]
};

/**
 * Export all track configurations
 */
export const trackConfigs = [
  cityTrackConfig,
  desertTrackConfig,
  forestTrackConfig
];

/**
 * Helper function to get track config by ID
 * @param {string} trackId - Track identifier
 * @returns {Object|null}
 */
export function getTrackConfig(trackId) {
  return trackConfigs.find(config => config.id === trackId) || null;
}

/**
 * Get all track IDs
 * @returns {Array<string>}
 */
export function getTrackIds() {
  return trackConfigs.map(config => config.id);
}
