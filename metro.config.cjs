const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Explicitly define extensions to ensure proper resolution on Windows with SDK 54, but merge with defaults
const customExts = [
    'native.ts', 'native.tsx', 'native.js', 'native.jsx',
    'android.ts', 'android.tsx', 'android.js', 'android.jsx'
];

// Add custom extensions to the beginning of sourceExts
config.resolver.sourceExts = [
    ...customExts,
    ...config.resolver.sourceExts.filter(ext => !customExts.includes(ext)),
    'cjs', 'mjs' // Ensure these are present
];

// Deduplicate
config.resolver.sourceExts = [...new Set(config.resolver.sourceExts)];

module.exports = config;
