#!/usr/bin/env node
/**
 * Touch Target Audit Script
 * Analyzes interactive elements for WCAG 2.5.5 compliance
 * Target: 48×48px minimum (geriatric-friendly)
 * WCAG 2.5.8 AA: 24×24px minimum
 */

const fs = require('fs');
const path = require('path');

// Padding sizes in Tailwind (in px, assuming 1rem = 16px)
const tailwindPadding = {
  'p-1': 4, 'p-2': 8, 'p-3': 12, 'p-4': 16, 'p-5': 20, 'p-6': 24,
  'py-1': 4, 'py-1.5': 6, 'py-2': 8, 'py-3': 12, 'py-4': 16,
  'px-1': 4, 'px-2': 8, 'px-3': 12, 'px-4': 16, 'px-5': 20, 'px-6': 24,
  'min-h-12': 48, 'min-h-11': 44, 'min-h-10': 40,
  'h-8': 32, 'h-10': 40, 'h-12': 48, 'h-14': 56, 'h-16': 64,
  'w-8': 32, 'w-10': 40, 'w-12': 48, 'w-14': 56, 'w-16': 64,
};

const findings = {
  critical: [], // < 24px (fails WCAG 2.5.8 AA)
  warning: [],  // 24-47px (passes AA but not geriatric standard)
  pass: [],     // >= 48px
  unknown: [],  // Can't determine from className alone
};

function extractPadding(className) {
  const paddingClasses = className.match(/\b(p[xy]?-[\d.]+|min-[hw]-\d+|[hw]-\d+)\b/g) || [];
  let verticalPadding = 0;
  let horizontalPadding = 0;
  let minHeight = 0;
  let minWidth = 0;

  paddingClasses.forEach(cls => {
    const size = tailwindPadding[cls];
    if (size !== undefined) {
      if (cls.startsWith('py-') || cls.startsWith('p-')) {
        verticalPadding = Math.max(verticalPadding, size);
      }
      if (cls.startsWith('px-') || cls.startsWith('p-')) {
        horizontalPadding = Math.max(horizontalPadding, size);
      }
      if (cls.startsWith('min-h-') || cls.startsWith('h-')) {
        minHeight = Math.max(minHeight, size);
      }
      if (cls.startsWith('min-w-') || cls.startsWith('w-')) {
        minWidth = Math.max(minWidth, size);
      }
    }
  });

  return { verticalPadding, horizontalPadding, minHeight, minWidth };
}

function estimateTouchTargetSize(padding) {
  const { verticalPadding, minHeight } = padding;

  // If explicit height is set and >= 48px, it passes
  if (minHeight >= 48) return { estimated: minHeight, status: 'pass' };
  if (minHeight > 0 && minHeight < 24) return { estimated: minHeight, status: 'critical' };
  if (minHeight >= 24 && minHeight < 48) return { estimated: minHeight, status: 'warning' };

  // Estimate based on padding + typical text height
  // text-sm = ~14px line-height ~20px
  // text-base = ~16px line-height ~24px
  const estimatedHeight = (verticalPadding * 2) + 20; // Assuming text-sm default

  if (estimatedHeight < 24) return { estimated: estimatedHeight, status: 'critical' };
  if (estimatedHeight < 48) return { estimated: estimatedHeight, status: 'warning' };
  return { estimated: estimatedHeight, status: 'pass' };
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Patterns for interactive elements
  const patterns = [
    { regex: /<button([^>]*)>/g, type: 'button' },
    { regex: /<a([^>]*)>/g, type: 'link' },
    { regex: /role="button"([^>]*)>/g, type: 'role-button' },
    { regex: /type="button"([^>]*)>/g, type: 'input-button' },
  ];

  patterns.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const elementText = match[0];
      const lineNumber = content.substring(0, match.index).split('\n').length;

      // Extract className
      const classMatch = elementText.match(/className=["']([^"']*)["']/);
      if (classMatch) {
        const className = classMatch[1];
        const padding = extractPadding(className);
        const { estimated, status } = estimateTouchTargetSize(padding);

        const finding = {
          file: path.relative(process.cwd(), filePath),
          line: lineNumber,
          type,
          className,
          estimatedSize: estimated,
          padding,
        };

        findings[status].push(finding);
      } else {
        findings.unknown.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNumber,
          type,
          note: 'No className found - manual review needed',
        });
      }
    }
  });
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      scanFile(fullPath);
    }
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
console.log('🔍 Scanning for touch target compliance...\n');
scanDirectory(srcDir);

// Report results
console.log('📊 TOUCH TARGET AUDIT RESULTS');
console.log('═'.repeat(80));
console.log();

if (findings.critical.length > 0) {
  console.log(`❌ CRITICAL (${findings.critical.length} elements < 24px - WCAG 2.5.8 AA FAIL):`);
  console.log('─'.repeat(80));
  findings.critical.forEach(f => {
    console.log(`  ${f.file}:${f.line}`);
    console.log(`    Type: ${f.type}`);
    console.log(`    Estimated size: ~${f.estimatedSize}px`);
    console.log(`    Classes: ${f.className.substring(0, 80)}`);
    console.log();
  });
}

if (findings.warning.length > 0) {
  console.log(`⚠️  WARNING (${findings.warning.length} elements 24-47px - Passes AA but not geriatric standard):`);
  console.log('─'.repeat(80));
  findings.warning.slice(0, 10).forEach(f => {
    console.log(`  ${f.file}:${f.line}`);
    console.log(`    Type: ${f.type}`);
    console.log(`    Estimated size: ~${f.estimatedSize}px (needs 48px)`);
    console.log(`    Classes: ${f.className.substring(0, 80)}`);
    console.log();
  });
  if (findings.warning.length > 10) {
    console.log(`  ... and ${findings.warning.length - 10} more\n`);
  }
}

console.log(`✅ PASS (${findings.pass.length} elements >= 48px)`);
console.log(`❓ UNKNOWN (${findings.unknown.length} elements need manual review)\n`);

console.log('SUMMARY:');
console.log(`  Total interactive elements analyzed: ${findings.critical.length + findings.warning.length + findings.pass.length + findings.unknown.length}`);
console.log(`  Critical failures: ${findings.critical.length}`);
console.log(`  Warnings: ${findings.warning.length}`);
console.log(`  Pass: ${findings.pass.length}`);
console.log(`  Need manual review: ${findings.unknown.length}`);

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  standards: {
    'WCAG 2.5.8 AA': '24×24px minimum',
    'WCAG 2.5.5 AAA': '44×44px minimum',
    'Geriatric UX Best Practice': '48×48px minimum',
  },
  findings,
  summary: {
    total: findings.critical.length + findings.warning.length + findings.pass.length + findings.unknown.length,
    critical: findings.critical.length,
    warning: findings.warning.length,
    pass: findings.pass.length,
    unknown: findings.unknown.length,
  },
};

fs.writeFileSync('touch-target-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Detailed report saved to: touch-target-audit-report.json');
