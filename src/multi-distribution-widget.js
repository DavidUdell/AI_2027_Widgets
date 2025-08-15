/**
 * AI 2027 - Multi-Distribution Interactive Widget
 * Allows users to create multiple sub-probability distributions with different colors and masses
 * 
 * Features:
 * - Interactive drawing of probability distributions
 * - Multiple distributions with different colors
 * - Background distribution renormalization relative to active distribution on blur
 * - Visibility controls for each distribution
 * - Constant mass assumption across all distributions in the interactive widget
 */

/**
 * Creates an interactive canvas widget for drawing multiple sub-probability distributions
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {Function} [options.onChange] - Callback function called when distributions change
 */

export function createMultiDistributionWidget(containerId, options) {
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
    canvas.className = 'widget-canvas';

    const ctx = canvas.getContext('2d');

    const numYears = options.endYear - options.startYear + 1;
    const numPeriods = (numYears - 1) * 4 + 1;

    // Store multiple distributions - initialize all colors
    let distributions = [];
    let activeDistributionIndex = 0; // Start with blue

    // Track visibility state for each distribution
    const visibilityState = {};

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    


    // Grid and styling constants
    const padding = 80;
    const plotWidth = widgetWidth - 2 * padding;
    const plotHeight = options.height - 2 * padding;
    const periodStep = plotWidth / (numPeriods - 1);

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
     * Initialize visibility state for distributions
     */
    function initializeVisibilityState() {
        distributions.forEach((distribution, index) => {
            // Default all distributions to visible
            visibilityState[index] = true;
        });
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
        drawAllDistributions();
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

        // Draw vertical guideline at the median of the active distribution
        if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length) {
            const activeDist = distributions[activeDistributionIndex];
            const totalMass = activeDist.values.reduce((sum, val) => sum + val, 0);
            
            if (totalMass > 0) {
                // Calculate the median (point where cumulative probability reaches 50% of total mass)
                const targetMass = totalMass / 2;
                let cumulativeMass = 0;
                let medianIndex = 0;
                
                for (let i = 0; i < activeDist.values.length; i++) {
                    cumulativeMass += activeDist.values[i];
                    if (cumulativeMass >= targetMass) {
                        medianIndex = i;
                        break;
                    }
                }
                
                const medianX = dataToCanvas(medianIndex, 0).x;

                // Draw vertical guideline
                ctx.strokeStyle = '#6c757d';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]); // Dashed line
                ctx.beginPath();
                ctx.moveTo(medianX, padding);
                ctx.lineTo(medianX, options.height - padding);
                ctx.stroke();
                ctx.setLineDash([]); // Reset to solid lines

                // Get quarter name
                let quarterName;
                const year = options.startYear + Math.floor(medianIndex / 4);
                const quarter = (medianIndex % 4) + 1;
                quarterName = `Q${quarter} ${year}`;

                // Draw median quarter name on top
                ctx.fillStyle = '#495057';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(quarterName, medianX, padding - 10);
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
     * Draw all distributions
     */
    function drawAllDistributions() {
        // If no distributions, show a message
        if (distributions.length === 0) {
            const centerX = widgetWidth / 2;
            const centerY = options.height / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Add a distribution to start drawing', centerX, centerY);
            return;
        }

        // Draw all non-active distributions in the background first (only if visible)
        distributions.forEach((distribution, index) => {
            if (index !== activeDistributionIndex && visibilityState[index]) {
                drawSingleDistribution(distribution, false);
            }
        });

        // Draw the active distribution on top (only if visible)
        if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length && 
            visibilityState[activeDistributionIndex]) {
            const activeDist = distributions[activeDistributionIndex];
            drawSingleDistribution(activeDist, true);
        }
    }

    /**
     * Draw a single distribution
     */
    function drawSingleDistribution(distribution, isActive) {
        const colorScheme = colorSchemes[distribution.color];
        if (!colorScheme) return;

        // Save the current context state
        ctx.save();
        
        // Set clipping path to the inner border (plot area)
        ctx.beginPath();
        ctx.rect(padding, padding, plotWidth, plotHeight);
        ctx.clip();

        // Create gradient for the fill with reduced opacity for background distributions
        const gradient = ctx.createLinearGradient(padding, padding, padding, options.height - padding);
        if (isActive) {
            gradient.addColorStop(0, colorScheme.gradientStart);
            gradient.addColorStop(1, colorScheme.gradientEnd);
        } else {
            // Reduce opacity for background distributions
            const backgroundGradientStart = colorScheme.gradientStart.replace('0.3)', '0.15)');
            const backgroundGradientEnd = colorScheme.gradientEnd.replace('0.1)', '0.05)');
            gradient.addColorStop(0, backgroundGradientStart);
            gradient.addColorStop(1, backgroundGradientEnd);
        }

        // Draw the filled area under the curve
        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Start at the bottom-left corner
        ctx.moveTo(padding, options.height - padding);

        // Draw the curve
        for (let i = 0; i < numPeriods; i++) {
            const coords = dataToCanvas(i, distribution.values[i]);
            ctx.lineTo(coords.x, coords.y);
        }

        // Close the path by going to bottom-right corner and back to start
        ctx.lineTo(widgetWidth - padding, options.height - padding);
        ctx.closePath();
        ctx.fill();

        // Draw the curve line on top with reduced opacity for background distributions
        if (isActive) {
            ctx.strokeStyle = colorScheme.stroke;
            ctx.lineWidth = 2;
        } else {
            // Reduce opacity for background distributions
            // Convert hex to rgba with 50% opacity
            const hex = colorScheme.stroke.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.lineWidth = 1.5;
        }
        
        ctx.beginPath();

        for (let i = 0; i < numPeriods; i++) {
            const coords = dataToCanvas(i, distribution.values[i]);
            if (i === 0) {
                ctx.moveTo(coords.x, coords.y);
            } else {
                ctx.lineTo(coords.x, coords.y);
            }
        }
        ctx.stroke();
        
        // Restore the context state (removes clipping)
        ctx.restore();
    }



    /**
     * Get combined distribution (sum of all distributions)
     */
    function getCombinedDistribution() {
        const combined = Array(numPeriods).fill(0);
        distributions.forEach(dist => {
            for (let i = 0; i < numPeriods; i++) {
                combined[i] += dist.values[i];
            }
        });
        return combined;
    }

    /**
     * Get total mass
     */
    function getTotalMass() {
        return distributions.reduce((sum, dist) => sum + dist.mass, 0);
    }

    /**
     * Handle mouse/touch events for drawing
     */
    function handlePointerDown(e) {
        if (activeDistributionIndex === -1) return;

        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        lastX = x;
        lastY = y;

        const { periodIndex, probability } = canvasToData(x, y);
        distributions[activeDistributionIndex].values[periodIndex] = probability;
        drawWidget();

        if (options.onChange) {
            options.onChange(distributions);
        }
    }

    function handlePointerMove(e) {
        if (!isDrawing || activeDistributionIndex === -1) return;

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
                distributions[activeDistributionIndex].values[periodIndex] = probability;
            }

            lastX = x;
            lastY = y;
            drawWidget();

            if (options.onChange) {
                options.onChange(distributions);
            }
        }
    }

    function handlePointerUp() {
        if (isDrawing) {
            // Trigger renormalization when drawing ends
            performRenormalization();
        }
        isDrawing = false;
    }

    /**
     * Renormalize background distributions relative to active distribution
     * 
     * This function implements the constant mass assumption: all distributions in the interactive
     * widget should have the same total mass as the active distribution. When the user finishes
     * drawing, all visible background distributions are scaled to match the active distribution's
     * total mass, allowing for fair comparison while maintaining their relative shapes.
     */
    function performRenormalization() {
        if (activeDistributionIndex === -1 || activeDistributionIndex >= distributions.length) {
            return;
        }

        const activeDistribution = distributions[activeDistributionIndex];
        const activeTotalMass = activeDistribution.values.reduce((sum, val) => sum + val, 0);
        
        if (activeTotalMass <= 0) {
            return; // No active mass to normalize against
        }

        // Renormalize all background distributions relative to the active distribution
        distributions.forEach((distribution, index) => {
            if (index !== activeDistributionIndex && visibilityState[index]) {
                const distributionTotalMass = distribution.values.reduce((sum, val) => sum + val, 0);
                
                if (distributionTotalMass > 0) {
                    // Calculate the scaling factor to match the active distribution's total mass
                    const scalingFactor = activeTotalMass / distributionTotalMass;
                    
                    // Apply the scaling factor to all values in this distribution
                    for (let i = 0; i < distribution.values.length; i++) {
                        distribution.values[i] *= scalingFactor;
                    }
                }
            }
        });

        // Redraw the widget to reflect the changes
        drawWidget();
        
        // Notify any change listeners
        if (options.onChange) {
            options.onChange(distributions);
        }
    }



    // Add event listeners
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    // Prevent context menu
    canvas.addEventListener('contextmenu', e => e.preventDefault());



    // Initialize all distributions
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow'];
    colors.forEach((color, index) => {
        const initialValues = Array(numPeriods).fill(0).map((_, i) => 0.2 + (0.8 * i / (numPeriods - 1)));
        distributions.push({
            color: color,
            mass: 100, // Default total percentage
            values: initialValues
        });
    });

    // Initialize visibility state
    initializeVisibilityState();

    // Append canvas to container
    container.appendChild(canvas);

    // Initial draw
    drawWidget();



    // Return methods for external control
    return {
        addDistribution: (color, mass) => {
            // Create sloping initial distribution from 20% at start to 100% at end
            const initialValues = Array(numPeriods).fill(0).map((_, i) => 0.2 + (0.8 * i / (numPeriods - 1)));
            
            const newDistribution = {
                color: color,
                mass: mass,
                values: initialValues
            };
            distributions.push(newDistribution);
            const newIndex = distributions.length - 1;
            activeDistributionIndex = newIndex;
            // Set new distribution as visible by default
            visibilityState[newIndex] = true;
            // Trigger renormalization when active distribution changes
            performRenormalization();
        },
        removeDistribution: (index) => {
            distributions.splice(index, 1);
            // Remove visibility state for this index and reindex the rest
            delete visibilityState[index];
            // Reindex visibility state for remaining distributions
            const newVisibilityState = {};
            Object.keys(visibilityState).forEach(oldIndex => {
                const oldIndexNum = parseInt(oldIndex);
                if (oldIndexNum > index) {
                    newVisibilityState[oldIndexNum - 1] = visibilityState[oldIndexNum];
                } else {
                    newVisibilityState[oldIndexNum] = visibilityState[oldIndexNum];
                }
            });
            Object.assign(visibilityState, newVisibilityState);
            
            if (activeDistributionIndex >= distributions.length) {
                activeDistributionIndex = distributions.length - 1;
            }
            // Trigger renormalization if active distribution changed
            performRenormalization();
        },
        clearAllDistributions: () => {
            distributions = [];
            activeDistributionIndex = -1;
            // Clear visibility state
            Object.keys(visibilityState).forEach(key => delete visibilityState[key]);
            drawWidget();
            if (options.onChange) {
                options.onChange(distributions);
            }
        },
        setActiveDistribution: (index) => {
            if (index >= 0 && index < distributions.length) {
                activeDistributionIndex = index;
                // Trigger renormalization when active distribution changes
                performRenormalization();
            }
        },
        setActiveDistributionByColor: (color) => {
            const index = distributions.findIndex(dist => dist.color === color);
            if (index !== -1) {
                activeDistributionIndex = index;
                // Trigger renormalization when active distribution changes
                performRenormalization();
            }
        },

        getDistributions: () => [...distributions],
        getActiveDistributionIndex: () => activeDistributionIndex,
        getCombinedDistribution: getCombinedDistribution,
        getTotalMass: getTotalMass,
        setOnChange: (callback) => {
            options.onChange = callback;
        },
        setDistributionVisibility: (index, visible) => {
            if (visibilityState.hasOwnProperty(index)) {
                visibilityState[index] = visible;
                drawWidget();
            }
        },
        getDistributionVisibility: (index) => {
            return visibilityState[index] || false;
        },
        toggleDistributionVisibility: (index) => {
            if (visibilityState.hasOwnProperty(index)) {
                visibilityState[index] = !visibilityState[index];
                drawWidget();
            }
        },
        getVisibilityState: () => {
            return { ...visibilityState };
        },
        setVisibilityState: (newVisibilityState) => {
            Object.assign(visibilityState, newVisibilityState);
            drawWidget();
        },
        renormalizeBackgroundDistributions: () => {
            performRenormalization();
        }
    };
}
