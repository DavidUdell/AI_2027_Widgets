/**
 * AI 2027 - Distribution Comparisons Module
 * Displays all distributions together in a non-interactive format for comparison
 */

/**
 * Creates a comparison view that displays all distributions together
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {Array<Object>} options.distributions - Array of distribution objects with color, mass, and values
 */
export function createComparisonsWidget(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    // Create a wrapper div to hold both canvas and legend inputs
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.height = options.height + 'px';

    const canvas = document.createElement('canvas');
    // Calculate responsive width if not provided
    let widgetWidth = options.width;
    if (!widgetWidth) {
        const containerRect = container.getBoundingClientRect();
        widgetWidth = containerRect.width - 20; // Account for padding
    }

    canvas.width = widgetWidth;
    canvas.height = options.height;
    canvas.className = 'comparisons-widget-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    const ctx = canvas.getContext('2d');

    const numYears = options.endYear - options.startYear + 1;
    const numPeriods = (numYears - 1) * 4 + 1;

    // Grid and styling constants
    const padding = 80;
    const plotWidth = widgetWidth - 2 * padding;
    const plotHeight = options.height - 2 * padding;
    const periodStep = plotWidth / (numPeriods - 1);

    // Track visibility state for each distribution
    const visibilityState = {};
    


    // Color schemes for different distributions
    const colorSchemes = {
        blue: {
            primary: '#007bff',
            gradientStart: 'rgba(0, 123, 255, 0.3)',
            gradientEnd: 'rgba(0, 123, 255, 0.1)',
            stroke: '#007bff'
        },
        green: {
            primary: '#28a745',
            gradientStart: 'rgba(40, 167, 69, 0.3)',
            gradientEnd: 'rgba(40, 167, 69, 0.1)',
            stroke: '#28a745'
        },
        red: {
            primary: '#dc3545',
            gradientStart: 'rgba(220, 53, 69, 0.3)',
            gradientEnd: 'rgba(220, 53, 69, 0.1)',
            stroke: '#dc3545'
        },
        purple: {
            primary: '#6f42c1',
            gradientStart: 'rgba(111, 66, 193, 0.3)',
            gradientEnd: 'rgba(111, 66, 193, 0.1)',
            stroke: '#6f42c1'
        },
        orange: {
            primary: '#fd7e14',
            gradientStart: 'rgba(253, 126, 20, 0.3)',
            gradientEnd: 'rgba(253, 126, 20, 0.1)',
            stroke: '#fd7e14'
        },
        yellow: {
            primary: '#ffc107',
            gradientStart: 'rgba(255, 193, 7, 0.3)',
            gradientEnd: 'rgba(255, 193, 7, 0.1)',
            stroke: '#ffc107'
        }
    };

    /**
     * Convert period index and probability to canvas coordinates
     */
    function dataToCanvas(periodIndex, probability) {
        const x = padding + periodIndex * periodStep;
        const y = padding + (1 - probability) * plotHeight;
        return { x, y };
    }

    /**
     * Initialize visibility state for distributions
     */
    function initializeVisibilityState() {
        if (!options.distributions) return;
        
        options.distributions.forEach((distribution, index) => {
            // Default all distributions to hidden
            visibilityState[index] = false;
        });
    }



    /**
     * Calculate the normalized peak value for a distribution
     */
    function calculateNormalizedPeak(distribution) {
        const totalMass = distribution.mass;
        const distributionSum = distribution.values.reduce((sum, prob) => sum + prob, 0);
        const normalizationFactor = distributionSum > 0 ? totalMass / (distributionSum * 100) : 0;
        const originalMaxValue = Math.max(...distribution.values);
        return originalMaxValue * normalizationFactor * 100;
    }

    /**
     * Calculate scaling factors for distributions based on their peak values
     */
    function calculateScalingFactors() {
        if (!options.distributions || options.distributions.length === 0) {
            return {};
        }

        // Calculate normalized peak values for all visible distributions
        const peakValues = {};
        let maxPeakValue = 0;
        let refIndex = -1;

        options.distributions.forEach((distribution, index) => {
            if (visibilityState[index]) {
                const peakValue = calculateNormalizedPeak(distribution);
                peakValues[index] = peakValue;
                if (peakValue > maxPeakValue) {
                    maxPeakValue = peakValue;
                    refIndex = index;
                }
            }
        });

        // If no visible distributions or max peak is 0, return no scaling
        if (maxPeakValue === 0 || refIndex === -1) {
            return {};
        }

        // Calculate scaling factors for each distribution based on peak values
        const refSum = options.distributions[refIndex].values.reduce((sum, prob) => sum + prob, 0);
        const refMass = options.distributions[refIndex].mass;
        const refRatio = refSum > 0 && refMass > 0 ? (refMass / refSum) : 0;
        const scalingFactors = {};

        options.distributions.forEach((distribution, index) => {
            if (visibilityState[index]) {
                const sum = distribution.values.reduce((sum, prob) => sum + prob, 0);
                const mass = distribution.mass;
                scalingFactors[index] = (sum > 0 && mass > 0 && refRatio > 0) ? (mass / sum) / refRatio : 0;
            }
        });

        // Apply additional scaling to ensure the highest peak fits within the plot area
        // The plot area has a height of plotHeight, and we want to use all available space
        const maxAllowedPeak = 1.0; // Allow peaks up to 100% of the plot height
        const maxScaledPeak = Math.max(...Object.entries(scalingFactors).map(([index, factor]) => {
            if (!visibilityState[parseInt(index)]) return 0;
            const distribution = options.distributions[parseInt(index)];
            const maxValue = Math.max(...distribution.values);
            return maxValue * factor;
        }));

        if (maxScaledPeak > maxAllowedPeak) {
            // Scale down if the highest peak exceeds the plot area
            const scaleDownFactor = maxAllowedPeak / maxScaledPeak;
            Object.keys(scalingFactors).forEach(index => {
                scalingFactors[index] *= scaleDownFactor;
            });
        } else if (maxScaledPeak > 0 && maxScaledPeak < maxAllowedPeak) {
            // Scale up if the highest peak is below the plot area top
            // Scale to exactly reach the top of the plot area (100%)
            const targetPeak = 1.0;
            const scaleUpFactor = targetPeak / maxScaledPeak;
            Object.keys(scalingFactors).forEach(index => {
                scalingFactors[index] *= scaleUpFactor;
            });
        }

        return scalingFactors;
    }

    /**
     * Draw the complete comparison widget
     */
    function drawWidget() {
        // Clear canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, widgetWidth, options.height);

        drawGrid();
        drawAxisLabels();
        drawAllDistributions();
        drawLegend();
    }

    /**
     * Draw static gridlines
     */
    function drawGrid() {
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(padding, padding, plotWidth, plotHeight);
        ctx.stroke();

        // Draw guidelines for all visible distributions
        if (options.distributions && options.distributions.length > 0) {
            // Calculate scaling factors
            const scalingFactors = calculateScalingFactors();
            
            // Collect all guideline positions to avoid label overlap
            const guidelinePositions = [];
            
            // First pass: collect all positions
            options.distributions.forEach((distribution, index) => {
                if (!visibilityState[index]) return;
                
                // Skip zero mass distributions
                if (distribution.mass === 0) return;

                const scaleFactor = scalingFactors[index] || 1;
                const maxScaledValue = Math.max(...distribution.values) * scaleFactor;
                
                if (maxScaledValue > 0) {
                    const maxY = dataToCanvas(0, maxScaledValue).y;
                    const normalizedPeak = calculateNormalizedPeak(distribution);
                    
                    guidelinePositions.push({
                        y: maxY,
                        peak: normalizedPeak,
                        distribution: distribution,
                        index: index
                    });
                }
            });
            
            // Sort by peak value (highest to lowest) to identify the three largest peaks
            guidelinePositions.sort((a, b) => b.peak - a.peak);
            
            // Second pass: draw guidelines only for the top two peaks
            guidelinePositions.forEach((guideline, i) => {
                // Only draw guidelines and labels for the two largest peaks
                if (i < 2) {
                    const maxY = guideline.y;
                    
                    // Get the color scheme for this distribution
                    const colorScheme = colorSchemes[guideline.distribution.color];
                    const guidelineColor = colorScheme ? colorScheme.stroke : '#6c757d';
                    
                    // Draw the gridline in the distribution's color
                    ctx.strokeStyle = guidelineColor;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]); // Dashed line
                    ctx.beginPath();
                    ctx.moveTo(padding, maxY);
                    ctx.lineTo(widgetWidth - padding, maxY);
                    ctx.stroke();
                    ctx.setLineDash([]); // Reset to solid lines

                    // Format the percentage value
                    const formatPercentage = (value) => {
                        if (value < 10) {
                            return value.toFixed(2) + '%';
                        } else {
                            return Math.round(value) + '%';
                        }
                    };

                    // Position labels: first on left, second on right
                    let labelX;
                    if (i === 0) {
                        labelX = padding - 10; // First label on the left
                    } else {
                        labelX = widgetWidth - padding + 10; // Second label on the right
                    }

                    // Draw the percentage label in the distribution's color
                    ctx.fillStyle = guidelineColor;
                    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = labelX < widgetWidth / 2 ? 'right' : 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(formatPercentage(guideline.peak), labelX, maxY);
                }
            });
        }

        // Draw the hardcoded 0% label at the bottom left
        ctx.fillStyle = '#495057';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('0%', padding - 10, options.height - padding);
    }

    /**
     * Draw axis labels
     */
    function drawAxisLabels() {
        ctx.fillStyle = '#495057';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // X-axis labels (years)
        for (let i = 0; i < numYears; i++) {
            let x;
            if (i === numYears - 1) {
                // Final year label goes at the very end
                x = padding + (numPeriods - 1) * periodStep;
            } else {
                // Other years go at the start of each year (every 4 quarters)
                x = padding + i * 4 * periodStep;
            }
            const year = options.startYear + i;
            
            if (i === numYears - 1) {
                // Multi-line label for the rightmost bin
                const lines = [">2039", "or never"];
                const lineHeight = 14;
                const baseY = options.height - padding / 2 - 18; // Align with other labels
                
                lines.forEach((line, lineIndex) => {
                    ctx.fillText(line, x, baseY + lineIndex * lineHeight);
                });
            } else {
                // Single line for other years
                ctx.fillText(year.toString(), x, options.height - padding / 2 - 18);
            }
        }

        // X-axis title
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Quarters Until 2040', widgetWidth / 2, options.height - padding / 2 + 7);

        // Y-axis title
        ctx.save();
        ctx.translate(padding / 2 - 14, options.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Probability AGI First Built In', 0, 0);
        ctx.restore();
    }



    /**
     * Draw all distributions with fill areas and curves
     */
    function drawAllDistributions() {
        if (!options.distributions || options.distributions.length === 0) {
            // Show a message if no distributions
            const centerX = widgetWidth / 2;
            const centerY = options.height / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No distributions to compare', centerX, centerY);
            return;
        }

        // Calculate scaling factors for all visible distributions
        const scalingFactors = calculateScalingFactors();

        // Draw each distribution with fill and curve (only if visible)
        options.distributions.forEach((distribution, index) => {
            // Skip if distribution is hidden
            if (!visibilityState[index]) return;

            const colorScheme = colorSchemes[distribution.color];
            if (!colorScheme) return;

            // Handle zero mass case - flatten distribution to 0%
            if (distribution.mass === 0) {
                // Don't draw anything for zero mass distributions
                return;
            }

            // Get scaling factor for this distribution
            const scaleFactor = scalingFactors[index] || 1;

            // Create gradient for the fill
            const gradient = ctx.createLinearGradient(padding, padding, padding, options.height - padding);
            gradient.addColorStop(0, colorScheme.gradientStart);
            gradient.addColorStop(1, colorScheme.gradientEnd);

            // Draw the filled area under the curve
            ctx.fillStyle = gradient;
            ctx.beginPath();

            // Start at the bottom-left corner
            ctx.moveTo(padding, options.height - padding);

            // Draw the curve with scaling applied
            for (let i = 0; i < numPeriods; i++) {
                // Apply scaling factor to the probability value
                const scaledProbability = distribution.values[i] * scaleFactor;
                const coords = dataToCanvas(i, scaledProbability);
                ctx.lineTo(coords.x, coords.y);
            }

            // Close the path by going to bottom-right corner and back to start
            ctx.lineTo(widgetWidth - padding, options.height - padding);
            ctx.closePath();
            ctx.fill();

            // Draw the curve line on top with thinner style
            ctx.strokeStyle = colorScheme.stroke;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            for (let i = 0; i < numPeriods; i++) {
                // Apply scaling factor to the probability value
                const scaledProbability = distribution.values[i] * scaleFactor;
                const coords = dataToCanvas(i, scaledProbability);
                if (i === 0) {
                    ctx.moveTo(coords.x, coords.y);
                } else {
                    ctx.lineTo(coords.x, coords.y);
                }
            }
            ctx.stroke();
        });
    }

    /**
     * Draw legend showing all distributions with their masses and checkboxes
     */
    function drawLegend() {
        if (!options.distributions || options.distributions.length === 0) return;

        const legendStartY = 14;
        const legendItemHeight = 25;
        const legendItemSpacing = 5;
        const colorBoxSize = 15;
        const checkboxSize = 12;
        const textMargin = 10;
        const itemsPerRow = 3;
        const rowSpacing = 10;

        // Calculate legend dimensions
        const maxTextWidth = Math.max(...options.distributions.map(dist => {
            const text = `${dist.color.charAt(0).toUpperCase() + dist.color.slice(1)}: `;
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            return ctx.measureText(text).width;
        }));

        const itemWidth = maxTextWidth + colorBoxSize + checkboxSize + textMargin * 2;
        const totalLegendWidth = itemWidth * itemsPerRow + (itemsPerRow - 1) * 40; // 40px spacing between columns
        const legendX = (widgetWidth - totalLegendWidth) / 2;

        options.distributions.forEach((distribution, index) => {
            const colorScheme = colorSchemes[distribution.color];
            if (!colorScheme) return;

            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = legendX + col * (itemWidth + 40); // 40px spacing between columns
            const y = legendStartY + row * (legendItemHeight + rowSpacing);

            // Draw checkbox
            const checkboxX = x;
            const checkboxY = y + 2;
            
            // Checkbox border
            ctx.strokeStyle = '#495057';
            ctx.lineWidth = 1;
            ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
            
            // Checkbox fill if checked
            if (visibilityState[index]) {
                ctx.fillStyle = '#495057';
                ctx.fillRect(checkboxX + 2, checkboxY + 2, checkboxSize - 4, checkboxSize - 4);
            }

            // Draw color box
            ctx.fillStyle = colorScheme.stroke;
            ctx.fillRect(x + checkboxSize + textMargin, y + 2, colorBoxSize, colorBoxSize);

            // Draw text
            ctx.fillStyle = '#495057';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // Draw color name
            const colorName = `${distribution.color.charAt(0).toUpperCase() + distribution.color.slice(1)}`;
            ctx.fillText(colorName, x + checkboxSize + textMargin + colorBoxSize + textMargin, y + colorBoxSize / 2 + 2);
        });
    }

    /**
     * Handle click events on the canvas
     */
    function handleCanvasClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if click is in legend area
        if (y < 80) { // Legend area is roughly in the top 80px
            const legendStartY = 14;
            const legendItemHeight = 25;
            const checkboxSize = 12;
            const textMargin = 10;
            const itemsPerRow = 3;
            const rowSpacing = 10;

            // Calculate legend dimensions (same as in drawLegend)
            const maxTextWidth = Math.max(...options.distributions.map(dist => {
                const text = `${dist.color.charAt(0).toUpperCase() + dist.color.slice(1)}`;
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                return ctx.measureText(text).width;
            }));

            const itemWidth = maxTextWidth + 15 + checkboxSize + textMargin * 2;
            const totalLegendWidth = itemWidth * itemsPerRow + (itemsPerRow - 1) * 40;
            const legendX = (widgetWidth - totalLegendWidth) / 2;

            // Check each checkbox area
            options.distributions.forEach((distribution, index) => {
                const row = Math.floor(index / itemsPerRow);
                const col = index % itemsPerRow;
                const itemX = legendX + col * (itemWidth + 40);
                const itemY = legendStartY + row * (legendItemHeight + rowSpacing);

                const checkboxX = itemX;
                const checkboxY = itemY + 2;

                // Check if click is within checkbox bounds
                if (x >= checkboxX && x <= checkboxX + checkboxSize &&
                    y >= checkboxY && y <= checkboxY + checkboxSize) {
                    // Toggle visibility
                    visibilityState[index] = !visibilityState[index];
                    drawWidget();
                }
            });
        }
    }

    // Add click event listener to canvas
    canvas.addEventListener('click', handleCanvasClick);

    // Append canvas to wrapper
    wrapper.appendChild(canvas);

    // Append wrapper to container
    container.appendChild(wrapper);

    // Initialize visibility state
    initializeVisibilityState();
    drawWidget();

    // Return methods for external control
    return {
        updateDistributions: (newDistributions) => {
            options.distributions = newDistributions;
            // Preserve existing visibility state instead of resetting
            // Only initialize new distributions that don't have visibility state yet
            if (newDistributions) {
                newDistributions.forEach((distribution, index) => {
                    if (!visibilityState.hasOwnProperty(index)) {
                        visibilityState[index] = false; // Default new distributions to hidden
                    }
                });
            }

            drawWidget();
        },
        redraw: () => {
            drawWidget();
        },
        setDistributionVisibility: (index, visible) => {
            if (visibilityState.hasOwnProperty(index)) {
                visibilityState[index] = visible;
                drawWidget();
            }
        },
        getDistributionVisibility: (index) => {
            return visibilityState[index] || false;
        }
    };
}
