#!/usr/bin/env node

/**
 * Script to sign the Firefox extension using Mozilla Add-ons API keys
 * This script uses dotenv to load keys from a .env file (which should be git-ignored)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: .env file not found!');
  console.log('Please create a .env file with your API keys. You can use .env.example as a template.');
  console.log('\x1b[36m%s\x1b[0m', `cp ${envExamplePath} ${envPath}`);
  console.log('Then add your API keys from: https://addons.mozilla.org/en-US/developers/addon/api/key/');
  process.exit(1);
}

// Load environment variables from .env file
require('dotenv').config();

const { AMO_API_KEY, AMO_API_SECRET } = process.env;

// Check if API keys are provided
if (!AMO_API_KEY || !AMO_API_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing API keys in .env file!');
  console.log('Make sure your .env file contains:');
  console.log('AMO_API_KEY=your_jwt_issuer_here');
  console.log('AMO_API_SECRET=your_jwt_secret_here');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', 'Signing Firefox extension with Mozilla Add-ons API...');

try {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'));
  }

  // Execute web-ext sign command
  execSync(
    `npx web-ext sign --api-key="${AMO_API_KEY}" --api-secret="${AMO_API_SECRET}" --source-dir=. --artifacts-dir=./dist`,
    { stdio: 'inherit' }
  );

  console.log('\x1b[32m%s\x1b[0m', 'Extension signed successfully!');
  console.log('The signed .xpi file is available in the dist/ directory');
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Error signing extension:');
  console.error(error.message);
  process.exit(1);
}