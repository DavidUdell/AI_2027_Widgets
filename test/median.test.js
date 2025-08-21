import { describe, it, expect } from 'vitest';

/**
 * Test median calculation functionality
 * This tests the median calculation logic that's used in both widgets
 */

describe('Median calculation', () => {
    /**
     * Calculate the median index for a distribution
     * This is the same logic used in both widgets
     */
    function calculateMedianIndex(values) {
        const totalMass = values.reduce((sum, val) => sum + val, 0);
        
        if (totalMass <= 0) return -1;
        
        // Calculate the median (point where cumulative probability reaches 50% of total mass)
        const targetMass = totalMass / 2;
        let cumulativeMass = 0;
        let medianIndex = 0;
        
        for (let i = 0; i < values.length; i++) {
            cumulativeMass += values[i];
            if (cumulativeMass >= targetMass) {
                medianIndex = i;
                break;
            }
        }
        
        return medianIndex;
    }

    it('should calculate median for simple distribution', () => {
        const values = [0.1, 0.2, 0.3, 0.4, 0.5];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(3); // Should be at index 3 (0.4) - cumulative mass reaches 50% here
    });

    it('should calculate median for distribution with equal values', () => {
        const values = [0.2, 0.2, 0.2, 0.2, 0.2];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(2); // Should be at index 2 (middle)
    });

    it('should calculate median for distribution with zero values', () => {
        const values = [0, 0, 0.5, 0, 0];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(2); // Should be at index 2 (0.5)
    });

    it('should handle empty distribution', () => {
        const values = [];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(-1); // Should return -1 for empty
    });

    it('should handle distribution with all zeros', () => {
        const values = [0, 0, 0, 0, 0];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(-1); // Should return -1 for no mass
    });

    it('should calculate median for skewed distribution', () => {
        const values = [0.1, 0.1, 0.1, 0.1, 0.6];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(4); // Should be at index 4 (0.6)
    });

    it('should calculate median for left-skewed distribution', () => {
        const values = [0.6, 0.1, 0.1, 0.1, 0.1];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(0); // Should be at index 0 (0.6)
    });

    it('should handle single non-zero value', () => {
        const values = [0, 0, 0.5, 0, 0];
        const medianIndex = calculateMedianIndex(values);
        expect(medianIndex).toBe(2); // Should be at index 2 (0.5)
    });
});
