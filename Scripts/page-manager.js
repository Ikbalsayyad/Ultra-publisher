/**
 * UltraMinds Page Manager V1
 * Handles:
 *  - Add / Delete pages
 *  - Move content up / down (arrow keys + buttons)
 *  - Landscape A4 mode (per-page toggle)
 *  - Page margin & bleed setup
 *  - Page numbering sync after any DOM change
 */

window.PageManager = {

  init() {
    this.bindArrowKeys();
    this.bindPageControlBar();
    this.bindMarginModal();
    this.loadSavedPageGap();
  },

  // ─────────────────────────────────────────────────
  // ADD PAGE
  // ─────────────────────────────────────────────────
  addPage(afterPage) {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    const existingPages = canvas.querySelectorAll('.book-page');
    const refPage = afterPage || existingPages[existingPages.length - 1];
    const newPageNum = refPage ? (parseInt(refPage.dataset.pageNum) || existingPages.length) + 1 : 1;

    const missionNum = window.currentMission?.missionNumber || '1';
    const missionTitle = window.currentMission?.missionTitle || window.currentMission?.title || '';

    const newPage = window.LayoutEngine.createPageElement(
      { missionNumber: missionNum, missionTitle, missionSubtitle: '' },
      { sections: [], pageType: 'generic' },
      newPageNum,
      newPageNum
    );
    newPage.classList.add('page-newly-added');

    if (refPage && refPage.nextSibling) {
      canvas.insertBefore(newPage, refPage.nextSibling);
    } else {
      canvas.appendChild(newPage);
    }

    // Add blank body placeholder
    const body = newPage.querySelector('.page-body-container');
    if (body && body.innerHTML.trim() === '') {
      body.innerHTML = `<div class="empty-page-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#475569;gap:12px;padding:40px;">
        <div style="font-size:2.5rem;">📄</div>
        <div style="font-size:0.85rem;text-align:center;">New empty page<br><small style="color:#64748B;">Drag cards here or use the Elements palette</small></div>
      </div>`;
    }

    // SMART OVERFLOW CAPTURE: If preceding page has overflowing cards, pull them into the new page!
    if (refPage) {
      const refBody = refPage.querySelector('.page-body-container');
      if (refBody) {
        const isOverflowing = refBody.scrollHeight > (refBody.clientHeight + 10);
        const refCards = Array.from(refBody.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section, :scope > div:not(.page-background-overlay):not(.empty-page-placeholder)'));
        if (isOverflowing && refCards.length > 0) {
          const cardsToPush = refCards.length > 1 ? refCards.slice(1) : refCards;
          const newBody = newPage.querySelector('.page-body-container');
          if (newBody && cardsToPush.length > 0) {
            newBody.innerHTML = '';
            cardsToPush.forEach(c => newBody.appendChild(c));
          }
        }
      }
    }

    // Sync mission data
    if (window.currentMission && Array.isArray(window.currentMission.pages)) {
      window.currentMission.pages.push({ pageType: 'generic', sections: [] });
    }

    this.syncPageNumbers();
    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
    window.HistoryEngine?.pushState('Add Page');
    window.SaveEngine?._showToast('📄 Page added!');

    setTimeout(() => {
      newPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newPage.classList.remove('page-newly-added');
    }, 400);
  },

  // ─────────────────────────────────────────────────
  // DELETE PAGE
  // ─────────────────────────────────────────────────
  deletePage(page) {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;
    const pages = canvas.querySelectorAll('.book-page');
    if (pages.length <= 1) { alert('Cannot delete the last page.'); return; }

    page = page || this.getActivePage();
    if (!page) { alert('Click on a page first to select it.'); return; }

    if (!confirm('Delete this page and all its content?')) return;

    window.HistoryEngine?.pushState('Delete Page');

    // Move cards to prev page if possible
    const prevPage = page.previousElementSibling?.closest('.book-page') || page.previousElementSibling;
    const cards = page.querySelectorAll('.page-body-container > *');
    if (prevPage && cards.length > 0) {
      const prevBody = prevPage.querySelector('.page-body-container');
      if (prevBody) cards.forEach(c => prevBody.appendChild(c));
    }

    page.remove();

    // Sync mission data
    const pageNum = parseInt(page.dataset.pageNum) - 1;
    if (window.currentMission?.pages && pageNum >= 0) {
      window.currentMission.pages.splice(pageNum, 1);
    }

    this.syncPageNumbers();
    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
    window.SaveEngine?._showToast('🗑 Page deleted.');
  },

  // ─────────────────────────────────────────────────
  // MOVE SELECTED CARD / ELEMENT
  // ─────────────────────────────────────────────────
  moveElementUp(el) {
    el = el || window.CanvasEditor?.selectedElement;
    if (!el) return;

    window.HistoryEngine?.pushState('Move Card Up');

    const parent = el.parentElement;
    const prevSibling = el.previousElementSibling;

    if (prevSibling) {
      // Move up within the same container
      parent.insertBefore(el, prevSibling);
      window.SaveEngine?._showToast('⬆ Moved up');
    } else {
      // Move to prev page
      const currentPage = el.closest('.book-page');
      const prevPage = currentPage?.previousElementSibling;
      if (prevPage && prevPage.classList.contains('book-page')) {
        const prevBody = prevPage.querySelector('.page-body-container');
        if (prevBody) {
          prevBody.appendChild(el);
          window.SaveEngine?._showToast('⬆ Moved to previous page');
        }
      }
    }

    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  moveElementDown(el) {
    el = el || window.CanvasEditor?.selectedElement;
    if (!el) return;

    window.HistoryEngine?.pushState('Move Card Down');

    const parent = el.parentElement;
    const nextSibling = el.nextElementSibling;

    if (nextSibling) {
      parent.insertBefore(nextSibling, el);
      window.SaveEngine?._showToast('⬇ Moved down');
    } else {
      const currentPage = el.closest('.book-page');
      let nextPage = currentPage?.nextElementSibling;
      if (!nextPage || !nextPage.classList.contains('book-page')) {
        this.addPage(currentPage);
        nextPage = currentPage?.nextElementSibling;
      }
      if (nextPage) {
        const nextBody = nextPage.querySelector('.page-body-container');
        if (nextBody) {
          nextBody.insertBefore(el, nextBody.firstChild);
          window.SaveEngine?._showToast('⬇ Moved to next page');
        }
      }
    }

    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  // ─────────────────────────────────────────────────
  // ARROW KEY BINDINGS
  // ─────────────────────────────────────────────────
  bindArrowKeys() {
    document.addEventListener('keydown', (e) => {
      // Only when a canvas element is selected AND not typing in an input/contenteditable
      const selected = window.CanvasEditor?.selectedElement;
      if (!selected) return;

      const isTyping = document.activeElement &&
        (document.activeElement.isContentEditable ||
         document.activeElement.tagName === 'INPUT' ||
         document.activeElement.tagName === 'TEXTAREA' ||
         document.activeElement.tagName === 'SELECT');
      if (isTyping) return;

      if (e.key === 'ArrowUp' && e.shiftKey) {
        e.preventDefault();
        this.moveElementUp(selected);
      } else if (e.key === 'ArrowDown' && e.shiftKey) {
        e.preventDefault();
        this.moveElementDown(selected);
      } else if (e.key === 'Delete' && !e.shiftKey) {
        // Allow delete key on selected card (when not typing)
        if (selected && !document.activeElement?.isContentEditable) {
          if (confirm('Delete this element?')) {
            selected.remove();
            window.CanvasEditor.deselectElement();
            window.LayoutEngine?.autoReflowPages();
          }
        }
      }
    });
  },

  // ─────────────────────────────────────────────────
  // PAGE CONTROL BAR BUTTONS
  // ─────────────────────────────────────────────────
  bindPageControlBar() {
    if (this._isPcbBound) return;
    this._isPcbBound = true;
    const addBtn = document.getElementById('pcb-add-page');
    if (addBtn) addBtn.onclick = () => this.addPage();
    const delBtn = document.getElementById('pcb-delete-page');
    if (delBtn) delBtn.onclick = () => this.deletePage();
    const upBtn = document.getElementById('pcb-move-up');
    if (upBtn) upBtn.onclick = () => this.moveElementUp();
    const dnBtn = document.getElementById('pcb-move-down');
    if (dnBtn) dnBtn.onclick = () => this.moveElementDown();
    const mgBtn = document.getElementById('pcb-margins');
    if (mgBtn) mgBtn.onclick = () => this.openMarginModal();
    const lsBtn = document.getElementById('pcb-landscape-toggle');
    if (lsBtn) lsBtn.onclick = () => this.toggleLandscapeMode();
  },

  // ─────────────────────────────────────────────────
  // LANDSCAPE MODE
  // ─────────────────────────────────────────────────
  toggleLandscapeMode() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;
    const activePage = this.getActivePage() || canvas.querySelector('.book-page');
    if (!activePage) return;

    const isLandscape = activePage.classList.toggle('page-landscape');
    const btn = document.getElementById('pcb-landscape-toggle');
    if (btn) {
      btn.classList.toggle('btn-active', isLandscape);
      btn.title = isLandscape ? 'Switch to Portrait' : 'Switch to Landscape';
      btn.innerHTML = isLandscape ? '🔄 Landscape (ON)' : '📄 Landscape';
    }
    window.SaveEngine?._showToast(isLandscape ? '🔄 Landscape mode ON for this page' : '📄 Portrait mode restored');
  },

  addFooterToPage(pageTarget) {
    const page = pageTarget || this.getActivePage() || document.querySelector('.book-page');
    if (!page) return alert("Please select a page first.");

    window.HistoryEngine?.pushState('Add Page Footer');

    let footer = page.querySelector('.page-footer');
    if (!footer) {
      const pageNum = parseInt(page.dataset.pageNum) || 1;
      footer = window.LayoutEngine.createPageFooter({}, pageNum);
      page.appendChild(footer);
    }
    footer.style.display = 'flex';
    window.SaveEngine?._showToast('🦶 Page footer added!');
    window.LayoutEngine?.autoReflowPages();
  },

  setFooterColor(colorHex, pageTarget) {
    const page = pageTarget || this.getActivePage() || document.querySelector('.book-page');
    if (!page) return;

    const footer = page.querySelector('.page-footer');
    if (!footer) {
      this.addFooterToPage(page);
    }
    const targetFooter = page.querySelector('.page-footer');
    if (targetFooter) {
      targetFooter.style.background = colorHex;
      window.SaveEngine?._showToast(`🎨 Footer color set to ${colorHex}`);
    }
  },

  setPageGap(gapPx) {
    const val = Math.max(0, Math.min(500, parseInt(gapPx) || 44));
    document.documentElement.style.setProperty('--page-gap', `${val}px`);
    localStorage.setItem('um_page_gap', val);

    const slider = document.getElementById('page-gap-slider');
    if (slider && slider.value !== String(val)) slider.value = String(val);

    const label = document.getElementById('page-gap-value');
    if (label) label.textContent = `${val}px`;

    window.SaveEngine?._showToast(`↔️ Page gap set to ${val}px`);
    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
  },

  loadSavedPageGap() {
    const saved = localStorage.getItem('um_page_gap');
    const val = saved !== null ? parseInt(saved) : 44;
    this.setPageGap(val);
  },

  // ─────────────────────────────────────────────────
  // MARGIN / BLEED MODAL
  // ─────────────────────────────────────────────────
  openMarginModal() {
    const modal = document.getElementById('margin-bleed-modal');
    if (!modal) return;

    // Load saved values
    ['top','bottom','left','right','bleed'].forEach(side => {
      const input = document.getElementById(`margin-${side}`);
      const saved = localStorage.getItem(`um_margin_${side}`);
      if (input && saved) input.value = saved;
    });

    modal.classList.add('show-modal');
  },

  bindMarginModal() {
    document.getElementById('btn-apply-margins')?.addEventListener('click', () => {
      const margins = {};
      ['top','bottom','left','right','bleed'].forEach(side => {
        const val = parseFloat(document.getElementById(`margin-${side}`)?.value || 0);
        margins[side] = val;
        localStorage.setItem(`um_margin_${side}`, val);
      });
      this.applyMargins(margins);
      document.getElementById('margin-bleed-modal')?.classList.remove('show-modal');
      window.SaveEngine?._showToast('📐 Margins applied!');
    });
    document.getElementById('btn-close-margins')?.addEventListener('click', () => {
      document.getElementById('margin-bleed-modal')?.classList.remove('show-modal');
    });
  },

  applyMargins(margins) {
    const root = document.documentElement;
    root.style.setProperty('--page-margin-top', `${margins.top}mm`);
    root.style.setProperty('--page-margin-bottom', `${margins.bottom}mm`);
    root.style.setProperty('--page-margin-left', `${margins.left}mm`);
    root.style.setProperty('--page-margin-right', `${margins.right}mm`);
    root.style.setProperty('--page-bleed', `${margins.bleed || 0}mm`);

    document.querySelectorAll('.book-page').forEach(p => {
      p.style.paddingTop = `${margins.top}mm`;
      p.style.paddingBottom = `${margins.bottom}mm`;
      p.style.paddingLeft = `${margins.left}mm`;
      p.style.paddingRight = `${margins.right}mm`;
      // Bleed indicator
      if (margins.bleed > 0) {
        p.style.outline = `${margins.bleed}mm solid rgba(239,68,68,0.3)`;
        p.style.outlineOffset = `${margins.bleed}mm`;
      } else {
        p.style.outline = '';
      }
    });
  },

  // Load saved margins on startup
  loadSavedMargins() {
    const margins = {};
    ['top','bottom','left','right','bleed'].forEach(side => {
      margins[side] = parseFloat(localStorage.getItem(`um_margin_${side}`) || (side === 'top' ? 15 : side === 'bleed' ? 0 : 12));
    });
    this.applyMargins(margins);
  },

  // ─────────────────────────────────────────────────
  // PAGE NUMBER SYNC
  // ─────────────────────────────────────────────────
  syncPageNumbers() {
    const pages = Array.from(document.querySelectorAll('.book-page'));
    pages.forEach((p, idx) => {
      p.dataset.pageNum = idx + 1;
      const zVal = Math.max(1, 1000 - idx);
      p.style.setProperty('z-index', String(zVal), 'important');
      const ribbon = p.querySelector('.page-ribbon');
      if (ribbon) ribbon.textContent = `PAGE ${idx + 1}`;
    });
  },

  // ─────────────────────────────────────────────────
  // UTILITY: Get Active / Focused Page
  // ─────────────────────────────────────────────────
  getActivePage() {
    // Try from selected element
    const sel = window.CanvasEditor?.selectedElement;
    if (sel) return sel.closest('.book-page');
    // Fallback: first visible page in viewport
    const pages = Array.from(document.querySelectorAll('.book-page'));
    const viewport = window.innerHeight;
    return pages.find(p => {
      const rect = p.getBoundingClientRect();
      return rect.top >= -100 && rect.top <= viewport;
    }) || pages[0];
  }
};
