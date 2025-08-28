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
- **View probability scale** on the Y-axis (0-100%)
- **See quarters** on the X-axis (Q1 2026 through Q1 2040)

### Create Interactive Widget

Create an interactive widget where users can draw probability distributions
over quarters:

```javascript
import { createInteractiveWidget } from './src/index.js';

const widget = createInteractiveWidget('container-id', {});
```
## URL Fragment Format

The URL fragment uses the pattern:
```
#d=color1:values1,color2:values2,...
```

You can include any subset of the 6 colors (blue, green, red, purple, orange,
yellow). Distribution values are encoded using fixed-width base36: each
probability value [0.0, 1.0] is converted to an integer [0, 1000], and each
integer is converted to a (zeros-padded, uppercase) 3-character base36 string,

## Development

- **Build demo:** `npm run build`
- **Preview built demo:** `npm run preview`

## License

UNLICENSED - Private project
