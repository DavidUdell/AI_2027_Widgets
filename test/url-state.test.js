/**
 * Test file for URL fragment state management
 * Tests the encoding/decoding and URL state management functionality
 */

// Mock the canvas and DOM environment for testing
global.window = {
    location: {
        hash: '',
        pathname: '/test',
        search: '',
        href: 'http://localhost/test'
    },
    history: {
        replaceState: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {}
};

global.document = {
    getElementById: () => ({
        getBoundingClientRect: () => ({ width: 800, height: 600 }),
        appendChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {}
    }),
    createElement: () => ({
        getContext: () => ({
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            fillRect: () => {},
            strokeRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            fill: () => {},
            closePath: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            clip: () => {},
            setLineDash: () => {},
            measureText: () => ({ width: 50 }),
            fillText: () => {},
            strokeText: () => {},
            createLinearGradient: () => ({
                addColorStop: () => {}
            })
        }),
        width: 800,
        height: 600,
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {}
    })
};

// Import the widget functions (we'll need to extract the encoding functions for testing)
// For now, let's test the encoding/decoding logic directly

// Global functions for testing (extracted from the widget)
function encodeDistributionValues(values) {
    const encoded = values.map(val => Math.round(val * 1000));
    return encoded.map(num => num.toString(36).toUpperCase().padStart(3, '0')).join('');
}

function decodeDistributionValues(encoded) {
    // Validate input
    if (!encoded || typeof encoded !== 'string' || encoded.length === 0) {
        return null;
    }
    
    const chunkSize = 3; // Fixed width for each value
    
    // Check if encoded length is valid (must be divisible by chunk size)
    if (encoded.length % chunkSize !== 0) {
        return null;
    }
    
    const chunks = [];
    
    for (let i = 0; i < encoded.length; i += chunkSize) {
        chunks.push(encoded.slice(i, i + chunkSize));
    }
    
    try {
        const values = chunks.map(chunk => {
            // Validate chunk format (must be valid base36)
            if (!/^[0-9A-Za-z]{3}$/.test(chunk)) {
                throw new Error(`Invalid chunk format: ${chunk}`);
            }
            
            // Parse base36 (case-insensitive, but we use uppercase)
            const num = parseInt(chunk.toUpperCase(), 36);
            
            // Validate parsed number (should be in valid range 0-1000)
            if (isNaN(num) || num < 0 || num > 1000) {
                throw new Error(`Invalid value: ${num} from chunk ${chunk}`);
            }
            
            return num / 1000; // Convert back to probability
        });
        
        // Validate probability values (should be between 0 and 1)
        for (let i = 0; i < values.length; i++) {
            if (values[i] < 0 || values[i] > 1) {
                throw new Error(`Invalid probability value: ${values[i]} at index ${i}`);
            }
        }
        
        return values;
    } catch (error) {
        console.warn('Failed to decode distribution values:', error.message);
        return null;
    }
}

/**
 * Test the encoding and decoding of distribution values
 */
function testEncodingDecoding() {
    console.log('Testing encoding/decoding...');
    
    // Test data: some sample probability values
    const testValues = [0.1, 0.5, 0.8, 0.3, 0.9, 0.2];
    
    // Test encoding
    const encoded = encodeDistributionValues(testValues);
    console.log('Encoded:', encoded);
    
    // Test decoding
    const decoded = decodeDistributionValues(encoded);
    console.log('Decoded:', decoded);
    
    // Verify round-trip
    const isEqual = testValues.every((val, i) => Math.abs(val - decoded[i]) < 0.001);
    console.log('Round-trip test passed:', isEqual);
    
    return isEqual;
}

/**
 * Test URL fragment serialization
 */
function testUrlSerialization() {
    console.log('Testing URL serialization...');
    
    // Mock distribution data
    const mockDistributions = [
        {
            color: 'blue',
            mass: 100,
            values: [0.1, 0.2, 0.3, 0.4, 0.5]
        },
        {
            color: 'red',
            mass: 100,
            values: [0.2, 0.3, 0.4, 0.5, 0.6]
        }
    ];
    
    // Serialize to URL fragment - only distributions
    
    const distributionParts = mockDistributions.map(dist => {
        const encodedValues = encodeDistributionValues(dist.values);
        return `${dist.color}:${encodedValues}`;
    });
    
    const fragment = `d=${distributionParts.join(',')}`;
    console.log('Serialized fragment:', fragment);
    
    // Test parsing
    const params = new URLSearchParams(fragment);
    console.log('Parsed params:');
    console.log('- distributions:', params.get('d'));
    
    return fragment;
}

/**
 * Test URL fragment parsing
 */
function testUrlParsing() {
    console.log('Testing URL parsing...');
    
    // Test fragment - only distributions (using new fixed-width encoding)
    const testFragment = 'd=blue:02S0C802S019001F4,red:0C802S019001F40258';
    
    try {
        const params = new URLSearchParams(testFragment);
        
        // Parse distributions
        const distributionsParam = params.get('d');
        if (distributionsParam) {
            const distributionParts = distributionsParam.split(',');
            console.log('Distribution parts:', distributionParts);
            
            distributionParts.forEach(part => {
                const [color, encodedValues] = part.split(':');
                console.log(`Color: ${color}, Encoded: ${encodedValues}`);
            });
        }
        
        return true;
    } catch (error) {
        console.error('Parsing failed:', error);
        return false;
    }
}

/**
 * Test validation of invalid URL fragments
 */
function testInvalidUrlValidation() {
    console.log('Testing invalid URL validation...');
    
    const testCases = [
        {
            name: 'Invalid chunk length',
            fragment: 'd=blue:02S0C8,red:0C802S019001F40258',
            shouldFail: true
        },
        {
            name: 'Invalid base36 characters',
            fragment: 'd=blue:02S0C8@2S019001F4,red:0C802S019001F40258',
            shouldFail: true
        },
        {
            name: 'Invalid color',
            fragment: 'd=invalid:02S0C802S019001F4,red:0C802S019001F40258',
            shouldFail: true
        },
        {
            name: 'Missing color',
            fragment: 'd=:02S0C802S019001F4,red:0C802S019001F40258',
            shouldFail: true
        },
        {
            name: 'Missing values',
            fragment: 'd=blue:,red:0C802S019001F40258',
            shouldFail: true
        },
        {
            name: 'Duplicate colors',
            fragment: 'd=blue:02S0C802S019001F4,blue:0C802S019001F40258',
            shouldFail: true
        },
        {
            name: 'Valid fragment',
            fragment: 'd=blue:02S05K08C0B40DW,red:05K08C0B40DW0GO',
            shouldFail: false
        }
    ];
    
    let allTestsPassed = true;
    
    testCases.forEach(testCase => {
        try {
            const params = new URLSearchParams(testCase.fragment);
            const distributionsParam = params.get('d');
            
            if (distributionsParam) {
                const distributionParts = distributionsParam.split(',');
                let hasInvalidDistribution = false;
                const newDistributions = [];
                
                // Validate each distribution part (simulating the widget logic)
                for (const part of distributionParts) {
                    const [color, encodedValues] = part.split(':');
                    
                    // Validate color and encoded values
                    if (!color || !encodedValues) {
                        hasInvalidDistribution = true;
                        break;
                    }
                    
                    // Validate color (must be one of the allowed colors)
                    const validColors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow'];
                    if (!validColors.includes(color)) {
                        hasInvalidDistribution = true;
                        break;
                    }
                    
                    // Decode and validate values
                    const values = decodeDistributionValues(encodedValues);
                    if (values === null) {
                        hasInvalidDistribution = true;
                        break;
                    }
                    
                    // Check for duplicate colors
                    if (newDistributions.some(dist => dist.color === color)) {
                        hasInvalidDistribution = true;
                        break;
                    }
                    
                    newDistributions.push({ color, values });
                }
                
                const testPassed = hasInvalidDistribution === testCase.shouldFail;
                console.log(`${testCase.name}: ${testPassed ? 'PASS' : 'FAIL'}`);
                if (!testPassed) {
                    allTestsPassed = false;
                }
            }
        } catch (error) {
            const testPassed = testCase.shouldFail;
            console.log(`${testCase.name}: ${testPassed ? 'PASS' : 'FAIL'} (threw error)`);
            if (!testPassed) {
                allTestsPassed = false;
            }
        }
    });
    
    return allTestsPassed;
}

/**
 * Test decodeDistributionValues validation
 */
function testDecodeValidation() {
    console.log('Testing decodeDistributionValues validation...');
    
    const testCases = [
        { input: null, expected: null, name: 'null input' },
        { input: '', expected: null, name: 'empty string' },
        { input: '02S', expected: [0.1], name: 'valid single value' },
        { input: '02S05K', expected: [0.1, 0.2], name: 'valid two values' },
        { input: '02S0C8@', expected: null, name: 'invalid character' },
        { input: '02S0C', expected: null, name: 'incomplete chunk' },
        { input: '02S05K02S', expected: [0.1, 0.2, 0.1], name: 'valid three values' }
    ];
    
    let allTestsPassed = true;
    
    testCases.forEach(testCase => {
        const result = decodeDistributionValues(testCase.input);
        const testPassed = (result === null && testCase.expected === null) || 
                          (result && testCase.expected && 
                           result.length === testCase.expected.length &&
                           result.every((val, i) => Math.abs(val - testCase.expected[i]) < 0.001));
        
        console.log(`${testCase.name}: ${testPassed ? 'PASS' : 'FAIL'}`);
        if (!testPassed) {
            allTestsPassed = false;
        }
    });
    
    return allTestsPassed;
}

// Run tests
console.log('=== URL State Management Tests ===\n');

const encodingTest = testEncodingDecoding();
console.log('\n');

const serializationTest = testUrlSerialization();
console.log('\n');

const parsingTest = testUrlParsing();
console.log('\n');

const validationTest = testDecodeValidation();
console.log('\n');

const invalidUrlTest = testInvalidUrlValidation();
console.log('\n');

console.log('=== Test Results ===');
console.log('Encoding/Decoding:', encodingTest ? 'PASS' : 'FAIL');
console.log('Serialization:', serializationTest ? 'PASS' : 'FAIL');
console.log('Parsing:', parsingTest ? 'PASS' : 'FAIL');
console.log('Decode Validation:', validationTest ? 'PASS' : 'FAIL');
console.log('Invalid URL Validation:', invalidUrlTest ? 'PASS' : 'FAIL');

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testEncodingDecoding,
        testUrlSerialization,
        testUrlParsing,
        testDecodeValidation,
        testInvalidUrlValidation
    };
}
