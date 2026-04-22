import { System } from '../core/System.js';

/**
 * AISystem - controls AI opponent vehicles
 * Handles waypoint following, obstacle avoidance, and difficulty tuning
 * Child-appropriate AI with fair competition (no excessive rubber-banding)
 */
export class AISystem extends System {
  constructor(trackManager) {
    super();
    this.requiredComponents = ['AIComponent', 'VehicleComponent'];
    this.priority = 9; // Run before VehicleSystem
    this.trackManager = trackManager;
  }

  /**
   * Initialize the AI system
   * @param {World} world - The game world
   */
  init(world) {
    this.world = world;
  }

  /**
   * Update AI vehicles
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array<Entity>} entities - Entities with AIComponent and VehicleComponent
   */
  update(deltaTime, entities) {
    if (!this.trackManager || !this.trackManager.getCurrentTrack()) {
      return; // No track loaded, AI can't navigate
    }

    for (const entity of entities) {
      const ai = entity.getComponent('AIComponent');
      const vehicle = entity.getComponent('VehicleComponent');

      // Update AI decision making
      this._updateWaypointNavigation(ai, vehicle, deltaTime);
      this._applySteeringDecisions(ai, vehicle, deltaTime);
      this._applyThrottleDecisions(ai, vehicle, deltaTime);
      this._checkWaypointProgress(ai, vehicle);
    }
  }

  /**
   * Update AI navigation towards current waypoint
   * @private
   */
  _updateWaypointNavigation(ai, vehicle, deltaTime) {
    const waypoint = this.trackManager.getWaypoint(ai.currentWaypointIndex);

    if (!waypoint) {
      console.warn('AISystem: No waypoint found at index', ai.currentWaypointIndex);
      return;
    }

    // Calculate direction to waypoint
    const dx = waypoint.x - vehicle.position.x;
    const dz = waypoint.z - vehicle.position.z;
    const distanceToWaypoint = Math.sqrt(dx * dx + dz * dz);

    // Calculate desired heading (angle to waypoint)
    const targetAngle = Math.atan2(dx, dz);

    // Calculate angle difference (handle wrapping)
    let angleDiff = targetAngle - vehicle.rotation;

    // Normalize to -PI to PI range
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Store steering decision based on angle difference
    ai.desiredSteering = this._calculateSteering(angleDiff, ai.aggressiveness);
    ai.distanceToWaypoint = distanceToWaypoint;
  }

  /**
   * Calculate steering input based on angle difference
   * @private
   */
  _calculateSteering(angleDiff, aggressiveness) {
    // Proportional steering control
    const maxSteerAngle = Math.PI / 4; // 45 degrees
    let steering = (angleDiff / maxSteerAngle) * aggressiveness;

    // Clamp steering to -1 to 1 range
    steering = Math.max(-1, Math.min(1, steering));

    return steering;
  }

  /**
   * Apply steering decisions to vehicle input
   * Includes obstacle avoidance and steering errors for realism
   * @private
   */
  _applySteeringDecisions(ai, vehicle, deltaTime) {
    let finalSteering = ai.desiredSteering || 0;

    // Apply occasional steering errors for realism
    const currentTime = Date.now() / 1000;
    if (currentTime >= ai.nextErrorTime) {
      // Time for a steering error
      const errorDuration = 0.3; // 300ms error
      ai.steeringError = (Math.random() - 0.5) * 2 * ai.errorMagnitude;
      ai.nextErrorTime = currentTime + (1 / ai.errorFrequency);

      setTimeout(() => {
        ai.steeringError = 0;
      }, errorDuration * 1000);
    }

    // Add steering error
    if (ai.steeringError) {
      finalSteering += ai.steeringError;
    }

    // Check for obstacles (other vehicles)
    const obstacleAvoidance = this._calculateObstacleAvoidance(ai, vehicle);
    if (obstacleAvoidance !== 0) {
      finalSteering += obstacleAvoidance * ai.obstacleAvoidanceStrength;
      ai.isAvoidingObstacle = true;
    } else {
      ai.isAvoidingObstacle = false;
    }

    // Clamp final steering
    finalSteering = Math.max(-1, Math.min(1, finalSteering));

    // Apply to vehicle
    vehicle.steering = finalSteering;
  }

  /**
   * Calculate obstacle avoidance steering
   * @private
   */
  _calculateObstacleAvoidance(ai, vehicle) {
    if (!this.world) return 0;

    let avoidanceSteering = 0;
    const entities = this.world.getEntities();

    for (const other of entities) {
      // Skip self and non-vehicle entities
      if (other.id === vehicle.entityId || !other.hasComponent('VehicleComponent')) {
        continue;
      }

      const otherVehicle = other.getComponent('VehicleComponent');

      // Calculate distance to other vehicle
      const dx = otherVehicle.position.x - vehicle.position.x;
      const dz = otherVehicle.position.z - vehicle.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // If too close, apply avoidance
      if (distance < ai.obstacleAvoidanceRadius && distance > 0) {
        // Calculate direction away from obstacle
        const avoidAngle = Math.atan2(dx, dz);
        const angleDiff = avoidAngle - vehicle.rotation;

        // Steer away from obstacle (inverse direction)
        const avoidanceStrength = (1 - distance / ai.obstacleAvoidanceRadius);
        avoidanceSteering -= Math.sign(angleDiff) * avoidanceStrength;
      }
    }

    return Math.max(-1, Math.min(1, avoidanceSteering));
  }

  /**
   * Apply throttle decisions to vehicle input
   * Includes speed targeting and minimal rubber-banding
   * @private
   */
  _applyThrottleDecisions(ai, vehicle, deltaTime) {
    const targetSpeed = vehicle.maxSpeed * ai.targetSpeed;

    // Basic throttle control
    let throttle = 0;

    if (vehicle.speed < targetSpeed * 0.9) {
      // Accelerate if below target
      throttle = 1.0;
    } else if (vehicle.speed > targetSpeed * 1.1) {
      // Brake if too fast
      throttle = -0.5;
    } else {
      // Maintain speed
      throttle = 0.3;
    }

    // Reduce throttle when steering hard (arcade racing feel)
    const steerAmount = Math.abs(vehicle.steering);
    if (steerAmount > 0.5) {
      throttle *= (1 - steerAmount * 0.3);
    }

    // Apply minimal rubber-banding (optional, for fairness)
    // This slightly adjusts AI speed based on distance to player
    // Only if rubber-banding factor is set
    if (ai.rubberBandingFactor > 0) {
      const playerEntity = this._findPlayerEntity();
      if (playerEntity) {
        const playerVehicle = playerEntity.getComponent('VehicleComponent');
        if (playerVehicle) {
          const distanceToPlayer = this._calculateDistance(vehicle, playerVehicle);

          // If far behind, slight speed boost (fair competition)
          if (distanceToPlayer > 50) {
            throttle *= (1 + ai.rubberBandingFactor * 0.5);
          }
          // If far ahead, slight slowdown (keep race exciting)
          else if (distanceToPlayer < -50) {
            throttle *= (1 - ai.rubberBandingFactor * 0.5);
          }
        }
      }
    }

    // Clamp throttle
    throttle = Math.max(-1, Math.min(1, throttle));

    // Apply to vehicle
    vehicle.throttle = throttle;
  }

  /**
   * Check if AI has reached current waypoint and update target
   * @private
   */
  _checkWaypointProgress(ai, vehicle) {
    if (ai.distanceToWaypoint < ai.waypointReachedThreshold) {
      // Reached waypoint, move to next
      const nextWaypoint = this.trackManager.getNextWaypoint(ai.currentWaypointIndex);

      if (nextWaypoint) {
        ai.currentWaypointIndex = nextWaypoint.index;

        // If we wrapped around to start, increment lap counter
        if (nextWaypoint.index === 0) {
          ai.lapsCompleted++;
        }
      }
    }
  }

  /**
   * Find the player entity
   * @private
   */
  _findPlayerEntity() {
    if (!this.world) return null;

    const entities = this.world.getEntities();
    for (const entity of entities) {
      // Player has VehicleComponent but NOT AIComponent
      if (entity.hasComponent('VehicleComponent') && !entity.hasComponent('AIComponent')) {
        return entity;
      }
    }

    return null;
  }

  /**
   * Calculate distance between two vehicles
   * Positive = AI is behind, Negative = AI is ahead
   * @private
   */
  _calculateDistance(vehicle1, vehicle2) {
    const dx = vehicle2.position.x - vehicle1.position.x;
    const dz = vehicle2.position.z - vehicle1.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Clean up AI system
   */
  destroy() {
    this.world = null;
    this.trackManager = null;
  }
}
