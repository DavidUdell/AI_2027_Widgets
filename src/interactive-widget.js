/**
 * AI 2027 - Interactive Widget
 * Allows users to create multiple probability distributions with different colors
 * 
 * Features:
 * - Interactive drawing of probability distributions
 * - Multiple distributions with different colors
 * - Background distribution renormalization relative to active distribution on
 *   mouse up
 * - Visibility controls for each distribution
 */

/**
 * Creates an interactive canvas widget for drawing multiple probability distributions
 * @param {string} containerId - The ID of the HTML element to insert the widget into
 * @param {Object} options - Widget configuration options
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.height - Widget height in pixels
 * @param {number} options.startYear - Starting year for the distribution
 * @param {number} options.endYear - Ending year for the distribution
 * @param {Function} [options.onChange] - Callback function called when distributions change
 */

export function createInteractiveWidget(containerId, options) {
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

    // Store original values for scaling
    let originalValues = {};
    let userModifiedValues = {}; // Track which distributions have been modified by the user

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Guideline drag state
    let isDraggingGuideline = false;
    let guidelineY = 0; // Will be set when active distribution changes
    let originalGuidelineY = 0; // For drag start position
    let dragStartY = 0; // Mouse position when drag started
    let guidelineScaleFactor = 1.0; // Current scale factor for distributions
    let guidelineManuallySet = false; // Track if user has manually positioned the guideline
    
    // Second highest distribution peak guideline state
    let secondHighestPeakY = 0; // Y position for second highest distribution's peak
    let secondHighestPeakPercentage = 0; // Percentage value for second highest peak

    // Grid and styling constants - these will be recalculated on resize
    let padding = 80;
    let plotWidth = widgetWidth - 2 * padding;
    let plotHeight = options.height - 2 * padding;
    let periodStep = plotWidth / (numPeriods - 1);

    /**
     * Update widget dimensions and recalculate layout constants
     */
    function updateDimensions() {
        const containerRect = container.getBoundingClientRect();
        const newWidth = containerRect.width - 20; // Account for padding
        
        // Always update if width changed, or if called during distribution switches
        if (newWidth !== widgetWidth) {
            widgetWidth = newWidth;
            canvas.width = widgetWidth;
            
            // Recalculate layout constants
            padding = 80;
            plotWidth = widgetWidth - 2 * padding;
            plotHeight = options.height - 2 * padding;
            periodStep = plotWidth / (numPeriods - 1);
            
            // Redraw with new dimensions
            drawWidget();
        } else {
            // Even if width hasn't changed, ensure proper scaling by redrawing
            // This is important when switching distributions
            drawWidget();
        }
    }

    // Set up resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
    });
    resizeObserver.observe(container);

    // Also listen for window resize events as a fallback
    const resizeHandler = () => updateDimensions();
    window.addEventListener('resize', resizeHandler);

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
    // Epsilon value for floor probability (1/10,000)% = 0.000001
    const FLOOR_PROBABILITY_EPSILON = 0.000001;

    function canvasToData(x, y) {
        const periodIndex = Math.round((x - padding) / periodStep);
        const clampedPeriodIndex = Math.max(0, Math.min(numPeriods - 1, periodIndex));

        const probability = 1 - ((y - padding) / plotHeight);
        const clampedProbability = Math.max(FLOOR_PROBABILITY_EPSILON, Math.min(1, probability));

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

        // Update second highest peak guideline before drawing
        updateSecondHighestPeakGuideline();

        drawGrid();
        drawAxisLabels();
        drawAllDistributions();
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
     * Auto-scale distribution to fit within visible area when switching
     */
    function autoScaleDistribution(distributionIndex) {
        if (distributionIndex < 0 || distributionIndex >= distributions.length) {
            return;
        }
        
        const distribution = distributions[distributionIndex];
        const maxValue = Math.max(...distribution.values);
        
        if (maxValue <= 0) {
            return; // No scaling needed for empty distribution
        }
        
        // Calculate the maximum visible height (allow distribution to go to ceiling)
        const maxVisibleHeight = plotHeight;
        const maxVisibleProbability = maxVisibleHeight / plotHeight;
        
        // If the distribution is too tall, scale it down
        if (maxValue > maxVisibleProbability) {
            const scaleFactor = maxVisibleProbability / maxValue;
            guidelineScaleFactor = scaleFactor;
            
            // Apply scaling to all visible distributions
            distributions.forEach((dist, index) => {
                if (visibilityState[index]) {
                    for (let i = 0; i < dist.values.length; i++) {
                        dist.values[i] *= scaleFactor;
                    }
                }
            });
            
            // Update guideline position to match the new scale
            guidelineY = padding + (1 - maxVisibleProbability) * plotHeight;
            guidelineManuallySet = false; // Allow automatic positioning
        } else {
            // If distribution fits, reset to original scale
            guidelineScaleFactor = 1.0;
            guidelineManuallySet = false;
        }
    }

    /**
     * Update guideline position based on active distribution
     */
    function updateGuidelinePosition() {
        if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length && !guidelineManuallySet) {
            const activeDist = distributions[activeDistributionIndex];
            // Use current values to follow the actual peak, not original values
            const maxValue = Math.max(...activeDist.values);
            // Convert probability to canvas Y coordinate
            guidelineY = padding + (1 - maxValue) * plotHeight;
        }
    }

    /**
     * Calculate and update second highest distribution's peak guideline
     */
    function updateSecondHighestPeakGuideline() {
        // Get all visible distributions except the active one
        const visibleDistributions = distributions
            .map((dist, index) => ({ dist, index }))
            .filter(({ index }) => visibilityState[index] && index !== activeDistributionIndex);
        
        if (visibleDistributions.length === 0) {
            secondHighestPeakY = 0;
            secondHighestPeakPercentage = 0;
            return;
        }
        
        // Get the active distribution's peak for comparison
        let activeDistributionPeak = 0;
        if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length) {
            const activeDist = distributions[activeDistributionIndex];
            const activeMaxValue = Math.max(...activeDist.values);
            activeDistributionPeak = calculateNormalizedPeak(activeDist);
        }
        
        // Calculate peak values for all visible distributions using the same normalization as active distribution
        const peakValues = visibleDistributions.map(({ dist }) => {
            const maxValue = Math.max(...dist.values);
            const normalizedPeak = calculateNormalizedPeak(dist);
            return { maxValue, normalizedPeak };
        });
        
        // Filter to only include peaks that are lower than or equal to the active distribution's peak
        const peaksBelowActive = peakValues.filter(peak => peak.normalizedPeak <= activeDistributionPeak);
        
        if (peaksBelowActive.length === 0) {
            // If no peaks are below the active distribution, don't show the guideline
            secondHighestPeakY = 0;
            secondHighestPeakPercentage = 0;
            return;
        }
        
        // Find the highest peak among those below the active distribution
        peaksBelowActive.sort((a, b) => b.normalizedPeak - a.normalizedPeak);
        const nextHighest = peaksBelowActive[0];
        
        if (nextHighest) {
            secondHighestPeakY = padding + (1 - nextHighest.maxValue) * plotHeight;
            secondHighestPeakPercentage = nextHighest.normalizedPeak;
        } else {
            secondHighestPeakY = 0;
            secondHighestPeakPercentage = 0;
        }
    }

    /**
     * Check if a point is near the guideline label for drag detection
     */
    function isNearGuidelineLabel(x, y) {
        if (activeDistributionIndex < 0 || activeDistributionIndex >= distributions.length) {
            return false;
        }
        
        // Calculate label dimensions (matching the drawing function)
        const labelText = "9.99%"; // Use the largest label text for measurement
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        const textMetrics = ctx.measureText(labelText);
        const labelWidth = textMetrics.width + 8;
        const labelHeight = 16;
        
        // Check if click is in the label area (left side of the plot)
        const labelX = padding - 5 - labelWidth;
        
        return (x >= labelX && 
                x <= padding - 5 && 
                y >= guidelineY - labelHeight/2 && 
                y <= guidelineY + labelHeight/2);
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

        // Draw horizontal percentage guideline for the active distribution
        if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length) {
            const activeDist = distributions[activeDistributionIndex];
            const totalMass = activeDist.values.reduce((sum, val) => sum + val, 0);
            
            if (totalMass > 0) {
                // Calculate the normalized peak value
                const normalizedPeak = calculateNormalizedPeak(activeDist);
                
                if (normalizedPeak > 0) {
                    // Use the current guideline position (which may be dragged)
                    const currentY = guidelineY;
                    
                    // Draw horizontal guideline with visual feedback for dragging
                    const activeColorScheme = colorSchemes[activeDist.color];
                    if (isDraggingGuideline) {
                        ctx.strokeStyle = activeColorScheme.stroke; // Use active distribution color when dragging
                        ctx.lineWidth = 2;
                    } else {
                        ctx.strokeStyle = '#adb5bd'; // Lighter gray when not dragging (same as secondary guideline)
                        ctx.lineWidth = 1;
                    }
                    ctx.setLineDash([3, 3]); // Dashed line
                    ctx.beginPath();
                    ctx.moveTo(padding, currentY);
                    ctx.lineTo(widgetWidth - padding, currentY);
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

                    // Calculate the current percentage based on actual distribution values
                    const maxCurrentValue = Math.max(...activeDist.values);
                    const currentPercentage = calculateNormalizedPeak(activeDist);
                    
                    // Draw the percentage label on the left with interactive styling
                    ctx.fillStyle = isDraggingGuideline ? activeColorScheme.stroke : '#495057';
                    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Add background rectangle for better visual feedback
                    const labelText = formatPercentage(currentPercentage);
                    const textMetrics = ctx.measureText(labelText);
                    const labelWidth = textMetrics.width + 8;
                    const labelHeight = 16;
                    const labelX = padding - 5 - labelWidth;
                    const labelY = currentY - labelHeight/2;
                    
                    // Draw background rectangle with active distribution color when dragging
                    if (isDraggingGuideline) {
                        const hex = activeColorScheme.stroke.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
                    } else {
                        ctx.fillStyle = 'rgba(73, 80, 87, 0.1)';
                    }
                    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
                    
                    // Draw border
                    ctx.strokeStyle = isDraggingGuideline ? activeColorScheme.stroke : '#495057';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);
                    
                    // Draw text
                    ctx.fillStyle = isDraggingGuideline ? activeColorScheme.stroke : '#495057';
                    ctx.fillText(labelText, labelX + labelWidth/2, currentY);
                }
            }
        }

        // Draw vertical guidelines at the median of all visible distributions
        distributions.forEach((distribution, index) => {
            // Skip if distribution is hidden
            if (!visibilityState[index]) return;
            
            const totalMass = distribution.values.reduce((sum, val) => sum + val, 0);
            
            if (totalMass > 0) {
                // Calculate the median (point where cumulative probability reaches 50% of total mass)
                const targetMass = totalMass / 2;
                let cumulativeMass = 0;
                let medianIndex = 0;
                
                for (let i = 0; i < distribution.values.length; i++) {
                    cumulativeMass += distribution.values[i];
                    if (cumulativeMass >= targetMass) {
                        medianIndex = i;
                        break;
                    }
                }
                
                const medianX = dataToCanvas(medianIndex, 0).x;
                const colorScheme = colorSchemes[distribution.color];

                // Draw vertical guideline with distribution color (slightly transparent)
                const hex = colorScheme.stroke.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.7)`; // 70% opacity
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]); // Dashed line
                ctx.beginPath();
                ctx.moveTo(medianX, padding);
                ctx.lineTo(medianX, options.height - padding);
                ctx.stroke();
                ctx.setLineDash([]); // Reset to solid lines

                // Get quarter name components
                const year = options.startYear + Math.floor(medianIndex / 4);
                const quarter = (medianIndex % 4) + 1;
                const yearDigits = year.toString().slice(-2);

                // Draw median quarter name on top with distribution color
                ctx.fillStyle = colorScheme.stroke;
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                // Draw year line with proper alignment
                const yearLineY = padding - 10;
                const quarterLineY = yearLineY - 14;
                
                // Draw apostrophe and year digits separately for better alignment
                const apostrophe = '\u2019';
                const yearText = yearDigits;
                
                // Measure text for proper centering
                const apostropheWidth = ctx.measureText(apostrophe).width;
                const yearWidth = ctx.measureText(yearText).width;
                const totalYearWidth = apostropheWidth + yearWidth;
                
                // Draw apostrophe (left-aligned within the centered group)
                ctx.textAlign = 'left';
                ctx.fillText(apostrophe, medianX - totalYearWidth / 2, yearLineY);
                
                // Draw year digits (right-aligned within the centered group)
                ctx.fillText(yearText, medianX + totalYearWidth / 2 - yearWidth, yearLineY);
                
                // Draw quarter line
                ctx.textAlign = 'center';
                ctx.fillText(`Q${quarter}`, medianX, quarterLineY);
            }
        });

        // Draw the ε% label at the bottom left, but hide it when horizontal guideline is at visual floor
        // or when y-axis has been dragged to the visual floor
        const isAtVisualFloor = activeDistributionIndex >= 0 && 
                               activeDistributionIndex < distributions.length && 
                               distributions[activeDistributionIndex].values.reduce((sum, val) => sum + val, 0) > 0;
        
        if (isAtVisualFloor) {
            const activeDist = distributions[activeDistributionIndex];
            const maxValue = Math.max(...activeDist.values);
            const isGuidelineAtFloor = Math.abs(maxValue - FLOOR_PROBABILITY_EPSILON) < 1e-10;
            
            // Check if y-axis has been dragged to visual floor (scale factor is very small)
            const isYAxisAtVisualFloor = guidelineScaleFactor < 0.1; // Threshold for visual floor
            
            if (!isGuidelineAtFloor && !isYAxisAtVisualFloor) {
                ctx.fillStyle = '#495057';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText('ε%', padding - 10, options.height - padding);
            }
        } else {
            // Show epsilon label when no active distribution or no mass
            ctx.fillStyle = '#495057';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('ε%', padding - 10, options.height - padding);
        }

        // Draw second highest distribution's peak guideline (non-draggable)
        if (secondHighestPeakY > 0 && secondHighestPeakPercentage > 0) {
            // Draw horizontal guideline for second highest peak
            ctx.strokeStyle = '#adb5bd'; // Lighter gray color for non-draggable guideline
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]); // Different dash pattern to distinguish from active guideline
            ctx.beginPath();
            ctx.moveTo(padding, secondHighestPeakY);
            ctx.lineTo(widgetWidth - padding, secondHighestPeakY);
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

            // Draw the percentage label on the right side
            ctx.fillStyle = '#6c757d';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // Draw text without background rectangle (non-draggable)
            const labelText = formatPercentage(secondHighestPeakPercentage);
            const labelX = widgetWidth - padding + 5;
            
            // Draw text
            ctx.fillText(labelText, labelX, secondHighestPeakY);
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
            } else if (i === 0) {
                // First year - show full year
                ctx.fillText(year.toString(), x, options.height - padding / 2 - 18);
            } else {
                // Middle years - show abbreviated year with apostrophe
                const yearDigits = year.toString().slice(-2);
                const apostrophe = '\u2019';
                ctx.fillText(`${apostrophe}${yearDigits}`, x, options.height - padding / 2 - 18);
            }
        }

        // X-axis title
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Quarters', widgetWidth / 2, options.height - padding / 2 + 7);

        // Y-axis title
        ctx.save();
        ctx.translate(padding / 2 - 14, options.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Probability AGI Invented In', 0, 0);
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
     * Handle mouse/touch events for drawing and guideline dragging
     */
    function handlePointerDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking near the guideline label
        if (isNearGuidelineLabel(x, y)) {
            isDraggingGuideline = true;
            guidelineManuallySet = true; // Mark that user has manually positioned the guideline
            originalGuidelineY = guidelineY;
            dragStartY = y;
            canvas.style.cursor = 'ns-resize';
            drawWidget(); // Redraw to show dragging state
            return;
        }

        // Regular drawing logic
        if (activeDistributionIndex === -1) return;

        isDrawing = true;
        lastX = x;
        lastY = y;

        // Reset manual positioning when user starts drawing (they want guideline to follow peak)
        guidelineManuallySet = false;

        const { periodIndex, probability } = canvasToData(x, y);
        distributions[activeDistributionIndex].values[periodIndex] = probability;
        
        // Mark this distribution as user-modified
        userModifiedValues[activeDistributionIndex] = true;
        
        // Update guideline position to follow the new peak (only if not manually set)
        updateGuidelinePosition();
        
        drawWidget();

        if (options.onChange) {
            options.onChange(distributions);
        }
    }

    function handlePointerMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update cursor based on hover state
        if (!isDraggingGuideline && !isDrawing) {
            if (isNearGuidelineLabel(x, y)) {
                canvas.style.cursor = 'ns-resize';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        }

        // Handle guideline dragging
        if (isDraggingGuideline) {
            // Allow guideline to be dragged to the visual ceiling (no minimum constraint)
            const newY = Math.max(padding, Math.min(options.height - padding, y));
            guidelineY = newY;
            
                            // Calculate new scale factor based on guideline position
                if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length) {
                    const activeDist = distributions[activeDistributionIndex];
                    const maxValue = Math.max(...activeDist.values);
                    const currentProbability = 1 - ((newY - padding) / plotHeight);
                    
                    // Allow scale factor to go to 0 (visual ceiling) - no minimum constraint
                    guidelineScaleFactor = Math.max(0, currentProbability / maxValue);
                    
                    // Apply scaling to all distributions based on their current values
                    distributions.forEach((distribution, index) => {
                        if (visibilityState[index]) {
                            // Use current values for scaling (preserve user's work)
                            const currentValues = [...distribution.values];
                            for (let i = 0; i < distribution.values.length; i++) {
                                distribution.values[i] = currentValues[i] * guidelineScaleFactor;
                            }
                        }
                    });
                }
            
            drawWidget();
            if (options.onChange) {
                options.onChange(distributions);
            }
            return;
        }

        // Handle regular drawing
        if (!isDrawing || activeDistributionIndex === -1) return;

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
                // Mark this distribution as user-modified
                userModifiedValues[activeDistributionIndex] = true;
            }

            lastX = x;
            lastY = y;
            
            // Update guideline position to follow the new peak (only if not manually set)
            updateGuidelinePosition();
            
            drawWidget();

            if (options.onChange) {
                options.onChange(distributions);
            }
        }
    }

    function handlePointerUp() {
        if (isDraggingGuideline) {
            isDraggingGuideline = false;
            canvas.style.cursor = 'crosshair';
            drawWidget(); // Redraw to show normal state
        }
        
        if (isDrawing) {
            // Trigger renormalization when drawing ends
            performRenormalization();
            // Store current values as the new "original" values for this distribution
            if (activeDistributionIndex >= 0 && activeDistributionIndex < distributions.length) {
                originalValues[activeDistributionIndex] = [...distributions[activeDistributionIndex].values];
            }
            // Update guideline position after renormalization (only if not manually set)
            updateGuidelinePosition();
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

    // Prevent context menu and touch scrolling
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });



    // Initialize all distributions
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow'];
    colors.forEach((color, index) => {
        const initialValues = Array(numPeriods).fill(0).map((_, i) => 0.2 + (0.8 * i / (numPeriods - 1)));
        distributions.push({
            color: color,
            mass: 100, // Default total percentage
            values: initialValues
        });
        // Store original values
        originalValues[index] = [...initialValues];
    });

    // Initialize visibility state
    initializeVisibilityState();

    // Append canvas to container
    container.appendChild(canvas);

    // Initial draw
    updateGuidelinePosition();
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
            // Store original values
            originalValues[newIndex] = [...initialValues];
            // Reset guideline scale factor and restore original values
            guidelineScaleFactor = 1.0;
            guidelineManuallySet = false; // Reset manual positioning when adding new distribution
            distributions.forEach((distribution, distIndex) => {
                if (originalValues[distIndex]) {
                    distribution.values = [...originalValues[distIndex]];
                }
            });
            // Update dimensions to ensure proper scaling to available widget area
            updateDimensions();
            // Auto-scale the active distribution to fit within visible area
            autoScaleDistribution(newIndex);
            updateGuidelinePosition();
            // Trigger renormalization when active distribution changes
            performRenormalization();
        },
        removeDistribution: (index) => {
            distributions.splice(index, 1);
            // Remove visibility state for this index and reindex the rest
            delete visibilityState[index];
            // Remove original values for this index and reindex the rest
            delete originalValues[index];
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
            
            // Reindex original values for remaining distributions
            const newOriginalValues = {};
            Object.keys(originalValues).forEach(oldIndex => {
                const oldIndexNum = parseInt(oldIndex);
                if (oldIndexNum > index) {
                    newOriginalValues[oldIndexNum - 1] = originalValues[oldIndexNum];
                } else {
                    newOriginalValues[oldIndexNum] = originalValues[oldIndexNum];
                }
            });
            Object.assign(originalValues, newOriginalValues);
            
            if (activeDistributionIndex >= distributions.length) {
                activeDistributionIndex = distributions.length - 1;
            }
            // Update dimensions to ensure proper scaling to available widget area
            updateDimensions();
            // Trigger renormalization if active distribution changed
            performRenormalization();
        },
        clearAllDistributions: () => {
            distributions = [];
            activeDistributionIndex = -1;
            // Clear visibility state
            Object.keys(visibilityState).forEach(key => delete visibilityState[key]);
            // Clear original values
            Object.keys(originalValues).forEach(key => delete originalValues[key]);
            // Clear user modified values
            Object.keys(userModifiedValues).forEach(key => delete userModifiedValues[key]);
            drawWidget();
            if (options.onChange) {
                options.onChange(distributions);
            }
        },
        setActiveDistribution: (index) => {
            if (index >= 0 && index < distributions.length) {
                activeDistributionIndex = index;
                // Reset guideline scale factor and restore original values
                guidelineScaleFactor = 1.0;
                guidelineManuallySet = false; // Reset manual positioning when switching distributions
                // Restore original values for all distributions that haven't been user-modified
                distributions.forEach((distribution, distIndex) => {
                    if (originalValues[distIndex] && !userModifiedValues[distIndex]) {
                        distribution.values = [...originalValues[distIndex]];
                    }
                });
                // Update dimensions to ensure proper scaling to available widget area
                updateDimensions();
                // Auto-scale the active distribution to fit within visible area
                autoScaleDistribution(index);
                updateGuidelinePosition();
                // Trigger renormalization when active distribution changes
                performRenormalization();
            }
        },
        setActiveDistributionByColor: (color) => {
            const index = distributions.findIndex(dist => dist.color === color);
            if (index !== -1) {
                activeDistributionIndex = index;
                // Reset guideline scale factor and restore original values
                guidelineScaleFactor = 1.0;
                guidelineManuallySet = false; // Reset manual positioning when switching distributions
                // Restore original values for all distributions that haven't been user-modified
                distributions.forEach((distribution, distIndex) => {
                    if (originalValues[distIndex] && !userModifiedValues[distIndex]) {
                        distribution.values = [...originalValues[distIndex]];
                    }
                });
                // Update dimensions to ensure proper scaling to available widget area
                updateDimensions();
                // Auto-scale the active distribution to fit within visible area
                autoScaleDistribution(index);
                updateGuidelinePosition();
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
        },
        resetGuideline: () => {
            guidelineScaleFactor = 1.0;
            guidelineManuallySet = false; // Reset manual positioning when resetting
            // Restore original values to all distributions
            distributions.forEach((distribution, index) => {
                if (originalValues[index]) {
                    distribution.values = [...originalValues[index]];
                }
            });
            // Update dimensions to ensure proper scaling to available widget area
            updateDimensions();
            updateGuidelinePosition();
            drawWidget();
            if (options.onChange) {
                options.onChange(distributions);
            }
        },
        getGuidelineScaleFactor: () => guidelineScaleFactor,
        destroy: () => {
            // Clean up resize observer and event listeners
            resizeObserver.disconnect();
            window.removeEventListener('resize', resizeHandler);
        }
    };
}
