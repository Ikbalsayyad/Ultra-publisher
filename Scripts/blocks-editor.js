/**
 * UltraMinds Blocks Editor V1 (MIT App Inventor Style Visual Canvas)
 * Features:
 *  - Interactive full-screen canvas overlay with grid pattern
 *  - Drag & drop move freely like mascot stickers
 *  - Add custom blocks (Control, Logic, Math, Variable, Sensor, Actuator)
 *  - Double-click to rename blocks
 *  - Color picker per block
 *  - Export canvas blocks state directly into active book page
 */

window.BlocksEditor = {
  blocks: [],
  activeBlock: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.createModalMarkup();
    this.bindEvents();
  },

  bindEvents() {
    // Optional global event listeners for blocks editor
  },

  createModalMarkup() {
    document.getElementById('blocks-editor-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'blocks-editor-modal';
    modal.className = 'modal-overlay full-screen-modal';
    modal.style.cssText = 'display:none; z-index:999999; flex-direction:column; background: #090D16;';
    modal.innerHTML = `
      <div class="blocks-editor-header" style="display:flex; justify-content:space-between; align-items:center; padding:12px 24px; background:#0F172A; border-bottom:1px solid rgba(255,255,255,0.1);">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:1.4rem;">🧱</span>
          <div>
            <h3 style="margin:0; font-size:1.1rem; color:#F8FAFC;">MIT App Inventor Visual Block Builder</h3>
            <small style="color:#94A3B8;">Drag blocks freely on canvas, double-click text to rename, customize colors</small>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-primary" onclick="window.BlocksEditor.addBlock('event')" style="background:#F59E0B; border:none;">⚡ When Event</button>
          <button class="btn btn-primary" onclick="window.BlocksEditor.addBlock('action')" style="background:#2563EB; border:none;">⚙️ Set/Do Action</button>
          <button class="btn btn-primary" onclick="window.BlocksEditor.addBlock('logic')" style="background:#10B981; border:none;">🔀 If/Logic</button>
          <button class="btn btn-primary" onclick="window.BlocksEditor.addBlock('sensor')" style="background:#8B5CF6; border:none;">🌡️ Sensor Read</button>
          <button class="btn btn-secondary" onclick="window.BlocksEditor.clearCanvas()">🗑️ Clear</button>
          <button class="btn btn-primary" style="background:linear-gradient(135deg,#00F0FF,#2563EB); border:none;" onclick="window.BlocksEditor.insertIntoActivePage()">📥 Insert to Book Page</button>
          <button class="btn btn-secondary" onclick="window.BlocksEditor.close()">✕ Close</button>
        </div>
      </div>

      <div id="blocks-canvas-area" style="flex:1; position:relative; overflow:hidden; background-image: radial-gradient(#334155 1px, transparent 1px); background-size:24px 24px; cursor:crosshair;">
        <div id="blocks-canvas-inner" style="width:100%; height:100%; position:relative;"></div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  open() {
    let modal = document.getElementById('blocks-editor-modal');
    if (!modal) {
      this.createModalMarkup();
      modal = document.getElementById('blocks-editor-modal');
    }
    if (modal) {
      modal.style.display = 'flex';
      if (this.blocks.length === 0) {
        this.loadSampleBlocks();
      }
    }
  },

  close() {
    const modal = document.getElementById('blocks-editor-modal');
    if (modal) modal.style.display = 'none';
  },

  loadSampleBlocks() {
    this.clearCanvas();
    this.createBlockDOM('when Screen1.Initialize', 'event', 60, 60, '#F59E0B');
    this.createBlockDOM('set global temp to DHT11.ReadTemp', 'action', 80, 130, '#2563EB');
    this.createBlockDOM('if global temp > 30 then', 'logic', 80, 200, '#10B981');
    this.createBlockDOM('call Buzzer1.SoundAlarm', 'action', 100, 270, '#EF4444');
  },

  addBlock(type) {
    const defaultLabels = {
      event: 'when Button1.Click',
      action: 'set OLED.Text to "Hello"',
      logic: 'if ReadSensor() == HIGH',
      sensor: 'read DHT11 Temperature'
    };
    const colors = {
      event: '#F59E0B',
      action: '#2563EB',
      logic: '#10B981',
      sensor: '#8B5CF6'
    };
    const x = 100 + (this.blocks.length * 20) % 300;
    const y = 80 + (this.blocks.length * 30) % 400;
    this.createBlockDOM(defaultLabels[type] || 'new block', type, x, y, colors[type] || '#3B82F6');
  },

  createBlockDOM(labelText, type, left, top, bgColor) {
    const container = document.getElementById('blocks-canvas-inner');
    if (!container) return;

    const block = document.createElement('div');
    block.className = `canvas-mit-block block-type-${type}`;
    block.style.cssText = `
      position: absolute;
      left: ${left}px;
      top: ${top}px;
      background: ${bgColor};
      color: #FFFFFF;
      padding: 10px 16px;
      border-radius: 8px;
      font-family: 'Fira Code', monospace;
      font-weight: 600;
      font-size: 0.88rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      cursor: move;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 2px solid rgba(255,255,255,0.2);
    `;

    block.innerHTML = `
      <span class="block-icon">${type === 'event' ? '⚡' : type === 'action' ? '⚙️' : type === 'logic' ? '🔀' : '🌡️'}</span>
      <span class="block-text" contenteditable="true" style="outline:none;">${labelText}</span>
      <input type="color" value="${bgColor}" class="block-color-picker" style="width:20px; height:20px; border:none; background:none; cursor:pointer;" title="Change block color" />
      <span class="block-del-btn" style="cursor:pointer; opacity:0.6; font-size:0.75rem;" title="Delete Block">✕</span>
    `;

    // Events
    const colorPicker = block.querySelector('.block-color-picker');
    colorPicker.addEventListener('input', (e) => {
      block.style.background = e.target.value;
    });

    block.querySelector('.block-del-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      block.remove();
      this.blocks = this.blocks.filter(b => b.el !== block);
    });

    // Make freely draggable
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    block.addEventListener('mousedown', (e) => {
      if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.classList.contains('block-del-btn')) return;
      isDragging = true;
      offsetX = e.clientX - block.offsetLeft;
      offsetY = e.clientY - block.offsetTop;
      block.style.zIndex = '1000';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        block.style.left = `${Math.max(0, e.clientX - offsetX)}px`;
        block.style.top = `${Math.max(0, e.clientY - offsetY)}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        block.style.zIndex = '1';
      }
    });

    container.appendChild(block);
    this.blocks.push({ el: block, type, labelText, left, top, bgColor });
  },

  clearCanvas() {
    const container = document.getElementById('blocks-canvas-inner');
    if (container) container.innerHTML = '';
    this.blocks = [];
  },

  insertIntoActivePage() {
    const container = document.getElementById('blocks-canvas-inner');
    if (!container) return;

    const blockElements = container.querySelectorAll('.canvas-mit-block');
    if (blockElements.length === 0) {
      alert('No blocks to insert!');
      return;
    }

    const blocksData = Array.from(blockElements).map(b => ({
      label: b.querySelector('.block-text')?.textContent || '',
      bgColor: b.style.background,
      type: b.className.match(/block-type-([\w-]+)/)?.[1] || 'do'
    }));

    const cardData = {
      type: 'blocks-code',
      title: 'CUSTOM MIT APP INVENTOR BLOCKS',
      icon: '🧱',
      blocks: blocksData
    };

    if (window.CanvasEditor && window.LayoutEngine) {
      const cardEl = window.LayoutEngine.renderSection(cardData);
      const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
      if (activePage && cardEl) {
        const body = activePage.querySelector('.page-body-container');
        if (body) {
          body.appendChild(cardEl);
          window.LayoutEngine.autoReflowPages();
          window.SaveEngine?._showToast('🧱 Blocks inserted into active page!');
          this.close();
        }
      }
    }
  }
};
