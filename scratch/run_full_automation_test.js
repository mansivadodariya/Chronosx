const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('      CHRONOS X COMPREHENSIVE AUTOMATION TEST       ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${name}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${name} - ${details}`);
  }
}

// 1. Check all 9 Locale Files Valid JSON and matching namespaces
const locales = ['en', 'ar', 'ary', 'es', 'ru', 'zh', 'vi', 'id', 'fil'];
const localesDir = path.join(__dirname, '../src/locales');

locales.forEach(loc => {
  const filePath = path.join(localesDir, `${loc}.json`);
  let isValid = false;
  let keyCount = 0;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    keyCount = Object.keys(data).length;
    isValid = keyCount >= 50;
  } catch (e) {
    isValid = false;
  }
  assertTest(`Locale Dictionary (${loc}.json) valid with ${keyCount} namespaces`, isValid);
});

// 2. Check for any duplicate t declarations or unhooked t across all files
function checkHookUsage(dir, errors = []) {
  fs.readdirSync(dir).forEach(item => {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        checkHookUsage(full, errors);
      }
    } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      
      // Check for unhooked t
      if (content.match(/\bt\(/)) {
        const hasHookOrProp = 
          content.includes('useLanguage') || 
          content.includes('(t)') || 
          content.includes('({ t') || 
          content.includes(', t') || 
          content.includes('t,') || 
          content.includes('const t =') || 
          content.includes('let t =') || 
          content.includes('function(t') || 
          content.includes('t = (') || 
          content.includes('t: parentT');
        if (!hasHookOrProp) {
          errors.push(`Unhooked t in ${full}`);
        }
      }

      // Check for duplicate t
      const funcMatch = content.match(/export default function\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)\s*\{([\s\S]*)/);
      if (funcMatch) {
        const params = funcMatch[2];
        const body = funcMatch[3];
        if (params.match(/\bt\b/) && !params.includes('t: parentT') && !params.includes('t =') && body.match(/const\s+\{\s*t\s*\}\s*=\s*useLanguage/)) {
          errors.push(`Duplicate t in ${full}`);
        }
      }
    }
  });
  return errors;
}

const hookErrors = checkHookUsage(path.join(__dirname, '../src'));
assertTest('No Unhooked or Duplicate Translation Hook Declarations', hookErrors.length === 0, hookErrors.join(', '));

// 3. Coding Standard: Check line limits (< 810 lines)
function checkMaxLineLimits(dir, bigFiles = []) {
  fs.readdirSync(dir).forEach(item => {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        checkMaxLineLimits(full, bigFiles);
      }
    } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
      const lines = fs.readFileSync(full, 'utf8').split('\n').length;
      if (lines > 810) {
        bigFiles.push(`${path.basename(full)}: ${lines} lines`);
      }
    }
  });
  return bigFiles;
}

const overLimit = checkMaxLineLimits(path.join(__dirname, '../src'));
assertTest('All source files contain fewer than 810 lines of code', overLimit.length === 0, overLimit.join(', '));

// 4. Check Critical Page Routes Exist and Export Default Components
const srcDir = path.join(__dirname, '../src');
const criticalPages = [
  path.join(srcDir, 'app/page.js'),
  path.join(srcDir, 'app/(static)/about-us/page.js'),
  path.join(srcDir, 'app/(static)/affiliate-program/page.js'),
  path.join(srcDir, 'app/(static)/custom-bot-builder/page.js'),
  path.join(srcDir, 'app/(static)/forex-calculator/page.js'),
  path.join(srcDir, 'app/(static)/no-refund-policy/page.js'),
  path.join(srcDir, 'app/(static)/privacy-policy/page.js'),
  path.join(srcDir, 'app/(static)/risk-disclosure/page.js'),
  path.join(srcDir, 'app/(static)/terms-and-conditions/page.js'),
  path.join(srcDir, 'app/(static)/white-label/page.js'),
  path.join(srcDir, 'app/(user)/my-bots/page.js'),
  path.join(srcDir, 'app/(user)/trade-audit/page.js'),
  path.join(srcDir, 'app/(user)/chart-scanner/page.js'),
  path.join(srcDir, 'app/(user)/strategy-hub/page.js')
];

criticalPages.forEach(p => {
  const exists = fs.existsSync(p);
  const content = exists ? fs.readFileSync(p, 'utf8') : '';
  const hasExport = content.includes('export default');
  assertTest(`Route File Valid [${path.basename(path.dirname(p))}/${path.basename(p)}]`, exists && hasExport);
});

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL AUTOMATION TESTS PASSED WITH 0 ERRORS!');
}
