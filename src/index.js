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
 * @param {Array<number>} [options.initialDistribution] - Initial probability values (0-1) for each year
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
    
    // Calculate number of years
    const numYears = options.endYear - options.startYear + 1;
    
    // Initialize distribution data
    let distribution = options.initialDistribution || 
        Array(numYears).fill(0.5); // Default to 50% for all years
    
    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Grid and styling constants
    const padding = 40;
    const plotWidth = options.width - 2 * padding;
    const plotHeight = options.height - 2 * padding;
    const yearStep = plotWidth / (numYears - 1);
    
    /**
     * Convert canvas coordinates to year and probability
     */
    function canvasToData(x, y) {
        const yearIndex = Math.round((x - padding) / yearStep);
        const clampedYearIndex = Math.max(0, Math.min(numYears - 1, yearIndex));
        
        const probability = 1 - ((y - padding) / plotHeight);
        const clampedProbability = Math.max(0, Math.min(1, probability));
        
        return { yearIndex: clampedYearIndex, probability: clampedProbability };
    }
    
    /**
     * Convert year index and probability to canvas coordinates
     */
    function dataToCanvas(yearIndex, probability) {
        const x = padding + yearIndex * yearStep;
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
        
        // Vertical lines (years)
        for (let i = 0; i < numYears; i++) {
            const x = padding + i * yearStep;
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
            const x = padding + i * yearStep;
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
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < numYears; i++) {
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
        
        for (let i = 0; i < numYears; i++) {
            const coords = dataToCanvas(i, distribution[i]);
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
        
        const { yearIndex, probability } = canvasToData(x, y);
        distribution[yearIndex] = probability;
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
                
                const { yearIndex, probability } = canvasToData(interpX, interpY);
                distribution[yearIndex] = probability;
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
            distribution = Array(numYears).fill(0.5);
            drawWidget();
        }
    };
}

// Legacy function for backward compatibility
export function createWidget(containerId, options) {
    console.warn('createWidget is deprecated. Use createDistributionWidget instead.');
    return createDistributionWidget(containerId, options);
}
