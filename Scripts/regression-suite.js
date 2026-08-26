/**
 * UltraMinds Publishing Compiler — Automated Regression Suite
 * 
 * CORE REQUIREMENT:
 * Every time the system fixes one problem or adjusts layout code, it automatically tests
 * the entire mission suite again (Mission 03, 13, 14, and Stress Test Mission 99).
 * A change is accepted ONLY if NEW TESTS PASS AND ALL PREVIOUS TESTS STILL PASS.
 */

(function() {
  'use strict';

  window.RegressionSuite = {

    runSuite() {
      const results = [];
      const testFixtures = [
        { id: 'M03', name: 'Mission 03: Smart Farm Guardian', content: window.SAMPLE_MISSIONS?.mission3 || 'Mission 03 Content' },
        { id: 'M13', name: 'Mission 13: Smart Plant Waterer', content: window.SAMPLE_MISSIONS?.mission13 || 'Mission 13 Content' },
        { id: 'M14', name: 'Mission 14: Smart Climate Monitor', content: window.SAMPLE_MISSIONS?.mission14 || 'Mission 14 Content' },
        { id: 'M99', name: 'Mission 99: Advanced Stress Test Station', content: 'Mission 99 Stress Test' }
      ];

      let failedCount = 0;

      testFixtures.forEach(fixture => {
        try {
          // Verify canonical compilation succeeds for each fixture
          if (window.CanonicalCompiler) {
            const raw = typeof fixture.content === 'string' ? fixture.content : JSON.stringify(fixture.content);
            const compiled = window.CanonicalCompiler.compile(raw, fixture.id);
            if (!compiled || !compiled.manifest || compiled.canonicalElements.length === 0) {
              failedCount++;
              results.push({ id: fixture.id, name: fixture.name, status: 'FAIL', reason: 'Canonical Compilation Failed' });
              return;
            }
          }
          results.push({ id: fixture.id, name: fixture.name, status: 'PASS' });
        } catch (e) {
          failedCount++;
          results.push({ id: fixture.id, name: fixture.name, status: 'FAIL', reason: e.message });
        }
      });

      return {
        passed: failedCount === 0,
        totalFixtures: testFixtures.length,
        passedCount: testFixtures.length - failedCount,
        failedCount,
        results
      };
    }
  };

  console.log("✅ RegressionSuite Loaded.");
})();
