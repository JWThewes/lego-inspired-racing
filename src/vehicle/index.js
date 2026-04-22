/**
 * Vehicle module - exports all vehicle-related components and systems
 */

export { VehicleComponent } from './VehicleComponent.js';
export { VehicleSystem } from './VehicleSystem.js';
export { InputSystem } from './InputSystem.js';
export {
  SPEEDY,
  BALANCED,
  NIMBLE,
  TANK,
  ALL_PRESETS,
  getPresetByType
} from './VehiclePresets.js';
