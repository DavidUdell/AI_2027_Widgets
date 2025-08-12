/**
 * Bayesian Analysis Module
 * Log score calculation for comparing sub-probability distributions
 */

/**
 * Calculate log score for a prediction distribution against ground truth distribution
 * Score = truthMass * H( Q_truth, P_prediction ) - truthMass * log(predMass) - (1 - truthMass) * log(1 - predMass)
 * Lower scores are better (closer to ground truth)
 *
 * @param {Array<number>} prediction - Predicted sub-probability distribution
 * @param {Array<number>} truth - Ground truth sub-probability distribution
 * @returns {number} Log score (lower is better)
 */

export function calculateLogScore(prediction, predProb, truth, truthProb) {
    const tolerance = 1e-12;
    const onePlusTol = 1 + tolerance;

    const predMass = predProb / 100;
    const truthMass = truthProb / 100;

    // Catch distribution element errors
    if (prediction.length !== truth.length) {
        throw new Error('Distributions must have the same shape');
    }
    if (prediction.length === 0) {
        throw new Error('Distributions must have at least one entry');
    }
    if (prediction.some(v => !Number.isFinite(v)) || truth.some(v => !Number.isFinite(v))) {
        throw new Error('Distributions must be finite');
    }
    if (prediction.some(v => v < -tolerance) || truth.some(v => v < -tolerance)) {
        throw new Error('Distributions cannot contain negative values');
    }

    // Catch total mass errors
    if (predMass > onePlusTol) {
        throw new Error('Prediction mass cannot exceed 1, but was ' + predMass);
    }
    if (truthMass > onePlusTol) {
        throw new Error('Ground truth mass cannot exceed 1, but was ' + truthMass);
    }
    if (predMass <= -tolerance) {
        throw new Error('Prediction mass cannot be negative, but was ' + predMass);
    }
    if (truthMass <= -tolerance) {
        throw new Error('Ground truth mass cannot be negative, but was ' + truthMass);
    }

    // You put nothing on the event that might have occured
    if (predMass <= tolerance && truthMass > tolerance) return Infinity;
    // You bet everything on an event that might not have happened
    if ((1 - predMass) <= tolerance && (1 - truthMass) > tolerance) return Infinity;

    // Normalize--these are the behind-the-scenes mass values, not the proper
    // labeled values.
    const predDenominator = prediction.reduce((sum, v) => sum + v, 0);
    const truthDenominator = truth.reduce((sum, v) => sum + v, 0);
    const Q = truth.map(v => v / truthDenominator);
    const P = prediction.map(v => v / predDenominator);

    // H( Q_truth, P_prediction )
    let crossEntropy = 0;
    for (let i = 0; i < Q.length; i++) {
        const q = Q[i], p = P[i];

        if (q <= 0) continue;
        if (p <= 0) return Infinity;
        crossEntropy += -q * Math.log(p);
    }

    return truthMass * crossEntropy - truthMass * Math.log(predMass) - (1 - truthMass) * Math.log(1 - predMass);
}

/**
 * Compare two predictions against ground truth using log scores
 * @param {Array<number>} prediction1 - First sub-probability distribution
 * @param {Array<number>} prediction2 - Second sub-probability distribution
 * @param {Array<number>} truth - Ground truth sub-probability distribution
 * @returns {Object} Comparison results
 */

export function comparePredictions(prediction1, predProb1, prediction2, predProb2, truth, truthProb) {
    const first = calculateLogScore(prediction1, predProb1, truth, truthProb);
    const second = calculateLogScore(prediction2, predProb2, truth, truthProb);
    const tolerance = 1e-10;

    let winning = 'tie';
    if (Number.isFinite(first) && Number.isFinite(second)) {
        if (Math.abs(first - second) > tolerance) {
            winning = first < second ? 'prediction1' : 'prediction2';
        }
    }
    // Smaller scores are better
    else if (Number.isFinite(first) && !Number.isFinite(second)) {
        winning = 'prediction1';
    }
    else if (!Number.isFinite(first) && Number.isFinite(second)) {
        winning = 'prediction2';
    }
    // else if both infinitely bad or very close, tie

    let gap = null, factor = null;
    if (Number.isFinite(first) && Number.isFinite(second)) {
        gap = second - first;
        factor = Math.exp(-gap);
    }

    return {
        prediction1: { logScore: first },
        prediction2: { logScore: second },
        winning: winning,
        gap: gap,
        factor: factor,
    };
}
