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
 * @param {boolean} [options.monthlyGranularity] - If true, use monthly ticks instead of yearly
 * @param {Array<number>} [options.initialDistribution] - Initial probability values (0-1) for each time period
 * @param {Function} [options.onChange] - Callback function called when distribution changes
 */
export function createDistributionWidget(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    canvas.className = 'widget-canvas';
    
    const ctx = canvas.getContext('2d');
    
    // Calculate number of time periods
    const numYears = options.endYear - options.startYear + 1;
    // For monthly granularity, use (numYears - 1) * 12 + 1 to have only one notch for the final year
    const numPeriods = options.monthlyGranularity ? (numYears - 1) * 12 + 1 : numYears;
    
    // Initialize distribution data
    let distribution = options.initialDistribution || 
        Array(numPeriods).fill(0.5); // Default to 50% for all periods
    
    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Grid and styling constants
    const padding = 40;
    const plotWidth = options.width - 2 * padding;
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
        ctx.fillRect(0, 0, options.width, options.height);
        
        // Draw grid
        drawGrid();
        
        // Draw axis labels
        drawAxisLabels();
        
        // Draw distribution curve
        drawDistributionCurve();
        
        // Draw data points
        drawDataPoints();
    }
    
    /**
     * Draw the background grid
     */
    function drawGrid() {
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        
        // Vertical lines (periods)
        for (let i = 0; i < numPeriods; i++) {
            const x = padding + i * periodStep;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, options.height - padding);
            ctx.stroke();
        }
        
        // Horizontal lines (probability levels)
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(options.width - padding, y);
            ctx.stroke();
        }
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
            if (options.monthlyGranularity) {
                if (i === numYears - 1) {
                    // Final year label goes at the very end
                    x = padding + (numPeriods - 1) * periodStep;
                } else {
                    // Other years go at the start of each year (every 12 months)
                    x = padding + i * 12 * periodStep;
                }
            } else {
                x = padding + i * periodStep;
            }
            const year = options.startYear + i;
            ctx.fillText(year.toString(), x, options.height - padding / 2);
        }
        
        // Y-axis labels (probabilities)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * plotHeight;
            const probability = (10 - i) / 10;
            ctx.fillText(`${(probability * 100).toFixed(0)}%`, padding - 5, y);
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
        ctx.lineTo(options.width - padding, options.height - padding);
        ctx.closePath();
        ctx.fill();
        
        // Draw the curve line on top
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
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
     * Draw data points
     */
    function drawDataPoints() {
        ctx.fillStyle = '#007bff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Only draw data points for years (not every month) to avoid clutter
        for (let i = 0; i < numYears; i++) {
            let periodIndex;
            if (options.monthlyGranularity) {
                if (i === numYears - 1) {
                    // Final year data point goes at the very end
                    periodIndex = numPeriods - 1;
                } else {
                    // Other years go at the start of each year (every 12 months)
                    periodIndex = i * 12;
                }
            } else {
                periodIndex = i;
            }
            const coords = dataToCanvas(periodIndex, distribution[periodIndex]);
            const radius = 4;
            
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
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
