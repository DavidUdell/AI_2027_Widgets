/**
 * Bayesian Analysis Module
 * Simple log score calculation for comparing probability distributions
 */

/**
 * Calculate log score for a prediction against ground truth
 * Log score = KL(groundTruth || prediction) - log(mass_groundTruth) + log(mass_prediction)
 * This handles unnormalized distributions properly
 * Lower scores are better (closer to ground truth)
 * 
 * @param {Array<number>} prediction - Predicted distribution (unnormalized)
 * @param {Array<number>} groundTruth - Ground truth distribution (unnormalized)
 * @returns {number} Log score (lower is better)
 */
export function calculateLogScore(prediction, groundTruth) {
    if (prediction.length !== groundTruth.length) {
        throw new Error('Distributions must have the same length');
    }
    
    // Calculate total masses
    const predictionMass = prediction.reduce((sum, p) => sum + p, 0);
    const groundTruthMass = groundTruth.reduce((sum, p) => sum + p, 0);
    
    if (predictionMass === 0 || groundTruthMass === 0) {
        throw new Error('Distributions cannot have zero total mass');
    }
    
    // Normalize distributions
    const normalizedPrediction = prediction.map(p => p / predictionMass);
    const normalizedGroundTruth = groundTruth.map(p => p / groundTruthMass);
    
    // Calculate KL divergence: KL(groundTruth || prediction)
    const epsilon = 1e-10;
    let klDivergence = 0;
    
    for (let i = 0; i < normalizedGroundTruth.length; i++) {
        const p = normalizedGroundTruth[i];
        const q = normalizedPrediction[i];
        
        if (p > epsilon && q > epsilon) {
            klDivergence += p * Math.log(p / q);
        } else if (p > epsilon && q <= epsilon) {
            // Ground truth has mass where prediction has none - infinite penalty
            return Infinity;
        }
        // If p <= epsilon, contribution is 0 (0 * log(anything) = 0)
    }
    
    // Add log mass terms for proper handling of unnormalized distributions
    const logScore = klDivergence - Math.log(groundTruthMass) + Math.log(predictionMass);
    
    return logScore;
}

/**
 * Compare two predictions against ground truth using log scores
 * @param {Array<number>} prediction1 - First prediction (unnormalized)
 * @param {Array<number>} prediction2 - Second prediction (unnormalized)
 * @param {Array<number>} groundTruth - Ground truth (unnormalized)
 * @returns {Object} Comparison results
 */
export function comparePredictions(prediction1, prediction2, groundTruth) {
    const score1 = calculateLogScore(prediction1, groundTruth);
    const score2 = calculateLogScore(prediction2, groundTruth);
    
    const winner = score1 < score2 ? 'prediction1' : 'prediction2';
    
    // Handle case where scores are equal or both are 0
    let improvement;
    if (Math.abs(score1 - score2) < 1e-10) {
        improvement = 0;
    } else {
        improvement = Math.abs(score1 - score2) / Math.max(score1, score2) * 100;
    }
    
    return {
        prediction1: { logScore: score1 },
        prediction2: { logScore: score2 },
        winner,
        improvement: improvement.toFixed(1)
    };
}
