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
    selectionControls.style.justifyContent = 'center';
    selectionControls.style.alignItems = 'center';
    selectionControls.style.gap = '20px';
    selectionControls.style.flexWrap = 'wrap';
    selectionControls.style.marginBottom = '15px';

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

    selectionControls.appendChild(pred1Container);
    selectionControls.appendChild(pred2Container);
    selectionControls.appendChild(truthContainer);

    // Create results section
    const resultsSection = document.createElement('div');
    resultsSection.style.marginTop = '20px';
    resultsSection.style.padding = '20px';
    resultsSection.style.backgroundColor = '#f8f9fa';
    resultsSection.style.borderRadius = '8px';
    resultsSection.style.border = '1px solid #e9ecef';
    resultsSection.style.minHeight = '200px';
    resultsSection.style.display = 'flex';
    resultsSection.style.alignItems = 'center';
    resultsSection.style.justifyContent = 'center';

    // Initial message
    const initialMessage = document.createElement('div');
    initialMessage.style.color = '#6c757d';
    initialMessage.style.fontSize = '16px';
    initialMessage.style.textAlign = 'center';

    controlsSection.appendChild(selectionControls);
    mainContainer.appendChild(controlsSection);
    mainContainer.appendChild(resultsSection);

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

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select --';
        defaultOption.disabled = true;
        defaultOption.selected = true;

        pred1Select.appendChild(defaultOption.cloneNode(true));
        pred2Select.appendChild(defaultOption.cloneNode(true));
        truthSelect.appendChild(defaultOption.cloneNode(true));

        // Add distribution options
        options.distributions.forEach((distribution, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `${distribution.color.charAt(0).toUpperCase() + distribution.color.slice(1)}`;
            
            pred1Select.appendChild(option.cloneNode(true));
            pred2Select.appendChild(option.cloneNode(true));
            truthSelect.appendChild(option.cloneNode(true));
        });
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
        const pred1Index = parseInt(pred1Select.value);
        const pred2Index = parseInt(pred2Select.value);
        const truthIndex = parseInt(truthSelect.value);

        // Clear results section
        resultsSection.innerHTML = '';

        // Check if all selections are made
        if (isNaN(pred1Index) || isNaN(pred2Index) || isNaN(truthIndex)) {
            const message = document.createElement('div');
            message.textContent = 'Please select two predictions and a ground truth distribution.';
            message.style.color = '#6c757d';
            message.style.fontSize = '16px';
            message.style.textAlign = 'center';
            resultsSection.appendChild(message);
            return;
        }

        // Check for duplicate selections
        if (pred1Index === pred2Index || pred1Index === truthIndex || pred2Index === truthIndex) {
            const message = document.createElement('div');
            message.textContent = 'Please select three different distributions.';
            message.style.color = '#dc3545';
            message.style.fontSize = '16px';
            message.style.textAlign = 'center';
            resultsSection.appendChild(message);
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

        // Create results display
        const resultsContainer = document.createElement('div');
        resultsContainer.style.width = '100%';
        resultsContainer.style.maxWidth = '600px';

        // Title
        const title = document.createElement('h3');
        title.textContent = 'Bayesian Comparison Results';
        title.style.color = '#2c3e50';
        title.style.marginBottom = '20px';
        title.style.textAlign = 'center';
        title.style.borderBottom = '2px solid #3498db';
        title.style.paddingBottom = '10px';
        resultsContainer.appendChild(title);

        // Results table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '20px';

        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#f8f9fa';
        headerRow.style.borderBottom = '2px solid #dee2e6';

        const headers = ['', 'Prediction 1', 'Prediction 2'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.padding = '12px 8px';
            th.style.textAlign = 'center';
            th.style.fontWeight = 'bold';
            th.style.color = '#495057';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');

        // Distribution row
        const distRow = document.createElement('tr');
        distRow.style.borderBottom = '1px solid #dee2e6';

        const distLabel = document.createElement('td');
        distLabel.textContent = 'Distribution';
        distLabel.style.padding = '12px 8px';
        distLabel.style.fontWeight = 'bold';
        distLabel.style.color = '#495057';
        distRow.appendChild(distLabel);

        const pred1Dist = document.createElement('td');
        pred1Dist.textContent = pred1.color.charAt(0).toUpperCase() + pred1.color.slice(1);
        pred1Dist.style.padding = '12px 8px';
        pred1Dist.style.textAlign = 'center';
        pred1Dist.style.color = colorSchemes[pred1.color];
        pred1Dist.style.fontWeight = 'bold';
        distRow.appendChild(pred1Dist);

        const pred2Dist = document.createElement('td');
        pred2Dist.textContent = pred2.color.charAt(0).toUpperCase() + pred2.color.slice(1);
        pred2Dist.style.padding = '12px 8px';
        pred2Dist.style.textAlign = 'center';
        pred2Dist.style.color = colorSchemes[pred2.color];
        pred2Dist.style.fontWeight = 'bold';
        distRow.appendChild(pred2Dist);

        tbody.appendChild(distRow);

        // Mass row
        const massRow = document.createElement('tr');
        massRow.style.borderBottom = '1px solid #dee2e6';

        const massLabel = document.createElement('td');
        massLabel.textContent = 'Total Mass';
        massLabel.style.padding = '12px 8px';
        massLabel.style.fontWeight = 'bold';
        massLabel.style.color = '#495057';
        massRow.appendChild(massLabel);

        const pred1Mass = document.createElement('td');
        pred1Mass.textContent = `${pred1.mass}%`;
        pred1Mass.style.padding = '12px 8px';
        pred1Mass.style.textAlign = 'center';
        massRow.appendChild(pred1Mass);

        const pred2Mass = document.createElement('td');
        pred2Mass.textContent = `${pred2.mass}%`;
        pred2Mass.style.padding = '12px 8px';
        pred2Mass.style.textAlign = 'center';
        massRow.appendChild(pred2Mass);

        tbody.appendChild(massRow);

        // Log Score row
        const scoreRow = document.createElement('tr');
        scoreRow.style.borderBottom = '1px solid #dee2e6';

        const scoreLabel = document.createElement('td');
        scoreLabel.textContent = 'Log Score';
        scoreLabel.style.padding = '12px 8px';
        scoreLabel.style.fontWeight = 'bold';
        scoreLabel.style.color = '#495057';
        scoreRow.appendChild(scoreLabel);

        const pred1Score = document.createElement('td');
        pred1Score.textContent = formatLogScore(comparison.prediction1.logScore);
        pred1Score.style.padding = '12px 8px';
        pred1Score.style.textAlign = 'center';
        pred1Score.style.fontFamily = 'monospace';
        scoreRow.appendChild(pred1Score);

        const pred2Score = document.createElement('td');
        pred2Score.textContent = formatLogScore(comparison.prediction2.logScore);
        pred2Score.style.padding = '12px 8px';
        pred2Score.style.textAlign = 'center';
        pred2Score.style.fontFamily = 'monospace';
        scoreRow.appendChild(pred2Score);

        tbody.appendChild(scoreRow);

        table.appendChild(tbody);
        resultsContainer.appendChild(table);

        // Winner section
        const winnerSection = document.createElement('div');
        winnerSection.style.textAlign = 'center';
        winnerSection.style.marginBottom = '20px';

        let winnerText, winnerColor;
        if (comparison.winning === 'prediction1') {
            winnerText = `Winner: ${pred1.color.charAt(0).toUpperCase() + pred1.color.slice(1)}`;
            winnerColor = colorSchemes[pred1.color];
        } else if (comparison.winning === 'prediction2') {
            winnerText = `Winner: ${pred2.color.charAt(0).toUpperCase() + pred2.color.slice(1)}`;
            winnerColor = colorSchemes[pred2.color];
        } else {
            winnerText = 'Tie';
            winnerColor = '#6c757d';
        }

        const winnerLabel = document.createElement('div');
        winnerLabel.textContent = winnerText;
        winnerLabel.style.fontSize = '18px';
        winnerLabel.style.fontWeight = 'bold';
        winnerLabel.style.color = winnerColor;
        winnerLabel.style.padding = '10px';
        winnerLabel.style.border = `2px solid ${winnerColor}`;
        winnerLabel.style.borderRadius = '6px';
        winnerLabel.style.display = 'inline-block';
        winnerSection.appendChild(winnerLabel);

        resultsContainer.appendChild(winnerSection);

        // Additional metrics
        if (comparison.gap !== null && comparison.factor !== null) {
            const metricsSection = document.createElement('div');
            metricsSection.style.display = 'flex';
            metricsSection.style.justifyContent = 'space-around';
            metricsSection.style.flexWrap = 'wrap';
            metricsSection.style.gap = '20px';

            // Gap metric
            const gapContainer = document.createElement('div');
            gapContainer.style.textAlign = 'center';
            
            const gapLabel = document.createElement('div');
            gapLabel.textContent = 'Score Gap';
            gapLabel.style.fontSize = '14px';
            gapLabel.style.color = '#6c757d';
            gapLabel.style.marginBottom = '5px';
            
            const gapValue = document.createElement('div');
            gapValue.textContent = formatLogScore(comparison.gap);
            gapValue.style.fontSize = '16px';
            gapValue.style.fontWeight = 'bold';
            gapValue.style.fontFamily = 'monospace';
            gapValue.style.color = '#495057';
            
            gapContainer.appendChild(gapLabel);
            gapContainer.appendChild(gapValue);
            metricsSection.appendChild(gapContainer);

            // Factor metric
            const factorContainer = document.createElement('div');
            factorContainer.style.textAlign = 'center';
            
            const factorLabel = document.createElement('div');
            factorLabel.textContent = 'Likelihood Factor';
            factorLabel.style.fontSize = '14px';
            factorLabel.style.color = '#6c757d';
            factorLabel.style.marginBottom = '5px';
            
            const factorValue = document.createElement('div');
            factorValue.textContent = formatFactor(comparison.factor);
            factorValue.style.fontSize = '16px';
            factorValue.style.fontWeight = 'bold';
            factorValue.style.fontFamily = 'monospace';
            factorValue.style.color = '#495057';
            
            factorContainer.appendChild(factorLabel);
            factorContainer.appendChild(factorValue);
            metricsSection.appendChild(factorContainer);

            resultsContainer.appendChild(metricsSection);
        }

        // Ground truth info
        const truthInfo = document.createElement('div');
        truthInfo.style.marginTop = '20px';
        truthInfo.style.padding = '15px';
        truthInfo.style.backgroundColor = '#e3f2fd';
        truthInfo.style.borderRadius = '6px';
        truthInfo.style.borderLeft = '4px solid #2196f3';
        
        const truthText = document.createElement('div');
        truthText.innerHTML = `<strong>Ground Truth:</strong> ${truth.color.charAt(0).toUpperCase() + truth.color.slice(1)} distribution (${truth.mass}% total mass)`;
        truthText.style.color = '#1565c0';
        truthInfo.appendChild(truthText);
        
        resultsContainer.appendChild(truthInfo);

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
