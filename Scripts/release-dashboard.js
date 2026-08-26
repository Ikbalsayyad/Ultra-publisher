/**
 * UltraMinds Publishing Compiler — Release Dashboard & Actionable Diagnostics UI
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * Human review is NOT reading the entire PDF and hoping something is right.
 * The RELEASE DASHBOARD shows clear, 10/10 PASS status across all verification gates.
 * If anything fails, it shows the exact element location, failure cause, and layout action.
 */

(function() {
  'use strict';

  window.ReleaseDashboard = {

    init() {
      this.createDashboardModal();
    },

    createDashboardModal() {
      if (document.getElementById('release-dashboard-modal')) return;

      const modal = document.createElement('div');
      modal.id = 'release-dashboard-modal';
      modal.className = 'release-dashboard-overlay';
      modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 7, 14, 0.88);
        backdrop-filter: blur(10px);
        z-index: 99999;
        font-family: 'Inter', system-ui, sans-serif;
        color: #F8FAFC;
        align-items: center; justify-content: center;
      `;

      modal.innerHTML = `
        <div class="dashboard-card" style="
          width: 820px; max-width: 92vw; max-height: 88vh;
          background: #0B0F19; border: 1px solid rgba(0,240,255,0.3);
          border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          display: flex; flex-direction: column; overflow: hidden;
        ">
          <!-- Header -->
          <div style="padding: 16px 24px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.5rem;">🚀</span>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #FFF;">PUBLISHING COMPILER — RELEASE DASHBOARD</h3>
                <span id="rd-mission-id" style="font-size: 0.75rem; color: var(--accent-cyan, #00F0FF);">MISSION STATUS & VERIFICATION AUDIT</span>
              </div>
            </div>
            <button onclick="window.ReleaseDashboard.hide()" style="background: none; border: none; color: #94A3B8; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <!-- Content Body -->
          <div style="padding: 20px 24px; overflow-y: auto; flex: 1;">
            
            <!-- Summary Banner -->
            <div id="rd-status-banner" style="
              padding: 14px 20px; border-radius: 10px; margin-bottom: 20px;
              display: flex; justify-content: space-between; align-items: center;
              background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981;
            ">
              <div>
                <div id="rd-status-title" style="font-size: 1.1rem; font-weight: 800; color: #10B981;">RELEASE READY</div>
                <div id="rd-status-sub" style="font-size: 0.8rem; color: #94A3B8;">All 10 Automated Verification Gates Passed</div>
              </div>
              <div id="rd-score-badge" style="font-size: 1.2rem; font-weight: 900; background: #10B981; color: #000; padding: 4px 14px; border-radius: 20px;">10 / 10</div>
            </div>

            <!-- 10 Gates Grid -->
            <div id="rd-gates-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
              <!-- Populated dynamically -->
            </div>

            <!-- Diagnostics Panel -->
            <div id="rd-diagnostics-panel" style="display: none; background: rgba(239, 68, 68, 0.08); border: 1px solid #EF4444; border-radius: 10px; padding: 16px;">
              <h4 style="margin: 0 0 10px 0; color: #EF4444; font-size: 0.9rem;">⚠️ ACTIONABLE DIAGNOSTICS & REMEDIATION</h4>
              <div id="rd-diagnostics-content" style="font-size: 0.8rem; font-family: monospace; color: #FCA5A5; white-space: pre-wrap;"></div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div style="padding: 14px 24px; background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-secondary" onclick="window.GoldenMasterEngine?.setMaster(window.currentMission?.id || 'M01', window.lastCanonicalResult); alert('Marked as GOLDEN MASTER baseline!');" style="font-size: 0.8rem;">⭐ Set as Golden Master</button>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" onclick="window.ReleaseDashboard.hide()" style="font-size: 0.8rem;">Close</button>
              <button id="rd-btn-export" class="btn btn-primary" onclick="window.ExportEngine?.exportPDF()" style="background: #10B981; font-size: 0.8rem;">📥 Export Print PDF</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    },

    show(verificationReport, canonicalResult) {
      this.createDashboardModal();
      const modal = document.getElementById('release-dashboard-modal');
      if (!modal) return;

      const statusBanner = document.getElementById('rd-status-banner');
      const statusTitle = document.getElementById('rd-status-title');
      const statusSub = document.getElementById('rd-status-sub');
      const scoreBadge = document.getElementById('rd-score-badge');
      const gatesGrid = document.getElementById('rd-gates-grid');
      const diagPanel = document.getElementById('rd-diagnostics-panel');
      const diagContent = document.getElementById('rd-diagnostics-content');
      const btnExport = document.getElementById('rd-btn-export');

      if (!verificationReport) return;

      scoreBadge.textContent = verificationReport.scoreText || '0/10';

      if (verificationReport.passed) {
        statusBanner.style.background = 'rgba(16, 185, 129, 0.15)';
        statusBanner.style.borderColor = '#10B981';
        statusTitle.style.color = '#10B981';
        statusTitle.textContent = 'RELEASE READY';
        statusSub.textContent = 'Zero content omitted, zero text modified, 100% print ready.';
        diagPanel.style.display = 'none';
        if (btnExport) btnExport.disabled = false;
      } else {
        statusBanner.style.background = 'rgba(239, 68, 68, 0.15)';
        statusBanner.style.borderColor = '#EF4444';
        statusTitle.style.color = '#EF4444';
        statusTitle.textContent = 'BUILD FAILED — NOT RELEASE READY';
        statusSub.textContent = 'One or more verification gates failed. See diagnostics below.';
        diagPanel.style.display = 'block';
        if (btnExport) btnExport.disabled = true;

        // Render failure diagnostics
        const failures = verificationReport.gateResults.filter(g => g.status === 'FAIL');
        diagContent.textContent = failures.map(f => `
FAIL: ${f.gate}
Reason: ${f.details}
${f.action ? 'Action: ' + f.action : ''}
${f.evidence ? 'Evidence: ' + JSON.stringify(f.evidence, null, 2) : ''}
--------------------------------------------------`).join('\n');
      }

      // Render 10 Gates Grid
      gatesGrid.innerHTML = '';
      verificationReport.gateResults.forEach(gate => {
        const item = document.createElement('div');
        item.style.cssText = `
          padding: 10px 14px; border-radius: 8px; font-size: 0.8rem;
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        `;
        const isPass = gate.status === 'PASS';
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; color: #FFF;">${gate.gate}</div>
            <div style="font-size: 0.72rem; color: #94A3B8;">${gate.details}</div>
          </div>
          <span style="
            font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 10px;
            background: ${isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};
            color: ${isPass ? '#10B981' : '#EF4444'};
          ">${gate.status}</span>
        `;
        gatesGrid.appendChild(item);
      });

      modal.style.display = 'flex';
    },

    hide() {
      const modal = document.getElementById('release-dashboard-modal');
      if (modal) modal.style.display = 'none';
    }
  };

  console.log("✅ ReleaseDashboard Engine Loaded.");
})();
