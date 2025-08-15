/**
 * AI 2027 - Bayesian Comparisons Widget
 * Allows users to select two distributions to compare against a ground truth distribution
 */

import { comparePredictions } from './bayesian.js';

/**
 * Creates a Bayesian comparison widget for evaluating predictions against ground truth
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {Array<Object>} options.distributions - Array of distribution objects with color, mass, and values
 */
export function createBayesianComparisonsWidget(containerId, options) {
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
    selectionTitle.textContent = 'Bayesian Comparison Calculator';
    selectionTitle.style.fontWeight = 'bold';
    selectionTitle.style.fontSize = '16px';
    selectionTitle.style.color = '#2c3e50';
    selectionTitle.style.marginBottom = '10px';
    selectionTitle.style.textAlign = 'center';
    
    // Create dropdowns container
    const dropdownsContainer = document.createElement('div');
    dropdownsContainer.style.display = 'flex';
    dropdownsContainer.style.justifyContent = 'center';
    dropdownsContainer.style.alignItems = 'center';
    dropdownsContainer.style.gap = '20px';
    dropdownsContainer.style.flexWrap = 'wrap';

    // Prediction 1 selection
    const pred1Container = document.createElement('div');
    pred1Container.style.display = 'flex';
    pred1Container.style.alignItems = 'center';
    pred1Container.style.gap = '8px';
    
    const pred1Label = document.createElement('label');
    pred1Label.textContent = 'Prediction 1:';
    pred1Label.style.fontWeight = 'bold';
    pred1Label.style.color = '#2c3e50';
    
    const pred1Select = document.createElement('select');
    pred1Select.style.padding = '4px 8px';
    pred1Select.style.border = '1px solid #ccc';
    pred1Select.style.borderRadius = '4px';
    pred1Select.style.fontSize = '14px';
    
    pred1Container.appendChild(pred1Label);
    pred1Container.appendChild(pred1Select);

    // Prediction 2 selection
    const pred2Container = document.createElement('div');
    pred2Container.style.display = 'flex';
    pred2Container.style.alignItems = 'center';
    pred2Container.style.gap = '8px';
    
    const pred2Label = document.createElement('label');
    pred2Label.textContent = 'Prediction 2:';
    pred2Label.style.fontWeight = 'bold';
    pred2Label.style.color = '#2c3e50';
    
    const pred2Select = document.createElement('select');
    pred2Select.style.padding = '4px 8px';
    pred2Select.style.border = '1px solid #ccc';
    pred2Select.style.borderRadius = '4px';
    pred2Select.style.fontSize = '14px';
    
    pred2Container.appendChild(pred2Label);
    pred2Container.appendChild(pred2Select);

    // Ground Truth selection
    const truthContainer = document.createElement('div');
    truthContainer.style.display = 'flex';
    truthContainer.style.alignItems = 'center';
    truthContainer.style.gap = '8px';
    
    const truthLabel = document.createElement('label');
    truthLabel.textContent = 'Ground Truth:';
    truthLabel.style.fontWeight = 'bold';
    truthLabel.style.color = '#2c3e50';
    
    const truthSelect = document.createElement('select');
    truthSelect.style.padding = '4px 8px';
    truthSelect.style.border = '1px solid #ccc';
    truthSelect.style.borderRadius = '4px';
    truthSelect.style.fontSize = '14px';
    
    truthContainer.appendChild(truthLabel);
    truthContainer.appendChild(truthSelect);

    dropdownsContainer.appendChild(pred1Container);
    dropdownsContainer.appendChild(pred2Container);
    dropdownsContainer.appendChild(truthContainer);
    
    selectionControls.appendChild(selectionTitle);
    selectionControls.appendChild(dropdownsContainer);

    // Create results section inside the selection controls box
    const resultsSection = document.createElement('div');
    resultsSection.style.marginTop = '15px';
    resultsSection.style.padding = '0px';
    resultsSection.style.backgroundColor = '#f8f9fa';
    resultsSection.style.borderRadius = '6px';
    resultsSection.style.border = '1px solid #e9ecef';
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
        pred1Select.innerHTML = '';
        pred2Select.innerHTML = '';
        truthSelect.innerHTML = '';

        // Add distribution options (no default disabled option)
        options.distributions.forEach((distribution, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `${distribution.color.charAt(0).toUpperCase() + distribution.color.slice(1)}`;
            
            pred1Select.appendChild(option.cloneNode(true));
            pred2Select.appendChild(option.cloneNode(true));
            truthSelect.appendChild(option.cloneNode(true));
        });

        // Set default selections to first distribution
        if (options.distributions.length > 0) {
            pred1Select.value = '0';
            pred2Select.value = '0';
            truthSelect.value = '0';
            
            // Trigger initial results calculation
            updateResults();
        }
    }

    /**
     * Format log score for display
     */
    function formatLogScore(score) {
        if (!Number.isFinite(score)) {
            return '∞';
        }
        return score.toFixed(4);
    }

    /**
     * Format factor for display
     */
    function formatFactor(factor) {
        if (!Number.isFinite(factor)) {
            return 'N/A';
        }
        if (factor < 1.01) {
            return factor.toFixed(4);
        }
        return factor.toFixed(2);
    }

    /**
     * Update comparison results
     */
    function updateResults() {
        const pred1Index = pred1Select.value ? parseInt(pred1Select.value) : -1;
        const pred2Index = pred2Select.value ? parseInt(pred2Select.value) : -1;
        const truthIndex = truthSelect.value ? parseInt(truthSelect.value) : -1;

        // Clear results section
        resultsSection.innerHTML = '';

        // Check if all selections are made
        if (pred1Index === -1 || pred2Index === -1 || truthIndex === -1) {
            resultsSection.style.display = 'none';
            return;
        }



        // Get selected distributions
        const pred1 = options.distributions[pred1Index];
        const pred2 = options.distributions[pred2Index];
        const truth = options.distributions[truthIndex];

        // Perform comparison
        const comparison = comparePredictions(
            pred1.values, pred1.mass,
            pred2.values, pred2.mass,
            truth.values, truth.mass
        );

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.style.padding = '15px';
        
        // Create minimalistic results display
        const resultsContainer = document.createElement('div');
        resultsContainer.style.fontSize = '14px';
        resultsContainer.style.lineHeight = '1.4';

        // Winner
        let winnerText;
        if (comparison.winning === 'prediction1') {
            winnerText = `Winner: ${pred1.color.charAt(0).toUpperCase() + pred1.color.slice(1)}`;
        } else if (comparison.winning === 'prediction2') {
            winnerText = `Winner: ${pred2.color.charAt(0).toUpperCase() + pred2.color.slice(1)}`;
        } else {
            winnerText = 'Tie';
        }

        const winnerDiv = document.createElement('div');
        winnerDiv.textContent = winnerText;
        winnerDiv.style.fontWeight = 'bold';
        winnerDiv.style.marginBottom = '8px';
        resultsContainer.appendChild(winnerDiv);

        // Scores
        const scoresDiv = document.createElement('div');
        scoresDiv.textContent = `${pred1.color.charAt(0).toUpperCase() + pred1.color.slice(1)}: ${formatLogScore(comparison.prediction1.logScore)} | ${pred2.color.charAt(0).toUpperCase() + pred2.color.slice(1)}: ${formatLogScore(comparison.prediction2.logScore)}`;
        scoresDiv.style.fontFamily = 'monospace';
        scoresDiv.style.marginBottom = '8px';
        resultsContainer.appendChild(scoresDiv);

        // Gap and factor if available
        if (comparison.gap !== null && comparison.factor !== null) {
            const metricsDiv = document.createElement('div');
            metricsDiv.textContent = `Gap: ${formatLogScore(comparison.gap)} | Factor: ${formatFactor(comparison.factor)}`;
            metricsDiv.style.fontFamily = 'monospace';
            metricsDiv.style.fontSize = '12px';
            metricsDiv.style.color = '#666';
            resultsContainer.appendChild(metricsDiv);
        }

        resultsSection.appendChild(resultsContainer);
    }

    // Add event listeners
    pred1Select.addEventListener('change', updateResults);
    pred2Select.addEventListener('change', updateResults);
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
