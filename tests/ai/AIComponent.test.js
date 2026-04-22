import { describe, it, expect, beforeEach } from 'vitest';
import { AIComponent } from '../../src/ai/AIComponent.js';

describe('AIComponent', () => {
  let ai;

  beforeEach(() => {
    ai = new AIComponent();
  });

  describe('constructor', () => {
    it('should create an AI component with default values', () => {
      expect(ai.difficulty).toBe('medium');
      expect(ai.currentWaypointIndex).toBe(0);
      expect(ai.targetSpeed).toBe(0.8);
      expect(ai.aggressiveness).toBe(0.5);
      expect(ai.aiType).toBe('opponent');
    });

    it('should accept custom configuration', () => {
      const customAI = new AIComponent({
        difficulty: 'hard',
        targetSpeed: 0.95,
        aggressiveness: 0.8,
        aiType: 'racer'
      });

      expect(customAI.difficulty).toBe('hard');
      expect(customAI.targetSpeed).toBe(0.95);
      expect(customAI.aggressiveness).toBe(0.8);
      expect(customAI.aiType).toBe('racer');
    });

    it('should initialize waypoint navigation state', () => {
      expect(ai.currentWaypointIndex).toBe(0);
      expect(ai.waypointReachedThreshold).toBe(5.0);
      expect(ai.lookaheadDistance).toBe(15.0);
    });

    it('should initialize obstacle avoidance settings', () => {
      expect(ai.obstacleAvoidanceRadius).toBe(10.0);
      expect(ai.obstacleAvoidanceStrength).toBe(0.7);
    });

    it('should initialize fair play settings', () => {
      expect(ai.rubberBandingFactor).toBe(0.1);
      expect(ai.errorFrequency).toBe(0.05);
      expect(ai.errorMagnitude).toBe(0.3);
    });

    it('should initialize internal state', () => {
      expect(ai.nextErrorTime).toBe(0);
      expect(ai.isAvoidingObstacle).toBe(false);
      expect(ai.lapsCompleted).toBe(0);
    });
  });

  describe('setDifficulty', () => {
    it('should apply easy difficulty preset', () => {
      ai.setDifficulty('easy');

      expect(ai.difficulty).toBe('easy');
      expect(ai.targetSpeed).toBe(0.7);
      expect(ai.aggressiveness).toBe(0.4);
      expect(ai.errorFrequency).toBe(0.08);
      expect(ai.errorMagnitude).toBe(0.4);
    });

    it('should apply medium difficulty preset', () => {
      ai.setDifficulty('medium');

      expect(ai.difficulty).toBe('medium');
      expect(ai.targetSpeed).toBe(0.8);
      expect(ai.aggressiveness).toBe(0.5);
      expect(ai.errorFrequency).toBe(0.05);
      expect(ai.errorMagnitude).toBe(0.3);
    });

    it('should apply hard difficulty preset', () => {
      ai.setDifficulty('hard');

      expect(ai.difficulty).toBe('hard');
      expect(ai.targetSpeed).toBe(0.9);
      expect(ai.aggressiveness).toBe(0.7);
      expect(ai.errorFrequency).toBe(0.02);
      expect(ai.errorMagnitude).toBe(0.2);
    });

    it('should default to medium for unknown difficulty', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      ai.setDifficulty('impossible');

      expect(ai.difficulty).toBe('medium');
      expect(ai.targetSpeed).toBe(0.8);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown difficulty: impossible')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('difficulty scaling', () => {
    it('should make easy AI slower and less aggressive', () => {
      ai.setDifficulty('easy');
      const easySpeed = ai.targetSpeed;
      const easyAggressiveness = ai.aggressiveness;

      ai.setDifficulty('hard');
      const hardSpeed = ai.targetSpeed;
      const hardAggressiveness = ai.aggressiveness;

      expect(easySpeed).toBeLessThan(hardSpeed);
      expect(easyAggressiveness).toBeLessThan(hardAggressiveness);
    });

    it('should make easy AI make more errors', () => {
      ai.setDifficulty('easy');
      const easyErrorFreq = ai.errorFrequency;
      const easyErrorMag = ai.errorMagnitude;

      ai.setDifficulty('hard');
      const hardErrorFreq = ai.errorFrequency;
      const hardErrorMag = ai.errorMagnitude;

      expect(easyErrorFreq).toBeGreaterThan(hardErrorFreq);
      expect(easyErrorMag).toBeGreaterThan(hardErrorMag);
    });
  });

  describe('component type', () => {
    it('should be a Component instance', () => {
      expect(ai).toBeInstanceOf(Object);
      expect(typeof ai).toBe('object');
    });
  });
});
