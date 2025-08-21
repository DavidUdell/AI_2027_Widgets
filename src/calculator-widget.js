/**
 * AI 2027 - Calculator Widget
 * KL Divergence Calculator - shows all distributions' KL divergence against a ground truth
 */

import { calculateKLDivergence } from './KL-divergence.js';

/**
 * Creates a KL Divergence Calculator widget that shows all distributions' scores against a ground truth
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {Array<Object>} options.distributions - Array of distribution objects with color, mass, and values
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
    selectionTitle.textContent = 'Calculator';
    selectionTitle.style.fontWeight = 'bold';
    selectionTitle.style.fontSize = '16px';
    selectionTitle.style.color = '#2c3e50';
    selectionTitle.style.marginBottom = '15px';
    selectionTitle.style.textAlign = 'center';
    
    // Create ground truth selection container
    const truthContainer = document.createElement('div');
    truthContainer.style.display = 'flex';
    truthContainer.style.justifyContent = 'center';
    truthContainer.style.alignItems = 'center';
    truthContainer.style.gap = '12px';
    truthContainer.style.marginBottom = '15px';
    
    const truthLabel = document.createElement('label');
    truthLabel.textContent = 'Ground Truth Distribution:';
    truthLabel.style.fontWeight = 'bold';
    truthLabel.style.color = '#2c3e50';
    truthLabel.style.fontSize = '14px';
    
    const truthSelect = document.createElement('select');
    truthSelect.style.padding = '4px 8px';
    truthSelect.style.border = '1px solid #ccc';
    truthSelect.style.borderRadius = '4px';
    truthSelect.style.fontSize = '14px';
    truthSelect.style.fontWeight = 'normal';
    
    truthContainer.appendChild(truthLabel);
    truthContainer.appendChild(truthSelect);
    
    selectionControls.appendChild(selectionTitle);
    selectionControls.appendChild(truthContainer);

    // Create results section inside the selection controls box
    const resultsSection = document.createElement('div');
    resultsSection.style.marginTop = '15px';
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

    // Color schemes for visual indicators
    const colorSchemes = {
        blue: '#007bff',
        green: '#28a745',
        red: '#dc3545',
        purple: '#6f42c1',
        orange: '#fd7e14',
        yellow: '#ffc107'
    };

    /**
     * Populate dropdown options
     */
    function populateDropdowns() {
        if (!options.distributions || options.distributions.length === 0) {
            return;
        }

        // Clear existing options
        truthSelect.innerHTML = '';

        // Add distribution options
        options.distributions.forEach((distribution, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `${distribution.color.charAt(0).toUpperCase() + distribution.color.slice(1)}`;
            
            truthSelect.appendChild(option);
        });

        // Set default selection to first distribution
        if (options.distributions.length > 0) {
            truthSelect.value = '0';
            
            // Trigger initial results calculation
            updateResults();
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
     * Format factor for display
     */
    function formatFactor(factor) {
        if (!Number.isFinite(factor)) {
            return 'N/A';
        }
        if (factor < 1.01) {
            return factor.toFixed(3);
        }
        return factor.toFixed(2);
    }

    /**
     * Update KL divergence results for all distributions
     */
    function updateResults() {
        const truthIndex = truthSelect.value ? parseInt(truthSelect.value) : -1;

        // Clear results section
        resultsSection.innerHTML = '';

        // Check if ground truth is selected
        if (truthIndex === -1 || !options.distributions || options.distributions.length === 0) {
            resultsSection.style.display = 'none';
            return;
        }

        // Get selected ground truth
        const truth = options.distributions[truthIndex];

        // Calculate KL divergence for all distributions
        const klScores = options.distributions.map((distribution, index) => {
            const klDivergence = calculateKLDivergence(
                distribution.values, truth.values
            );
            return {
                index,
                distribution,
                klDivergence
            };
        });

        // Sort by KL divergence (best scores first)
        klScores.sort((a, b) => a.klDivergence - b.klDivergence);

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.style.padding = '15px';
        
        // Create results display
        const resultsContainer = document.createElement('div');
        resultsContainer.style.fontSize = '14px';
        resultsContainer.style.lineHeight = '1.6';

        // Title
        const titleDiv = document.createElement('div');
        titleDiv.textContent = `KL Divergence vs. Ground Truth`;
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '8px';
        titleDiv.style.textAlign = 'center';
        titleDiv.style.color = '#2c3e50';
        resultsContainer.appendChild(titleDiv);

        // Create minimalistic display
        klScores.forEach((score) => {
            const scoreRow = document.createElement('div');
            scoreRow.style.display = 'flex';
            scoreRow.style.justifyContent = 'space-between';
            scoreRow.style.alignItems = 'center';
            scoreRow.style.padding = '4px 0';
            scoreRow.style.fontFamily = 'monospace';
            scoreRow.style.fontSize = '13px';

            // Distribution name
            const nameDiv = document.createElement('span');
            nameDiv.textContent = score.distribution.color.charAt(0).toUpperCase() + score.distribution.color.slice(1);

            // KL divergence score
            const scoreDiv = document.createElement('span');
            scoreDiv.textContent = formatKLDivergence(score.klDivergence);

            scoreRow.appendChild(nameDiv);
            scoreRow.appendChild(scoreDiv);
            resultsContainer.appendChild(scoreRow);
        });



        resultsSection.appendChild(resultsContainer);
    }

    // Add event listener
    truthSelect.addEventListener('change', updateResults);

    // Append to container
    container.appendChild(mainContainer);

    // Initialize dropdowns
    populateDropdowns();

    // Return methods for external control
    return {
        updateDistributions: (newDistributions) => {
            options.distributions = newDistributions;
            populateDropdowns();
            updateResults();
        },
        redraw: () => {
            populateDropdowns();
            updateResults();
        }
    };
}
