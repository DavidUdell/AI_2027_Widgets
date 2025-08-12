/**
 * Example usage of the Bayesian Analysis Module - Log Score Focus
 */

import {
    calculateLogScore,
    comparePredictions
} from '../src/bayesian.js';

// Example 1: Calculate log score for identical distributions
console.log('=== Example 1: Identical Distributions ===');
const prediction1 = [1, 2, 3, 4];
const groundTruth1 = [1, 2, 3, 4];
const logScore1 = calculateLogScore(prediction1, groundTruth1);
console.log('Prediction:', prediction1);
console.log('Ground Truth:', groundTruth1);
console.log('Log Score:', logScore1.toFixed(6)); // Should be 0

// Example 2: Calculate log score for different distributions
console.log('\n=== Example 2: Different Distributions ===');
const prediction2 = [1, 2, 3];
const groundTruth2 = [3, 2, 1];
const logScore2 = calculateLogScore(prediction2, groundTruth2);
console.log('Prediction:', prediction2);
console.log('Ground Truth:', groundTruth2);
console.log('Log Score:', logScore2.toFixed(6)); // Should be > 0

// Example 3: Log score with unnormalized distributions (different masses)
console.log('\n=== Example 3: Unnormalized Distributions (Different Masses) ===');
const prediction3 = [2, 4, 6, 8]; // Sum = 20
const groundTruth3 = [1, 2, 3, 4]; // Sum = 10
const logScore3 = calculateLogScore(prediction3, groundTruth3);
console.log('Prediction (sum=20):', prediction3);
console.log('Ground Truth (sum=10):', groundTruth3);
console.log('Log Score:', logScore3.toFixed(6)); // Should be log(2) ≈ 0.693
console.log('Expected (log(2)):', Math.log(2).toFixed(6));

// Example 4: Scale invariance
console.log('\n=== Example 4: Scale Invariance ===');
const prediction4a = [1, 2, 3, 4]; // Sum = 10
const prediction4b = [2, 4, 6, 8]; // Sum = 20 (2x scale)
const groundTruth4 = [1, 2, 3, 4]; // Sum = 10
const logScore4a = calculateLogScore(prediction4a, groundTruth4);
const logScore4b = calculateLogScore(prediction4b, groundTruth4);
console.log('Prediction A (sum=10):', prediction4a);
console.log('Prediction B (sum=20):', prediction4b);
console.log('Ground Truth (sum=10):', groundTruth4);
console.log('Log Score A:', logScore4a.toFixed(6)); // Should be 0
console.log('Log Score B:', logScore4b.toFixed(6)); // Should be log(2) ≈ 0.693
console.log('Difference (B - A):', (logScore4b - logScore4a).toFixed(6)); // Should be log(2)

// Example 5: Compare predictions
console.log('\n=== Example 5: Compare Predictions ===');
const goodPrediction = [40, 30, 20, 10];
const badPrediction = [10, 20, 30, 40];
const groundTruth = [35, 35, 20, 10];
const comparison = comparePredictions(goodPrediction, badPrediction, groundTruth);
console.log('Good Prediction:', goodPrediction);
console.log('Bad Prediction:', badPrediction);
console.log('Ground Truth:', groundTruth);
console.log('Winner:', comparison.winner);
console.log('Improvement:', comparison.improvement + '%');
console.log('Good prediction log score:', comparison.prediction1.logScore.toFixed(6));
console.log('Bad prediction log score:', comparison.prediction2.logScore.toFixed(6));

// Example 6: Overconfident prediction penalty
console.log('\n=== Example 6: Overconfident Prediction Penalty ===');
const overconfident = [0.9, 0.1];
const uniformTruth = [0.5, 0.5];
const overconfidentScore = calculateLogScore(overconfident, uniformTruth);
console.log('Overconfident Prediction:', overconfident);
console.log('Uniform Ground Truth:', uniformTruth);
console.log('Log Score:', overconfidentScore.toFixed(6)); // Should be > 0

// Example 7: Infinite penalty for zero mass where ground truth has mass
console.log('\n=== Example 7: Infinite Penalty ===');
const zeroMassPrediction = [0, 1, 1];
const groundTruthWithZeros = [1, 1, 1];
const infiniteScore = calculateLogScore(zeroMassPrediction, groundTruthWithZeros);
console.log('Zero Mass Prediction:', zeroMassPrediction);
console.log('Ground Truth:', groundTruthWithZeros);
console.log('Log Score:', infiniteScore); // Should be Infinity

// Example 8: Real-world scenario with unnormalized distributions
console.log('\n=== Example 8: Real-world Scenario (Unnormalized) ===');
const expertPrediction = [60, 25, 10, 5]; // Expert thinks early AGI
const skepticPrediction = [5, 10, 25, 60]; // Skeptic thinks late AGI
const actualOutcome = [70, 20, 8, 2]; // Reality: early AGI
const realWorldComparison = comparePredictions(expertPrediction, skepticPrediction, actualOutcome);
console.log('Expert Prediction (early AGI):', expertPrediction);
console.log('Skeptic Prediction (late AGI):', skepticPrediction);
console.log('Actual Outcome:', actualOutcome);
console.log('Winner:', realWorldComparison.winner);
console.log('Expert log score:', realWorldComparison.prediction1.logScore.toFixed(6));
console.log('Skeptic log score:', realWorldComparison.prediction2.logScore.toFixed(6));
console.log('Expert was', realWorldComparison.improvement + '% better');

// Example 9: Mass comparison
console.log('\n=== Example 9: Mass Comparison ===');
const lowMassPrediction = [10, 5, 3, 2]; // Sum = 20
const highMassPrediction = [100, 50, 30, 20]; // Sum = 200 (10x scale)
const groundTruthMass = [50, 25, 15, 10]; // Sum = 100
const massComparison = comparePredictions(lowMassPrediction, highMassPrediction, groundTruthMass);
console.log('Low Mass Prediction (sum=20):', lowMassPrediction);
console.log('High Mass Prediction (sum=200):', highMassPrediction);
console.log('Ground Truth (sum=100):', groundTruthMass);
console.log('Winner:', massComparison.winner);
console.log('Low mass log score:', massComparison.prediction1.logScore.toFixed(6));
console.log('High mass log score:', massComparison.prediction2.logScore.toFixed(6));
console.log('Difference should be log(200/20) = log(10):', Math.log(10).toFixed(6));
