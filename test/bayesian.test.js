/**
 * Tests for Bayesian Analysis Module
 */

import { describe, test, expect } from 'vitest';
import {
    calculateKLDivergence,
    comparePredictions
} from '../src/bayesian.js';

describe('Bayesian scoring', () => {
    // Proper distributions
    test('should return 0 for identical distributions', () => {
        const prediction = [0.5, 0.5];
        const groundTruth = [0.5, 0.5];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeCloseTo(0, 5);
    });

    test('should return a positive score for differing distributions', () => {
        const prediction = [0, 0, 1];
        const groundTruth = [1, 0, 0];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeGreaterThan(0);
    });

    test('should return 0 for identical point-mass distributions', () => {
        const prediction = [0, 0, 1, 0, 0];
        const groundTruth = [0, 0, 1, 0, 0];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeCloseTo(0, 5);
    });

    // Probability distributions with different shapes
    test('should handle distributions with different shapes', () => {
        const prediction = [0.1, 0.2, 0.3, 0.4];
        const groundTruth = [0.4, 0.3, 0.2, 0.1];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(Number.isFinite(klDivergence)).toBe(true);
        expect(klDivergence).toBeGreaterThan(0);
    });

    test('should return 0 for identical distributions with different absolute values', () => {
        const prediction = [0.2, 0.4, 0.6, 0.8];
        const groundTruth = [0.2, 0.4, 0.6, 0.8];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeCloseTo(0, 5);
    });

    test('should return infinity for predictions with zero probability where ground truth has probability', () => {
        const prediction = [0, 1, 1];
        const groundTruth = [1, 1, 1];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBe(Infinity);
    });

    test('should handle ground truth with all zeros gracefully', () => {
        const prediction = [1, 1, 1];
        const groundTruth = [0, 0, 0];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeCloseTo(0, 5); // KL divergence is 0 when truth has no mass
        expect(Number.isFinite(klDivergence)).toBe(true);
    });

    test('should throw error for different length distributions', () => {
        const prediction = [1, 0.2];
        const groundTruth = [1, 0.2, 0.3];

        expect(() => calculateKLDivergence(prediction, groundTruth)).toThrow('Distributions must have the same shape');
    });

    test('should work with very small values', () => {
        const prediction = [0.001, 0.999];
        const groundTruth = [0.001, 0.999];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(Number.isFinite(klDivergence)).toBe(true);
        expect(klDivergence).toBeGreaterThanOrEqual(0);
    });

    test('should handle distributions with different shapes', () => {
        const prediction = [0.3, 0.4, 0.2];
        const groundTruth = [0.2, 0.3, 0.1];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(Number.isFinite(klDivergence)).toBe(true);
        expect(klDivergence).toBeGreaterThan(0);
    });

    test('should identify better prediction correctly', () => {
        const goodPrediction = [0.4, 0.3, 0.2, 0.1];
        const badPrediction = [0.1, 0.2, 0.3, 0.4];
        const groundTruth = [0.35, 0.35, 0.2, 0.1];

        const result = comparePredictions(goodPrediction, badPrediction, groundTruth);

        expect(result.winning).toBe('prediction1');
        expect(result.prediction1.klDivergence).toBeLessThan(result.prediction2.klDivergence);
    });

    test('should handle equal predictions', () => {
        const prediction1 = [0.1, 0.2, 0.3, 0.4];
        const prediction2 = [0.1, 0.2, 0.3, 0.4];
        const groundTruth = [0.1, 0.2, 0.3, 0.4];

        const result = comparePredictions(prediction1, prediction2, groundTruth);

        expect(result.prediction1.klDivergence).toBeCloseTo(result.prediction2.klDivergence, 5);
        expect(result.winning).toBe('tie');
    });

    test('should return all required properties', () => {
        const prediction1 = [0.1, 0.2, 0.3, 0.4];
        const prediction2 = [0.4, 0.3, 0.2, 0.1];
        const groundTruth = [0.1, 0.2, 0.3, 0.4];

        const result = comparePredictions(prediction1, prediction2, groundTruth);

        expect(result).toHaveProperty('prediction1');
        expect(result).toHaveProperty('prediction2');
        expect(result).toHaveProperty('winning');
        expect(result).toHaveProperty('gap');
        expect(result).toHaveProperty('factor');

        expect(result.prediction1).toHaveProperty('klDivergence');
        expect(result.prediction2).toHaveProperty('klDivergence');
    });

    test('should score probability distributions correctly', () => {
        const prediction1 = [0.4, 0.4, 0.6, 0.8];
        const prediction2 = [0.8, 0.6, 0.4, 0.2];
        const groundTruth = [0.1, 0.2, 0.3, 0.4];

        const result = comparePredictions(prediction1, prediction2, groundTruth);

        expect(result.winning).toBe('prediction1');
        expect(result.gap).toBeGreaterThan(0);
        expect(result.factor).toBeGreaterThan(0);
        expect(Number.isFinite(result.factor)).toBe(true);
    });
});
