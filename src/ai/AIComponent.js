import { Component } from '../core/Component.js';

/**
 * AIComponent - stores AI opponent state and configuration
 * Pure data container for AI behavior properties
 */
export class AIComponent extends Component {
  constructor(config = {}) {
    super();

    // AI difficulty settings
    this.difficulty = config.difficulty || 'medium'; // 'easy', 'medium', 'hard'

    // Waypoint navigation state
    this.currentWaypointIndex = 0; // Current target waypoint
    this.waypointReachedThreshold = 5.0; // Distance to consider waypoint reached

    // AI driving behavior tuning
    this.targetSpeed = config.targetSpeed || 0.8; // Target speed multiplier (0-1 of maxSpeed)
    this.aggressiveness = config.aggressiveness || 0.5; // How aggressively AI steers (0-1)
    this.lookaheadDistance = config.lookaheadDistance || 15.0; // How far ahead AI looks

    // Obstacle avoidance
    this.obstacleAvoidanceRadius = config.obstacleAvoidanceRadius || 10.0; // Detection radius
    this.obstacleAvoidanceStrength = config.obstacleAvoidanceStrength || 0.7; // Avoidance force

    // Performance adjustments (fair play)
    this.rubberBandingFactor = config.rubberBandingFactor || 0.1; // Minimal rubber-banding (0.1 = 10%)
    this.errorFrequency = config.errorFrequency || 0.05; // Occasional steering errors for realism
    this.errorMagnitude = config.errorMagnitude || 0.3; // Magnitude of steering errors

    // Internal state
    this.nextErrorTime = 0; // When next steering error occurs
    this.isAvoidingObstacle = false; // Currently avoiding something
    this.lapsCompleted = 0; // Track progress

    // AI type identifier
    this.aiType = config.aiType || 'opponent'; // 'opponent', 'racer', etc.
  }

  /**
   * Apply difficulty preset to AI settings
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;

    switch (difficulty) {
      case 'easy':
        this.targetSpeed = 0.7;
        this.aggressiveness = 0.4;
        this.errorFrequency = 0.08;
        this.errorMagnitude = 0.4;
        break;
      case 'medium':
        this.targetSpeed = 0.8;
        this.aggressiveness = 0.5;
        this.errorFrequency = 0.05;
        this.errorMagnitude = 0.3;
        break;
      case 'hard':
        this.targetSpeed = 0.9;
        this.aggressiveness = 0.7;
        this.errorFrequency = 0.02;
        this.errorMagnitude = 0.2;
        break;
      default:
        console.warn(`Unknown difficulty: ${difficulty}, using medium`);
        this.setDifficulty('medium');
    }
  }
}
