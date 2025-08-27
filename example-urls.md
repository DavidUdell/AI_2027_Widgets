# Example URLs for Testing URL Control

These example URLs demonstrate how the widget can be controlled entirely through the URL fragment. Simply append any of these fragments to your demo URL to see the widget load with different states.

## Base URL
```
http://localhost:8000/demo-url-state.html
```

## Example 1: Blue Distribution with Peak
```
http://localhost:8000/demo-url-state.html#d=blue:64.c8.12c.190.1f4,red=c8.12c.190.1f4.258&a=0&v=10&s=1
```
- Blue distribution with a peak in the middle
- Red distribution hidden
- Blue is the active distribution
- Normal scale

## Example 2: Green Active, Blue Background
```
http://localhost:8000/demo-url-state.html#d=green:190.1f4.258.2bc.320.384,blue=64.c8.12c.190.1f4&a=1&v=01&s=0.8
```
- Green distribution is active
- Blue distribution visible in background
- Scaled down to 80%
- Green has a different shape

## Example 3: Multiple Visible Distributions
```
http://localhost:8000/demo-url-state.html#d=purple:12c.190.1f4.258.2bc.320,orange=190.1f4.258.2bc.320.384&a=0&v=11&s=1.2
```
- Purple and orange distributions both visible
- Purple is active
- Scaled up to 120%
- Both distributions have different shapes

## Example 4: Complex State
```
http://localhost:8000/demo-url-state.html#d=blue:64.c8.12c.190.1f4,green=190.1f4.258.2bc.320,red=c8.12c.190.1f4.258,purple=12c.190.1f4.258.2bc&a=2&v=1101&s=0.9
```
- Four distributions with different shapes
- Red distribution is active (index 2)
- Blue, green, and purple visible; red hidden
- Scaled to 90%

## How to Test

1. **Copy any URL above** and paste it into your browser
2. **The widget will automatically load** with the specified state
3. **Edit the URL fragment** in the address bar and reload to see changes
4. **Use the "Reload from URL" button** to force reload without page refresh
5. **Use the "Reset to Default" button** to clear the URL and load defaults

## URL Fragment Format

The URL fragment follows this pattern:
```
#d=color1:values1,color2:values2,...&a=activeIndex&v=visibilityBits&s=scaleFactor
```

Where:
- `d` = distributions (color:encodedValues pairs)
- `a` = active distribution index (0-based)
- `v` = visibility state as binary string (1=visible, 0=hidden)
- `s` = guideline scale factor

## Creating Your Own URLs

1. **Draw distributions** in the widget
2. **Copy the URL** from the address bar
3. **Share the URL** with others
4. **Recipients will see** your exact distributions when they open the URL

## Browser Navigation

- **Back/Forward buttons** work with URL changes
- **Bookmark any URL** to save a specific state
- **Edit URL directly** in address bar and reload
- **Share URLs** via email, chat, or social media
