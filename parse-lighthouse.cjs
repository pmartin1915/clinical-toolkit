const data = require('./lighthouse-baseline.json');
const audits = data.audits;
const accessibilityRefs = data.categories.accessibility.auditRefs;

console.log('\n========== LIGHTHOUSE BASELINE RESULTS ==========\n');
console.log('OVERALL SCORES:');
console.log(`  Performance: ${Math.round(data.categories.performance.score * 100)}/100`);
console.log(`  Accessibility: ${Math.round(data.categories.accessibility.score * 100)}/100`);
console.log(`  Best Practices: ${Math.round(data.categories['best-practices'].score * 100)}/100`);
console.log(`  SEO: ${Math.round(data.categories.seo.score * 100)}/100`);

console.log('\n========== ACCESSIBILITY AUDIT FAILURES ==========\n');

const failed = accessibilityRefs
  .filter(ref => {
    const audit = audits[ref.id];
    return audit && audit.score !== null && audit.score < 1;
  })
  .map(ref => {
    const audit = audits[ref.id];
    return {
      id: ref.id,
      title: audit.title,
      score: audit.score,
      weight: ref.weight,
      description: audit.description.replace(/<[^>]+>/g, ''),
      details: audit.details
    };
  })
  .sort((a, b) => (b.weight || 0) - (a.weight || 0));

if (failed.length === 0) {
  console.log('  ✅ All accessibility audits passed!');
} else {
  failed.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Score: ${item.score === 0 ? '0 (FAIL)' : `${Math.round(item.score * 100)}/100`}`);
    console.log(`   Weight: ${item.weight || 0}`);
    console.log(`   ID: ${item.id}`);

    if (item.details && item.details.items && item.details.items.length > 0) {
      const count = item.details.items.length;
      console.log(`   Affected elements: ${count}`);

      // Show first 3 items as examples
      item.details.items.slice(0, 3).forEach((detail, i) => {
        if (detail.node && detail.node.snippet) {
          console.log(`     ${i + 1}. ${detail.node.snippet.substring(0, 80)}...`);
        }
      });
      if (count > 3) {
        console.log(`     ... and ${count - 3} more`);
      }
    }
    console.log('');
  });
}

console.log('\n========== KEY PERFORMANCE ISSUES ==========\n');

const perfAudits = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index'
];

perfAudits.forEach(auditId => {
  const audit = audits[auditId];
  if (audit) {
    const score = audit.score !== null ? Math.round(audit.score * 100) : 'N/A';
    const value = audit.displayValue || audit.numericValue || 'N/A';
    console.log(`  ${audit.title}: ${value} (Score: ${score}/100)`);
  }
});

console.log('\n================================================\n');
