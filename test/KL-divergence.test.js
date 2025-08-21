/**
 * Tests for KL Divergence Module
 */

import { describe, test, expect } from 'vitest';
import { calculateKLDivergence } from '../src/KL-divergence.js';

describe('KL divergence', () => {
    test('should return 0 for identical uniform distributions', () => {
        const prediction = [0.5, 0.5];
        const groundTruth = [0.5, 0.5];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeCloseTo(0, 5);
    });

    test('should return 0 for identical point-mass distributions', () => {
        const prediction = [0, 0, 1, 0, 0];
        const groundTruth = [0, 0, 1, 0, 0];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeCloseTo(0, 5);
    });

    test('should return a positive score for differing distributions', () => {
        const prediction = [0, 0, 1];
        const groundTruth = [1, 0, 0];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(klDivergence).toBeGreaterThan(0);
    });

    test('should throw error for different length distributions', () => {
        const prediction = [1, 0.2];
        const groundTruth = [1, 0.2, 0.3];

        expect(() => calculateKLDivergence(prediction, groundTruth)).toThrow('Distributions must have the same shape');
    });

    test('should work with very small values', () => {
        const prediction = [0.001, 0.999];
        const groundTruth = [0.999, 0.001];

        const klDivergence = calculateKLDivergence(prediction, groundTruth);
        expect(Number.isFinite(klDivergence)).toBe(true);
        expect(klDivergence).toBeGreaterThanOrEqual(0);
    });
});
