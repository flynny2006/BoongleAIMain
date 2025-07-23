const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  try {
    // --- Step 1: Create the 'dist' directory ---
    const distDir = 'dist';
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    // --- Step 2: Build and bundle the TypeScript/React code ---
    await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: path.join(distDir, 'main.js'),
      loader: { '.tsx': 'tsx' },
      // This safely injects the API key from Netlify's environment
      define: {
        'process.env.API_KEY': `"${process.env.API_KEY}"`,
      },
      logLevel: 'info',
    });

    // --- Step 3: Read, modify, and write index.html for production ---
    let html = fs.readFileSync('index.html', 'utf-8');

    // Remove the importmap script block, as it's no longer needed
    html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');

    // Replace the development script with the production bundle
    html = html.replace(
      '<script type="module" src="/index.tsx"></script>',
      '<script src="/main.js" defer></script>'
    );

    fs.writeFileSync(path.join(distDir, 'index.html'), html);

    console.log('✅ Build successful!');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();