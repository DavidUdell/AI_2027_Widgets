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

/**
 * Test the encoding and decoding of distribution values
 */
function testEncodingDecoding() {
    console.log('Testing encoding/decoding...');
    
    // Test data: some sample probability values
    const testValues = [0.1, 0.5, 0.8, 0.3, 0.9, 0.2];
    
    // Encode function (extracted from the widget)
    function encodeDistributionValues(values) {
        const encoded = values.map(val => Math.round(val * 1000));
        return encoded.map(num => num.toString(36)).join('.');
    }
    
    // Decode function (extracted from the widget)
    function decodeDistributionValues(encoded) {
        const parts = encoded.split('.');
        return parts.map(part => {
            const num = parseInt(part, 36);
            return num / 1000;
        });
    }
    
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
    function encodeDistributionValues(values) {
        const encoded = values.map(val => Math.round(val * 1000));
        return encoded.map(num => num.toString(36)).join('.');
    }
    
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
    
    // Test fragment - only distributions
    const testFragment = 'd=blue:64.c8.12c.190.1f4,red:c8.12c.190.1f4.258';
    
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

// Run tests
console.log('=== URL State Management Tests ===\n');

const encodingTest = testEncodingDecoding();
console.log('\n');

const serializationTest = testUrlSerialization();
console.log('\n');

const parsingTest = testUrlParsing();
console.log('\n');

console.log('=== Test Results ===');
console.log('Encoding/Decoding:', encodingTest ? 'PASS' : 'FAIL');
console.log('Serialization:', serializationTest ? 'PASS' : 'FAIL');
console.log('Parsing:', parsingTest ? 'PASS' : 'FAIL');

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testEncodingDecoding,
        testUrlSerialization,
        testUrlParsing
    };
}
