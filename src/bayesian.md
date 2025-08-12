# Bayesian Analysis Module - Log Score Focus

A simple, clean implementation focused on log score calculation for comparing probability distributions.

## Overview

The log score is a standard scoring rule in Bayesian analysis that measures how well a prediction matches the ground truth. It properly handles unnormalized distributions by incorporating log mass terms.

**Key properties:**
- Lower scores are better (closer to ground truth)
- Properly handles unnormalized distributions with different masses
- Provides infinite penalty for predictions with zero mass where ground truth has mass
- Scale-invariant: multiplying both distributions by the same factor doesn't change relative scores
- Standard metric in Bayesian analysis and forecasting

## Functions

### `calculateLogScore(prediction, groundTruth)`

Calculates the log score for a prediction against ground truth.

**Parameters:**
- `prediction` (Array<number>): Predicted distribution (unnormalized)
- `groundTruth` (Array<number>): Ground truth distribution (unnormalized)

**Returns:** number - Log score (lower is better, 0 for perfect match)

**Example:**
```javascript
const prediction = [1, 2, 3, 4];
const groundTruth = [1, 2, 3, 4];
const logScore = calculateLogScore(prediction, groundTruth);
// Result: 0 (perfect match)

const badPrediction = [4, 3, 2, 1];
const logScore2 = calculateLogScore(badPrediction, groundTruth);
// Result: > 0 (worse prediction)

// Different masses
const highMassPrediction = [2, 4, 6, 8]; // Sum = 20
const lowMassTruth = [1, 2, 3, 4]; // Sum = 10
const logScore3 = calculateLogScore(highMassPrediction, lowMassTruth);
// Result: log(2) ≈ 0.693 (penalty for mass difference)
```

### `comparePredictions(prediction1, prediction2, groundTruth)`

Compares two predictions against ground truth using log scores.

**Parameters:**
- `prediction1` (Array<number>): First prediction (unnormalized)
- `prediction2` (Array<number>): Second prediction (unnormalized)
- `groundTruth` (Array<number>): Ground truth (unnormalized)

**Returns:** Object with comparison results:
```javascript
{
  prediction1: { logScore: number },
  prediction2: { logScore: number },
  winner: 'prediction1' | 'prediction2',
  improvement: string // percentage improvement
}
```

**Example:**
```javascript
const goodPred = [40, 30, 20, 10];
const badPred = [10, 20, 30, 40];
const groundTruth = [35, 35, 20, 10];
const result = comparePredictions(goodPred, badPred, groundTruth);
// Result: { winner: 'prediction1', improvement: '45.2%', ... }
```

## Usage Examples

See `examples/bayesian-example.js` for complete usage examples.

## Testing

Run the test suite:

```bash
npm test
```

The test suite covers:
- Log score calculations for identical and different distributions
- Proper handling of unnormalized distributions with different masses
- Scale invariance properties
- Infinite penalties for zero mass predictions
- Edge cases and error handling
- Prediction comparisons

## Mathematical Background

### Log Score Formula
The log score is calculated as:

```
LogScore = KL(groundTruth || prediction) - log(mass_groundTruth) + log(mass_prediction)
```

Where:
- `KL(groundTruth || prediction)` is the KL divergence from normalized ground truth to normalized prediction
- `mass_groundTruth` is the sum of ground truth values
- `mass_prediction` is the sum of prediction values

### Properties
- **Perfect match**: Log score = 0 (when distributions are identical)
- **Worse predictions**: Log score > 0
- **Mass difference penalty**: If prediction has mass M and ground truth has mass N, there's a penalty of log(M/N)
- **Infinite penalty**: When prediction has zero mass where ground truth has mass
- **Scale invariant**: Multiplying both distributions by the same factor doesn't change relative scores
- **Asymmetric**: KL divergence depends on which distribution is the reference

### Scale Invariance
The log score properly handles unnormalized distributions. For example:
- If prediction has mass 20 and ground truth has mass 10, there's a penalty of log(20/10) = log(2)
- If prediction has mass 100 and ground truth has mass 50, there's a penalty of log(100/50) = log(2)
- The relative scores between different predictions remain the same regardless of overall scale

## Notes

- All distributions must have the same length
- Distributions are normalized internally for KL divergence calculation
- Zero total mass distributions throw an error
- Perfect predictions have log score = 0
- All functions are pure and have no side effects
- Lower log scores indicate better predictions
- The metric properly penalizes both shape differences and mass differences
