#!/usr/bin/env node

/**
 * Build script for Safe Browsing Guard
 * Generates both Chrome and Firefox extension packages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building Safe Browsing Guard for Chrome and Firefox...\n');

// Configuration
const version = '2.0.0';
const buildDir = 'build';
const chromeDir = path.join(buildDir, 'chrome');
const firefoxDir = path.join(buildDir, 'firefox');

// Files to copy to both builds
const sharedFiles = [
    'background.js',
    'advancedDetection.js',
    'downloadAnalyzer.js',
    'config.js',
    'utils.js',
    'popup.html',
    'popup.js',
    'style.css',
    'options.html',
    'options.js',
    'options.css',
    'CHANGELOG.md',
    'privacy_policy.md',
    'privacy_practices.md',
    'LICENSE'
];

const sharedDirs = [
    'icons',
    'utils'
];

// Clean build directory
console.log('🧹 Cleaning build directory...');
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
}

// Create build directories
fs.mkdirSync(chromeDir, { recursive: true });
fs.mkdirSync(firefoxDir, { recursive: true });

// Copy shared files
console.log('📦 Copying shared files...');
sharedFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(chromeDir, file));
        fs.copyFileSync(file, path.join(firefoxDir, file));
        console.log(`  ✓ ${file}`);
    }
});

// Copy shared directories
console.log('📁 Copying shared directories...');
sharedDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDir(dir, path.join(chromeDir, dir));
        copyDir(dir, path.join(firefoxDir, dir));
        console.log(`  ✓ ${dir}/`);
    }
});

// Copy browser-specific manifests
console.log('📄 Copying browser-specific manifests...');
fs.copyFileSync('manifest.json', path.join(chromeDir, 'manifest.json'));
console.log('  ✓ Chrome manifest');

if (fs.existsSync('manifest.firefox.json')) {
    fs.copyFileSync('manifest.firefox.json', path.join(firefoxDir, 'manifest.json'));
    console.log('  ✓ Firefox manifest');
} else {
    console.warn('  ⚠ Firefox manifest not found, using Chrome manifest');
    fs.copyFileSync('manifest.json', path.join(firefoxDir, 'manifest.json'));
}

// Copy READMEs
if (fs.existsSync('README_V2.md')) {
    fs.copyFileSync('README_V2.md', path.join(chromeDir, 'README.md'));
    fs.copyFileSync('README_V2.md', path.join(firefoxDir, 'README.md'));
    console.log('  ✓ README');
}

// Create ZIP packages
console.log('\n📦 Creating distribution packages...');

try {
    // Chrome package
    process.chdir(chromeDir);
    execSync(`zip -r ../safe-browsing-guard-chrome-v${version}.zip .`, { stdio: 'pipe' });
    process.chdir('../..');
    console.log(`  ✓ build/safe-browsing-guard-chrome-v${version}.zip`);

    // Firefox package
    process.chdir(firefoxDir);
    execSync(`zip -r ../safe-browsing-guard-firefox-v${version}.zip .`, { stdio: 'pipe' });
    process.chdir('../..');
    console.log(`  ✓ build/safe-browsing-guard-firefox-v${version}.zip`);
} catch (error) {
    console.error('  ✗ Error creating ZIP files:', error.message);
    process.exit(1);
}

// Print summary
console.log('\n✨ Build complete!\n');
console.log('📊 Build Summary:');
console.log(`  Version: ${version}`);
console.log(`  Chrome package: build/safe-browsing-guard-chrome-v${version}.zip`);
console.log(`  Firefox package: build/safe-browsing-guard-firefox-v${version}.zip`);

// Get package sizes
const chromeZip = path.join(buildDir, `safe-browsing-guard-chrome-v${version}.zip`);
const firefoxZip = path.join(buildDir, `safe-browsing-guard-firefox-v${version}.zip`);

if (fs.existsSync(chromeZip)) {
    const chromeSize = (fs.statSync(chromeZip).size / 1024).toFixed(2);
    console.log(`  Chrome size: ${chromeSize} KB`);
}

if (fs.existsSync(firefoxZip)) {
    const firefoxSize = (fs.statSync(firefoxZip).size / 1024).toFixed(2);
    console.log(`  Firefox size: ${firefoxSize} KB`);
}

console.log('\n🎉 Ready for distribution!');
console.log('\n📝 Next steps:');
console.log('  1. Test Chrome extension: Load build/chrome/ as unpacked extension');
console.log('  2. Test Firefox extension: Load build/firefox/ as temporary add-on');
console.log('  3. Submit to Chrome Web Store: Use build/safe-browsing-guard-chrome-v' + version + '.zip');
console.log('  4. Submit to Firefox Add-ons: Use build/safe-browsing-guard-firefox-v' + version + '.zip');

// Helper function to copy directory recursively
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
