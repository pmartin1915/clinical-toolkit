const data = require('./lighthouse-final.json');

console.log('\n🎉 FINAL LIGHTHOUSE ACCESSIBILITY SCORE 🎉\n');
console.log('Accessibility Score:', Math.round(data.categories.accessibility.score * 100) + '/100\n');

const audits = data.audits;
const accessibilityRefs = data.categories.accessibility.auditRefs;

const failed = accessibilityRefs.filter(ref => {
  const audit = audits[ref.id];
  return audit && audit.score !== null && audit.score < 1;
});

if (failed.length === 0) {
  console.log('✅ ALL ACCESSIBILITY AUDITS PASSED!\n');
  console.log('Perfect accessibility score achieved! 🌟\n');
} else {
  console.log('Remaining failures:', failed.length);
  failed.forEach(ref => {
    const audit = audits[ref.id];
    console.log('-', audit.title);
  });
}
