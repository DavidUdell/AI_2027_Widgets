/**
 * AI 2027 - Interactive Distribution Drawing Widget
 * Allows users to draw sub-probability distributions over years/quarters
 */ 

/**
 * Creates an interactive canvas widget for drawing sub-probability distributions over years/quarters
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {Array<number>} [options.initialDistribution] - Initial probability values [0,1] for each time period
 * @param {Function} [options.onChange] - Callback function called when distribution changes
 * @param {number} [options.totalMass] - Total mass to display (as percentage, default calculated from distribution)
 * @param {string} [options.color] - Color theme for the widget ('blue', 'green', or 'red')
 * @param {boolean} [options.interactive] - Whether the widget is interactive (default: true)
 */

export function createDistributionWidget(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    const canvas = document.createElement('canvas');
    // Calculate responsive width if not provided
    let widgetWidth = options.width;
    if (!widgetWidth) {
        const containerRect = container.getBoundingClientRect();
        widgetWidth = containerRect.width - 20; // Account for padding
    }

    canvas.width = widgetWidth;
    canvas.height = options.height;

    // Set canvas class based on interactivity
    if (options.interactive !== false) {
        canvas.className = 'widget-canvas';
    } else {
        canvas.className = 'reference-widget-canvas';
    }

    const ctx = canvas.getContext('2d');

    const numYears = options.endYear - options.startYear + 1;
    // Use (numYears - 1) * 4 + 1 to have only one quarter for the final year
    const numPeriods = (numYears - 1) * 4 + 1

    // Initialize distribution data
    let distribution = options.initialDistribution || 
        Array(numPeriods).fill(0.5); // Default to 50% for all periods

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Grid and styling constants
    const padding = 80;
    const plotWidth = widgetWidth - 2 * padding;
    const plotHeight = options.height - 2 * padding;
    const periodStep = plotWidth / (numPeriods - 1);

    let colorScheme;
    if (options.color === 'green') {
        colorScheme = {
            primary: '#28a745',
            gradientStart: 'rgba(40, 167, 69, 0.3)',
            gradientEnd: 'rgba(40, 167, 69, 0.1)',
            stroke: '#28a745'
        };
    } else if (options.color === 'red') {
        colorScheme = {
            primary: '#dc3545',
            gradientStart: 'rgba(220, 53, 69, 0.3)',
            gradientEnd: 'rgba(220, 53, 69, 0.1)',
            stroke: '#dc3545'
        };
    } else {
        // Default blue
        colorScheme = {
            primary: '#007bff',
            gradientStart: 'rgba(0, 123, 255, 0.3)',
            gradientEnd: 'rgba(0, 123, 255, 0.1)',
            stroke: '#007bff'
        };
    }

    /**
     * Convert canvas coordinates to period index and probability
     */
    function canvasToData(x, y) {
        const periodIndex = Math.round((x - padding) / periodStep);
        const clampedPeriodIndex = Math.max(0, Math.min(numPeriods - 1, periodIndex));

        const probability = 1 - ((y - padding) / plotHeight);
        const clampedProbability = Math.max(0, Math.min(1, probability));

        return { periodIndex: clampedPeriodIndex, probability: clampedProbability };
    }

    /**
     * Convert period index and probability to canvas coordinates
     */
    function dataToCanvas(periodIndex, probability) {
        const x = padding + periodIndex * periodStep;
        const y = padding + (1 - probability) * plotHeight;
        return { x, y };
    }

    /**
     * Draw the complete widget
     */
    function drawWidget() {
        // Clear canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, widgetWidth, options.height);

        drawGrid();
        drawAxisLabels();
        drawDistributionCurve();
    }

    /**
     * Draw static and dynamic gridlines
     */
    function drawGrid() {
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(padding, padding, plotWidth, plotHeight);
        ctx.stroke();

        // Draw horizontal gridline at the maximum distribution value
        const maxDistributionValue = Math.max(...distribution);
        if (maxDistributionValue > 0) {
            const maxY = dataToCanvas(0, maxDistributionValue).y;

            // Draw the gridline
            ctx.strokeStyle = '#6c757d';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.beginPath();
            ctx.moveTo(padding, maxY);
            ctx.lineTo(widgetWidth - padding, maxY);
            ctx.stroke();
            ctx.setLineDash([]); // Reset to solid lines

            // Calculate and display the normalized value at this height
            const totalMass = options.totalMass !== undefined ? options.totalMass : 
                distribution.reduce((sum, prob) => sum + prob, 0) * 100;
            const distributionSum = distribution.reduce((sum, prob) => sum + prob, 0);
            const normalizationFactor = distributionSum > 0 ? totalMass / (distributionSum * 100) : 0;
            const maxNormalizedValue = maxDistributionValue * normalizationFactor * 100;

            // Format the percentage value
            const formatPercentage = (value) => {
                if (value < 1) {
                    return value.toFixed(2) + '%';
                } else {
                    return Math.round(value) + '%';
                }
            };

            // Draw the percentage label on the y-axis (left side)
            ctx.fillStyle = '#495057';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(formatPercentage(maxNormalizedValue), padding - 10, maxY);

            // Find the quarter with maximum probability and draw vertical guideline
            const maxIndex = distribution.indexOf(maxDistributionValue);
            if (maxIndex !== -1) {
                const maxX = dataToCanvas(maxIndex, 0).x;

                // Draw vertical guideline
                ctx.strokeStyle = '#6c757d';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]); // Dashed line - same as horizontal
                ctx.beginPath();
                ctx.moveTo(maxX, padding);
                ctx.lineTo(maxX, options.height - padding);
                ctx.stroke();
                ctx.setLineDash([]); // Reset to solid lines

                // Get quarter name
                let quarterName;
                const year = options.startYear + Math.floor(maxIndex / 4);
                const quarter = (maxIndex % 4) + 1;
                quarterName = `Q${quarter} ${year}`;

                // Draw top quarter name on top
                ctx.fillStyle = '#495057';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(quarterName, maxX, padding - 10);
            }
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
            ctx.fillText(year.toString(), x, options.height - padding / 2 - 18);
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
     * Draw the distribution curve
     */
    function drawDistributionCurve() {
        // Create gradient for the fill using the color scheme
        const gradient = ctx.createLinearGradient(padding, padding, padding, options.height - padding);
        gradient.addColorStop(0, colorScheme.gradientStart);
        gradient.addColorStop(1, colorScheme.gradientEnd);

        // Draw the filled area under the curve
        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Start at the bottom-left corner
        ctx.moveTo(padding, options.height - padding);

        // Draw the curve
        for (let i = 0; i < numPeriods; i++) {
            const coords = dataToCanvas(i, distribution[i]);
            ctx.lineTo(coords.x, coords.y);
        }

        // Close the path by going to bottom-right corner and back to start
        ctx.lineTo(widgetWidth - padding, options.height - padding);
        ctx.closePath();
        ctx.fill();

        // Use provided total mass or calculate from distribution
        const totalPercentage = options.totalMass !== undefined ? 
            Math.round(options.totalMass) : 
            Math.round(distribution.reduce((sum, prob) => sum + prob, 0) * 100);

        // Determine if the center point is under the shaded region
        const centerX = widgetWidth / 2;
        const centerY = options.height / 2;
        const centerPeriodIndex = (centerX - padding) / periodStep;
        const clampedPeriodIndex = Math.max(0, Math.min(numPeriods - 1, Math.round(centerPeriodIndex)));
        const centerProbability = distribution[clampedPeriodIndex];
        const centerYInData = (1 - (centerY - padding) / plotHeight);

        // Choose color based on whether text is over shaded region
        let textColor;
        if (centerYInData < centerProbability) {
            // Text is over the shaded region - use faint white
            textColor = 'rgba(255, 255, 255, 0.66)';
        } else {
            // Text is over white background or exactly at boundary - use faint dark
            textColor = 'rgba(0, 0, 0, 0.2)';
        }

        // Draw total probability text with appropriate color
        ctx.fillStyle = textColor;
        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(totalPercentage.toString() + '%', centerX, centerY);

        // Draw the curve line on top using the color scheme
        ctx.strokeStyle = colorScheme.stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < numPeriods; i++) {
            const coords = dataToCanvas(i, distribution[i]);
            if (i === 0) {
                ctx.moveTo(coords.x, coords.y);
            } else {
                ctx.lineTo(coords.x, coords.y);
            }
        }
        ctx.stroke();
    }



    /**
     * Handle mouse/touch events for drawing
     */
    function handlePointerDown(e) {
        if (options.interactive === false) return;

        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        lastX = x;
        lastY = y;

        const { periodIndex, probability } = canvasToData(x, y);
        distribution[periodIndex] = probability;
        drawWidget();

        if (options.onChange) {
            options.onChange(distribution);
        }
    }

    function handlePointerMove(e) {
        if (!isDrawing || options.interactive === false) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Interpolate between last point and current point
        const dx = x - lastX;
        const dy = y - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 2) { // Only update if moved enough
            const steps = Math.ceil(distance / 2);
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const interpX = lastX + dx * t;
                const interpY = lastY + dy * t;

                const { periodIndex, probability } = canvasToData(interpX, interpY);
                distribution[periodIndex] = probability;
            }

            lastX = x;
            lastY = y;
            drawWidget();

            if (options.onChange) {
                options.onChange(distribution);
            }
        }
    }

    function handlePointerUp() {
        isDrawing = false;
    }

    // Add event listeners only if interactive
    if (options.interactive !== false) {
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);

        // Prevent context menu
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    // Append canvas to container
    container.appendChild(canvas);

    // Initial draw
    drawWidget();

    // Return methods for external control
    return {
        getDistribution: () => [...distribution],
        getTotalMass: () => options.totalMass,
        setDistribution: (newDistribution) => {
            distribution = [...newDistribution];
            drawWidget();
            if (options.onChange) {
                options.onChange(distribution);
            }
        },
        setTotalMass: (totalMass) => {
            options.totalMass = totalMass;
            drawWidget();
            if (options.onChange) {
                options.onChange(distribution);
            }
        },
        reset: () => {
            distribution = Array(numPeriods).fill(0.5);
            drawWidget();
            if (options.onChange) {
                options.onChange(distribution);
            }
        },
        setOnChange: (callback) => {
            options.onChange = callback;
        }
    };
}

// Legacy function for backward compatibility
export function createWidget(containerId, options) {
    console.warn('createWidget is deprecated. Use createDistributionWidget instead.');
    return createDistributionWidget(containerId, options);
}

// Export Bayesian analysis functions
export * from './bayesian.js';

// Export multi-distribution widget
export { createMultiDistributionWidget } from './multi-distribution-widget.js';

// Export comparisons widget
export { createComparisonsWidget } from './comparisons.js';
