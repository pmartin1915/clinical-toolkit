const data = require('./lighthouse-after-fixes.json');

console.log('\n========== LIGHTHOUSE ACCESSIBILITY SCORE AFTER FIXES ==========\n');
console.log('Accessibility Score:', Math.round(data.categories.accessibility.score * 100) + '/100');

const audits = data.audits;
const accessibilityRefs = data.categories.accessibility.auditRefs;

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
      description: audit.description.replace(/<[^>]+>/g, '')
    };
  })
  .sort((a, b) => (b.weight || 0) - (a.weight || 0));

console.log('\nREMAINING ACCESSIBILITY FAILURES:', failed.length);

if (failed.length > 0) {
  console.log('\n');
  failed.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Weight: ${item.weight || 0}`);
    console.log('');
  });
} else {
  console.log('\n✅ ALL ACCESSIBILITY AUDITS PASSED!\n');
}

console.log('================================================================\n');
