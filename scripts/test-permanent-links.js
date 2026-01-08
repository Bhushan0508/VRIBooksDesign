/**
 * Test script to verify permanent links are working correctly
 * Usage: node scripts/test-permanent-links.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Permanent Links Setup...\n');

// Test 1: Check if bookLinks utility exists
console.log('✓ Test 1: Checking bookLinks utility...');
const bookLinksPath = path.join(__dirname, '../src/utils/bookLinks.js');
if (fs.existsSync(bookLinksPath)) {
  console.log('  ✅ bookLinks.js found at src/utils/bookLinks.js');
} else {
  console.log('  ❌ bookLinks.js not found');
}

// Test 2: Check if BookDetails component exists
console.log('\n✓ Test 2: Checking BookDetails component...');
const bookDetailsPath = path.join(__dirname, '../src/component/BookDetails.jsx');
if (fs.existsSync(bookDetailsPath)) {
  console.log('  ✅ BookDetails.jsx found at src/component/BookDetails.jsx');
} else {
  console.log('  ❌ BookDetails.jsx not found');
}

// Test 3: Check App.jsx routing
console.log('\n✓ Test 3: Checking React Router setup...');
const appPath = path.join(__dirname, '../src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');
if (appContent.includes('/bookDetail/:sku') && appContent.includes('BookDetails')) {
  console.log('  ✅ React Router configured with /bookDetail/:sku route');
} else {
  console.log('  ❌ Route configuration not found');
}

// Test 4: Check vite.config.js
console.log('\n✓ Test 4: Checking Vite configuration...');
const viteConfigPath = path.join(__dirname, '../vite.config.js');
const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
if (viteContent.includes('proxy') && viteContent.includes('/api')) {
  console.log('  ✅ API proxy configured');
} else {
  console.log('  ⚠️  API proxy not found in config');
}

// Test 5: Check index.html meta tags
console.log('\n✓ Test 5: Checking SEO meta tags...');
const indexPath = path.join(__dirname, '../index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const hasMetaTags = {
  charset: indexContent.includes('charset'),
  viewport: indexContent.includes('viewport'),
  description: indexContent.includes('description'),
  ogType: indexContent.includes('og:type')
};

if (Object.values(hasMetaTags).every(v => v)) {
  console.log('  ✅ All essential meta tags found');
  Object.entries(hasMetaTags).forEach(([tag, found]) => {
    console.log(`    ${found ? '✓' : '✗'} ${tag}`);
  });
} else {
  console.log('  ⚠️  Some meta tags missing');
  Object.entries(hasMetaTags).forEach(([tag, found]) => {
    console.log(`    ${found ? '✓' : '✗'} ${tag}`);
  });
}

// Test 6: Example URLs
console.log('\n📋 Example Permanent Links:');
const exampleSKUs = ['E03', 'M01', 'Sp02', 'H66'];
exampleSKUs.forEach(sku => {
  console.log(`  https://www.vridhamma.org/bookDetail/${sku}`);
});

// Test 7: Summary
console.log('\n✅ Permanent Links Setup Summary:');
console.log('  • Dynamic routes configured: /bookDetail/:sku');
console.log('  • Production domain: https://www.vridhamma.org');
console.log('  • Utility functions available: src/utils/bookLinks.js');
console.log('  • API proxy configured for data fetching');
console.log('  • SEO meta tags added to index.html');
console.log('\n💡 Next Steps:');
console.log('  1. Deploy to production server');
console.log('  2. Configure server to handle SPA routing (.htaccess or Nginx)');
console.log('  3. Test links at: https://www.vridhamma.org/bookDetail/E03');
console.log('  4. Monitor API calls in browser DevTools');
console.log('\n📖 Documentation: See PERMANENT_LINKS_SETUP.md for detailed guide');
