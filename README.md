# AI 2027 Widgets

Interactive probability distribution widgets for embedding in text content.
Draw arbitrary probability distributions over quarters with an intuitive canvas
interface, specifically designed for AGI timeline predictions.

## Features

- **Interactive drawing** - Click and drag to draw your probability
  distribution
- **Quarter-based visualization** - Show probability trends over quarters until
  2040
- **Real-time updates** - See changes as you draw
- **Responsive design** - Widgets adapt to their container size
- **Bayesian scoring** - Compare predictions using proper log score metrics

## Quick Start

1. **Install dependencies:** `npm install`

2. **Run the demo locally:** `npm run dev`

3. **Run test suite:** `npm test`

## Widget Usage

### How It Works

The widget provides an interactive canvas where users can:

- **Click and drag** to draw probability curves
- **See real-time updates** as they draw
- **View probability values** on the Y-axis (0-100%)
- **See quarters** on the X-axis (Q1 2026 through Q1 2040)
- **Get smooth interpolation** between drawn points
- **Set total probability mass** independently of the distribution shape

The widget automatically handles:
- Coordinate conversion between canvas and data space
- Smooth drawing with interpolation
- Grid and axis labeling with quarter/year markers
- Touch and mouse input
- Dynamic total mass display

### Create Basic Interactive Widget

Create an interactive widget where users can draw probability distributions
over quarters:

```javascript
import { createDistributionWidget } from './src/index.js';

const widget = createDistributionWidget('container-id', {
    width: 300,
    height: 120,
    startYear: 2026,
    endYear: 2040,
    initialDistribution: [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.35, 0.3, 0.25, 0.2],
    totalMass: 50, // Total probability mass as percentage
    onChange: (distribution) => {
        console.log('Distribution changed:', distribution);
    }
});
```

### Widget Options

- **width** (number): Widget width in pixels
- **height** (number): Widget height in pixels  
- **startYear** (number): Starting year for the distribution
- **endYear** (number): Ending year for the distribution
- **initialDistribution** (Array<number>): Initial probability values [0,1] for
  each quarter
- **totalMass** (number): Total probability mass as percentage [0,100]
- **onChange** (Function): Callback called when distribution changes
- **color** (string): Color theme ('blue', 'green', or 'red')
- **interactive** (boolean): Whether the widget is interactive (default: true)

### Widget Methods

The widget returns an object with methods for external control:

```javascript
// Get current distribution values
const distribution = widget.getDistribution();

// Get total mass percentage
const totalMass = widget.getTotalMass();

// Set distribution programmatically
widget.setDistribution([0.1, 0.2, 0.3, 0.4, 0.5]);

// Set total mass percentage
widget.setTotalMass(75);

// Reset to default (50% for all quarters)
widget.reset();

// Set or update the onChange callback
widget.setOnChange((distribution) => {
    console.log('Distribution updated:', distribution);
});
```

## HTML Integration

**Add container element:**
   ```html
   <p>
      The probability distribution over quarters until 2040 is: 
      <span id="my-widget"></span> based on current trends.
   </p>
   ```

**Create the widget:**
   ```javascript
   createDistributionWidget('my-widget', {
       width: 300,
       height: 120,
       startYear: 2026,
       endYear: 2040,
       totalMass: 50
   });
   ```

## Bayesian Analysis Module

The project includes a Bayesian analysis module that implements proper log
score calculation for comparing sub-probability distributions. That is, this
scoring rule is specifically designed for evaluating predictions where the
total probability mass may be less than 100%.

### Log Score Formula

The log score is calculated using

```
Score = truthMass * H(Q_truth, P_prediction) - truthMass * log(predMass) - (1 - truthMass) * log(1 - predMass)
```

where
- `truthMass` and `predMass` are the total probability masses (as fractions)
- `H(Q_truth, P_prediction)` is the cross-entropy between the normalized ground
  truth and prediction distributions

Lower scores indicate better predictions.

### Usage Example

```javascript
import { comparePredictions, calculateLogScore } from './src/index.js';

const prediction1 = [0.4, 0.3, 0.2, 0.1];
const prediction2 = [0.1, 0.2, 0.3, 0.4];
const groundTruth = [0.35, 0.35, 0.2, 0.1];
const predProb1 = 100; // 100% total mass
const predProb2 = 50;  // 50% total mass
const truthProb = 85;  // 85% total mass

const result = comparePredictions(prediction1, predProb1, prediction2, predProb2, groundTruth, truthProb);
console.log('Winner:', result.winning); // 'prediction1'
console.log('Log score difference:', result.gap); // Positive number
console.log('Bayes factor:', result.factor); // How much better the winner is
```

### Available Functions

- `calculateLogScore(prediction, predProb, groundTruth, truthProb)` - Calculate
  log score
- `comparePredictions(pred1, predProb1, pred2, predProb2, groundTruth,
  truthProb)` - Compare two predictions

## Development

- **Build demo:** `npm run build`
- **Preview built demo:** `npm run preview`

## License

UNLICENSED - Private project
