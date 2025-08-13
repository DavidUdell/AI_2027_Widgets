import fs from 'fs';
import path from 'path';

/**
 * Post-build script for demo deployment
 * Handles script injection and deployment file generation
 */

const DIST_DIR = 'dist';
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

function findBuiltJavaScript() {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets directory not found: ${ASSETS_DIR}`);
  }
  
  const jsFiles = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.js'));
  if (jsFiles.length === 0) {
    throw new Error('No JavaScript files found in assets directory');
  }
  
  return jsFiles[0]; // Return the first JS file (should be the main one)
}

function injectScriptTag(jsFile) {
  const demoPath = path.join(DIST_DIR, 'demo.html');
  
  if (!fs.existsSync(demoPath)) {
    throw new Error(`Demo HTML file not found: ${demoPath}`);
  }
  
  let demoContent = fs.readFileSync(demoPath, 'utf8');
  
  // Create the script tag with the correct asset path
  const scriptTag = `    <script type="module" src="./assets/${jsFile}"></script>`;
  
  // Inject before closing body tag
  if (demoContent.includes('</body>')) {
    demoContent = demoContent.replace('</body>', `${scriptTag}\n</body>`);
  } else {
    throw new Error('No closing </body> tag found in demo.html');
  }
  
  // Write back to file
  fs.writeFileSync(demoPath, demoContent);
  
  return jsFile;
}

function createIndexHtml() {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 2027 Widgets Demo</title>
    <meta http-equiv="refresh" content="0; url=./demo.html">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 50px;
            background: #f8f9fa;
        }
        .redirect-message {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="redirect-message">
        <h1>AI 2027 Widgets Demo</h1>
        <p>Redirecting to the demo page...</p>
        <p>If you're not redirected automatically, <a href="./demo.html">click here</a>.</p>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
}

function createNetlifyRedirects() {
  const redirects = `/*    /demo.html   200`;
  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirects);
}

function main() {
  try {
    console.log('🔧 Running demo post-build fixes...');
    
    // Find and inject the built JavaScript
    const jsFile = findBuiltJavaScript();
    injectScriptTag(jsFile);
    console.log(`✅ Injected script tag for ${jsFile}`);
    
    // Create deployment files
    createIndexHtml();
    console.log('✅ Created index.html redirect page');
    
    createNetlifyRedirects();
    console.log('✅ Created _redirects file for Netlify');
    
    console.log('🎉 Demo build completed successfully!');
  } catch (error) {
    console.error('❌ Demo build failed:', error.message);
    process.exit(1);
  }
}

main();
