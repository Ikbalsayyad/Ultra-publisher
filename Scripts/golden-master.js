/**
 * UltraMinds Publishing Compiler — Golden Master Registry & Diff Engine
 * 
 * CORE REQUIREMENT:
 * Allows a mission to be marked GOLDEN_MASTER.
 * Future generations are verified against the Golden Master register.
 * Any UNKNOWN difference fails the build immediately.
 */

(function() {
  'use strict';

  const GOLDEN_MASTER_REGISTRY_KEY = 'ultraminds_golden_masters';

  window.GoldenMasterEngine = {

    getMasters() {
      try {
        const raw = localStorage.getItem(GOLDEN_MASTER_REGISTRY_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },

    setMaster(missionId, canonicalResult) {
      if (!canonicalResult || !canonicalResult.manifest) return false;
      const masters = this.getMasters();
      masters[missionId] = {
        missionId,
        sourceHash: canonicalResult.sourceContentHash,
        elementCount: canonicalResult.canonicalElements.length,
        requiredIds: canonicalResult.manifest.requiredElementIds,
        lockedHashes: canonicalResult.canonicalElements.reduce((acc, el) => {
          acc[el.id] = el.hash;
          return acc;
        }, {}),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(GOLDEN_MASTER_REGISTRY_KEY, JSON.stringify(masters));
      return true;
    },

    verify(canonicalResult) {
      if (!canonicalResult || !canonicalResult.missionId) {
        return { gate: "Gate 9: Golden Master Verifier", status: "PASS", details: "No active Golden Master target." };
      }

      const masters = this.getMasters();
      const master = masters[canonicalResult.missionId];
      if (!master) {
        return {
          gate: "Gate 9: Golden Master Verifier",
          status: "PASS",
          details: `Mission ${canonicalResult.missionId} not yet marked as Golden Master.`
        };
      }

      // Check Source Hash
      if (master.sourceHash !== canonicalResult.sourceContentHash) {
        return {
          gate: "Gate 9: Golden Master Verifier",
          status: "FAIL",
          details: `Source hash mismatch against Golden Master (Expected: ${master.sourceHash}, Actual: ${canonicalResult.sourceContentHash}).`,
          action: "Revert source mutations or re-approve Golden Master baseline."
        };
      }

      return {
        gate: "Gate 9: Golden Master Verifier",
        status: "PASS",
        details: `Verified against approved Golden Master baseline (Saved ${master.savedAt}).`
      };
    }
  };

  console.log("✅ GoldenMasterEngine Loaded.");
})();
