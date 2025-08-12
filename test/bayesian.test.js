/**
 * Tests for Bayesian Analysis Module
 */

import { describe, test, expect } from 'vitest';
import {
    calculateLogScore,
    comparePredictions
} from '../src/bayesian.js';

describe('Bayesian Analysis Module', () => {
    describe('calculateLogScore', () => {
        // Proper distributions
        test('should return ln(2) for identical distributions', () => {
            const prediction = [0.5, 0.5];
            const groundTruth = [0.5, 0.5];
            const predProb = 100;
            const truthProb = 100;

            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(logScore).toBeCloseTo(Math.log(2), 5);
        });

        test('should return a positive score for differing distributions', () => {
            const prediction = [0, 0, 1];
            const groundTruth = [1, 0, 0];
            const predProb = 100;
            const truthProb = 100;

            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(logScore).toBeGreaterThan(0);
        });

        test('should return 0 for identical point-mass distributions', () => {
            const prediction = [0, 0, 1, 0, 0];
            const groundTruth = [0, 0, 1, 0, 0];
            const predProb = 100;
            const truthProb = 100;

            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(logScore).toBeCloseTo(0, 5);
        });

        // Sub-probability distributions
        test('should handle sub-probability distributions with different masses', () => {
            const prediction = [0.2, 0.4, 0.6, 0.8];
            const groundTruth = [0.1, 0.2, 0.3, 0.4];
            const predProb = 30;
            const truthProb = 40;

            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(Number.isFinite(logScore)).toBe(true);
            expect(logScore).toBeGreaterThan(0);
        });

        test('should handle unnormalized distributions with same shape but different mass', () => {
            const prediction = [0.2, 0.4, 0.6, 0.8]; // Sum = 2.0
            const groundTruth = [0.1, 0.2, 0.3, 0.4]; // Sum = 1.0, same shape
            const predProb = 50;
            const truthProb = 25;
            
            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(Number.isFinite(logScore)).toBe(true);
            expect(logScore).toBeGreaterThan(0);
        });

        test('should return infinity for predictions with zero mass where ground truth has mass', () => {
            const prediction = [0, 1, 1];
            const groundTruth = [1, 1, 1];
            const predProb = 0;
            const truthProb = 100;
            
            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(logScore).toBe(Infinity);
        });

        test('should handle ground truth with zeros gracefully', () => {
            const prediction = [1, 1, 1];
            const groundTruth = [1, 0, 1];
            const predProb = 100;
            const truthProb = 100;
            
            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(logScore).toBeGreaterThan(0);
            expect(Number.isFinite(logScore)).toBe(true);
        });

        test('should throw error for different length distributions', () => {
            const prediction = [1, 0.2];
            const groundTruth = [1, 0.2, 0.3];
            const predProb = 100;
            const truthProb = 100;
            
            expect(() => calculateLogScore(prediction, predProb, groundTruth, truthProb)).toThrow('Distributions must have the same shape');
        });

        test('should throw error for prediction mass exceeding 1', () => {
            const prediction = [0.5, 0.5];
            const groundTruth = [0.5, 0.5];
            const predProb = 150; // 1.5 > 1
            const truthProb = 100;
            
            expect(() => calculateLogScore(prediction, predProb, groundTruth, truthProb)).toThrow('Prediction mass cannot exceed 1');
        });

        test('should throw error for negative prediction mass', () => {
            const prediction = [0.5, 0.5];
            const groundTruth = [0.5, 0.5];
            const predProb = -10;
            const truthProb = 100;
            
            expect(() => calculateLogScore(prediction, predProb, groundTruth, truthProb)).toThrow('Prediction mass cannot be negative');
        });

        test('should handle different distributions with different scores', () => {
            const p = [0.1, 0.1, 0.8];
            const q = [0.8, 0.1, 0.1];
            const predProb = 100;
            const truthProb = 100;
            
            const score1 = calculateLogScore(p, predProb, q, truthProb);
            const score2 = calculateLogScore(q, predProb, p, truthProb);
            
            // Both should be finite and positive
            expect(score1).toBeGreaterThan(0);
            expect(score2).toBeGreaterThan(0);
            expect(Number.isFinite(score1)).toBe(true);
            expect(Number.isFinite(score2)).toBe(true);
        });

        test('should work with very small values', () => {
            const prediction = [0.001, 0.999];
            const groundTruth = [0.001, 0.999];
            const predProb = 100;
            const truthProb = 100;
            
            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(Number.isFinite(logScore)).toBe(true);
            expect(logScore).toBeGreaterThanOrEqual(0);
        });

        test('should penalize overconfident predictions', () => {
            const overconfident = [0.9, 0.1];
            const uniformTruth = [0.5, 0.5];
            const predProb = 100;
            const truthProb = 100;
            
            const logScore = calculateLogScore(overconfident, predProb, uniformTruth, truthProb);
            expect(logScore).toBeGreaterThan(0);
        });

        test('should handle scale invariance correctly', () => {
            const prediction1 = [0.1, 0.2, 0.3, 0.4];
            const prediction2 = [0.2, 0.4, 0.6, 0.8]; // 2x scale
            const groundTruth = [0.1, 0.2, 0.3, 0.4];
            const predProb = 100;
            const truthProb = 100;
            
            const score1 = calculateLogScore(prediction1, predProb, groundTruth, truthProb);
            const score2 = calculateLogScore(prediction2, predProb, groundTruth, truthProb);
            
            // Both should be finite and positive
            expect(Number.isFinite(score1)).toBe(true);
            expect(Number.isFinite(score2)).toBe(true);
            expect(score1).toBeGreaterThan(0);
            expect(score2).toBeGreaterThan(0);
        });

        test('should handle sub-probability distributions correctly', () => {
            const prediction = [0.3, 0.4, 0.2];
            const groundTruth = [0.2, 0.3, 0.1];
            const predProb = 60; // 0.6 total mass
            const truthProb = 40; // 0.4 total mass
            
            const logScore = calculateLogScore(prediction, predProb, groundTruth, truthProb);
            expect(Number.isFinite(logScore)).toBe(true);
        });
    });

    describe('comparePredictions', () => {
        test('should identify better prediction correctly', () => {
            const goodPrediction = [0.4, 0.3, 0.2, 0.1];
            const badPrediction = [0.1, 0.2, 0.3, 0.4];
            const groundTruth = [0.35, 0.35, 0.2, 0.1];
            const predProb1 = 100;
            const predProb2 = 100;
            const truthProb = 100;
            
            const result = comparePredictions(goodPrediction, predProb1, badPrediction, predProb2, groundTruth, truthProb);
            
            expect(result.winning).toBe('prediction1');
            expect(result.prediction1.logScore).toBeLessThan(result.prediction2.logScore);
        });

        test('should handle equal predictions', () => {
            const prediction1 = [0.1, 0.2, 0.3, 0.4];
            const prediction2 = [0.1, 0.2, 0.3, 0.4];
            const groundTruth = [0.1, 0.2, 0.3, 0.4];
            const predProb1 = 100;
            const predProb2 = 100;
            const truthProb = 100;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(result.prediction1.logScore).toBeCloseTo(result.prediction2.logScore, 5);
            expect(result.winning).toBe('tie');
        });

        test('should return all required properties', () => {
            const prediction1 = [0.1, 0.2, 0.3, 0.4];
            const prediction2 = [0.4, 0.3, 0.2, 0.1];
            const groundTruth = [0.1, 0.2, 0.3, 0.4];
            const predProb1 = 100;
            const predProb2 = 100;
            const truthProb = 100;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(result).toHaveProperty('prediction1');
            expect(result).toHaveProperty('prediction2');
            expect(result).toHaveProperty('winning');
            expect(result).toHaveProperty('gap');
            expect(result).toHaveProperty('factor');
            
            expect(result.prediction1).toHaveProperty('logScore');
            expect(result.prediction2).toHaveProperty('logScore');
        });

        test('should work with unnormalized distributions', () => {
            const prediction1 = [0.2, 0.4, 0.6, 0.8]; // Sum = 2.0
            const prediction2 = [0.8, 0.6, 0.4, 0.2]; // Sum = 2.0
            const groundTruth = [0.1, 0.2, 0.3, 0.4]; // Sum = 1.0
            const predProb1 = 50;
            const predProb2 = 50;
            const truthProb = 25;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(result.winning).toBe('prediction1');
            expect(result.gap).toBeGreaterThan(0);
            expect(result.factor).toBeGreaterThan(0);
            expect(Number.isFinite(result.factor)).toBe(true);
        });

        test('should handle different probability masses', () => {
            const prediction1 = [0.5, 0.5];
            const prediction2 = [0.5, 0.5];
            const groundTruth = [0.5, 0.5];
            const predProb1 = 80;
            const predProb2 = 60;
            const truthProb = 100;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(result.prediction1.logScore).not.toBe(result.prediction2.logScore);
            expect(Number.isFinite(result.prediction1.logScore)).toBe(true);
            expect(Number.isFinite(result.prediction2.logScore)).toBe(true);
        });
    });

    describe('Integration tests', () => {
        test('should work with real-world-like distributions', () => {
            // Simulate a scenario where one prediction is better than another
            const goodPrediction = [0.4, 0.3, 0.2, 0.1];
            const badPrediction = [0.1, 0.2, 0.3, 0.4];
            const groundTruth = [0.35, 0.35, 0.2, 0.1];
            const predProb1 = 100;
            const predProb2 = 100;
            const truthProb = 100;
            
            const result = comparePredictions(goodPrediction, predProb1, badPrediction, predProb2, groundTruth, truthProb);
            
            expect(result.winning).toBe('prediction1');
            expect(result.prediction1.logScore).toBeLessThan(result.prediction2.logScore);
            expect(result.gap).toBeGreaterThan(0);
        });

        test('should handle edge cases gracefully', () => {
            // Test with very small values
            const prediction1 = [0.001, 0.999];
            const prediction2 = [0.999, 0.001];
            const groundTruth = [0.001, 0.999];
            const predProb1 = 100;
            const predProb2 = 100;
            const truthProb = 100;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(result.winning).toBe('prediction1');
            expect(result.prediction1.logScore).toBeLessThan(result.prediction2.logScore);
        });

        test('should handle infinite scores correctly', () => {
            const prediction1 = [0, 1, 1];
            const prediction2 = [1, 1, 1];
            const groundTruth = [1, 1, 1];
            const predProb1 = 0;
            const predProb2 = 100;
            const truthProb = 100;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(result.winning).toBe('prediction2');
            expect(result.prediction1.logScore).toBe(Infinity);
            expect(Number.isFinite(result.prediction2.logScore)).toBe(true);
        });

        test('should handle sub-probability scenarios', () => {
            const prediction1 = [0.3, 0.4, 0.2];
            const prediction2 = [0.2, 0.3, 0.1];
            const groundTruth = [0.2, 0.3, 0.1];
            const predProb1 = 60;
            const predProb2 = 40;
            const truthProb = 40;
            
            const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
            
            expect(Number.isFinite(result.prediction1.logScore)).toBe(true);
            expect(Number.isFinite(result.prediction2.logScore)).toBe(true);
            expect(result.gap).not.toBeNull();
            expect(result.factor).not.toBeNull();
        });
    });
});
