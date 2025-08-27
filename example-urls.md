# Example URLs for Testing URL Control

These example URLs demonstrate how the widget can be controlled entirely through the URL fragment. Simply append any of these fragments to your demo URL to see the widget load with different states.

## Base URL
```
http://localhost:8000/demo-url-state.html
```

## Example 1: Blue Distribution with Peak
```
http://localhost:8000/demo-url-state.html#d=blue:64.c8.12c.190.1f4,red:c8.12c.190.1f4.258
```
- Blue distribution with a peak in the middle
- Red distribution with different values
- Visual parameters (active distribution, visibility, scale) use defaults

## Example 2: Green and Blue Distributions
```
http://localhost:8000/demo-url-state.html#d=green:190.1f4.258.2bc.320.384,blue:64.c8.12c.190.1f4
```
- Green and blue distributions with different shapes
- Visual parameters use defaults

## Example 3: Multiple Distributions
```
http://localhost:8000/demo-url-state.html#d=purple:12c.190.1f4.258.2bc.320,orange:190.1f4.258.2bc.320.384
```
- Purple and orange distributions with different shapes
- Visual parameters use defaults

## Example 4: Complex State
```
http://localhost:8000/demo-url-state.html#d=blue:64.c8.12c.190.1f4,green:190.1f4.258.2bc.320,red:c8.12c.190.1f4.258,purple:12c.190.1f4.258.2bc
```
- Four distributions with different shapes
- Visual parameters (active distribution, visibility, scale) use defaults

## How to Test

1. **Copy any URL above** and paste it into your browser
2. **The widget will automatically load** with the specified state
3. **Edit the URL fragment** in the address bar and reload to see changes
4. **Use the "Reload from URL" button** to force reload without page refresh
5. **Use the "Reset to Default" button** to clear the URL and load defaults

## URL Fragment Format

The URL fragment follows this pattern:
```
#d=color1:values1,color2:values2,...
```

Where:
- `d` = distributions (color:encodedValues pairs)

Visual parameters (active distribution, visibility, scale) are not stored and use default values when loading from URL.

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
