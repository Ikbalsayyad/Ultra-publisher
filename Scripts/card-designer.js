/**
 * UltraMinds Card Designer V1 (Interactive Custom Card Builder)
 * Allows user to assemble custom cards with:
 *  - Title + Emoji / Image Icon
 *  - Capsule style theme picker
 *  - Body Text / Bullet points
 *  - Sub-cards grid (drag & resize inside card)
 *  - Image holders
 *  - Background styling
 */

window.CardDesigner = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.createModalMarkup();
  },

  createModalMarkup() {
    document.getElementById('card-designer-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'card-designer-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:none; z-index:99999;';
    modal.innerHTML = `
      <div class="modal-card" style="width:680px; max-height:85vh; overflow-y:auto; background:#0F172A; border:1px solid var(--accent-cyan);">
        <h3 style="margin-bottom:12px; font-size:1.1rem; color:#F8FAFC;">🎨 Design Custom New Card</h3>
        <p style="font-size:0.8rem; color:#94A3B8; margin-bottom:16px;">Build a custom UltraMinds card component with title, subcards, image holders, and custom themes.</p>

        <div class="form-group">
          <label>Card Title</label>
          <input type="text" id="cd-title" class="form-control" value="MY CUSTOM EXPERIMENT CARD" />
        </div>

        <div style="display:flex; gap:12px;">
          <div class="form-group" style="flex:1;">
            <label>Title Icon / Emoji</label>
            <input type="text" id="cd-icon" class="form-control" value="🚀" placeholder="Emoji or icon" />
          </div>

          <div class="form-group" style="flex:1;">
            <label>Card Theme Style</label>
            <select id="cd-theme" class="form-control">
              <option value="theme-card-blue">Ultra Blue (Default)</option>
              <option value="theme-card-green">Ultra Green (Lab / Action)</option>
              <option value="theme-card-orange">Ultra Orange (Review / STEM)</option>
              <option value="theme-card-purple">Ultra Purple (AI / Innovation)</option>
              <option value="theme-card-red">Ultra Red (Alert / Safety)</option>
              <option value="theme-card-dark">Ultra Dark Studio</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Card Body Text / Description</label>
          <textarea id="cd-body" class="form-control" rows="3" placeholder="Enter card explanation, notes, or instructions here..."></textarea>
        </div>

        <div style="display:flex; gap:12px;">
          <div class="form-group" style="flex:1;">
            <label>Bullet List Style</label>
            <select id="cd-bullet-style" class="form-control">
              <option value="✔">✔ Checkmark</option>
              <option value="•">• Disc</option>
              <option value="⭐">⭐ Star</option>
              <option value="▶">▶ Arrow</option>
              <option value="1.">1. Numbered</option>
              <option value="☐">☐ Checkbox</option>
            </select>
          </div>

          <div class="form-group" style="flex:1;">
            <label>Include Image Holder?</label>
            <select id="cd-include-image" class="form-control">
              <option value="none">No Image Holder</option>
              <option value="top">Image at Top</option>
              <option value="bottom">Image at Bottom</option>
              <option value="pure">Pure Bezel-Free Image</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Callout Alert Box (Optional Key Takeaway)</label>
          <input type="text" id="cd-callout-text" class="form-control" placeholder="e.g. Note: Always verify circuit connections before powering ON..." />
        </div>

        <div class="form-group">
          <label>Key-Value Specs (e.g. Port: I2C | Voltage: 5V)</label>
          <input type="text" id="cd-keyvalue-text" class="form-control" placeholder="Key: Value, Port: I2C..." />
        </div>

        <div class="form-group">
          <label>Subcards Grid (Optional Sub-Steps)</label>
          <div id="cd-subcards-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
            <!-- Subcard rows inserted dynamically -->
          </div>
          <button class="btn btn-secondary" onclick="window.CardDesigner.addSubcardRow()" style="font-size:0.75rem; padding:4px 10px;">➕ Add Subcard Step</button>
        </div>

        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:20px;">
          <button class="btn btn-secondary" onclick="window.CardDesigner.close()">Cancel</button>
          <button class="btn btn-primary" onclick="window.CardDesigner.buildAndInsertCard()">✨ Create & Insert Card</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  open() {
    let modal = document.getElementById('card-designer-modal');
    if (!modal) {
      this.createModalMarkup();
      modal = document.getElementById('card-designer-modal');
    }
    modal.classList.add('show-modal');
    modal.style.display = 'flex';
    // Clear subcards
    const container = document.getElementById('cd-subcards-list');
    if (container) container.innerHTML = '';
    this.addSubcardRow('Step 1', 'Connect the sensor wires to Pin 5');
    this.addSubcardRow('Step 2', 'Upload program to micro-controller');
  },

  close() {
    const modal = document.getElementById('card-designer-modal');
    if (modal) {
      modal.classList.remove('show-modal');
      modal.style.display = 'none';
    }
  },

  addSubcardRow(title = '', desc = '') {
    const container = document.getElementById('cd-subcards-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'cd-subcard-input-row';
    row.style.cssText = 'display:flex; gap:6px; align-items:center;';
    row.innerHTML = `
      <input type="text" class="form-control cd-sub-title" value="${title}" placeholder="Subcard Title" style="width:140px; font-size:0.78rem;" />
      <input type="text" class="form-control cd-sub-desc" value="${desc}" placeholder="Subcard Description / Details" style="flex:1; font-size:0.78rem;" />
      <button class="ctx-btn-sm" style="background:#EF4444;" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
  },

  buildAndInsertCard() {
    const title = document.getElementById('cd-title')?.value.trim() || 'CUSTOM CARD';
    const icon = document.getElementById('cd-icon')?.value.trim() || '🚀';
    const theme = document.getElementById('cd-theme')?.value || 'theme-card-blue';
    const body = document.getElementById('cd-body')?.value.trim() || '';
    const imgPos = document.getElementById('cd-include-image')?.value || 'none';

    // Subcards
    const subcardRows = document.querySelectorAll('.cd-subcard-input-row');
    const steps = Array.from(subcardRows).map(row => ({
      title: row.querySelector('.cd-sub-title')?.value || '',
      desc: row.querySelector('.cd-sub-desc')?.value || ''
    })).filter(s => s.title || s.desc);

    // Build DOM card manually or via LayoutEngine
    const card = document.createElement('div');
    card.className = `card-base concept-card ${theme} draggable-element`;
    card.setAttribute('draggable', 'true');

    let subcardsHtml = '';
    if (steps.length > 0) {
      subcardsHtml = `<div class="subcards-flex-grid" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">` +
        steps.map((s, i) => `
          <div class="in-card-step draggable-element" draggable="true" style="flex:1; min-width:180px; resize:both; overflow:auto;">
            <div class="step-num-badge" contenteditable="true">${i + 1}</div>
            <div class="step-content-area">
              <div class="step-title-text" contenteditable="true">${s.title}</div>
              <div class="step-desc-text" contenteditable="true">${s.desc}</div>
            </div>
          </div>
        `).join('') + `</div>`;
    }

    let imgHtml = '';
    if (imgPos === 'pure') {
      imgHtml = `<div class="image-frame-container" style="height:150px; margin:8px 0; border-radius:8px; background:transparent; border:none; overflow:hidden; cursor:pointer;" title="Double-click or drag image here">
        <img class="holder-img" src="" alt="Click to upload image"
          style="width:100%; height:100%; object-fit:cover; display:none;" />
        <div class="img-placeholder-label" style="display:flex; align-items:center; justify-content:center; height:100%; color:#475569; font-size:0.8rem; pointer-events:none;">🖼️✨ Double-click to upload pure image</div>
      </div>`;
    } else if (imgPos !== 'none') {
      // Must include an <img> tag so canvas-editor.js triggerImageUpload / drag-drop can find and replace it
      imgHtml = `<div class="image-frame-container" style="height:150px; margin:10px 0; border-radius:6px; background:transparent; border:1.5px dashed rgba(59,130,246,0.3); overflow:hidden; cursor:pointer;" title="Double-click or drag image here">
        <img class="holder-img" src="" alt="Click to upload image"
          style="width:100%; height:100%; object-fit:cover; display:none;" />
        <div class="img-placeholder-label" style="display:flex; align-items:center; justify-content:center; height:100%; color:#475569; font-size:0.8rem; pointer-events:none;">🖼️ Double-click to upload image</div>
      </div>`;
    }


    const calloutText = document.getElementById('cd-callout-text')?.value.trim() || '';
    const kvText = document.getElementById('cd-keyvalue-text')?.value.trim() || '';

    let calloutHtml = '';
    if (calloutText) {
      calloutHtml = `
        <div class="incard-callout-box" style="display:flex; gap:8px; align-items:flex-start; padding:8px 12px; background:rgba(245,158,11,0.12); border-left:3px solid #F59E0B; border-radius:6px; margin:6px 0;">
          <span contenteditable="true" style="font-size:0.9rem;">💡</span>
          <div contenteditable="true" style="font-size:0.78rem; color:#FDE68A; flex:1;">${calloutText}</div>
        </div>
      `;
    }

    let kvHtml = '';
    if (kvText) {
      const pairs = kvText.split(',').map(p => {
        const parts = p.split(/[:=]/);
        return { key: parts[0]?.trim() || 'KEY', val: parts[1]?.trim() || '' };
      });
      kvHtml = `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:6px; margin:6px 0;">` +
        pairs.map(p => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.12); border-radius:6px; padding:6px 10px; font-size:0.76rem;">
            <span style="font-weight:700; color:#00F0FF;" contenteditable="true">${p.key}:</span>
            <span style="color:#CBD5E1; margin-left:6px;" contenteditable="true">${p.val}</span>
          </div>
        `).join('') + `</div>`;
    }

    const toolbarHtml = window.LayoutEngine?.makeInCardToolbarHTML ? window.LayoutEngine.makeInCardToolbarHTML() : '';

    card.innerHTML = `
      <div class="capsule-header">
        <span class="round-icon-badge">${icon}</span>
        <span class="card-title-text" contenteditable="true">${title}</span>
      </div>
      ${imgPos === 'top' ? imgHtml : ''}
      ${body ? `<div class="card-body-text" contenteditable="true">${body}</div>` : ''}
      ${kvHtml}
      ${calloutHtml}
      ${subcardsHtml}
      ${imgPos === 'bottom' ? imgHtml : ''}
      ${toolbarHtml}
    `;

    if (window.LayoutEngine?._attachCardControls) {
      window.LayoutEngine._attachCardControls(card);
    }

    const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
    if (activePage) {
      const bodyContainer = activePage.querySelector('.page-body-container');
      if (bodyContainer) {
        bodyContainer.appendChild(card);
        window.LayoutEngine?.autoReflowPages();
        window.SaveEngine?._showToast('🎨 Custom card created and inserted!');
        this.close();
      }
    }
  }
};
