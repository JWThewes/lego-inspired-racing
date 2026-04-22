/**
 * Vehicle Presets - Defines 4 vehicle types with distinct handling characteristics
 * Designed for arcade-style gameplay suitable for children aged 6-12
 */

/**
 * Speedy - High speed, low control
 * Fast but difficult to handle - for experienced players
 */
export const SPEEDY = {
  vehicleType: 'speedy',
  acceleration: 20.0,
  maxSpeed: 50.0,
  turnSpeed: 2.0,
  brakeForce: 30.0,
  drag: 0.96,
  description: 'Lightning fast but tricky to control!'
};

/**
 * Balanced - Well-rounded vehicle
 * Good all-around performance - recommended for beginners
 */
export const BALANCED = {
  vehicleType: 'balanced',
  acceleration: 15.0,
  maxSpeed: 40.0,
  turnSpeed: 2.5,
  brakeForce: 25.0,
  drag: 0.95,
  description: 'Perfect balance of speed and control'
};

/**
 * Nimble - High maneuverability, moderate speed
 * Easy to control with sharp turning - great for tight tracks
 */
export const NIMBLE = {
  vehicleType: 'nimble',
  acceleration: 18.0,
  maxSpeed: 38.0,
  turnSpeed: 3.5,
  brakeForce: 28.0,
  drag: 0.93,
  description: 'Quick turns and easy handling'
};

/**
 * Tank - Heavy and powerful
 * Slower but stable - good for younger children
 */
export const TANK = {
  vehicleType: 'tank',
  acceleration: 12.0,
  maxSpeed: 35.0,
  turnSpeed: 2.0,
  brakeForce: 35.0,
  drag: 0.92,
  description: 'Steady and reliable, perfect for beginners'
};

/**
 * Get all vehicle presets as an array
 */
export const ALL_PRESETS = [SPEEDY, BALANCED, NIMBLE, TANK];

/**
 * Get a vehicle preset by type name
 * @param {string} type - Vehicle type name
 * @returns {Object} Vehicle preset or BALANCED if not found
 */
export function getPresetByType(type) {
  switch (type) {
    case 'speedy': return SPEEDY;
    case 'balanced': return BALANCED;
    case 'nimble': return NIMBLE;
    case 'tank': return TANK;
    default: return BALANCED;
  }
}
