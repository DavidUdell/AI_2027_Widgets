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
        test('should handle unnormalized distributions with different masses', () => {
            const prediction = [2, 4, 6, 8]; // Sum = 20
            const groundTruth = [1, 2, 3, 4]; // Sum = 10
            
            const logScore = calculateLogScore(prediction, groundTruth);
            // Should be log(20/10) = log(2) ≈ 0.693
            expect(logScore).toBeCloseTo(Math.log(2), 5);
        });

        test('should handle unnormalized distributions with same shape but different mass', () => {
            const prediction = [2, 4, 6, 8]; // Sum = 20
            const groundTruth = [1, 2, 3, 4]; // Sum = 10, same shape
            
            const logScore = calculateLogScore(prediction, groundTruth);
            // Should be log(20/10) = log(2) ≈ 0.693
            expect(logScore).toBeCloseTo(Math.log(2), 5);
        });

        test('should return infinity for predictions with zero mass where ground truth has mass', () => {
            const prediction = [0, 1, 1];
            const groundTruth = [1, 1, 1];
            
            const logScore = calculateLogScore(prediction, groundTruth);
            expect(logScore).toBe(Infinity);
        });

        test('should handle ground truth with zeros gracefully', () => {
            const prediction = [1, 1, 1];
            const groundTruth = [1, 0, 1];
            
            const logScore = calculateLogScore(prediction, groundTruth);
            expect(logScore).toBeGreaterThan(0);
            expect(Number.isFinite(logScore)).toBe(true);
        });

        test('should throw error for different length distributions', () => {
            const prediction = [1, 2];
            const groundTruth = [1, 2, 3];
            
            expect(() => calculateLogScore(prediction, groundTruth)).toThrow('Distributions must have the same length');
        });

        test('should throw error for zero total mass distributions', () => {
            const prediction = [0, 0, 0];
            const groundTruth = [1, 1, 1];
            
            expect(() => calculateLogScore(prediction, groundTruth)).toThrow('Distributions cannot have zero total mass');
        });

        test('should handle different distributions with different scores', () => {
            const p = [1, 1, 8];
            const q = [8, 1, 1];
            
            const score1 = calculateLogScore(p, q);
            const score2 = calculateLogScore(q, p);
            
            // Both should be finite and positive
            expect(score1).toBeGreaterThan(0);
            expect(score2).toBeGreaterThan(0);
            expect(Number.isFinite(score1)).toBe(true);
            expect(Number.isFinite(score2)).toBe(true);
        });

        test('should work with very small values', () => {
            const prediction = [0.001, 0.999];
            const groundTruth = [0.001, 0.999];
            
            const logScore = calculateLogScore(prediction, groundTruth);
            expect(logScore).toBeCloseTo(0, 5);
        });

        test('should penalize overconfident predictions', () => {
            const overconfident = [0.9, 0.1];
            const uniformTruth = [0.5, 0.5];
            
            const logScore = calculateLogScore(overconfident, uniformTruth);
            expect(logScore).toBeGreaterThan(0);
        });

        test('should handle scale invariance correctly', () => {
            const prediction1 = [1, 2, 3, 4];
            const prediction2 = [2, 4, 6, 8]; // 2x scale
            const groundTruth = [1, 2, 3, 4];
            
            const score1 = calculateLogScore(prediction1, groundTruth);
            const score2 = calculateLogScore(prediction2, groundTruth);
            
            // prediction2 should have log(2) higher score
            expect(score2 - score1).toBeCloseTo(Math.log(2), 5);
        });
    });

    describe('comparePredictions', () => {
        test('should identify better prediction correctly', () => {
            const goodPrediction = [40, 30, 20, 10];
            const badPrediction = [10, 20, 30, 40];
            const groundTruth = [35, 35, 20, 10];
            
            const result = comparePredictions(goodPrediction, badPrediction, groundTruth);
            
            expect(result.winner).toBe('prediction1');
            expect(result.prediction1.logScore).toBeLessThan(result.prediction2.logScore);
        });

        test('should handle equal predictions', () => {
            const prediction1 = [1, 2, 3, 4];
            const prediction2 = [1, 2, 3, 4];
            const groundTruth = [1, 2, 3, 4];
            
            const result = comparePredictions(prediction1, prediction2, groundTruth);
            
            expect(result.prediction1.logScore).toBeCloseTo(result.prediction2.logScore, 5);
            expect(result.improvement).toBe('0.0');
        });

        test('should return all required properties', () => {
            const prediction1 = [1, 2, 3, 4];
            const prediction2 = [4, 3, 2, 1];
            const groundTruth = [1, 2, 3, 4];
            
            const result = comparePredictions(prediction1, prediction2, groundTruth);
            
            expect(result).toHaveProperty('prediction1');
            expect(result).toHaveProperty('prediction2');
            expect(result).toHaveProperty('winner');
            expect(result).toHaveProperty('improvement');
            
            expect(result.prediction1).toHaveProperty('logScore');
            expect(result.prediction2).toHaveProperty('logScore');
        });

        test('should work with unnormalized distributions', () => {
            const prediction1 = [2, 4, 6, 8]; // Sum = 20
            const prediction2 = [8, 6, 4, 2]; // Sum = 20
            const groundTruth = [1, 2, 3, 4]; // Sum = 10
            
            const result = comparePredictions(prediction1, prediction2, groundTruth);
            
            expect(result.winner).toBe('prediction1');
            expect(parseFloat(result.improvement)).toBeGreaterThan(0);
        });
    });

    describe('Integration tests', () => {
        test('should work with real-world-like distributions', () => {
            // Simulate a scenario where one prediction is better than another
            const goodPrediction = [40, 30, 20, 10];
            const badPrediction = [10, 20, 30, 40];
            const groundTruth = [35, 35, 20, 10];
            
            const result = comparePredictions(goodPrediction, badPrediction, groundTruth);
            
            expect(result.winner).toBe('prediction1');
            expect(result.prediction1.logScore).toBeLessThan(result.prediction2.logScore);
            expect(parseFloat(result.improvement)).toBeGreaterThan(0);
        });

        test('should handle edge cases gracefully', () => {
            // Test with very small values
            const prediction1 = [0.001, 0.999];
            const prediction2 = [0.999, 0.001];
            const groundTruth = [0.001, 0.999];
            
            const result = comparePredictions(prediction1, prediction2, groundTruth);
            
            expect(result.winner).toBe('prediction1');
            expect(result.prediction1.logScore).toBeLessThan(result.prediction2.logScore);
        });

        test('should handle infinite scores correctly', () => {
            const prediction1 = [0, 1, 1];
            const prediction2 = [1, 1, 1];
            const groundTruth = [1, 1, 1];
            
            const result = comparePredictions(prediction1, prediction2, groundTruth);
            
            expect(result.winner).toBe('prediction2');
            expect(result.prediction1.logScore).toBe(Infinity);
            expect(Number.isFinite(result.prediction2.logScore)).toBe(true);
        });
    });
});
