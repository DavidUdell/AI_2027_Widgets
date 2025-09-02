/**
 * AI 2027 - Widgets Module
 * Allows users to draw probability distributions over years/quarters
 */ 

import { createInteractiveWidget } from './interactive-widget.js';
import { createCalculatorWidget } from './calculator-widget.js';

// Export boot function
export function boot(root = document) {
    // Create interactive widget
    const widget = createInteractiveWidget('interactive-widget', {});

    // Create calculator widget
    const calculatorWidget = createCalculatorWidget('calculator-widget', {
        distributions: widget.getDistributions(),
        activeDistributionIndex: widget.getActiveDistributionIndex(),
        visibilityState: widget.getVisibilityState()
    });

    // Interactive widget controls
    const colorSelect = root.getElementById('distribution-color');
    const visibilityTogglesContainer = root.getElementById('visibility-toggles');

    // Checkbox color labels
    const colorSchemes = {
        blue: '#007bff',
        green: '#28a745',
        red: '#dc3545',
        purple: '#6f42c1',
        orange: '#fd7e14',
        yellow: '#ffc107'
    };

    // Create visibility toggles
    function createVisibilityToggles() {
        visibilityTogglesContainer.innerHTML = '';
        const distributions = widget.getDistributions();
        const activeIndex = widget.getActiveDistributionIndex();
        const currentVisibilityState = widget.getVisibilityState();
        
        distributions.forEach((distribution, index) => {
            const toggle = root.createElement('div');
            toggle.className = 'visibility-toggle';
            toggle.innerHTML = `
                <input type="checkbox" id="toggle-${distribution.color}">
                <div class="color-box" style="background-color: ${colorSchemes[distribution.color]}"></div>
                <span class="label">${distribution.color.charAt(0).toUpperCase() + distribution.color.slice(1)}</span>
            `;
            
            const checkbox = toggle.querySelector('input[type="checkbox"]');
            
            // Handle active distribution logic
            if (index === activeIndex) {
                // Active distribution should always be visible and disabled
                checkbox.checked = true;
                checkbox.disabled = true;
                widget.setDistributionVisibility(index, true);
            } else {
                // Use current visibility state from widget, or default to false
                const isVisible = currentVisibilityState[index] || false;
                checkbox.checked = isVisible;
                checkbox.disabled = false;
                widget.setDistributionVisibility(index, isVisible);
            }
            
            // Add event listener
            checkbox.addEventListener('change', () => {
                widget.setDistributionVisibility(index, checkbox.checked);
                // Update calculator widget when visibility changes
                if (calculatorWidget) {
                    calculatorWidget.setVisibilityState(widget.getVisibilityState());
                }
            });
            
            visibilityTogglesContainer.appendChild(toggle);
        });
    }



    // Reset visibility toggle initialization state
    function resetVisibilityToggleState() {
        const distributions = widget.getDistributions();
        distributions.forEach((distribution) => {
            const checkbox = root.getElementById(`toggle-${distribution.color}`);
            if (checkbox) {
                checkbox.removeAttribute('data-initialized');
            }
        });
    }

    // Update visibility toggles when active distribution changes
    function updateVisibilityToggles() {
        const distributions = widget.getDistributions();
        const activeIndex = widget.getActiveDistributionIndex();
        
        distributions.forEach((distribution, index) => {
            const checkbox = root.getElementById(`toggle-${distribution.color}`);
            if (checkbox) {
                if (index === activeIndex) {
                    // Active distribution should always be visible and
                    // disabled
                    checkbox.checked = true;
                    checkbox.disabled = true;
                    widget.setDistributionVisibility(index, true);
                } else {
                    // Background distributions can be toggled
                    checkbox.disabled = false;
                    // Always update the checkbox state to match the widget's visibility state
                    checkbox.checked = widget.getDistributionVisibility(index);
                    checkbox.setAttribute('data-initialized', 'true');
                }
            }
        });
    }

    function updateColorSelect() {
        const activeIndex = widget.getActiveDistributionIndex();
        if (activeIndex >= 0) {
            const distributions = widget.getDistributions();
            const activeColor = distributions[activeIndex].color;
            colorSelect.value = activeColor;
        }
    }



    // Handle color dropdown changes
    colorSelect.addEventListener('change', () => {
        const color = colorSelect.value;
        widget.setActiveDistributionByColor(color);
        updateVisibilityToggles();
        
        // Update the calculator widget when active distribution changes
        if (calculatorWidget) {
            calculatorWidget.setActiveDistributionIndex(widget.getActiveDistributionIndex());
        }
    });

    // Set up callback to update calculator widget when distributions
    // change
    widget.setOnChange((distributions) => {
        if (calculatorWidget) {
            calculatorWidget.updateDistributions(distributions);
            calculatorWidget.setActiveDistributionIndex(widget.getActiveDistributionIndex());
            calculatorWidget.setVisibilityState(widget.getVisibilityState());
        }
        // Reset visibility toggle state to ensure proper updates
        resetVisibilityToggleState();
        // Update the UI controls to reflect the active distribution
        updateColorSelect();
        updateVisibilityToggles();
    });

    // Initialize
    createVisibilityToggles();
    updateColorSelect();
    updateVisibilityToggles();
    
    // Initialize calculator widget with current state after Interactive widget is fully set up
    if (calculatorWidget) {
        calculatorWidget.setVisibilityState(widget.getVisibilityState());
    }

}

export { createInteractiveWidget, createCalculatorWidget };
