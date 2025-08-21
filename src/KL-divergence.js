/**
 * KL Divergence Module
 * KL divergence calculation for comparing probability distributions
 */

/**
 * Calculate KL divergence for a prediction distribution against ground truth distribution
 * Score = D_KL(Q_truth || P_prediction) = Σ q_i * log(q_i / p_i)
 * Lower scores are better (closer to ground truth)
 *
 * @param {Array<number>} prediction - Predicted probability distribution
 * @param {Array<number>} truth - Ground truth probability distribution
 * @returns {number} KL divergence (lower is better)
 */

export function calculateKLDivergence(prediction, truth) {
    const tolerance = 1e-12;

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

    // Normalize arrays to probability distributions
    let Q, P;
    const predDenominator = prediction.reduce((sum, v) => sum + v, 0);
    const truthDenominator = truth.reduce((sum, v) => sum + v, 0);
    
    if (predDenominator < tolerance) {
        // Zero vector becomes uniform distribution
        P = prediction.map(v => 1 / prediction.length);
    } else {
        // Normalize vector
        P = prediction.map(v => v / predDenominator);    
    }
    
    if (truthDenominator < tolerance) {
        // Zero vector becomes uniform distribution
        Q = truth.map(v => 1 / truth.length);
    } else {
        // Normalize vector
        Q = truth.map(v => v / truthDenominator);
    }

    // Calculate KL divergence D_KL(Q || P) = Σ q_i * log(q_i / p_i)
    let klDivergence = 0;
    for (let i = 0; i < Q.length; i++) {
        const q = Q[i], p = P[i];

        if (q <= 0) continue; // Skip zero probability events in truth
        if (!(p > 0)) return Infinity; // Prediction assigns zero to event that occurred
        
        klDivergence += q * Math.log(q / p);
    }

    return klDivergence;
}
