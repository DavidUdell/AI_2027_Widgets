/**
 * AI 2027 - Calculator Widget
 * KL Divergence Calculator - shows all distributions' KL divergence against the Drawing distribution
 */

import { calculateKLDivergence } from './KL-divergence.js';

/**
 * Creates a KL Divergence Calculator widget that shows all distributions' scores against the Drawing distribution
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {Array<Object>} options.distributions - Array of distribution objects with color, mass, and values
 * @param {number} options.activeDistributionIndex - Index of the active (Drawing) distribution to use as ground truth
 * @param {Object} options.visibilityState - Object mapping distribution indices to visibility booleans
 */
export function createCalculatorWidget(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.style.width = '100%';
    mainContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';

    // Create controls section
    const controlsSection = document.createElement('div');
    controlsSection.style.marginBottom = '20px';
    controlsSection.style.textAlign = 'center';

    // Create selection controls
    const selectionControls = document.createElement('div');
    selectionControls.style.display = 'flex';
    selectionControls.style.flexDirection = 'column';
    selectionControls.style.alignItems = 'center';
    selectionControls.style.gap = '15px';
    selectionControls.style.marginBottom = '15px';
    selectionControls.style.padding = '20px';
    selectionControls.style.border = '3px solid #2c3e50';
    selectionControls.style.borderRadius = '8px';
    selectionControls.style.backgroundColor = '#f8f9fa';
    selectionControls.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    
    // Add title for the selection box
    const selectionTitle = document.createElement('div');
    selectionTitle.textContent = 'Kullback\u2013Leibler Divergence';
    selectionTitle.style.fontWeight = 'bold';
    selectionTitle.style.fontSize = '16px';
    selectionTitle.style.color = '#2c3e50';
    selectionTitle.style.marginBottom = '15px';
    selectionTitle.style.textAlign = 'center';
    
    // Create ground truth display container (no longer a selection)
    const truthContainer = document.createElement('div');
    truthContainer.style.display = 'flex';
    truthContainer.style.justifyContent = 'center';
    truthContainer.style.alignItems = 'center';
    truthContainer.style.gap = '12px';
    truthContainer.style.marginBottom = '15px';
    
    const truthLabel = document.createElement('label');
    truthLabel.textContent = 'Ground Truth:';
    truthLabel.style.fontWeight = 'bold';
    truthLabel.style.color = '#2c3e50';
    truthLabel.style.fontSize = '14px';
    
    const truthDisplay = document.createElement('span');
    truthDisplay.style.fontSize = '14px';
    truthDisplay.style.fontWeight = 'bold';
    truthDisplay.style.color = '#2c3e50';
    
    truthContainer.appendChild(truthLabel);
    truthContainer.appendChild(truthDisplay);
    
    selectionControls.appendChild(selectionTitle);
    selectionControls.appendChild(truthContainer);

    // Create results section inside the selection controls box
    const resultsSection = document.createElement('div');
    resultsSection.style.marginTop = '0px';
    resultsSection.style.padding = '0px';
    resultsSection.style.backgroundColor = 'transparent';
    resultsSection.style.borderRadius = '0px';
    resultsSection.style.border = 'none';
    resultsSection.style.minHeight = '0px';
    resultsSection.style.display = 'none';
    resultsSection.style.width = '100%';

    controlsSection.appendChild(selectionControls);
    selectionControls.appendChild(resultsSection);
    mainContainer.appendChild(controlsSection);

    /**
     * Update the ground truth display
     */
    function updateGroundTruthDisplay() {
        if (!options.distributions || options.distributions.length === 0) {
            truthDisplay.textContent = 'None';
            return;
        }

        const activeIndex = options.activeDistributionIndex || 0;
        if (activeIndex >= 0 && activeIndex < options.distributions.length) {
            const activeDistribution = options.distributions[activeIndex];
            truthDisplay.textContent = activeDistribution.color.charAt(0).toUpperCase() + activeDistribution.color.slice(1);
        } else {
            truthDisplay.textContent = 'None';
        }
    }

    /**
     * Format KL divergence for display
     */
    function formatKLDivergence(score) {
        if (!Number.isFinite(score)) {
            return '∞';
        }
        return score.toFixed(2);
    }

    /**
     * Update KL divergence results for all distributions
     */
    function updateResults() {
        const activeIndex = options.activeDistributionIndex || 0;

        // Clear results section
        resultsSection.innerHTML = '';

        // Check if ground truth is available
        if (activeIndex < 0 || !options.distributions || options.distributions.length === 0 || 
            activeIndex >= options.distributions.length) {
            resultsSection.style.display = 'none';
            return;
        }

        // Get selected ground truth (Drawing distribution)
        const truth = options.distributions[activeIndex];

        // Calculate KL divergence for all distributions except the ground truth
        const klScores = options.distributions
            .map((distribution, index) => {
                const klDivergence = calculateKLDivergence(
                    distribution.values, truth.values
                );
                return {
                    index,
                    distribution,
                    klDivergence
                };
            })
            .filter(score => {
                // Exclude the ground truth distribution
                if (score.index === activeIndex) return false;
                // Only include distributions that are visible in the Interactive widget
                return options.visibilityState && options.visibilityState[score.index] === true;
            });

        // Sort by KL divergence (best scores first)
        klScores.sort((a, b) => a.klDivergence - b.klDivergence);

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.style.padding = '0px';
        
        // Create results display
        const resultsContainer = document.createElement('div');
        resultsContainer.style.fontSize = '14px';
        resultsContainer.style.lineHeight = '1.6';

        // Create minimalistic display
        klScores.forEach((score) => {
            const scoreRow = document.createElement('div');
            scoreRow.style.display = 'flex';
            scoreRow.style.justifyContent = 'center';
            scoreRow.style.alignItems = 'center';
            scoreRow.style.padding = '4px 0';
            scoreRow.style.fontFamily = 'monospace';
            scoreRow.style.fontSize = '13px';
            scoreRow.style.gap = '40px';

            // Distribution name
            const nameDiv = document.createElement('span');
            nameDiv.textContent = score.distribution.color.charAt(0).toUpperCase() + score.distribution.color.slice(1);
            nameDiv.style.minWidth = '80px';
            nameDiv.style.textAlign = 'center';

            // KL divergence score
            const scoreDiv = document.createElement('span');
            scoreDiv.textContent = formatKLDivergence(score.klDivergence);
            scoreDiv.style.minWidth = '60px';
            scoreDiv.style.textAlign = 'center';

            scoreRow.appendChild(nameDiv);
            scoreRow.appendChild(scoreDiv);
            resultsContainer.appendChild(scoreRow);
        });

        resultsSection.appendChild(resultsContainer);
    }

    // Append to container
    container.appendChild(mainContainer);

    // Initialize display
    updateGroundTruthDisplay();
    // Don't show results initially - wait for proper visibility state
    resultsSection.style.display = 'none';

    // Return methods for external control
    return {
        updateDistributions: (newDistributions) => {
            options.distributions = newDistributions;
            updateGroundTruthDisplay();
            updateResults();
        },
        setActiveDistributionIndex: (newActiveIndex) => {
            options.activeDistributionIndex = newActiveIndex;
            updateGroundTruthDisplay();
            updateResults();
        },
        setVisibilityState: (newVisibilityState) => {
            options.visibilityState = newVisibilityState;
            updateResults();
        }
    };
}
