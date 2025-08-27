# Example URLs for Testing URL Control

These example URLs demonstrate how the widget can be controlled entirely through the URL fragment. Simply append any of these fragments to your demo URL to see the widget load with different states.

## Base URL
```
http://localhost:8000/demo-url-state.html
```

## Example 1: Complete Distribution Set
```
http://localhost:8000/demo-url-state.html#d=blue:02S05K08C0B40DW,green:02S05K08C0B40DW,red:02S05K08C0B40DW,purple:02S05K08C0B40DW,orange:02S05K08C0B40DW,yellow:02S05K08C0B40DW
```
- All 6 distributions with identical values
- Visual parameters (active distribution, visibility, scale) use defaults

## Example 2: Varied Distribution Set
```
http://localhost:8000/demo-url-state.html#d=blue:02S05K08C0B40DW,green:05K08C0B40DW0GO,red:08C0B40DW0GO0P0,purple:0B40DW0GO0P005K,orange:0DW0GO0P005K08C,yellow:0GO0P005K08C0B4
```
- All 6 distributions with different values
- Visual parameters use defaults

## Example 3: Peak Distribution Pattern
```
http://localhost:8000/demo-url-state.html#d=blue:02S05K08C0B40DW,green:05K08C0B40DW0GO,red:08C0B40DW0GO0P0,purple:0B40DW0GO0P005K,orange:0DW0GO0P005K08C,yellow:0GO0P005K08C0B4
```
- All 6 distributions with peak patterns
- Visual parameters use defaults

## Example 4: Complex State
```
http://localhost:8000/demo-url-state.html#d=blue:02S05K08C0B40DW,green:05K08C0B40DW0GO,red:08C0B40DW0GO0P0,purple:0B40DW0GO0P005K,orange:0DW0GO0P005K08C,yellow:0GO0P005K08C0B4
```
- All 6 distributions with complex patterns
- Visual parameters (active distribution, visibility, scale) use defaults

## Example 5: Partial State (Blue and Red Only)
```
http://localhost:8000/demo-url-state.html#d=blue:02S05K08C0B40DW,red:05K08C0B40DW0GO
```
- Blue and red distributions from URL
- Green, purple, orange, and yellow filled with defaults
- Visual parameters use defaults

## Example 6: Single Distribution
```
http://localhost:8000/demo-url-state.html#d=blue:02S05K08C0B40DW
```
- Blue distribution from URL
- All other colors filled with defaults
- Visual parameters use defaults

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
- **Partial states supported**: You can include any subset of the 6 colors (blue, green, red, purple, orange, yellow)
- Missing colors are automatically filled with default values

Visual parameters (active distribution, visibility, scale) are not stored and use default values when loading from URL.

## Value Encoding

Distribution values are encoded using fixed-width base36:
- Each probability value (0.0-1.0) is converted to an integer (0-1000)
- Each integer is converted to a 3-character base36 string (padded with zeros, uppercase)
- No separators are needed between values due to fixed width

**Example:**
- Probability `0.1` → Integer `100` → Base36 `"02S"`
- Probability `0.5` → Integer `500` → Base36 `"0DW"`
- Values `[0.1, 0.5]` → `"02S0DW"`

## Creating Your Own URLs

1. **Draw distributions** in the widget
2. **Copy the URL** from the address bar
3. **Share the URL** with others
4. **Recipients will see** your exact distributions when they open the URL

**Note**: When sharing partial states, recipients will see a console warning indicating which colors were filled with default values. This helps users understand what was loaded from the URL vs. what was filled automatically.

## Error Handling and Validation

The widget includes robust validation for URL fragments:

- **Invalid distributions** are rejected and the widget falls back to initialization state
- **Invalid colors** (not in the allowed set: blue, green, red, purple, orange, yellow) are rejected
- **Invalid encoded values** (wrong length, invalid base36 characters, out-of-range values) are rejected
- **Duplicate colors** are rejected
- **Malformed fragments** (missing colors or values) are rejected

**Partial State Support**: The widget gracefully handles partial URL fragments. If some colors are missing from the URL, the widget will:
- Load the valid distributions from the URL
- Fill missing colors with default initialization values
- Log a warning about which colors were filled with defaults

This allows users to share partial states while ensuring the widget always has a complete set of 6 distributions.

## Browser Navigation

- **Back/Forward buttons** work with URL changes
- **Bookmark any URL** to save a specific state
- **Edit URL directly** in address bar and reload
- **Share URLs** via email, chat, or social media
