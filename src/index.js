/**
 * AI 2027 Widgets - Interactive Distribution Drawing Widget
 * Allows users to draw arbitrary probability distributions over years
 */

/**
 * Creates an interactive canvas widget for drawing probability distributions over years
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {boolean} [options.quarterlyGranularity] - If true, use quarterly ticks instead of yearly
 * @param {Array<number>} [options.initialDistribution] - Initial probability values (0-1) for each time period
 * @param {Function} [options.onChange] - Callback function called when distribution changes
 * @param {number} [options.totalMass] - Total mass to display (as percentage, default calculated from distribution)
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
        widgetWidth = containerRect.width - 40; // Account for padding
    }

    canvas.width = widgetWidth;
    canvas.height = options.height;
    canvas.className = 'widget-canvas';

    const ctx = canvas.getContext('2d');

    // Calculate number of time periods
    const numYears = options.endYear - options.startYear + 1;
    // For quarterly granularity, use (numYears - 1) * 4 + 1 to have only one notch for the final year
    const numPeriods = options.quarterlyGranularity ? (numYears - 1) * 4 + 1 : numYears;

    // Initialize distribution data
    let distribution = options.initialDistribution || 
        Array(numPeriods).fill(0.5); // Default to 50% for all periods

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Grid and styling constants
    const padding = 40;
    const plotWidth = widgetWidth - 2 * padding;
    const plotHeight = options.height - 2 * padding;
    const periodStep = plotWidth / (numPeriods - 1);

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

        // Draw grid
        drawGrid();

        // Draw axis labels
        drawAxisLabels();

        // Draw distribution curve
        drawDistributionCurve();
    }

    /**
     * Draw the background grid
     */
    function drawGrid() {
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;

        // Draw border around the interactable region
        ctx.beginPath();
        ctx.rect(padding, padding, plotWidth, plotHeight);
        ctx.stroke();
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
            if (options.quarterlyGranularity) {
                if (i === numYears - 1) {
                    // Final year label goes at the very end
                    x = padding + (numPeriods - 1) * periodStep;
                } else {
                    // Other years go at the start of each year (every 4 quarters)
                    x = padding + i * 4 * periodStep;
                }
            } else {
                x = padding + i * periodStep;
            }
            const year = options.startYear + i;
            ctx.fillText(year.toString(), x, options.height - padding / 2);
        }
    }

    /**
     * Draw the distribution curve
     */
    function drawDistributionCurve() {
        // Create gradient for the fill
        const gradient = ctx.createLinearGradient(padding, padding, padding, options.height - padding);
        gradient.addColorStop(0, 'rgba(0, 123, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 123, 255, 0.1)');

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

        // Draw the curve line on top
        ctx.strokeStyle = '#007bff';
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
        if (!isDrawing) return;

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

    // Add event listeners
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    // Prevent context menu
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Append canvas to container
    container.appendChild(canvas);

    // Initial draw
    drawWidget();

    // Return methods for external control
    return {
        getDistribution: () => [...distribution],
        setDistribution: (newDistribution) => {
            distribution = [...newDistribution];
            drawWidget();
        },
        setTotalMass: (totalMass) => {
            options.totalMass = totalMass;
            drawWidget();
        },
        reset: () => {
            distribution = Array(numPeriods).fill(0.5);
            drawWidget();
        }
    };
}

// Legacy function for backward compatibility
export function createWidget(containerId, options) {
    console.warn('createWidget is deprecated. Use createDistributionWidget instead.');
    return createDistributionWidget(containerId, options);
}
