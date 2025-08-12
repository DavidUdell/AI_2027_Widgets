# AI 2027 Widgets

Interactive probability distribution widgets for embedding in text content. Draw arbitrary probability distributions over years with an intuitive canvas interface.

## Features

- **Interactive drawing** - Click and drag to draw your probability distribution
- **Year-based visualization** - Show probability trends over any time period
- **Real-time updates** - See changes as you draw
- **Responsive design** - Widgets adapt to their container size
- **Modern tooling** - Built with Vite for fast development and optimized builds

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the demo:**
   ```bash
   npm run demo
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## Widget Usage

### Basic Distribution Widget

Create an interactive widget where users can draw probability distributions over years:

```javascript
import { createDistributionWidget } from './src/index.js';

const widget = createDistributionWidget('container-id', {
    width: 300,
    height: 120,
    startYear: 2024,
    endYear: 2034,
    initialDistribution: [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.35, 0.3, 0.25, 0.2],
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
- **initialDistribution** (Array<number>): Initial probability values (0-1) for each year
- **onChange** (Function): Callback called when distribution changes

### Widget Methods

The widget returns an object with methods for external control:

```javascript
// Get current distribution values
const distribution = widget.getDistribution();

// Set distribution programmatically
widget.setDistribution([0.1, 0.2, 0.3, 0.4, 0.5]);

// Reset to default (50% for all years)
widget.reset();
```

## HTML Integration

1. **Add container element:**
   ```html
   <p>The probability distribution over the next decade is: 
      <span id="my-widget"></span> based on current trends.</p>
   ```

2. **Create the widget:**
   ```javascript
   createDistributionWidget('my-widget', {
       width: 300,
       height: 120,
       startYear: 2024,
       endYear: 2034
   });
   ```

## Bayesian Analysis Module

The project includes a clean, tested Bayesian analysis module focused on log score calculation for comparing probability distributions. The log score properly handles unnormalized distributions by incorporating log mass terms.

```javascript
import { comparePredictions, calculateLogScore } from './src/index.js';

const prediction1 = [40, 30, 20, 10];
const prediction2 = [10, 20, 30, 40];
const groundTruth = [35, 35, 20, 10];

const result = comparePredictions(prediction1, prediction2, groundTruth);
console.log('Winner:', result.winner); // 'prediction1'
console.log('Improvement:', result.improvement); // '98.3%'

// Handles unnormalized distributions
const highMassPrediction = [2, 4, 6, 8]; // Sum = 20
const lowMassTruth = [1, 2, 3, 4]; // Sum = 10
const logScore = calculateLogScore(highMassPrediction, lowMassTruth);
console.log('Log Score:', logScore); // log(2) ≈ 0.693
```

### Available Functions

- `calculateLogScore(prediction, groundTruth)` - Calculate log score (lower is better)
- `comparePredictions(pred1, pred2, groundTruth)` - Compare two predictions

### Key Features

- **Unnormalized distributions**: Works with raw probability values of any scale
- **Mass-aware**: Properly penalizes differences in total mass between distributions
- **Scale-invariant**: Relative scores remain the same regardless of overall scale
- **Standard metric**: Log score is widely used in Bayesian analysis and forecasting

See `src/bayesian.md` for complete documentation and `examples/bayesian-example.js` for usage examples.

## Testing

Run the test suite:

```bash
npm test
```

The test suite covers both the widget functionality and the Bayesian analysis module.

## How It Works

The widget provides an interactive canvas where users can:

- **Click and drag** to draw probability curves
- **See real-time updates** as they draw
- **View probability values** on the Y-axis (0-100%)
- **See years** on the X-axis
- **Get smooth interpolation** between drawn points

The widget automatically handles:
- Coordinate conversion between canvas and data space
- Smooth drawing with interpolation
- Grid and axis labeling
- Touch and mouse input

## Development

- **Build library:** `npm run build`
- **Run tests:** `npm test`
- **Preview build:** `npm run preview`

## License

UNLICENSED - Private project
