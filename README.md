# AI 2027 Widgets

Interactive probability distribution widgets for embedding in HTML. Draw
arbitrary probability distributions over quarters and see how they stack up
against one another.

## Features

- **Drawing** - Click and drag to draw probability distributions
- **Scoring** - Compare predictions using KL divergence

## Create Widgets

Build with `npm run build`, then put the contents of
`./dist/ai-2027-widgets.iife.js` in the page's leading `<script>` tag. Then
initialize in another `<script>` tag:

```javascript
const { createInteractiveWidget, createCalculatorWidget } = window.AI2027Widgets;

const interactiveWidget = createInteractiveWidget('container-id-1', {});
const calculatorWidget = createCalculatorWidget('container-id-2', {
    distributions: widget.getDistributions(),
    activeDistributionIndex: widget.getActiveDistributionIndex(),
    visibilityState: widget.getVisibilityState()
});
```
See `index.html` for an instance of fully featured initialization.

## URL Fragments Logic

The widgets try to store state in the URL fragment, in the pattern:
```
#d=color1:values1,color2:values2,...
```

This can include any subset of the 6 distribution colors (blue, green, red,
purple, orange, yellow). Distribution values are encoded using fixed-width
base36: the quarter probability values [0.0, 1.0] together become a
zeros-padded, uppercase, 2-character base36 string.

## License

UNLICENSED
