/**
 * UltraMinds Multi-Format Production Export Engine (V3 - Single & Two-Page Multi-Page PDF Print Engine)
 * Exports A4 pages to PDF, Word (.doc/.docx), PowerPoint Widescreen Slides, and Strict EPUB/OEBPS-compliant XHTML.
 */

window.ExportEngine = {
  exportPDF() {
    window.CanvasEditor?.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();
    if (window.InCardDesigner) window.InCardDesigner.hideToolbar();

    // Remove any active selection overlays, handles, or context menus
    document.querySelectorAll('.transform-handle, .card-move-arrows-overlay, .selected-card, .selected-card-outline').forEach(el => {
      el.classList.remove('selected-card', 'selected-card-outline');
      if (el.classList.contains('transform-handle') || el.classList.contains('card-move-arrows-overlay')) {
        el.remove();
      }
    });

    const isTwoPageActive = document.body.classList.contains('view-two-page');
    const container = document.getElementById('a4-canvas-container');

    // Temporarily unwrap two-page spreads into single sequential pages for PDF print
    if (isTwoPageActive && container) {
      document.body.classList.remove('view-two-page');
      const pages = Array.from(container.querySelectorAll('.book-page'));
      container.innerHTML = '';
      pages.forEach(p => container.appendChild(p));
    }

    // Reset zoom temporarily for 1:1 print scaling
    const prevZoom = document.documentElement.style.getPropertyValue('--canvas-zoom');
    document.documentElement.style.setProperty('--canvas-zoom', '1');

    document.body.classList.add('exporting-pdf');

    const cleanup = () => {
      document.body.classList.remove('exporting-pdf');
      if (prevZoom) document.documentElement.style.setProperty('--canvas-zoom', prevZoom);
      if (isTwoPageActive) {
        document.body.classList.add('view-two-page');
        if (window.LayoutEngine) window.LayoutEngine.applyTwoPageSpreadMode();
      }
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup, { once: true });

    setTimeout(() => {
      window.print();
      // Backup fallback in case afterprint event does not trigger
      setTimeout(cleanup, 3000);
    }, 100);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // XHTML INTERACTIVE WEB PACKAGE EXPORT (V2 — Premium Standalone Engine)
  // ═══════════════════════════════════════════════════════════════════════════

  async exportXHTML() {
    const activePages = document.querySelectorAll('.book-page');
    if (!activePages.length) return alert("No pages found to export.");

    window.CanvasEditor?.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();
    if (window.InCardDesigner) window.InCardDesigner.hideToolbar();

    // Remove active selection overlays before cloning
    document.querySelectorAll('.transform-handle, .card-move-arrows-overlay, .selected-card, .selected-card-outline').forEach(el => {
      el.classList.remove('selected-card', 'selected-card-outline');
      if (el.classList.contains('transform-handle') || el.classList.contains('card-move-arrows-overlay')) {
        el.remove();
      }
    });

    window.SaveEngine?._showToast('🌐 Building interactive XHTML package...');

    try {
      // 1. Compile all styles (bundled fallback + live fetch if available + responsive layer)
      const compiledCSS = await this._compileXHTMLStyles();

      // 2. Build interactive JS layer
      const interactiveJS = this._buildInteractiveJS();

      // 3. Clean and export all pages
      const exportData = this._buildExportPages(activePages);

      // 4. Gather mission metadata
      const missionTitle = window.currentMission?.missionTitle || 'UltraMinds Mission';
      const missionNum = window.currentMission?.missionNumber || '';
      const themeClass = document.body.className.match(/theme-\w+/)?.[0] || 'theme-blue';

      // 5. Assemble final XHTML document
      const xhtml = this._assembleXHTMLDocument({
        title: missionTitle,
        missionNum,
        themeClass,
        css: compiledCSS,
        js: interactiveJS,
        pagesXhtml: exportData.pagesXhtml,
        tocItems: exportData.tocItems,
      });

      // 6. Download
      const safeTitle = (missionTitle || 'UltraMinds_Mission')
        .replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim().replace(/\s+/g, '-');
      this.downloadFile(xhtml, safeTitle + '.xhtml', 'application/xhtml+xml');
      window.SaveEngine?._showToast('✅ Interactive XHTML web package exported!');
    } catch (err) {
      console.error('XHTML export error:', err);
      window.SaveEngine?._showToast('❌ Export error — see console.');
    }
  },

  sanitizeToValidXHTML(htmlString) {
    if (!htmlString) return '';

    let clean = htmlString
      .replace(/\s*contenteditable="[^"]*"/gi, '')
      .replace(/\s*draggable="[^"]*"/gi, '')
      .replace(/<div class="transform-handle[^">]*><\/div>/gi, '');

    // Self-close all HTML void elements
    const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    voidTags.forEach(tag => {
      const re = new RegExp('<' + tag + '(\\s+[^>]*)?>', 'gi');
      clean = clean.replace(re, (match) => {
        if (match.endsWith('/>') || match.endsWith('/ >')) return match;
        return match.replace(/>$/, ' />');
      });
    });

    // Map named HTML entities to XML-compliant numeric entities
    const htmlEntityMap = {
      '&nbsp;': '&#160;',
      '&bull;': '&#8226;',
      '&hellip;': '&#8230;',
      '&middot;': '&#183;',
      '&copy;': '&#169;',
      '&reg;': '&#174;',
      '&trade;': '&#8482;',
      '&ndash;': '&#8211;',
      '&mdash;': '&#8212;',
      '&lsquo;': '&#8216;',
      '&rsquo;': '&#8217;',
      '&ldquo;': '&#8220;',
      '&rdquo;': '&#8221;',
      '&times;': '&#215;',
      '&divide;': '&#247;',
      '&plusmn;': '&#177;',
      '&micro;': '&#181;',
      '&deg;': '&#176;',
      '&larr;': '&#8592;',
      '&uarr;': '&#8593;',
      '&rarr;': '&#8594;',
      '&darr;': '&#8595;',
      '&harr;': '&#8596;',
      '&check;': '&#10003;',
      '&cross;': '&#10007;',
      '&approx;': '&#8776;',
      '&ne;': '&#8800;',
      '&le;': '&#8804;',
      '&ge;': '&#8805;'
    };
    for (const [entity, replacement] of Object.entries(htmlEntityMap)) {
      clean = clean.split(entity).join(replacement);
    }

    // Escape any bare & not part of an entity reference
    clean = clean.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[a-f\d]+);)/gi, '&amp;');

    return clean;
  },

  // ─── XHTML Export Helpers ──────────────────────────────────────────────────

  /**
   * Returns the bundled complete CSS of all 5 UltraMinds stylesheets:
   * (ultraminds-core.css, ultraminds-layout.css, ultraminds-cards.css,
   *  ultraminds-dynamic-cards.css, ultraminds-utilities.css).
   * Ensures 100% self-contained export without relying on network or file:// fetch.
   */
  _getBundledCSS() {
    return "/* === Styles/ultraminds-core.css === */\n/* ==========================================================================\n   ULTRAMINDS CORE DESIGN SYSTEM (ultraminds-core.css)\n   ========================================================================== */\n\n/* --------------------------------------------------------------------------\n   01. DESIGN TOKENS & ROOT VARIABLES\n   -------------------------------------------------------------------------- */\n:root {\n  /* Brand Theme Colors */\n  --mission-blue: #1E40AF;\n  --mission-blue-dark: #1E3A8A;\n  --mission-blue-light: #EFF6FF;\n  --mission-blue-border: #BFDBFE;\n  \n  --mission-orange: #EA580C;\n  --mission-orange-dark: #C2410C;\n  --mission-orange-light: #FFF7ED;\n  --mission-orange-border: #FFEDD5;\n\n  --mission-green: #16A34A;\n  --mission-green-dark: #15803D;\n  --mission-green-light: #F0FDF4;\n  --mission-green-border: #BBF7D0;\n\n  --mission-yellow: #D97706;\n  --mission-yellow-dark: #B45309;\n  --mission-yellow-light: #FEFCE8;\n  --mission-yellow-border: #FDE68A;\n\n  --mission-purple: #7C3AED;\n  --mission-purple-dark: #6D28D9;\n  --mission-purple-light: #F5F3FF;\n  --mission-purple-border: #DDD6FE;\n\n  --mission-red: #DC2626;\n  --mission-red-light: #FEF2F2;\n  --mission-red-border: #FECACA;\n\n  /* UI Canvas & Neutral Shades */\n  --bg-page: #F1F5F9;\n  --bg-card: #FFFFFF;\n  --text-main: #0F172A;\n  --text-secondary: #334155;\n  --text-muted: #64748B;\n  --white: #FFFFFF;\n\n  /* OLED Screen Colors */\n  --oled-bg: #0A0F1D;\n  --oled-cyan: #00F0FF;\n  --oled-yellow: #FFD700;\n\n  /* Typography */\n  --font-heading: 'Outfit', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n  --font-body: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n  --font-code: 'Fira Code', 'Courier New', Courier, monospace;\n\n  /* Spacing System */\n  --space-xs: 4px;\n  --space-sm: 8px;\n  --space-md: 16px;\n  --space-lg: 24px;\n  --space-xl: 32px;\n\n  /* Border Radii & Shadows */\n  --radius-xs: 6px;\n  --radius-sm: 10px;\n  --radius-md: 16px;\n  --radius-lg: 24px;\n  --radius-full: 9999px;\n\n  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04);\n  --shadow-md: 0 6px 16px rgba(15, 23, 42, 0.08);\n  --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.12);\n  --shadow-glow-blue: 0 0 20px rgba(30, 64, 175, 0.25);\n  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);\n}\n\n/* --------------------------------------------------------------------------\n   02. THEME ACTIVATION\n   -------------------------------------------------------------------------- */\nbody.theme-blue { --theme-active: var(--mission-blue); --theme-active-dark: var(--mission-blue-dark); }\nbody.theme-orange { --theme-active: var(--mission-orange); --theme-active-dark: var(--mission-orange-dark); }\nbody.theme-green { --theme-active: var(--mission-green); --theme-active-dark: var(--mission-green-dark); }\nbody.theme-purple { --theme-active: var(--mission-purple); --theme-active-dark: var(--mission-purple-dark); }\n\n/* --------------------------------------------------------------------------\n   03. BASE RESET & BODY STYLING\n   -------------------------------------------------------------------------- */\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nhtml {\n  font-size: 16px;\n  scroll-behavior: smooth;\n  -webkit-text-size-adjust: 100%;\n}\n\nbody {\n  background-color: var(--bg-page);\n  color: var(--text-main);\n  font-family: var(--font-body);\n  line-height: 1.5;\n  padding: var(--space-lg);\n  max-width: 1280px;\n  margin: 0 auto;\n  -webkit-font-smoothing: antialiased;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-family: var(--font-heading);\n  font-weight: 800;\n  letter-spacing: -0.02em;\n  color: var(--text-main);\n}\n\np {\n  color: var(--text-secondary);\n  line-height: 1.6;\n}\n\n/* --------------------------------------------------------------------------\n   04. HEADER BANNERS & PAGE BADGES\n   -------------------------------------------------------------------------- */\n.page-header-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: var(--space-md);\n}\n\n.page-number-pill {\n  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);\n  color: var(--white);\n  font-family: var(--font-heading);\n  font-weight: 900;\n  font-size: 0.85rem;\n  padding: 6px 18px;\n  border-radius: var(--radius-full);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);\n}\n\n.mission-pill {\n  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);\n  color: var(--white);\n  font-family: var(--font-heading);\n  font-weight: 900;\n  font-size: 0.85rem;\n  padding: 6px 20px;\n  border-radius: var(--radius-full);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);\n}\n\n.mission-corner-badge {\n  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);\n  color: var(--white);\n  border-radius: 0 0 var(--radius-md) var(--radius-md);\n  padding: 12px 24px;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-family: var(--font-heading);\n  font-weight: 900;\n  box-shadow: var(--shadow-md);\n}\n\n.mission-corner-badge .badge-num {\n  font-size: 1.8rem;\n  line-height: 1;\n  color: var(--white);\n}\n\n.mission-main-title {\n  font-size: 2.8rem;\n  font-weight: 900;\n  text-transform: uppercase;\n  color: #0F172A;\n  line-height: 1.05;\n  margin-bottom: var(--space-xs);\n  letter-spacing: -0.03em;\n}\n\n.mission-main-title .highlight-orange { color: #EA580C; }\n.mission-main-title .highlight-blue { color: #2563EB; }\n\n.mission-main-subtitle {\n  font-size: 1.15rem;\n  color: var(--text-muted);\n  font-weight: 600;\n  display: flex;\n  align-items: center;\n  gap: var(--space-sm);\n  margin-bottom: var(--space-lg);\n}\n\n/* --------------------------------------------------------------------------\n   05. SVG ICON MASK SYSTEM (No external dependencies)\n   -------------------------------------------------------------------------- */\n.icon {\n  display: inline-block;\n  width: 1.25em;\n  height: 1.25em;\n  vertical-align: -0.15em;\n  background-color: currentColor;\n  mask-size: contain;\n  mask-repeat: no-repeat;\n  mask-position: center;\n  -webkit-mask-size: contain;\n  -webkit-mask-repeat: no-repeat;\n  -webkit-mask-position: center;\n}\n\n.icon-robot {\n  mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2a2 2 0 0 1 2 2v2h2a3 3 0 0 1 3 3v2h2v2h-2v2a3 3 0 0 1-3 3h-2v2a2 2 0 0 1-4 0v-2H8a3 3 0 0 1-3-3v-2H3v-2h2V9a3 3 0 0 1 3-3h2V4a2 2 0 0 1 2-2zm0 2h-2v2h2V4z\" fill=\"black\"/></svg>');\n  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2a2 2 0 0 1 2 2v2h2a3 3 0 0 1 3 3v2h2v2h-2v2a3 3 0 0 1-3 3h-2v2a2 2 0 0 1-4 0v-2H8a3 3 0 0 1-3-3v-2H3v-2h2V9a3 3 0 0 1 3-3h2V4a2 2 0 0 1 2-2zm0 2h-2v2h2V4z\" fill=\"black\"/></svg>');\n}\n\n.icon-world {\n  mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke=\"black\" stroke-width=\"2\"/></svg>');\n  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke=\"black\" stroke-width=\"2\"/></svg>');\n}\n\n.icon-lightbulb {\n  mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M9 21h6v-1H9v1zm3-19C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z\" fill=\"black\"/></svg>');\n  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M9 21h6v-1H9v1zm3-19C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z\" fill=\"black\"/></svg>');\n}\n\n.icon-target {\n  mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"6\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"black\"/></svg>');\n  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"6\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"black\"/></svg>');\n}\n\n/* === Styles/ultraminds-layout.css === */\n/* ==========================================================================\n   ULTRAMINDS LAYOUT CSS V20 — Studio App Shell + A4 Page Canvas\n   ========================================================================== */\n\n/* ──────────────────────────────────────────────────\n   STUDIO APP SHELL\n   ────────────────────────────────────────────────── */\nbody.studio-app {\n  background: #0F172A;\n  color: #F8FAFC;\n  font-family: var(--page-global-font, var(--font-body));\n  padding: 0; margin: 0;\n  max-width: 100vw; min-height: 100vh;\n  overflow: hidden;\n  display: flex; flex-direction: column;\n}\n\n/* ──────────────────────────────────────────────────\n   TOP NAVBAR\n   ────────────────────────────────────────────────── */\n.studio-navbar {\n  height: 46px;\n  background: linear-gradient(90deg, #0B1120 0%, #0F172A 100%);\n  border-bottom: 1px solid rgba(255,255,255,0.08);\n  display: flex; align-items: center;\n  padding: 0 10px; gap: 8px;\n  flex-shrink: 0; z-index: 200;\n  box-shadow: 0 2px 12px rgba(0,0,0,0.4);\n}\n.brand-logo { display: flex; align-items: center; gap: 8px; }\n.logo-badge {\n  background: linear-gradient(135deg, #2563EB, #7C3AED);\n  color: #fff; font-size: 0.6rem; font-weight: 800;\n  padding: 2px 8px; border-radius: 4px; letter-spacing: 0.08em;\n}\n.logo-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.88rem; color: #F8FAFC; letter-spacing: -0.01em; }\n.navbar-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-wrap: wrap; }\n\n/* ──────────────────────────────────────────────────\n   FORMAT BAR (TOP)\n   ────────────────────────────────────────────────── */\n#top-format-bar {\n  background: #1E293B; border-bottom: 1px solid rgba(255,255,255,0.07);\n  padding: 4px 12px; display: flex; align-items: center; gap: 8px;\n  flex-wrap: wrap; flex-shrink: 0;\n}\n#top-format-bar.hidden { display: none; }\n\n/* ──────────────────────────────────────────────────\n   WORKSPACE (SIDEBAR + CANVAS)\n   ────────────────────────────────────────────────── */\n.studio-workspace {\n  display: flex; flex: 1;\n  overflow: hidden; height: calc(100vh - 46px);\n}\n\n/* ──────────────────────────────────────────────────\n   LEFT SIDEBAR\n   ────────────────────────────────────────────────── */\n.left-control-panel {\n  width: 300px; min-width: 300px; max-width: 300px;\n  background: #111827;\n  border-right: 1px solid rgba(255,255,255,0.07);\n  display: flex; flex-direction: column;\n  overflow: hidden; flex-shrink: 0;\n  transition: width 0.25s, min-width 0.25s;\n}\n.left-control-panel.collapsed { width: 0; min-width: 0; overflow: hidden; }\n\n/* Panel Tabs */\n.panel-tabs {\n  display: flex; gap: 2px; padding: 8px 8px 0;\n  border-bottom: 1px solid rgba(255,255,255,0.06);\n  flex-shrink: 0;\n}\n.tab-btn {\n  flex: 1; background: transparent; border: none;\n  color: #94A3B8; font-size: 0.68rem; font-weight: 700;\n  padding: 6px 4px; border-radius: 6px 6px 0 0; cursor: pointer;\n  transition: all 0.15s; text-align: center;\n}\n.tab-btn:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }\n.tab-btn.active { background: rgba(37,99,235,0.15); color: #60A5FA; border-bottom: 2px solid #2563EB; }\n\n/* Tab Contents */\n.tab-content { display: none; flex: 1; overflow-y: auto; padding: 10px; }\n.tab-content.active { display: flex; flex-direction: column; gap: 8px; }\n\n/* Form Groups */\n.form-group { display: flex; flex-direction: column; gap: 4px; }\n.form-group label { font-size: 0.7rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }\n.form-group textarea {\n  background: #1E293B; color: #E2E8F0; border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 8px; padding: 8px 10px; font-size: 0.75rem;\n  resize: vertical; min-height: 160px; font-family: var(--font-code);\n  line-height: 1.5; outline: none;\n}\n.form-group textarea:focus { border-color: #2563EB; }\n.form-group select, .form-group input[type=\"text\"], .form-group input[type=\"password\"], .form-group .form-control {\n  background: #1E293B; color: #E2E8F0;\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 6px; padding: 6px 8px; font-size: 0.75rem;\n  outline: none; width: 100%; box-sizing: border-box;\n}\n.form-group select:focus, .form-group input:focus { border-color: #2563EB; }\n.form-group input[type=\"range\"] { width: 100%; accent-color: #2563EB; }\n.form-group input[type=\"color\"] { height: 32px; cursor: pointer; }\n\n/* Elements Palette */\n.component-palette-grid {\n  display: flex; flex-direction: column; gap: 4px;\n}\n.palette-btn {\n  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);\n  color: #CBD5E1; border-radius: 6px; padding: 6px 8px; font-size: 0.72rem;\n  font-weight: 600; text-align: left; cursor: pointer; transition: all 0.15s;\n  display: flex; align-items: center; gap: 6px;\n}\n.palette-btn:hover { background: rgba(37,99,235,0.15); border-color: rgba(37,99,235,0.4); color: #E2E8F0; }\n\n/* AI Status Monitor */\n.ai-status-panel {\n  background: #1E293B; border: 1px solid rgba(0,240,255,0.2);\n  border-radius: 8px; padding: 10px; font-size: 0.72rem;\n}\n.ai-status-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }\n.ai-spinner { animation: spin 1.2s linear infinite; display: inline-block; font-size: 1rem; }\n@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n.ai-status-title { font-weight: 700; color: #00F0FF; font-size: 0.72rem; }\n.ai-status-log { color: #94A3B8; font-size: 0.7rem; line-height: 1.5; }\n\n/* Inspector Panel */\n#element-inspector { font-size: 0.75rem; }\n.inspector-placeholder { color: #64748B; font-size: 0.75rem; padding: 12px 0; }\n\n/* ──────────────────────────────────────────────────\n   RIGHT CANVAS VIEWPORT\n   ────────────────────────────────────────────────── */\n.right-canvas-viewport,\n#a4-canvas-container {\n  flex: 1; overflow-y: auto; overflow-x: hidden;\n  background: #1A2332;\n  background-image:\n    radial-gradient(circle at 20% 50%, rgba(37,99,235,0.04) 0%, transparent 60%),\n    radial-gradient(circle at 80% 20%, rgba(124,58,237,0.04) 0%, transparent 50%);\n  padding: 20px;\n  display: flex; flex-direction: column; align-items: center; gap: 20px;\n  position: relative !important;\n  z-index: 1 !important;\n}\n\n/* ──────────────────────────────────────────────────\n   A4 PAGE BOOK\n   ────────────────────────────────────────────────── */\n:root { --canvas-zoom: 0.75; --font-scale: 1.0; --page-gap: 44px; }\n\n.book-page {\n  width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px;\n  background: #FFFFFF; position: relative !important;\n  z-index: 2;\n  isolation: isolate !important; /* Scopes each page's internal stacking context */\n  display: flex; flex-direction: column;\n  box-shadow:\n    0 0 0 1px rgba(0,0,0,0.04),\n    0 8px 40px rgba(0,0,0,0.35),\n    0 2px 8px rgba(0,0,0,0.2);\n  transform-origin: top center;\n  transform: scale(var(--canvas-zoom));\n  margin-bottom: calc((var(--canvas-zoom) - 1) * 1123px + var(--page-gap, 44px)) !important;\n  border-radius: 2px;\n  overflow: hidden;\n  font-family: var(--page-global-font, 'Inter', sans-serif);\n  box-sizing: border-box;\n}\n\n/* Page Background Overlay */\n.page-background-overlay {\n  position: absolute; inset: 0; z-index: 0;\n  background-size: cover; background-position: center;\n  pointer-events: none;\n}\n\n/* ──────────────────────────────────────────────────\n   PAGE TOP BAR\n   ────────────────────────────────────────────────── */\n.page-top-bar {\n  position: relative; z-index: 10;\n  display: flex; align-items: center; justify-content: space-between;\n  padding: 6px 14px;\n  background: #fff; border-bottom: 1px solid #F1F5F9;\n  flex-shrink: 0;\n}\n.page-ribbon {\n  background: linear-gradient(135deg, #F97316, #EA580C);\n  color: #fff; font-size: 0.65rem; font-weight: 800;\n  padding: 3px 12px; border-radius: 999px; letter-spacing: 0.07em;\n}\n.top-mission-pill {\n  background: linear-gradient(135deg, #2563EB, #1D4ED8);\n  color: #fff; font-size: 0.65rem; font-weight: 800;\n  padding: 3px 14px; border-radius: 999px; letter-spacing: 0.07em;\n}\n.top-corner-badge {\n  background: linear-gradient(135deg, #0F172A, #1E293B);\n  color: #fff; border-radius: 8px; padding: 4px 10px;\n  display: flex; flex-direction: column; align-items: center;\n  min-width: 44px;\n}\n.badge-text { font-size: 0.55rem; font-weight: 700; letter-spacing: 0.08em; color: #94A3B8; }\n.badge-num { font-size: 1rem; font-weight: 900; line-height: 1; }\n\n/* ──────────────────────────────────────────────────\n   PAGE BODY\n   ────────────────────────────────────────────────── */\n.page-body-container {\n  flex: 1; position: relative; z-index: 1;\n  padding: 6px 10px 48px 10px !important;\n  display: flex; flex-direction: column; gap: 6px;\n  overflow: hidden !important; box-sizing: border-box;\n}\n\n/* ──────────────────────────────────────────────────\n   PAGE FOOTER\n   ────────────────────────────────────────────────── */\n.page-footer {\n  position: absolute !important;\n  bottom: 0 !important;\n  left: 0 !important;\n  right: 0 !important;\n  width: 100% !important;\n  box-sizing: border-box !important;\n  margin: 0 !important;\n  z-index: 10 !important;\n  background: #0F172A; color: #fff;\n  padding: 6px 14px;\n  display: flex; align-items: center; gap: 12px;\n  flex-wrap: wrap; min-height: 36px;\n}\n.footer-pills-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }\n.footer-code-pill {\n  background: rgba(255,255,255,0.12); color: #F8FAFC;\n  font-size: 0.65rem; font-weight: 600; padding: 3px 10px;\n  border-radius: 999px; white-space: nowrap;\n}\n.footer-arrow { color: #64748B; font-size: 0.7rem; }\n.footer-tip-zone, .footer-fact-zone {\n  font-size: 0.68rem; color: #CBD5E1;\n  display: flex; align-items: center; gap: 4px;\n}\n.footer-tip-label, .footer-fact-label { color: #F59E0B; font-weight: 700; white-space: nowrap; }\n.footer-next-zone {\n  margin-left: auto; display: flex; align-items: center; gap: 6px;\n  background: rgba(37,99,235,0.2); padding: 3px 10px; border-radius: 999px;\n}\n.footer-next-label { font-size: 0.62rem; font-weight: 700; color: #60A5FA; text-transform: uppercase; letter-spacing: 0.06em; }\n.footer-next-text { font-size: 0.7rem; color: #E2E8F0; font-weight: 600; }\n.footer-next-arrow { color: #F59E0B; font-size: 1rem; font-weight: 900; }\n.footer-brand { font-size: 0.7rem; font-weight: 800; color: #94A3B8; font-family: 'Outfit', sans-serif; margin-left: auto; }\n\n/* ──────────────────────────────────────────────────\n   TWO-PAGE SPREAD\n   ────────────────────────────────────────────────── */\n.two-page-spread {\n  display: flex; gap: 0; align-items: flex-start;\n  transform-origin: top center;\n}\n\n/* ──────────────────────────────────────────────────\n   BUTTONS\n   ────────────────────────────────────────────────── */\n.btn {\n  padding: 5px 12px; border-radius: 6px; border: none;\n  font-size: 0.72rem; font-weight: 700; cursor: pointer;\n  transition: all 0.15s; white-space: nowrap;\n  display: inline-flex; align-items: center; gap: 4px;\n}\n.btn-primary {\n  background: linear-gradient(135deg, #2563EB, #1D4ED8);\n  color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.4);\n}\n.btn-primary:hover { background: linear-gradient(135deg, #3B82F6, #2563EB); transform: translateY(-1px); }\n.btn-secondary {\n  background: rgba(255,255,255,0.08); color: #CBD5E1;\n  border: 1px solid rgba(255,255,255,0.1);\n}\n.btn-secondary:hover { background: rgba(255,255,255,0.14); color: #fff; }\n.btn-primary.active, .btn-secondary.active { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5); color: #FCA5A5; }\n.btn:disabled { opacity: 0.5; cursor: not-allowed; }\n\n/* ──────────────────────────────────────────────────\n   MODALS\n   ────────────────────────────────────────────────── */\n.modal-overlay {\n  position: fixed; inset: 0; z-index: 9000;\n  background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);\n  display: none; align-items: center; justify-content: center;\n}\n.modal-overlay.show-modal { display: flex; }\n.modal-card {\n  background: #1E293B; border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 16px; padding: 24px; width: 420px; max-width: 95vw;\n  box-shadow: 0 24px 64px rgba(0,0,0,0.6);\n  color: #E2E8F0;\n}\n.modal-card h3 { font-family: 'Outfit', sans-serif; color: #F8FAFC; }\n\n/* ──────────────────────────────────────────────────\n   DRAGGABLE ELEMENTS\n   ────────────────────────────────────────────────── */\n.draggable-element { cursor: grab; }\n.draggable-element:active { cursor: grabbing; }\n.draggable-element.drag-over {\n  outline: 2px dashed #2563EB;\n  outline-offset: 2px;\n  background-color: rgba(37,99,235,0.06) !important;\n}\n.drag-source { opacity: 0.4; }\n\n/* Manual mode: no drag indicators */\nbody.manual-mode .draggable-element { cursor: default; }\nbody.manual-mode .draggable-element:hover { outline: none; }\n\n/* ──────────────────────────────────────────────────\n   FLOATING CLIPART STICKER\n   ────────────────────────────────────────────────── */\n.floating-clipart-sticker {\n  position: absolute; z-index: 100; cursor: move;\n  user-select: none;\n}\n.clipart-img { pointer-events: none; }\n\n/* ──────────────────────────────────────────────────\n   SCROLLBAR STYLING\n   ────────────────────────────────────────────────── */\n::-webkit-scrollbar { width: 6px; height: 6px; }\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }\n::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }\n\n/* ──────────────────────────────────────────────────\n   CONTENTEDITABLE FOCUS\n   ────────────────────────────────────────────────── */\n[contenteditable=\"true\"]:focus {\n  outline: 1.5px solid rgba(37,99,235,0.5);\n  outline-offset: 1px; border-radius: 3px;\n  background: rgba(37,99,235,0.04);\n}\n\n/* ──────────────────────────────────────────────────\n   PRINT STYLES\n   ────────────────────────────────────────────────── */\n@media print {\n  body { background: white; margin: 0; padding: 0; }\n  .book-page { transform: none !important; box-shadow: none; page-break-after: always; break-after: page; }\n  .book-page:last-child, .book-page:last-of-type { page-break-after: avoid !important; break-after: avoid !important; }\n  .studio-navbar, .page-control-toolbar, .left-control-panel, .modal-overlay { display: none !important; }\n  .right-canvas-viewport { padding: 0; background: white; }\n}\n\n/* === Styles/ultraminds-cards.css === */\n/* ==========================================================================\n   ULTRAMINDS CARDS CSS V20 — All 25+ Rich Card Components\n   Matches sample pages 1-5 exactly\n   ========================================================================== */\n\n/* ──────────────────────────────────────────────────\n   BASE CARD FOUNDATION\n   ────────────────────────────────────────────────── */\n.card-base {\n  background: var(--bg-card, #FFFFFF);\n  border-radius: 12px;\n  padding: 12px 14px;\n  margin: 6px 0;\n  border: 1.5px solid rgba(0,0,0,0.07);\n  box-shadow: 0 2px 8px rgba(15,23,42,0.06);\n  transition: box-shadow 0.2s;\n  position: relative;\n  overflow: visible;\n  box-sizing: border-box;\n}\n.card-base:hover { box-shadow: 0 4px 16px rgba(15,23,42,0.12); }\n.card-base.full-width { width: 100%; }\n\n/* ──────────────────────────────────────────────────\n   CAPSULE HEADERS\n   ────────────────────────────────────────────────── */\n.capsule-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: var(--theme-active, #1E40AF);\n  color: #fff;\n  border-radius: 999px;\n  padding: 5px 14px 5px 5px;\n  margin-bottom: 10px;\n  width: fit-content;\n  max-width: 100%;\n}\n.round-icon-badge {\n  background: rgba(255,255,255,0.25);\n  border-radius: 50%;\n  width: 28px; height: 28px;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 14px; flex-shrink: 0;\n}\n.card-title-text {\n  font-family: 'Outfit', sans-serif;\n  font-weight: 800;\n  font-size: 0.82rem;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #fff;\n}\n\n/* Theme Color Capsule Overrides */\n.theme-card-green .capsule-header { background: var(--mission-green, #16A34A); }\n.theme-card-yellow .capsule-header { background: var(--mission-yellow, #D97706); }\n.theme-card-purple .capsule-header { background: var(--mission-purple, #7C3AED); }\n.theme-card-red .capsule-header { background: var(--mission-red, #DC2626); }\n.theme-card-orange .capsule-header { background: var(--mission-orange, #EA580C); }\n.theme-card-dark .capsule-header { background: #0F172A; }\n.theme-card-teal .capsule-header { background: #0D9488; }\n.theme-card-slate .capsule-header { background: #475569; }\n\n/* Card theme backgrounds */\n.theme-card-blue   { border-left: 4px solid var(--mission-blue, #1E40AF); }\n.theme-card-green  { border-left: 4px solid var(--mission-green, #16A34A); }\n.theme-card-yellow { border-left: 4px solid var(--mission-yellow, #D97706); background: #FFFBEB; }\n.theme-card-purple { border-left: 4px solid var(--mission-purple, #7C3AED); background: #F9F5FF; }\n.theme-card-red    { border-left: 4px solid var(--mission-red, #DC2626); background: #FFF5F5; }\n.theme-card-orange { border-left: 4px solid var(--mission-orange, #EA580C); background: #FFF7ED; }\n.theme-card-dark   { background: #0F172A; border-left: 4px solid #334155; }\n.theme-card-teal   { border-left: 4px solid #0D9488; background: #F0FDFA; }\n.theme-card-slate  { border-left: 4px solid #475569; background: #F8FAFC; }\n\n/* ──────────────────────────────────────────────────\n   COVER PAGE — HEADER BANNER\n   ────────────────────────────────────────────────── */\n.cover-header-banner {\n  display: grid;\n  grid-template-columns: 160px 1fr 160px;\n  align-items: center;\n  gap: 12px;\n  padding: 10px 12px;\n  margin-bottom: 10px;\n  background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);\n  border-radius: 12px;\n  border: 1px solid #BFDBFE;\n  min-height: 150px;\n}\n.cover-mascot-area {\n  display: flex; flex-direction: column; align-items: center; gap: 6px;\n}\n.cover-mascot-img {\n  font-size: 64px; line-height: 1;\n  border-radius: 8px !important;\n  object-fit: cover !important;\n  filter: drop-shadow(0 4px 12px rgba(30,64,175,0.2));\n}\n.cover-guide-info { text-align: center; }\n.guide-name-badge {\n  display: block;\n  background: #1E40AF; color: #fff;\n  font-size: 0.72rem; font-weight: 800;\n  padding: 3px 10px; border-radius: 999px;\n  margin-bottom: 3px;\n}\n.guide-role-label {\n  display: block; font-size: 0.65rem; color: #F59E0B; font-weight: 700;\n}\n.cover-title-center { text-align: center; }\n.cover-mission-label {\n  background: #2563EB; color: #fff;\n  font-size: 0.75rem; font-weight: 800;\n  padding: 4px 16px; border-radius: 999px;\n  display: inline-block; margin-bottom: 8px;\n  letter-spacing: 0.08em;\n}\n.cover-main-title {\n  font-family: 'Outfit', sans-serif;\n  font-size: 2.2rem; font-weight: 900;\n  color: #0F172A; line-height: 1.0;\n  text-transform: uppercase; letter-spacing: -0.02em;\n  margin-bottom: 6px;\n  outline: none;\n}\n.cover-subtitle {\n  font-size: 0.85rem; color: #334155;\n  font-weight: 600; line-height: 1.4;\n  outline: none;\n}\n.cover-visual-area {\n  display: flex; align-items: center; justify-content: center;\n}\n.cover-illustration-placeholder {\n  width: 130px; height: 130px;\n  background: rgba(37,99,235,0.08);\n  border-radius: 12px;\n  border: 2px dashed rgba(37,99,235,0.2);\n  display: flex; align-items: center; justify-content: center;\n}\n.cover-icon-big { font-size: 56px; }\n\n/* ──────────────────────────────────────────────────\n   PAGE TYPE BANNERS (Pages 2-5)\n   ────────────────────────────────────────────────── */\n.page-type-banner {\n  display: flex; align-items: center; gap: 14px;\n  padding: 10px 16px; border-radius: 10px;\n  margin-bottom: 10px; position: relative;\n}\n.page-banner-icon { font-size: 28px; }\n.page-banner-title {\n  font-family: 'Outfit', sans-serif;\n  font-size: 1.6rem; font-weight: 900;\n  text-transform: uppercase; letter-spacing: -0.02em;\n  outline: none;\n}\n.page-banner-subtitle {\n  font-size: 0.75rem; font-weight: 700;\n  letter-spacing: 0.12em; text-transform: uppercase;\n  outline: none; opacity: 0.8;\n}\n\n.banner-engineering-explorer {\n  background: linear-gradient(135deg, #0F4C2B 0%, #15803D 100%);\n  color: #fff;\n}\n.banner-engineering-explorer .page-banner-title { color: #ECFDF5; }\n.banner-engineering-explorer .page-banner-subtitle { color: #86EFAC; }\n\n.banner-build-lab {\n  background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%);\n  color: #fff;\n}\n.banner-build-lab .page-banner-title { color: #EFF6FF; }\n.banner-build-lab .page-banner-subtitle { color: #F59E0B; }\n\n.banner-logic-builder {\n  background: linear-gradient(135deg, #2D1B69 0%, #7C3AED 100%);\n  color: #fff;\n}\n.banner-logic-builder .page-banner-title { color: #F5F3FF; }\n.banner-logic-builder .page-banner-subtitle { color: #C4B5FD; }\n\n.banner-innovation-studio {\n  background: linear-gradient(135deg, #78350F 0%, #D97706 100%);\n  color: #fff;\n}\n.banner-innovation-studio .page-banner-title { color: #FFF7ED; }\n.banner-innovation-studio .page-banner-subtitle { color: #FDE68A; }\n\n/* ──────────────────────────────────────────────────\n   SPLIT LAYOUT (2-Column)\n   ────────────────────────────────────────────────── */\n.split-layout {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n  width: 100%;\n  margin: 6px 0;\n  box-sizing: border-box;\n}\n.split-layout > * { min-width: 0; }\n\n/* ──────────────────────────────────────────────────\n   MISSION STORY CARD\n   ────────────────────────────────────────────────── */\n.mission-story-card { background: #F8FAFF; }\n.story-layout { display: grid; grid-template-columns: 1fr 64px; gap: 10px; }\n.story-text { font-size: 0.82rem; line-height: 1.55; color: #1E293B; }\n.story-images { display: flex; flex-direction: column; gap: 6px; align-items: center; }\n.story-img-sticker {\n  width: 48px; height: 48px;\n  background: #EFF6FF; border-radius: 8px;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 24px; border: 1px solid #BFDBFE;\n}\n\n/* ──────────────────────────────────────────────────\n   REAL WORLD CARD\n   ────────────────────────────────────────────────── */\n.real-world-card { background: #F0FDF4; }\n.rw-list { list-style: none; padding: 0; margin: 4px 0; }\n.rw-item { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 0.82rem; color: #1E293B; }\n.rw-dot { color: #16A34A; font-size: 0.7rem; }\n.rw-bottom-note { font-size: 0.78rem; color: #166534; font-weight: 600; margin-top: 6px; font-style: italic; }\n\n/* ──────────────────────────────────────────────────\n   CURIOSITY BOX\n   ────────────────────────────────────────────────── */\n.curiosity-box-card { background: #FFFBEB; }\n\n/* ──────────────────────────────────────────────────\n   STEM FACT\n   ────────────────────────────────────────────────── */\n.stem-fact-card { background: #F9F5FF; }\n.stem-fact-layout { display: flex; gap: 10px; align-items: flex-start; }\n.oled-mini-screen {\n  background: #030712;\n  color: #00FF9F;\n  font-family: 'Fira Code', monospace;\n  font-size: 0.62rem; font-weight: 600;\n  border-radius: 8px;\n  padding: 8px 10px;\n  border: 2px solid #1E293B;\n  min-width: 90px; flex-shrink: 0;\n  box-shadow: inset 0 0 12px rgba(0,255,159,0.1);\n  white-space: pre;\n}\n\n/* ──────────────────────────────────────────────────\n   MISSION OBJECTIVES ROW\n   ────────────────────────────────────────────────── */\n.mission-objectives-card { background: #F8FAFF; }\n.objectives-row {\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  gap: 6px;\n  margin-top: 4px;\n}\n.objective-cell {\n  background: #FFFFFF;\n  border: 1.5px solid #DBEAFE;\n  border-radius: 8px;\n  padding: 6px 4px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  display: flex; flex-direction: column; align-items: center; gap: 4px;\n}\n.obj-num-circle {\n  background: var(--mission-blue, #1E40AF);\n  color: #fff; font-weight: 900; font-size: 0.9rem;\n  width: 28px; height: 28px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n}\n.obj-icon { font-size: 20px; }\n.obj-text-block strong { font-size: 0.78rem; color: #0F172A; display: block; line-height: 1.3; }\n.obj-sub { font-size: 0.68rem; color: #64748B; }\n\n/* ──────────────────────────────────────────────────\n   THINK LIKE AN ENGINEER\n   ────────────────────────────────────────────────── */\n.think-engineer-card { background: #F8FAFF; }\n.question-prompt { font-weight: 700; font-size: 0.84rem; color: #1E40AF; margin-bottom: 8px; line-height: 1.4; }\n.answer-lines { margin: 4px 0 8px; }\n.answer-dotted-line { border-bottom: 1.5px dashed #CBD5E1; height: 22px; margin: 4px 0; }\n.scenario-comparison { display: grid; grid-template-columns: 1fr 40px 1fr; gap: 8px; align-items: center; margin-top: 8px; }\n.scenario-box {\n  border-radius: 10px; padding: 8px 10px; text-align: center;\n  border: 1.5px solid; min-height: auto;\n}\n.scenario-ok { background: #F0FDF4; border-color: #86EFAC; }\n.scenario-warn { background: #FFF5F5; border-color: #FCA5A5; }\n.scenario-room-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }\n.scenario-stats { font-size: 0.75rem; display: flex; gap: 8px; justify-content: center; margin-bottom: 4px; color: #334155; }\n.scenario-feel-ok { background: #16A34A; color: #fff; border-radius: 999px; font-size: 0.68rem; font-weight: 700; padding: 2px 10px; display: inline-block; }\n.scenario-feel-warn { background: #DC2626; color: #fff; border-radius: 999px; font-size: 0.68rem; font-weight: 700; padding: 2px 10px; display: inline-block; }\n.scenario-emoji { font-size: 24px; display: block; margin-top: 4px; }\n.vs-circle {\n  background: #1E40AF; color: #fff;\n  width: 36px; height: 36px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-weight: 900; font-size: 0.72rem;\n  justify-self: center;\n}\n\n/* ──────────────────────────────────────────────────\n   OBSERVE & ANSWER CARD (Page 2)\n   ────────────────────────────────────────────────── */\n.observe-card { background: #F0FDF4; }\n.observe-intro { font-size: 0.8rem; color: #166534; margin-bottom: 8px; font-weight: 600; }\n.observe-image-placeholder {\n  background: #DCFCE7; border-radius: 10px;\n  padding: 12px; margin-bottom: 8px; text-align: center;\n}\n.obs-img-box { font-size: 28px; }\n.observe-q-item {\n  display: grid; grid-template-columns: 24px 1fr;\n  gap: 6px; margin-bottom: 8px; align-items: start;\n}\n.observe-q-num {\n  background: #16A34A; color: #fff;\n  width: 22px; height: 22px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 0.7rem; font-weight: 800; flex-shrink: 0;\n}\n.observe-q-text { font-size: 0.8rem; color: #1E293B; font-weight: 600; padding-top: 2px; }\n.observe-answer-line { border-bottom: 1.5px dashed #CBD5E1; height: 20px; grid-column: 2; }\n\n/* ──────────────────────────────────────────────────\n   COMPONENT SPOTLIGHT (Page 2)\n   ────────────────────────────────────────────────── */\n.component-spotlight-card { background: #F0FDF4; }\n.component-layout { display: grid; grid-template-columns: 1fr 80px; gap: 10px; margin-bottom: 10px; }\n.component-name { font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 900; color: #16A34A; }\n.component-subtitle { font-size: 0.72rem; font-weight: 800; color: #374151; letter-spacing: 0.04em; margin-bottom: 6px; }\n.feature-list { list-style: none; padding: 0; }\n.feature-item { font-size: 0.78rem; color: #1E293B; padding: 2px 0; display: flex; align-items: center; gap: 4px; }\n.component-img-placeholder {\n  background: #DCFCE7; border-radius: 8px;\n  display: flex; align-items: center; justify-content: center;\n  border: 1px dashed #86EFAC;\n}\n.component-img-box { font-size: 36px; }\n\n/* Pin Configuration */\n.pin-config-section { margin-top: 8px; border: 1.5px solid #BBF7D0; border-radius: 8px; overflow: hidden; }\n.pin-config-title { background: #16A34A; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; letter-spacing: 0.06em; }\n.pin-config-table { padding: 6px 8px; }\n.pin-row { display: grid; grid-template-columns: 30px 60px 1fr; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #F0FDF4; }\n.pin-num {\n  width: 26px; height: 26px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-weight: 800; font-size: 0.78rem; color: #fff;\n}\n.pin-red { background: #DC2626; }\n.pin-blue { background: #2563EB; }\n.pin-black { background: #374151; }\n.pin-label { font-weight: 800; font-size: 0.78rem; }\n.pin-label-red { color: #DC2626; }\n.pin-label-blue { color: #2563EB; }\n.pin-label-black { color: #374151; }\n.pin-desc { font-size: 0.75rem; color: #374151; }\n\n/* Specs Grid */\n.specs-section { margin-top: 8px; border: 1.5px solid #BBF7D0; border-radius: 8px; overflow: hidden; }\n.specs-title { background: #16A34A; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; letter-spacing: 0.06em; }\n.specs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 6px; }\n.spec-cell { text-align: center; padding: 6px 4px; background: #fff; border-radius: 6px; border: 1px solid #E5E7EB; }\n.spec-icon { font-size: 16px; margin-bottom: 2px; }\n.spec-label { font-size: 0.62rem; color: #6B7280; font-weight: 600; margin-bottom: 2px; }\n.spec-value { font-size: 0.68rem; font-weight: 700; color: #1E293B; white-space: pre-line; }\n\n/* ──────────────────────────────────────────────────\n   INSIDE SENSOR (Page 2)\n   ────────────────────────────────────────────────── */\n.inside-sensor-card { background: #EFF6FF; }\n.inside-intro { font-size: 0.82rem; font-weight: 600; color: #1E293B; margin-bottom: 8px; }\n.inside-sensor-diagram { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 10px; overflow: hidden; border: 1.5px solid #BFDBFE; margin-bottom: 8px; }\n.sensor-half { padding: 10px; }\n.sensor-left { background: #FEF2F2; border-right: 2px solid #BFDBFE; }\n.sensor-right { background: #EFF6FF; }\n.sensor-half-title { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }\n.sensor-left .sensor-half-title { color: #DC2626; }\n.sensor-right .sensor-half-title { color: #2563EB; }\n.sensor-half-content { font-size: 0.76rem; color: #334155; line-height: 1.4; }\n.inside-bottom-note { display: flex; align-items: center; gap: 6px; background: #F8FAFF; border-radius: 8px; padding: 6px 10px; font-size: 0.76rem; color: #334155; border: 1px solid #BFDBFE; }\n.inside-note-icon { font-size: 16px; flex-shrink: 0; }\n\n/* ──────────────────────────────────────────────────\n   COMPARISON VS (Page 2)\n   ────────────────────────────────────────────────── */\n.comparison-vs-card { background: #FFFBEB; }\n.cv-columns { display: grid; grid-template-columns: 1fr 36px 1fr; gap: 6px; align-items: start; margin: 8px 0; }\n.cv-col { }\n.cv-col-title { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }\n.cv-left .cv-col-title { color: #D97706; }\n.cv-right .cv-col-title { color: #2563EB; }\n.cv-item { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 6px; font-size: 0.76rem; color: #334155; }\n.cv-item-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }\n.cv-vs-badge {\n  background: #1E40AF; color: #fff;\n  width: 32px; height: 32px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-weight: 900; font-size: 0.7rem; align-self: center;\n}\n.cv-bottom-note { font-size: 0.74rem; font-weight: 800; color: #16A34A; text-align: center; margin-top: 8px; padding: 6px; background: #DCFCE7; border-radius: 8px; }\n\n/* ──────────────────────────────────────────────────\n   MISSION CHALLENGE (Page 2)\n   ────────────────────────────────────────────────── */\n.mission-challenge-card { background: #F0FDF4; }\n.challenge-question { font-size: 0.82rem; font-weight: 600; color: #1E293B; margin-bottom: 10px; line-height: 1.5; }\n.challenge-answer-fields { display: flex; gap: 16px; }\n.challenge-answer-field { flex: 1; border-bottom: 2px dashed #CBD5E1; padding: 4px 0; font-size: 0.78rem; color: #94A3B8; }\n\n/* ──────────────────────────────────────────────────\n   BUILD STEPS GRID (Page 3)\n   ────────────────────────────────────────────────── */\n.build-steps-card { background: #fff; }\n.build-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; }\n.build-step-col {\n  background: #F8FAFF; border-radius: 10px; border: 1.5px solid #E2E8F0;\n  padding: 10px 8px; display: flex; flex-direction: column; gap: 6px;\n}\n.step-num-badge {\n  background: var(--mission-orange, #EA580C); color: #fff;\n  width: 28px; height: 28px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-weight: 900; font-size: 0.85rem;\n}\n.step-title { font-size: 0.7rem; font-weight: 800; color: #EA580C; text-transform: uppercase; letter-spacing: 0.04em; }\n.step-img-placeholder {\n  background: #EFF6FF; border-radius: 8px; height: 90px;\n  display: flex; align-items: center; justify-content: center;\n  border: 1px dashed #BFDBFE; margin: 2px 0;\n}\n.step-img-box { font-size: 40px; }\n.step-desc { font-size: 0.74rem; color: #334155; line-height: 1.4; margin: 0; }\n.step-pin-table { width: 100%; border-collapse: collapse; margin-top: 4px; }\n.step-pin-table tr { border-bottom: 1px solid #F1F5F9; }\n.pin-td { font-size: 0.68rem; font-weight: 800; padding: 2px 4px; }\n.pin-td.pin-red { color: #DC2626; }\n.pin-td.pin-blue { color: #2563EB; }\n.pin-td.pin-black { color: #374151; }\n.pin-td.pin- { color: #374151; }\n.pin-arrow { font-size: 0.68rem; color: #94A3B8; padding: 2px 2px; }\n.pin-td-val { font-size: 0.68rem; color: #334155; padding: 2px 4px; }\n\n/* IN THIS LAB */\n.in-this-lab-card { background: #EFF6FF; }\n.lab-list { list-style: none; padding: 0; margin: 4px 0; }\n.lab-item { font-size: 0.8rem; color: #1E293B; padding: 4px 0; display: flex; align-items: center; gap: 6px; }\n\n/* PRO TIP */\n.pro-tip-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 12px; padding: 10px 12px; }\n.pro-tip-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }\n.pro-tip-icon { font-size: 18px; }\n.pro-tip-label { font-weight: 800; font-size: 0.78rem; color: #D97706; text-transform: uppercase; letter-spacing: 0.06em; }\n.pro-tip-content { font-size: 0.78rem; color: #374151; line-height: 1.5; }\n\n/* DEVICE READY */\n.device-ready-card { background: #EFF6FF; }\n.device-ready-layout { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; }\n.device-img-placeholder { background: #DBEAFE; border-radius: 10px; min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #93C5FD; }\n.device-img-box { font-size: 40px; }\n\n/* COMMON MISTAKES */\n.common-mistakes-card { background: #FFF5F5; }\n.mistakes-table { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }\n.mistake-row {\n  display: grid; grid-template-columns: 28px 1fr 20px 1fr;\n  align-items: center; gap: 6px;\n  background: #fff; border-radius: 8px; padding: 6px 10px;\n  border: 1px solid #FECACA;\n}\n.mistake-icon-col { font-size: 16px; text-align: center; }\n.mistake-issue { font-size: 0.76rem; color: #DC2626; font-weight: 600; }\n.mistake-arrow { font-size: 0.8rem; color: #94A3B8; text-align: center; }\n.mistake-fix { font-size: 0.76rem; color: #16A34A; font-weight: 600; }\n\n/* ENGINEER TIP */\n.engineer-tip-card { border-radius: 12px; padding: 10px 12px; background: #F0FDFA; border: 1.5px solid #99F6E4; }\n.eng-tip-layout { display: flex; align-items: flex-start; gap: 10px; }\n.eng-tip-icon { font-size: 20px; flex-shrink: 0; }\n.eng-tip-label { font-size: 0.7rem; font-weight: 800; color: #0D9488; text-transform: uppercase; letter-spacing: 0.06em; }\n.eng-tip-text { font-size: 0.78rem; color: #0F172A; line-height: 1.45; }\n\n/* ──────────────────────────────────────────────────\n   FLOWCHART (Page 4)\n   ────────────────────────────────────────────────── */\n.flowchart-card { background: #F8FAFF; }\n.flowchart-container { display: flex; flex-direction: column; align-items: center; gap: 0; }\n.fc-step-group { display: flex; flex-direction: column; align-items: center; width: 100%; }\n.fc-box { border-radius: 8px; padding: 7px 12px; font-size: 0.76rem; font-weight: 700; text-align: center; width: 90%; margin: 0 auto; box-sizing: border-box; }\n.fc-box-start { background: #16A34A; color: #fff; border-radius: 999px; }\n.fc-box-process { background: #DBEAFE; color: #1E3A8A; border: 1.5px solid #93C5FD; }\n.fc-box-wait { background: #FEF3C7; color: #78350F; border: 1.5px solid #FDE68A; }\n.fc-box-loop { background: #D1FAE5; color: #064E3B; border-radius: 999px; }\n.fc-arrow { font-size: 1rem; color: #64748B; text-align: center; padding: 1px 0; }\n.fc-step-desc { font-size: 0.7rem; color: #475569; text-align: center; margin: 2px 0; max-width: 90%; }\n.fc-loop-note { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 6px 10px; font-size: 0.74rem; color: #15803D; font-weight: 600; margin-top: 6px; text-align: center; }\n\n/* BLOCKS CODE */\n.blocks-code-card { background: #1E1E2E; border: none; }\n.blocks-code-card .capsule-header { background: #7C3AED; }\n.blocks-code-container { overflow: auto; }\n.blocks-placeholder, .mit-block-indent { padding: 4px 0 4px 16px; }\n.mit-block {\n  border-radius: 6px; padding: 5px 10px; font-size: 0.72rem;\n  font-family: 'Fira Code', monospace; font-weight: 600;\n  margin: 2px 0; display: inline-block; min-width: 120px;\n}\n.mit-block-when { background: #D97706; color: #fff; }\n.mit-block-do { background: #7C3AED; color: #fff; }\n.mit-block-set { background: #0284C7; color: #fff; }\n.mit-block-call { background: #16A34A; color: #fff; }\n\n/* CODE SNIPPET */\n.code-snippet-card { background: #0F172A; }\n.code-snippet-card .capsule-header { background: #1E293B; }\n.code-box { border-radius: 8px; overflow: hidden; border: 1px solid #1E293B; }\n.code-header-bar {\n  background: #1E293B; padding: 6px 10px;\n  display: flex; align-items: center; gap: 6px;\n}\n.code-dot { width: 10px; height: 10px; border-radius: 50%; }\n.code-dot-red { background: #FF5F57; }\n.code-dot-yellow { background: #FEBC2E; }\n.code-dot-green { background: #28C840; }\n.lang-badge { margin-left: auto; font-size: 0.65rem; color: #94A3B8; background: #0F172A; padding: 2px 8px; border-radius: 4px; font-family: 'Fira Code', monospace; }\n.code-content { background: #0F172A; color: #E2E8F0; font-family: 'Fira Code', monospace; font-size: 0.72rem; line-height: 1.6; padding: 10px 12px; margin: 0; overflow-x: auto; }\n.code-content code { outline: none; background: transparent; color: inherit; }\n\n/* VARIABLES AT WORK */\n.variables-card { background: #EFF6FF; }\n.var-intro { font-size: 0.78rem; color: #334155; margin-bottom: 8px; }\n.variables-list { display: flex; flex-direction: column; gap: 8px; }\n.var-item { background: #fff; border-radius: 8px; padding: 8px 10px; border: 1.5px solid #BFDBFE; }\n.var-chip { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }\n.var-chip code { background: #DBEAFE; color: #1E40AF; font-family: 'Fira Code', monospace; font-size: 0.76rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }\n.var-type { font-size: 0.7rem; color: #F59E0B; font-weight: 700; background: #FFFBEB; padding: 1px 6px; border-radius: 4px; }\n.var-icon { font-size: 18px; }\n.var-desc { font-size: 0.76rem; color: #334155; }\n.var-example { font-size: 0.74rem; color: #475569; margin-top: 2px; }\n\n/* OLED PREVIEW CARD */\n.oled-preview-card { background: #0A0F1D; border: 1.5px solid #1E293B; }\n.oled-intro { font-size: 0.78rem; color: #94A3B8; margin-bottom: 8px; }\n.oled-screen-large {\n  background: #030712; color: #00FF9F;\n  font-family: 'Fira Code', monospace; font-size: 0.85rem;\n  font-weight: 700; border-radius: 10px; padding: 14px;\n  border: 3px solid #1E293B;\n  box-shadow: inset 0 0 20px rgba(0,255,159,0.15), 0 0 20px rgba(0,255,159,0.08);\n  text-align: center; white-space: pre;\n}\n\n/* PREDICT & THINK */\n.predict-think-card { background: #F0FDF4; }\n.predict-questions { display: flex; flex-direction: column; gap: 6px; }\n.predict-q-item { display: grid; grid-template-columns: 24px 1fr; gap: 6px; align-items: start; }\n.predict-q-num {\n  background: var(--mission-green, #16A34A); color: #fff;\n  width: 22px; height: 22px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 0.7rem; font-weight: 800; flex-shrink: 0;\n}\n.predict-q-text { font-size: 0.8rem; color: #1E293B; font-weight: 600; padding-top: 2px; }\n.predict-answer-line { border-bottom: 1.5px dashed #CBD5E1; height: 20px; grid-column: 2; }\n\n/* CHALLENGE BOX */\n.challenge-box-card { background: #F0FDF4; border: 2px solid #86EFAC; }\n.challenge-content { font-size: 0.82rem; color: #1E293B; line-height: 1.5; }\n\n/* MISSION PROGRESS */\n.mission-progress-card { background: #F8FAFF; }\n.progress-track { display: flex; align-items: center; justify-content: center; margin-top: 8px; }\n.progress-circle {\n  width: 34px; height: 34px; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center;\n  font-weight: 800; font-size: 0.82rem;\n  background: #E2E8F0; color: #94A3B8;\n  border: 2px solid #CBD5E1;\n  transition: all 0.3s;\n}\n.progress-circle.progress-done { background: #2563EB; color: #fff; border-color: #1D4ED8; }\n.progress-connector { width: 24px; height: 3px; background: #CBD5E1; }\n\n/* ──────────────────────────────────────────────────\n   PAGE 5 — INNOVATION STUDIO\n   ────────────────────────────────────────────────── */\n/* MINI UPGRADE */\n.mini-upgrade-card { background: #F9F5FF; }\n.upgrade-intro { font-size: 0.78rem; color: #5B21B6; margin-bottom: 8px; font-weight: 600; }\n.upgrade-rows { display: flex; flex-direction: column; gap: 6px; }\n.upgrade-row { display: grid; grid-template-columns: 1fr 60px 90px; align-items: center; gap: 8px; background: #fff; border-radius: 8px; padding: 6px 8px; border: 1px solid #E9D5FF; }\n.upgrade-condition-box { display: flex; flex-direction: column; gap: 2px; }\n.upgrade-mood-icon { font-size: 18px; }\n.upgrade-condition { font-size: 0.72rem; color: #374151; font-weight: 600; }\n.upgrade-show { font-size: 0.7rem; color: #6B7280; font-style: italic; }\n.upgrade-arrow { font-size: 0.7rem; color: #9CA3AF; text-align: center; letter-spacing: -2px; }\n.oled-mini-preview {\n  background: #030712; color: #00FF9F;\n  font-family: 'Fira Code', monospace; font-size: 0.58rem;\n  border-radius: 6px; padding: 5px; border: 2px solid #1E293B;\n  white-space: pre; text-align: center;\n  box-shadow: inset 0 0 8px rgba(0,255,159,0.1);\n}\n.oled-blue pre { color: #00BFFF; }\n.oled-green pre { color: #00FF9F; }\n.oled-orange pre { color: #FFA500; }\n.oled-red pre { color: #FF4444; }\n\n/* REAL CHALLENGE */\n.real-challenge-card { background: #F0FDF4; }\n.rc-challenge-title { font-weight: 800; font-size: 0.84rem; color: #16A34A; margin-bottom: 4px; }\n.rc-challenge-desc { font-size: 0.78rem; color: #334155; margin-bottom: 8px; }\n.rc-flow-diagram { display: flex; align-items: center; gap: 4px; margin: 8px 0; flex-wrap: wrap; }\n.rc-flow-step { text-align: center; }\n.rc-flow-icon { font-size: 20px; margin-bottom: 4px; }\n.rc-flow-label { font-size: 0.65rem; font-weight: 700; color: #1E293B; white-space: pre-line; max-width: 70px; line-height: 1.2; }\n.rc-flow-arrow { font-size: 1.2rem; color: #16A34A; }\n.rc-add-more-title { font-size: 0.7rem; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; margin: 6px 0 4px; }\n.rc-addons-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }\n.rc-addon-cell { background: #fff; border: 1.5px solid #BBF7D0; border-radius: 8px; padding: 6px; text-align: center; }\n.rc-addon-icon { font-size: 20px; }\n.rc-addon-label { font-size: 0.66rem; font-weight: 700; color: #374151; margin-top: 2px; }\n.rc-bottom-note { font-size: 0.72rem; color: #166534; font-style: italic; margin-top: 6px; padding: 5px 8px; background: #DCFCE7; border-radius: 6px; }\n\n/* ENGINEERS EVERYWHERE */\n.engineers-everywhere-card { background: #F8FAFF; }\n.ee-intro { font-size: 0.8rem; color: #334155; margin-bottom: 8px; font-weight: 600; }\n.industries-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 6px; }\n.industry-cell {\n  background: #fff; border-radius: 10px; padding: 8px 6px;\n  border: 1.5px solid #E2E8F0; text-align: center;\n}\n.industry-img-placeholder,\n.step-img-box,\n.step-img-placeholder,\n.component-img-placeholder,\n.component-img-box,\n.obs-img-box,\n.observe-image-placeholder {\n  position: relative;\n  background: #EFF6FF;\n  border-radius: 8px;\n  min-height: 54px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 6px;\n  resize: both;\n  overflow: auto;\n  cursor: pointer;\n  box-sizing: border-box;\n}\n.industry-img-placeholder img,\n.step-img-box img,\n.step-img-placeholder img,\n.component-img-placeholder img,\n.component-img-box img,\n.obs-img-box img,\n.observe-image-placeholder img {\n  width: 100% !important;\n  height: 100% !important;\n  max-width: 100% !important;\n  max-height: 100% !important;\n  object-fit: contain !important;\n  border-radius: 6px;\n  display: block;\n}\n.industry-icon { font-size: 28px; }\n.industry-title { font-size: 0.68rem; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }\n.industry-desc { font-size: 0.68rem; color: #475569; line-height: 1.4; }\n\n/* DID YOU KNOW */\n.did-you-know-card { background: #FFFBEB; }\n.dyk-facts { display: flex; flex-direction: column; gap: 6px; }\n.dyk-fact { display: flex; align-items: flex-start; gap: 6px; font-size: 0.78rem; color: #1E293B; line-height: 1.4; }\n.dyk-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }\n\n/* MISSION REVIEW TABLE */\n.mission-review-table-card { background: #F0FDF4; }\n.review-table { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }\n.review-row { display: grid; grid-template-columns: 24px 1fr 1.5fr; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 6px; background: #fff; border: 1px solid #BBF7D0; }\n.review-check { font-size: 14px; }\n.review-question { font-size: 0.74rem; font-weight: 700; color: #374151; }\n.review-answer { font-size: 0.74rem; color: #1E293B; }\n\n/* ULTRA BADGE */\n.ultra-badge-card { background: linear-gradient(135deg, #EFF6FF 0%, #E0F2FE 100%); }\n.badge-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: center; }\n.badge-shield { text-align: center; }\n.badge-shield-icon { font-size: 48px; }\n.badge-name { font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 900; color: #1E40AF; text-transform: uppercase; }\n.badge-subtitle { font-size: 0.75rem; font-weight: 700; color: #7C3AED; margin-top: 4px; }\n.badge-mascot { font-size: 40px; margin-bottom: 6px; }\n.badge-congrats { font-size: 0.78rem; color: #334155; line-height: 1.4; }\n.badge-mascot-note { font-size: 0.8rem; font-weight: 800; color: #7C3AED; margin-top: 6px; }\n\n/* BEYOND MISSION */\n.beyond-mission-card { background: #0F172A; }\n.beyond-mission-card .capsule-header { background: #1E3A8A; }\n.beyond-steps-row { display: grid; grid-template-columns: 1fr 30px 1fr 30px 1fr; align-items: center; gap: 4px; margin: 8px 0; }\n.beyond-step { text-align: center; background: #1E293B; border-radius: 10px; padding: 10px 8px; }\n.beyond-step-icon { font-size: 24px; margin-bottom: 4px; }\n.beyond-step-label { font-size: 0.7rem; font-weight: 800; color: #F59E0B; text-transform: uppercase; margin-bottom: 4px; }\n.beyond-step-desc { font-size: 0.72rem; color: #CBD5E1; line-height: 1.3; }\n.beyond-arrow { font-size: 1.2rem; color: #F59E0B; text-align: center; }\n.beyond-bottom-note { font-size: 0.74rem; color: #94A3B8; font-style: italic; text-align: center; margin-top: 6px; }\n\n/* ──────────────────────────────────────────────────\n   GENERAL CARD TEXT\n   ────────────────────────────────────────────────── */\n.card-body-text { font-size: 0.8rem; color: #334155; line-height: 1.55; }\n.card-body-text p { margin: 3px 0; }\n.card-body-text ul, .card-list { margin: 4px 0; padding-left: 18px; line-height: 1.55; }\n.card-body-text li, .card-list li { margin-bottom: 2px; font-size: 0.78rem; }\n.worksheet-line { border-bottom: 1.5px dashed #CBD5E1; height: 24px; margin: 4px 0; }\n.worksheet-lines { margin-top: 6px; }\n\n/* Drawing Canvas */\n.drawing-canvas-card { background: #F8FAFF; }\n.drawing-canvas-grid {\n  min-height: 140px; border: 2px dashed rgba(59,130,246,0.4); border-radius: 8px;\n  background: radial-gradient(circle, rgba(59,130,246,0.06) 1px, transparent 1px);\n  background-size: 16px 16px;\n  display: flex; align-items: center; justify-content: center;\n  color: #94A3B8; font-size: 0.82rem; text-align: center; padding: 12px;\n  margin-top: 6px;\n}\n\n/* Image Holder */\n.image-holder-card { background: #fff; }\n.image-holder-card .image-frame-container { height: 160px; }\n.card-caption-text { font-size: 0.72rem; color: #64748B; font-style: italic; text-align: center; margin-top: 4px; }\n\n.image-prompt-holder {\n  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);\n  border: 2px dashed #7DD3FC;\n  border-radius: 10px;\n  min-height: 120px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  padding: 12px;\n  gap: 8px;\n  margin: 6px 0;\n}\n.image-prompt-icon { font-size: 32px; }\n.image-prompt-label { font-size: 0.7rem; font-weight: 700; color: #0369A1; letter-spacing: 0.04em; text-transform: uppercase; }\n.image-prompt-caption { font-size: 0.68rem; color: #475569; line-height: 1.4; max-width: 90%; font-style: italic; }\n\n/* Heroes Grid Card */\n.heroes-grid-card { background: #F0FDF4; }\n.heroes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px; }\n.hero-item {\n  background: #fff;\n  border-radius: 10px;\n  padding: 8px 10px;\n  border: 1.5px solid #BBF7D0;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.hero-icon { font-size: 24px; }\n.hero-name { font-size: 0.78rem; font-weight: 800; color: #16A34A; }\n.hero-quote { font-size: 0.72rem; color: #374151; font-style: italic; line-height: 1.3; }\n.hero-uses { font-size: 0.68rem; color: #6B7280; margin-top: 2px; }\n.hero-uses span { background: #DCFCE7; color: #166534; border-radius: 4px; padding: 1px 5px; margin-right: 3px; font-weight: 600; display: inline-block; }\n\n/* Incard Image */\n.incard-image-box {\n  border: 1.5px solid rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;\n  background: transparent; margin: 6px 0;\n}\n.incard-bottom-capsule {\n  padding: 5px 10px; border-top: 1px solid rgba(0,0,0,0.08);\n  font-size: 0.75rem; font-weight: 700; color: #1E293B;\n  text-align: center; background: rgba(37,99,235,0.06);\n}\n\n/* Space Filler */\n.space-filler-card { background: transparent; border: none; box-shadow: none; padding: 4px 0; }\n\n/* === Styles/ultraminds-dynamic-cards.css === */\n/**\n * UltraMinds Dynamic Cards CSS — Premium $50 Book Magazine Aesthetic\n * Covers: dynamic-text, dynamic-bullets, dynamic-subheader, dynamic-table,\n *         dynamic-mixed, dynamic-capsule, dynamic-comparison, dynamic-image\n * Also covers: universal resize handles, delete overlay, bullet add/remove controls\n */\n\n/* ═══════════════════════════════════════════════════════════════\n   UNIVERSAL RESIZE HANDLE\n═══════════════════════════════════════════════════════════════ */\n.um-resize-handle {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  width: 18px;\n  height: 18px;\n  background: linear-gradient(135deg, transparent 40%, var(--accent-cyan, #00F0FF) 40%);\n  border-bottom-right-radius: 6px;\n  cursor: se-resize;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n  z-index: 50;\n}\n\n.card-base:hover .um-resize-handle,\n.split-layout:hover > * .um-resize-handle,\n.draggable-element:hover > .um-resize-handle {\n  opacity: 1;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   UNIVERSAL CARD DELETE HOVER OVERLAY\n═══════════════════════════════════════════════════════════════ */\n.card-base,\n.split-layout > div,\n.draggable-element {\n  position: relative;\n  overflow: visible;\n}\n\n.um-card-quick-actions {\n  position: absolute;\n  top: -12px;\n  right: 6px;\n  display: flex;\n  gap: 4px;\n  opacity: 0;\n  transition: opacity 0.18s ease;\n  z-index: 99999;\n  pointer-events: none;\n}\n\n.card-base:hover > .um-card-quick-actions,\n.draggable-element:hover > .um-card-quick-actions {\n  opacity: 1;\n  pointer-events: all;\n}\n\n.um-qbtn {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  border: none;\n  cursor: pointer;\n  font-size: 0.65rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: bold;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.4);\n  transition: transform 0.15s ease;\n}\n\n.um-qbtn:hover { transform: scale(1.15); }\n.um-qbtn-del  { background: #EF4444; color: #fff; }\n.um-qbtn-dup  { background: #10B981; color: #fff; }\n.um-qbtn-edit { background: #3B82F6; color: #fff; }\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC TEXT CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-text-card {\n  background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95));\n  border: 1px solid rgba(148,163,184,0.15);\n  border-radius: 10px;\n  padding: 14px 16px;\n  margin: 6px 0;\n  box-shadow: 0 2px 12px rgba(0,0,0,0.25);\n}\n\n.dynamic-text-card .card-body-text {\n  color: #CBD5E1;\n  font-size: 0.84rem;\n  line-height: 1.65;\n}\n\n.dynamic-text-card .card-body-text p {\n  margin: 4px 0;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC BULLETS CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-bullets-card {\n  background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9));\n  border: 1px solid rgba(99,102,241,0.25);\n  border-left: 3px solid var(--accent-blue, #3B82F6);\n  border-radius: 10px;\n  padding: 12px 14px;\n  margin: 6px 0;\n  box-shadow: 0 2px 12px rgba(59,130,246,0.1);\n}\n\n.dynamic-bullets-list {\n  list-style: none;\n  margin: 8px 0 0 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.dynamic-bullet-item {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  background: rgba(59,130,246,0.06);\n  border-radius: 6px;\n  padding: 6px 10px;\n  transition: background 0.15s ease;\n  position: relative;\n}\n\n.dynamic-bullet-item:hover {\n  background: rgba(59,130,246,0.12);\n}\n\n.bullet-dot {\n  width: 7px;\n  height: 7px;\n  background: var(--accent-cyan, #00F0FF);\n  border-radius: 50%;\n  flex-shrink: 0;\n  margin-top: 5px;\n  box-shadow: 0 0 6px rgba(0,240,255,0.5);\n}\n\n.bullet-text {\n  flex: 1;\n  color: #E2E8F0;\n  font-size: 0.82rem;\n  line-height: 1.5;\n  outline: none;\n  min-width: 20px;\n}\n\n.bullet-del-btn {\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: #EF4444;\n  color: #fff;\n  border: none;\n  cursor: pointer;\n  font-size: 0.6rem;\n  display: none;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n}\n\n.dynamic-bullet-item:hover .bullet-del-btn {\n  display: flex;\n  opacity: 1;\n}\n\n.add-bullet-btn {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 8px;\n  background: rgba(0,240,255,0.08);\n  border: 1px dashed rgba(0,240,255,0.3);\n  border-radius: 6px;\n  padding: 5px 10px;\n  color: var(--accent-cyan, #00F0FF);\n  font-size: 0.75rem;\n  cursor: pointer;\n  width: 100%;\n  text-align: left;\n  transition: background 0.15s ease;\n}\n\n.add-bullet-btn:hover {\n  background: rgba(0,240,255,0.15);\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC SUBHEADER CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-subheader-card {\n  background: linear-gradient(135deg, rgba(30,41,59,0.0), transparent);\n  border: none;\n  border-bottom: 2px solid;\n  border-image: linear-gradient(90deg, var(--accent-cyan, #00F0FF), transparent) 1;\n  padding: 6px 0 6px 10px;\n  margin: 10px 0 4px 0;\n}\n\n.dynamic-subheader-title {\n  font-size: 1.05rem;\n  font-weight: 800;\n  color: #F1F5F9;\n  letter-spacing: 0.03em;\n  text-transform: uppercase;\n  background: linear-gradient(90deg, var(--accent-cyan, #00F0FF), #A78BFA);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n\n.dynamic-subheader-body {\n  color: #94A3B8;\n  font-size: 0.8rem;\n  margin-top: 4px;\n  line-height: 1.5;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC TABLE CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-table-card {\n  background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9));\n  border: 1px solid rgba(148,163,184,0.12);\n  border-radius: 10px;\n  padding: 12px 14px;\n  margin: 6px 0;\n  overflow-x: auto;\n}\n\n.dynamic-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.78rem;\n}\n\n.dynamic-table th {\n  background: linear-gradient(135deg, var(--accent-blue, #3B82F6), #6366F1);\n  color: #fff;\n  padding: 7px 10px;\n  text-align: left;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  font-size: 0.72rem;\n}\n\n.dynamic-table th:first-child { border-radius: 6px 0 0 6px; }\n.dynamic-table th:last-child  { border-radius: 0 6px 6px 0; }\n\n.dynamic-table td {\n  padding: 6px 10px;\n  border-bottom: 1px solid rgba(148,163,184,0.08);\n  color: #CBD5E1;\n  vertical-align: top;\n}\n\n.dynamic-table tr:nth-child(even) td {\n  background: rgba(255,255,255,0.025);\n}\n\n.dynamic-table tr:hover td {\n  background: rgba(59,130,246,0.07);\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC MIXED CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-mixed-card {\n  background: linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.95));\n  border: 1px solid rgba(148,163,184,0.12);\n  border-radius: 12px;\n  padding: 14px 16px;\n  margin: 6px 0;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.2);\n}\n\n.dynamic-mixed-card .card-body-text {\n  color: #CBD5E1;\n  font-size: 0.82rem;\n  line-height: 1.65;\n}\n\n.dynamic-mixed-bullets {\n  list-style: none;\n  margin: 8px 0 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.dynamic-mixed-bullets li {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 4px 0;\n  color: #E2E8F0;\n  font-size: 0.8rem;\n}\n\n.dynamic-mixed-bullets li::before {\n  content: '▸';\n  color: var(--accent-cyan, #00F0FF);\n  font-weight: bold;\n  flex-shrink: 0;\n  margin-top: 2px;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC CAPSULE CARD — premium highlight box\n═══════════════════════════════════════════════════════════════ */\n.dynamic-capsule-card {\n  background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1));\n  border: 1px solid rgba(139,92,246,0.3);\n  border-left: 4px solid #8B5CF6;\n  border-radius: 10px;\n  padding: 14px 16px;\n  margin: 6px 0;\n  box-shadow: 0 4px 20px rgba(139,92,246,0.15);\n  position: relative;\n  overflow: hidden;\n}\n\n.dynamic-capsule-card::before {\n  content: '';\n  position: absolute;\n  top: -30px;\n  right: -30px;\n  width: 80px;\n  height: 80px;\n  background: radial-gradient(circle, rgba(139,92,246,0.2), transparent);\n  border-radius: 50%;\n}\n\n.dynamic-capsule-card .card-body-text {\n  color: #E9D5FF;\n  font-size: 0.84rem;\n  line-height: 1.65;\n  position: relative;\n  z-index: 1;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC COMPARISON CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-comparison-card {\n  background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9));\n  border: 1px solid rgba(148,163,184,0.12);\n  border-radius: 12px;\n  padding: 14px 16px;\n  margin: 6px 0;\n}\n\n.dynamic-comparison-grid {\n  display: grid;\n  grid-template-columns: 1fr auto 1fr;\n  gap: 10px;\n  align-items: start;\n  margin-top: 10px;\n}\n\n.dynamic-comp-col {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.dynamic-comp-col-title {\n  font-size: 0.72rem;\n  font-weight: 800;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  margin-bottom: 6px;\n  padding: 4px 8px;\n  border-radius: 4px;\n}\n\n.dynamic-comp-col.comp-left .dynamic-comp-col-title {\n  background: rgba(59,130,246,0.15);\n  color: #93C5FD;\n  border-left: 2px solid #3B82F6;\n}\n\n.dynamic-comp-col.comp-right .dynamic-comp-col-title {\n  background: rgba(16,185,129,0.15);\n  color: #6EE7B7;\n  border-left: 2px solid #10B981;\n}\n\n.dynamic-comp-item {\n  display: flex;\n  align-items: flex-start;\n  gap: 6px;\n  padding: 4px 6px;\n  font-size: 0.78rem;\n  color: #CBD5E1;\n}\n\n.dynamic-comp-item .ci-icon {\n  color: var(--accent-cyan, #00F0FF);\n  flex-shrink: 0;\n  font-size: 0.75rem;\n  margin-top: 2px;\n}\n\n.dynamic-vs-badge {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  background: linear-gradient(135deg, #F59E0B, #D97706);\n  border-radius: 50%;\n  font-size: 0.65rem;\n  font-weight: 900;\n  color: #000;\n  align-self: center;\n  box-shadow: 0 2px 10px rgba(245,158,11,0.4);\n  flex-shrink: 0;\n}\n\n.dynamic-comp-bottom {\n  margin-top: 8px;\n  padding: 6px 10px;\n  background: rgba(255,255,255,0.04);\n  border-radius: 6px;\n  font-size: 0.76rem;\n  color: #94A3B8;\n  font-style: italic;\n  text-align: center;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DYNAMIC IMAGE CARD\n═══════════════════════════════════════════════════════════════ */\n.dynamic-image-card {\n  background: rgba(15,23,42,0.8);\n  border: 1.5px dashed rgba(59,130,246,0.35);\n  border-radius: 12px;\n  padding: 10px;\n  margin: 6px 0;\n  text-align: center;\n}\n\n.dynamic-image-frame {\n  width: 100%;\n  height: 160px;\n  background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9));\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  overflow: hidden;\n  position: relative;\n}\n\n.dynamic-image-frame img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.dynamic-image-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  color: #475569;\n}\n\n.dynamic-image-placeholder span {\n  font-size: 2rem;\n}\n\n.dynamic-image-placeholder p {\n  font-size: 0.72rem;\n  margin: 0;\n}\n\n.dynamic-image-caption {\n  margin-top: 6px;\n  font-size: 0.72rem;\n  color: #64748B;\n  text-align: center;\n  font-style: italic;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   INSERT PANEL QUICK BUTTONS\n═══════════════════════════════════════════════════════════════ */\n.insert-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 6px;\n  margin-bottom: 10px;\n}\n\n.insert-btn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  padding: 10px 6px;\n  background: rgba(30,41,59,0.8);\n  border: 1px solid rgba(148,163,184,0.15);\n  border-radius: 8px;\n  color: #94A3B8;\n  font-size: 0.7rem;\n  cursor: pointer;\n  transition: all 0.18s ease;\n  text-align: center;\n  line-height: 1.3;\n}\n\n.insert-btn:hover {\n  background: rgba(59,130,246,0.12);\n  border-color: var(--accent-cyan, #00F0FF);\n  color: #E2E8F0;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 14px rgba(0,240,255,0.12);\n}\n\n.insert-btn .ib-icon {\n  font-size: 1.2rem;\n}\n\n.insert-btn .ib-label {\n  font-weight: 600;\n  font-size: 0.68rem;\n}\n\n.insert-section-label {\n  font-size: 0.67rem;\n  color: #475569;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  margin: 8px 0 4px;\n  padding-bottom: 4px;\n  border-bottom: 1px solid rgba(255,255,255,0.06);\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   KNOWLEDGE CHECK / Q&A CARD\n═══════════════════════════════════════════════════════════════ */\n.knowledge-check-card .kc-question-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 8px;\n}\n\n.kc-question-item {\n  display: flex;\n  gap: 8px;\n  align-items: flex-start;\n  background: rgba(59,130,246,0.06);\n  border-radius: 8px;\n  padding: 8px 10px;\n}\n\n.kc-q-num {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #3B82F6, #6366F1);\n  color: #fff;\n  border-radius: 50%;\n  font-size: 0.68rem;\n  font-weight: 800;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.kc-q-text {\n  color: #CBD5E1;\n  font-size: 0.8rem;\n  line-height: 1.5;\n  flex: 1;\n}\n\n.kc-answer-line {\n  height: 1px;\n  background: rgba(148,163,184,0.2);\n  margin-top: 4px;\n  border-radius: 1px;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   VOCABULARY BUILDER CARD\n═══════════════════════════════════════════════════════════════ */\n.vocabulary-builder-card .vocab-list {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-top: 8px;\n}\n\n.vocab-item {\n  display: flex;\n  gap: 10px;\n  padding: 6px 10px;\n  background: rgba(139,92,246,0.08);\n  border-radius: 6px;\n  border-left: 2px solid #8B5CF6;\n}\n\n.vocab-term {\n  font-weight: 700;\n  color: #C4B5FD;\n  font-size: 0.8rem;\n  min-width: 80px;\n  flex-shrink: 0;\n}\n\n.vocab-def {\n  color: #94A3B8;\n  font-size: 0.78rem;\n  line-height: 1.4;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   SELECTED ELEMENT HIGHLIGHT\n═══════════════════════════════════════════════════════════════ */\n.selected-card {\n  outline: 2px solid var(--accent-cyan, #00F0FF) !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 0 4px rgba(0,240,255,0.15) !important;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   SMART PAGE STACKING INDICATOR\n═══════════════════════════════════════════════════════════════ */\n.page-overflow-badge {\n  position: absolute;\n  bottom: 8px;\n  right: 8px;\n  background: #EF4444;\n  color: #fff;\n  font-size: 0.6rem;\n  padding: 2px 6px;\n  border-radius: 4px;\n  font-weight: 700;\n  display: none;\n  z-index: 10;\n}\n\n.book-page.is-overflowing .page-overflow-badge {\n  display: block;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   RESPONSIVE SPLIT LAYOUT IN DYNAMIC CARDS\n═══════════════════════════════════════════════════════════════ */\n.dynamic-split-inner {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 10px;\n}\n\n@media (max-width: 500px) {\n  .dynamic-split-inner {\n    grid-template-columns: 1fr;\n  }\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   GENERIC CARD ENHANCED (for all fallback types)\n═══════════════════════════════════════════════════════════════ */\n.generic-card {\n  position: relative;\n}\n\n.generic-card .card-body-text {\n  font-size: 0.82rem;\n  line-height: 1.65;\n}\n\n.generic-card .custom-card-list {\n  margin: 6px 0;\n  padding-left: 16px;\n}\n\n.generic-card .custom-card-list li {\n  color: #CBD5E1;\n  font-size: 0.8rem;\n  margin-bottom: 4px;\n  line-height: 1.5;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   ANIMATION: Card entrance\n═══════════════════════════════════════════════════════════════ */\n@keyframes cardFadeIn {\n  from { opacity: 0; transform: translateY(6px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.card-base,\n.dynamic-text-card,\n.dynamic-bullets-card,\n.dynamic-subheader-card,\n.dynamic-table-card,\n.dynamic-mixed-card,\n.dynamic-capsule-card,\n.dynamic-comparison-card,\n.dynamic-image-card {\n  animation: cardFadeIn 0.25s ease both;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   VERTICAL FLOWCHART SEQUENCE (Perfect 1-column alignment)\n═══════════════════════════════════════════════════════════════ */\n.flowchart-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  margin-top: 10px;\n  width: 100%;\n}\n\n.fc-step-group {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  width: 100%;\n  max-width: 320px;\n}\n\n.fc-box {\n  width: 100%;\n  padding: 8px 14px;\n  border-radius: 8px;\n  font-weight: 700;\n  font-size: 0.8rem;\n  text-align: center;\n  letter-spacing: 0.03em;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.25);\n  transition: transform 0.15s ease, box-shadow 0.15s ease;\n}\n\n.fc-box:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 14px rgba(0,240,255,0.25);\n}\n\n.fc-box-start {\n  background: linear-gradient(135deg, #10B981, #059669);\n  color: #FFFFFF;\n}\n\n.fc-box-process {\n  background: linear-gradient(135deg, #3B82F6, #1D4ED8);\n  color: #FFFFFF;\n}\n\n.fc-box-wait {\n  background: linear-gradient(135deg, #F59E0B, #D97706);\n  color: #FFFFFF;\n}\n\n.fc-box-loop {\n  background: linear-gradient(135deg, #8B5CF6, #6D28D9);\n  color: #FFFFFF;\n}\n\n.fc-arrow {\n  color: var(--accent-cyan, #00F0FF);\n  font-size: 0.95rem;\n  font-weight: 900;\n  margin: 3px 0;\n  text-shadow: 0 0 8px rgba(0,240,255,0.6);\n  line-height: 1;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   CHECKBOX LISTS (Perfect alignment, no text clipping)\n═══════════════════════════════════════════════════════════════ */\n.custom-chk-list {\n  list-style: none;\n  margin: 6px 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.custom-chk-item {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 6px 10px;\n  background: rgba(255,255,255,0.03);\n  border: 1px solid rgba(148,163,184,0.12);\n  border-radius: 6px;\n  transition: background 0.15s ease;\n}\n\n.custom-chk-item:hover {\n  background: rgba(59,130,246,0.08);\n}\n\n.chk-box {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 16px;\n  height: 16px;\n  border: 1.5px solid var(--accent-cyan, #00F0FF);\n  border-radius: 3px;\n  color: var(--accent-cyan, #00F0FF);\n  font-size: 0.65rem;\n  font-weight: bold;\n  flex-shrink: 0;\n  margin-top: 2px;\n  background: rgba(0,240,255,0.08);\n}\n\n.chk-label {\n  color: #E2E8F0;\n  font-size: 0.8rem;\n  line-height: 1.5;\n  flex: 1;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   DIFFICULTY LEVEL BADGE\n═══════════════════════════════════════════════════════════════ */\n.difficulty-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1));\n  border: 1px solid rgba(245,158,11,0.3);\n  padding: 6px 12px;\n  border-radius: 20px;\n  color: #FBBF24;\n  font-weight: 700;\n  font-size: 0.8rem;\n  letter-spacing: 0.04em;\n  margin: 6px 0;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   HIGH-CONTRAST LIGHT TEXT ON DARK CARDS (Fixes dark text bug)\n═══════════════════════════════════════════════════════════════ */\n.theme-card-dark,\n.code-snippet-card,\n.testing-lab-card,\n.flowchart-card,\n.oled-preview-card,\n.beyond-mission-card,\n.dynamic-text-card,\n.dynamic-bullets-card,\n.dynamic-table-card,\n.dynamic-mixed-card,\n.dynamic-comparison-card,\n.dynamic-image-card {\n  color: #E2E8F0 !important;\n}\n\n.theme-card-dark .card-body-text,\n.theme-card-dark p,\n.theme-card-dark span,\n.theme-card-dark div,\n.theme-card-dark li,\n.testing-lab-card .card-body-text,\n.testing-lab-card p,\n.testing-lab-card span,\n.testing-lab-card div,\n.testing-lab-card li,\n.code-snippet-card code,\n.code-snippet-card pre {\n  color: #E2E8F0 !important;\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   MASCOT & EMOJI RESIZE & DELETE CONTROLS\n═══════════════════════════════════════════════════════════════ */\n.cover-mascot-wrapper,\n.badge-mascot,\n.story-img-sticker,\n.round-icon-badge,\n.card-icon-badge,\n.page-banner-icon {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  resize: both;\n  overflow: auto;\n  min-width: 24px;\n  min-height: 24px;\n  transition: transform 0.15s ease, box-shadow 0.15s ease;\n}\n\n.cover-mascot-wrapper:hover,\n.badge-mascot:hover,\n.story-img-sticker:hover {\n  outline: 1.5px dashed var(--accent-cyan, #00F0FF);\n  border-radius: 6px;\n}\n\n.cover-mascot-wrapper:hover::after,\n.badge-mascot:hover::after,\n.story-img-sticker:hover::after {\n  content: '✕';\n  position: absolute;\n  top: -6px;\n  right: -6px;\n  width: 18px;\n  height: 18px;\n  background: #EF4444;\n  color: #FFFFFF;\n  border-radius: 50%;\n  font-size: 0.65rem;\n  font-weight: bold;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  z-index: 99999;\n  box-shadow: 0 2px 6px rgba(0,0,0,0.4);\n}\n\n/* ═══════════════════════════════════════════════════════════════\n   IN-CARD TOOLBAR & SUBCARDS (Editor buttons hidden by default)\n═══════════════════════════════════════════════════════════════ */\n/* In-Card added sub-elements are ALWAYS fully visible inside cards */\n.incard-bullets-wrapper,\n.incard-text-wrapper,\n.incard-callout-wrapper,\n.incard-pair-wrapper,\n.incard-code-wrapper,\n.in-card-subcard {\n  display: block !important;\n  visibility: visible !important;\n  opacity: 1 !important;\n}\n\n.incard-element-bar,\n.incard-del-btn,\n.add-bullet-btn,\n.bullet-del-btn,\n.step-del-btn,\n.header-del-btn,\n.mascot-del-btn,\n.subcard-actions {\n  display: none !important;\n}\n\n/* Mascot & Pin Emoji Wrappers */\n.badge-mascot,\n.badge-mascot-wrapper,\n.cover-mascot-wrapper,\n.round-icon-badge,\n.card-icon-badge,\n.cover-illustration-placeholder,\n.pin-sticker,\n.incard-icon-box {\n  position: relative !important;\n  overflow: visible !important;\n}\n\n.mascot-del-btn {\n  display: none !important;\n  position: absolute !important;\n  top: -8px !important;\n  right: -8px !important;\n  background: #EF4444 !important;\n  color: #FFFFFF !important;\n  border: 1px solid #FFFFFF !important;\n  border-radius: 50% !important;\n  width: 20px !important;\n  height: 20px !important;\n  font-size: 11px !important;\n  font-weight: 900 !important;\n  cursor: pointer !important;\n  align-items: center !important;\n  justify-content: center !important;\n  z-index: 999999 !important;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;\n}\n\n/* Restrict helper controls strictly to the active hovered item */\n.incard-bullets-wrapper:hover .incard-del-btn,\n.incard-text-wrapper:hover .incard-del-btn,\n.incard-callout-wrapper:hover .incard-del-btn,\n.incard-pair-wrapper:hover .incard-del-btn,\n.incard-code-wrapper:hover .incard-del-btn,\n.build-step-col:hover .step-del-btn,\n.step-card:hover .step-del-btn,\n.wiring-step-card:hover .step-del-btn,\n.cover-header-banner:hover .header-del-btn,\n.mission-header-banner:hover .header-del-btn,\n.badge-mascot:hover .mascot-del-btn,\n.badge-mascot-wrapper:hover .mascot-del-btn,\n.cover-mascot-wrapper:hover .mascot-del-btn,\n.round-icon-badge:hover .mascot-del-btn,\n.card-icon-badge:hover .mascot-del-btn,\n.cover-illustration-placeholder:hover .mascot-del-btn,\n.pin-sticker:hover .mascot-del-btn,\n.incard-icon-box:hover .mascot-del-btn,\n.incard-bullets-wrapper:hover .add-bullet-btn,\n.dynamic-bullets-card:hover .add-bullet-btn {\n  display: flex !important;\n}\n\n.dynamic-bullet-item:hover .bullet-del-btn {\n  display: inline-flex !important;\n}\n\n.in-card-subcard:hover .subcard-actions {\n  display: flex !important;\n}\n\n.incard-add-btn {\n  background: rgba(15,23,42,0.85);\n  color: #93C5FD;\n  border: 1px dashed rgba(59,130,246,0.6);\n  border-radius: 4px;\n  font-size: 0.66rem;\n  font-weight: 600;\n  padding: 3px 7px;\n  cursor: pointer;\n  transition: background 0.15s, border-color 0.15s, color 0.15s;\n}\n\n.incard-add-btn:hover {\n  background: rgba(59,130,246,0.3);\n  border-color: #00F0FF;\n  color: #FFFFFF;\n}\n\n.in-card-subcard {\n  box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;\n  transition: border-color 0.15s ease;\n}\n\n.in-card-subcard:hover {\n  border-color: #00F0FF !important;\n}\n\n.footer-delete-btn {\n  display: none !important;\n  position: absolute;\n  top: -10px;\n  right: 12px;\n  background: #EF4444;\n  color: #FFFFFF;\n  border: none;\n  border-radius: 10px;\n  padding: 2px 8px;\n  font-size: 0.65rem;\n  font-weight: bold;\n  cursor: pointer;\n  z-index: 99999;\n  box-shadow: 0 2px 6px rgba(0,0,0,0.4);\n}\n\n.page-footer:hover .footer-delete-btn {\n  display: flex !important;\n}\n\n.page-overflow-badge {\n  position: absolute !important;\n  top: 8px !important;\n  right: 12px !important;\n  width: auto !important;\n  max-width: 260px !important;\n  height: auto !important;\n  max-height: 28px !important;\n  background: #EF4444 !important;\n  color: #FFFFFF !important;\n  font-size: 0.65rem !important;\n  font-weight: 800 !important;\n  padding: 3px 10px !important;\n  border-radius: 12px !important;\n  z-index: 99999 !important;\n  cursor: pointer !important;\n  box-shadow: 0 4px 12px rgba(239,68,68,0.5) !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  white-space: nowrap !important;\n  pointer-events: auto !important;\n}\n\n/* Print & Export Rules — 100% Hide all editing widgets */\n@media print {\n  .footer-delete-btn,\n  .incard-element-bar,\n  .incard-add-btn,\n  .add-bullet-btn,\n  .bullet-del-btn,\n  .subcard-actions,\n  .um-card-quick-actions,\n  .card-move-arrows-overlay,\n  .um-resize-handle,\n  .page-overflow-badge {\n    display: none !important;\n  }\n}\n\n.exporting-pdf .footer-delete-btn,\n.exporting-pdf .incard-element-bar,\n.exporting-pdf .incard-add-btn,\n.exporting-pdf .add-bullet-btn,\n.exporting-pdf .bullet-del-btn,\n.exporting-pdf .subcard-actions,\n.exporting-pdf .um-card-quick-actions,\n.exporting-pdf .card-move-arrows-overlay,\n.exporting-pdf .um-resize-handle,\n.exporting-pdf .page-overflow-badge {\n  display: none !important;\n}\n\n/* studio editing overflow override: #a4-canvas-container / .right-canvas-viewport MUST have overflow-y: auto for vertical page scrolling */\nbody.studio-app:not(.exporting-pdf) #a4-canvas-container,\nbody.studio-app:not(.exporting-pdf) .right-canvas-viewport {\n  overflow-y: auto !important;\n  overflow-x: auto !important;\n  height: calc(100vh - 78px) !important;\n  padding: 30px 40px !important;\n  box-sizing: border-box !important;\n}\n\n/* Page & Page Body containers inside canvas: overflow visible so handles float cleanly on page edges without clipping */\nbody.studio-app:not(.exporting-pdf) .book-page,\nbody.studio-app:not(.exporting-pdf) .page-body-container {\n  overflow: visible !important;\n}\n\n/* 8-Point Transform Resize Handles & Overlay Stack */\n.transform-handle {\n  position: absolute !important;\n  width: 18px !important;\n  height: 18px !important;\n  background: #00F0FF !important;\n  border: 2.5px solid #0F172A !important;\n  border-radius: 50% !important;\n  z-index: 2000000 !important;\n  box-shadow: 0 0 12px rgba(0, 240, 255, 0.9), 0 3px 10px rgba(0,0,0,0.8) !important;\n  pointer-events: auto !important;\n  touch-action: none !important;\n  cursor: pointer;\n}\n\n.transform-handle::after {\n  content: '';\n  position: absolute;\n  top: -8px;\n  left: -8px;\n  right: -8px;\n  bottom: -8px;\n  cursor: inherit;\n}\n\n.card-move-arrows-overlay {\n  position: absolute !important;\n  top: -38px !important;\n  right: 4px !important;\n  z-index: 1000000 !important;\n  display: flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  background: rgba(15, 23, 42, 0.96) !important;\n  padding: 4px 10px !important;\n  border-radius: 14px !important;\n  border: 1.5px solid #00F0FF !important;\n  box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 12px rgba(0,240,255,0.4) !important;\n  pointer-events: auto !important;\n  white-space: nowrap !important;\n}\n\n.selected-card,\n.selected-card-outline,\n.transform-handles-active,\n.floating-clipart-sticker.selected-card,\n.card-base.selected-card,\n.concept-card.selected-card,\n.code-snippet-card.selected-card,\n.image-holder-card.selected-card,\n.space-filler-card.selected-card,\n.sub-card.selected-card,\n.in-card-step.selected-card,\n.build-step-col.selected-card,\n.incard-image-box.selected-card {\n  overflow: visible !important;\n  z-index: 99999 !important;\n}\n\n/* Top handles */\n.handle-nw { top: 0 !important; left: 0 !important; transform: translate(-50%, -50%) !important; cursor: nwse-resize !important; }\n.handle-n  { top: 0 !important; left: 50% !important; transform: translate(-50%, -50%) !important; cursor: ns-resize !important; }\n.handle-ne { top: 0 !important; right: 0 !important; transform: translate(50%, -50%) !important; cursor: nesw-resize !important; }\n\n/* Middle side handles */\n.handle-e  { top: 50% !important; right: 0 !important; transform: translate(50%, -50%) !important; cursor: ew-resize !important; }\n.handle-w  { top: 50% !important; left: 0 !important; transform: translate(-50%, -50%) !important; cursor: ew-resize !important; }\n\n/* Bottom handles */\n.handle-se { bottom: 0 !important; right: 0 !important; transform: translate(50%, 50%) !important; cursor: nwse-resize !important; }\n.handle-s  { bottom: 0 !important; left: 50% !important; transform: translate(-50%, 50%) !important; cursor: ns-resize !important; }\n.handle-sw { bottom: 0 !important; left: 0 !important; transform: translate(-50%, 50%) !important; cursor: nesw-resize !important; }\n\n\n\n\n/* === Styles/ultraminds-utilities.css === */\n/* ==========================================================================\n   ULTRAMINDS UI - UTILITIES & PRINT ENGINE (ultraminds-utilities.css)\n   ========================================================================== */\n\n/* --------------------------------------------------------------------------\n   01. TYPOGRAPHY & ALIGNMENT UTILITIES\n   -------------------------------------------------------------------------- */\n.text-center { text-align: center; }\n.text-right { text-align: right; }\n.text-left { text-align: left; }\n\n.text-muted { color: var(--text-muted); }\n.text-bold { font-weight: 800; }\n.text-uppercase { text-transform: uppercase; }\n\n/* Spacing Helpers */\n.mt-xs { margin-top: var(--space-xs); }\n.mt-sm { margin-top: var(--space-sm); }\n.mt-md { margin-top: var(--space-md); }\n.mt-lg { margin-top: var(--space-lg); }\n\n.mb-none { margin-bottom: 0 !important; }\n.mb-xs { margin-bottom: var(--space-xs); }\n.mb-sm { margin-bottom: var(--space-sm); }\n.mb-md { margin-bottom: var(--space-md); }\n.mb-lg { margin-bottom: var(--space-lg); }\n\n.p-sm { padding: var(--space-sm); }\n.p-md { padding: var(--space-md); }\n.p-lg { padding: var(--space-lg); }\n\n/* Flex Helpers */\n.flex-center { display: flex; align-items: center; justify-content: center; }\n.flex-between { display: flex; align-items: center; justify-content: space-between; }\n.gap-sm { gap: var(--space-sm); }\n.gap-md { gap: var(--space-md); }\n\n/* --------------------------------------------------------------------------\n   02. PHASE 2: PRINT ENGINE (Exact A4 Book Printouts)\n   -------------------------------------------------------------------------- */\n@media print {\n  * {\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;\n  }\n\n  @page {\n    size: A4 portrait;\n    margin: 0mm !important; /* Full bleed exact A4 210mm x 297mm */\n  }\n\n  body.mode-landscape {\n    @page {\n      size: A4 landscape;\n      margin: 0mm !important;\n    }\n  }\n\n  html, body {\n    background: #FFFFFF !important;\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 210mm !important;\n    height: auto !important;\n  }\n\n  body.mode-landscape {\n    width: 297mm !important;\n  }\n\n  /* Exact A4 Sheet per Page */\n  .book-page, .a4-page {\n    width: 210mm !important;\n    height: 297mm !important;\n    min-width: 210mm !important;\n    min-height: 297mm !important;\n    max-width: 210mm !important;\n    max-height: 297mm !important;\n    margin: 0 !important;\n    padding: 10mm 12mm !important;\n    box-shadow: none !important;\n    border: none !important;\n    border-radius: 0 !important;\n    transform: none !important;\n    page-break-before: always !important;\n    page-break-after: always !important;\n    break-before: page !important;\n    break-after: page !important;\n    overflow: hidden !important;\n  }\n\n  body.mode-landscape .book-page,\n  .book-page.landscape {\n    width: 297mm !important;\n    height: 210mm !important;\n    min-width: 297mm !important;\n    min-height: 210mm !important;\n    max-width: 297mm !important;\n    max-height: 210mm !important;\n  }\n\n  .book-page:first-of-type {\n    page-break-before: avoid !important;\n    break-before: avoid !important;\n  }\n\n  /* Disable screen-only elements in print */\n  .no-print {\n    display: none !important;\n  }\n}";
  },

  /**
   * Compiles all CSS stylesheets into a single self-contained string.
   * Uses bundled CSS as guaranteed base, tries live fetch for updates if online,
   * and appends responsive/interactive layer.
   */
  async _compileXHTMLStyles() {
    let baseCSS = this._getBundledCSS();

    const cssFiles = [
      'Styles/ultraminds-core.css',
      'Styles/ultraminds-layout.css',
      'Styles/ultraminds-cards.css',
      'Styles/ultraminds-dynamic-cards.css',
      'Styles/ultraminds-utilities.css'
    ];

    try {
      let liveCSS = '';
      let fetchCount = 0;
      for (const file of cssFiles) {
        try {
          const response = await fetch(file);
          if (response.ok) {
            liveCSS += '/* === ' + file + ' === */\n' + (await response.text()) + '\n\n';
            fetchCount++;
          }
        } catch (e) {}
      }
      if (fetchCount === cssFiles.length && liveCSS.length > 50000) {
        baseCSS = liveCSS;
      }
    } catch (e) {}

    return baseCSS + '\n\n' + this._buildResponsiveCSS();
  },

  /**
   * Responsive breakpoints, dark mode, interactive UI elements, print rules,
   * and web-view overrides for standalone XHTML viewing.
   */
  _buildResponsiveCSS() {
    return [
'/* ═══════════════════════════════════════════════════════════════════════════',
'   ULTRAMINDS INTERACTIVE XHTML — RESPONSIVE & INTERACTIVE LAYER',
'   ═══════════════════════════════════════════════════════════════════════════ */',
'',
'/* --- Reset & Document Base --- */',
'html, body { margin:0; padding:0; scroll-behavior:smooth; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }',
'body { font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:#0F172A; line-height:1.6; background:#F1F5F9; }',
'body.studio-app { position:static !important; overflow:auto !important; height:auto !important; }',
'',
'/* --- Progress Bar --- */',
'.um-progress-bar { position:fixed; top:0; left:0; height:3px; background:linear-gradient(90deg,#2563EB,#00F0FF); z-index:9999; transition:width .2s ease-out; border-radius:0 2px 2px 0; pointer-events:none; }',
'',
'/* --- Navigation Header --- */',
'.um-nav-header { position:sticky; top:0; z-index:1000; background:rgba(15,23,42,.97); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); padding:8px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.08); box-shadow:0 4px 24px rgba(0,0,0,.18); }',
'.um-nav-brand { display:flex; align-items:center; gap:10px; color:#F8FAFC; font-weight:800; font-family:"Outfit",sans-serif; font-size:1rem; letter-spacing:.02em; }',
'.um-nav-brand-badge { background:linear-gradient(135deg,#2563EB,#00F0FF); color:#FFF; padding:2px 8px; border-radius:6px; font-size:.7rem; font-weight:800; }',
'.um-nav-controls { display:flex; align-items:center; gap:8px; }',
'.um-nav-btn { background:rgba(255,255,255,.08); color:#CBD5E1; border:1px solid rgba(255,255,255,.1); padding:5px 12px; border-radius:8px; font-size:.78rem; cursor:pointer; transition:all .2s ease; font-family:"Inter",sans-serif; font-weight:600; }',
'.um-nav-btn:hover { background:rgba(255,255,255,.16); color:#F8FAFC; border-color:rgba(255,255,255,.2); }',
'.um-nav-btn.active { background:#2563EB; color:#FFF; border-color:#2563EB; }',
'',
'/* --- TOC Sidebar --- */',
'.um-toc-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.45); z-index:899; display:none; opacity:0; transition:opacity .3s ease; }',
'.um-toc-overlay.open { display:block; opacity:1; }',
'.um-toc-sidebar { position:fixed; left:0; top:0; bottom:0; width:280px; background:rgba(15,23,42,.98); backdrop-filter:blur(16px); border-right:1px solid rgba(255,255,255,.06); padding:16px 0; overflow-y:auto; z-index:900; transform:translateX(-100%); transition:transform .3s cubic-bezier(.4,0,.2,1); box-shadow:4px 0 32px rgba(0,0,0,.25); }',
'.um-toc-sidebar.open { transform:translateX(0); }',
'.um-toc-title { padding:16px 18px 14px; font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:#64748B; border-bottom:1px solid rgba(255,255,255,.06); margin-bottom:8px; }',
'.um-toc-item { display:flex; align-items:center; gap:10px; padding:11px 18px; color:#94A3B8; text-decoration:none; font-size:.82rem; font-weight:600; transition:all .2s ease; border-left:3px solid transparent; cursor:pointer; }',
'.um-toc-item:hover { background:rgba(255,255,255,.04); color:#F8FAFC; border-left-color:#2563EB; }',
'.um-toc-item.active { background:rgba(37,99,235,.12); color:#60A5FA; border-left-color:#2563EB; }',
'.um-toc-num { background:linear-gradient(135deg,#1E40AF,#2563EB); color:#FFF; width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:800; flex-shrink:0; }',
'',
'/* --- Pages Container (Web View) --- */',
'.um-pages-container { max-width:860px; margin:0 auto; padding:28px 20px 80px; }',
'',
'/* --- Page Cards for Web Context --- */',
'.um-pages-container .book-page,',
'.um-pages-container .a4-page {',
'  width:100% !important; max-width:794px !important;',
'  min-height:1123px !important; height:auto !important; max-height:none !important;',
'  margin:0 auto 36px auto !important;',
'  padding:18px 22px 52px 22px !important;',
'  box-sizing:border-box;',
'  background:#FFFFFF;',
'  border-radius:16px;',
'  box-shadow:0 10px 40px rgba(15,23,42,.10),0 2px 6px rgba(0,0,0,.04);',
'  border:1px solid rgba(0,0,0,.06);',
'  position:relative;',
'  overflow:visible !important;',
'  display:flex; flex-direction:column;',
'  transform:none !important;',
'  isolation:auto;',
'  opacity:1;',
'}',
'',
'/* --- Page body container --- */',
'.um-pages-container .page-body-container {',
'  overflow:visible !important; flex:1; display:flex; flex-direction:column; gap:6px;',
'}',
'',
'/* --- Page footer --- */',
'.um-pages-container .page-footer {',
'  position:relative !important; margin-top:auto;',
'}',
'',
'/* --- Background overlay non-interactive --- */',
'.um-pages-container .page-background-overlay { pointer-events:none; }',
'',
'/* --- Card Hover Enhancement --- */',
'.um-pages-container .card-base,',
'.um-pages-container .concept-card {',
'  transition:transform .2s ease,box-shadow .2s ease;',
'}',
'.um-pages-container .card-base:hover,',
'.um-pages-container .concept-card:hover {',
'  transform:translateY(-1px);',
'  box-shadow:0 6px 20px rgba(15,23,42,.10);',
'}',
'',
'/* --- Back to Top --- */',
'.um-back-to-top { position:fixed; bottom:24px; right:24px; width:46px; height:46px; background:linear-gradient(135deg,#1E40AF,#2563EB); color:#FFF; border:none; border-radius:50%; font-size:1.3rem; cursor:pointer; z-index:800; opacity:0; transform:translateY(16px); transition:all .3s ease; box-shadow:0 4px 20px rgba(30,64,175,.35); display:flex; align-items:center; justify-content:center; }',
'.um-back-to-top.visible { opacity:1; transform:translateY(0); }',
'.um-back-to-top:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(30,64,175,.5); }',
'',
'/* --- Export Footer Branding --- */',
'.um-export-footer { background:#0F172A; color:#F8FAFC; text-align:center; padding:22px 16px; font-family:"Outfit",sans-serif; font-weight:700; font-size:.85rem; letter-spacing:.15em; text-transform:uppercase; border-top:3px solid #2563EB; }',
'.um-export-footer span { color:#00F0FF; }',
'',
'/* ═══════════════════════════════════════════════════════════════════════════',
'   DARK MODE',
'   ═══════════════════════════════════════════════════════════════════════════ */',
'[data-theme="dark"] { background:#0B0F19 !important; }',
'[data-theme="dark"] .um-pages-container .book-page,',
'[data-theme="dark"] .um-pages-container .a4-page {',
'  background:#1E293B !important; border-color:rgba(255,255,255,.06) !important;',
'  box-shadow:0 4px 28px rgba(0,0,0,.35) !important; color:#E2E8F0 !important;',
'}',
'[data-theme="dark"] .card-base,',
'[data-theme="dark"] .concept-card {',
'  background:rgba(255,255,255,.04) !important; border-color:rgba(255,255,255,.08) !important; color:#E2E8F0 !important;',
'}',
'[data-theme="dark"] .card-base *, [data-theme="dark"] .concept-card * { color:inherit; }',
'[data-theme="dark"] .capsule-header { filter:brightness(.9); }',
'[data-theme="dark"] .data-table th { background:rgba(255,255,255,.08) !important; color:#E2E8F0 !important; }',
'[data-theme="dark"] .data-table td { border-color:rgba(255,255,255,.08) !important; color:#CBD5E1 !important; }',
'[data-theme="dark"] .page-top-bar { border-bottom-color:rgba(255,255,255,.1) !important; }',
'[data-theme="dark"] .page-footer { background:#0B0F19 !important; }',
'[data-theme="dark"] .um-export-footer { background:#050810; }',
'[data-theme="dark"] .mission-story-card,',
'[data-theme="dark"] .real-world-card,',
'[data-theme="dark"] .curiosity-box-card,',
'[data-theme="dark"] .stem-fact-card,',
'[data-theme="dark"] .think-engineer-card,',
'[data-theme="dark"] .observe-card,',
'[data-theme="dark"] .component-spotlight-card,',
'[data-theme="dark"] .inside-sensor-card,',
'[data-theme="dark"] .in-this-lab-card,',
'[data-theme="dark"] .pro-tip-card,',
'[data-theme="dark"] .engineer-tip-card,',
'[data-theme="dark"] .did-you-know-card,',
'[data-theme="dark"] .mission-review-table-card,',
'[data-theme="dark"] .comparison-vs-card,',
'[data-theme="dark"] .challenge-box-card,',
'[data-theme="dark"] .mini-upgrade-card,',
'[data-theme="dark"] .predict-think-card,',
'[data-theme="dark"] .knowledge-check-card,',
'[data-theme="dark"] .vocabulary-builder-card,',
'[data-theme="dark"] .heroes-grid-card,',
'[data-theme="dark"] .mission-objectives-card,',
'[data-theme="dark"] .build-steps-card,',
'[data-theme="dark"] .common-mistakes-card,',
'[data-theme="dark"] .ultra-badge-card,',
'[data-theme="dark"] .engineers-everywhere-card,',
'[data-theme="dark"] .mission-challenge-card {',
'  background:rgba(255,255,255,.03) !important; color:#E2E8F0 !important;',
'}',
'[data-theme="dark"] .split-layout > * { color:#E2E8F0; }',
'[data-theme="dark"] .cover-header-banner { color:#E2E8F0; }',
'[data-theme="dark"] .page-header-banner, [data-theme="dark"] .page-type-banner { filter:brightness(.85); }',
'',
'/* ═══════════════════════════════════════════════════════════════════════════',
'   RESPONSIVE BREAKPOINTS',
'   ═══════════════════════════════════════════════════════════════════════════ */',
'',
'/* --- Tablet (768–1023px) --- */',
'@media (max-width:1023px) {',
'  .um-pages-container { padding:16px 12px 60px; }',
'  .um-pages-container .book-page { padding:20px 18px 32px !important; border-radius:12px; margin-bottom:24px !important; }',
'  .cover-header-banner { grid-template-columns:120px 1fr 120px !important; }',
'  .build-steps-grid, .industries-grid, .specs-grid { grid-template-columns:repeat(2,1fr) !important; }',
'  .objectives-row { grid-template-columns:repeat(3,1fr) !important; }',
'}',
'',
'/* --- Mobile (<=767px) --- */',
'@media (max-width:767px) {',
'  .um-nav-header { padding:6px 12px; }',
'  .um-nav-brand { font-size:.82rem; }',
'  .um-pages-container { padding:10px 6px 60px; }',
'  .um-pages-container .book-page { padding:14px 10px 22px !important; border-radius:10px; margin-bottom:16px !important; }',
'  .cover-header-banner { grid-template-columns:1fr !important; text-align:center; }',
'  .cover-mascot-area { display:none !important; }',
'  .cover-illustration-placeholder, .cover-icon-big { max-width:200px; margin:0 auto; }',
'  .split-layout, .grid-2col, .grid-3col, .grid-4col { grid-template-columns:1fr !important; }',
'  .build-steps-grid, .industries-grid, .specs-grid, .heroes-grid { grid-template-columns:1fr !important; }',
'  .objectives-row { grid-template-columns:repeat(2,1fr) !important; }',
'  .scenario-comparison, .dynamic-comparison-grid { grid-template-columns:1fr !important; gap:12px !important; }',
'  .cv-vs-badge, .vs-circle, .dynamic-vs-badge { margin:8px auto; }',
'  .beyond-steps-row { grid-template-columns:1fr !important; gap:12px !important; }',
'  .beyond-arrow { display:none; }',
'  .upgrade-row { grid-template-columns:1fr !important; }',
'  .mistake-row { grid-template-columns:1fr !important; gap:8px !important; }',
'  .review-row { grid-template-columns:1fr !important; gap:4px !important; }',
'  .capsule-header { font-size:.8rem !important; }',
'  .card-title-text { font-size:.72rem !important; }',
'  .mission-main-title, .cover-main-title { font-size:1.8rem !important; }',
'  .code-content, .code-box { font-size:.75rem !important; overflow-x:auto; }',
'  .data-table { font-size:.78rem; }',
'  .page-footer { flex-direction:column; gap:6px; text-align:center; }',
'  .footer-code-pills { flex-wrap:wrap; justify-content:center; }',
'  .um-toc-sidebar { width:100%; max-width:300px; }',
'  .um-back-to-top { bottom:14px; right:14px; width:40px; height:40px; font-size:1.1rem; }',
'}',
'',
'/* ═══════════════════════════════════════════════════════════════════════════',
'   PRINT STYLESHEET',
'   ═══════════════════════════════════════════════════════════════════════════ */',
'@media print {',
'  .um-nav-header, .um-toc-sidebar, .um-toc-overlay, .um-back-to-top, .um-progress-bar, .um-export-footer { display:none !important; }',
'  body, html { background:#FFF !important; }',
'  .um-pages-container { max-width:none !important; padding:0 !important; margin:0 !important; }',
'  .um-pages-container .book-page, .um-pages-container .a4-page {',
'    width:210mm !important; min-height:297mm !important; height:auto !important;',
'    max-width:none !important; max-height:none !important;',
'    padding:12mm 14mm !important; margin:0 !important;',
'    border:none !important; border-radius:0 !important; box-shadow:none !important;',
'    page-break-after:always !important; break-after:page !important;',
'    opacity:1 !important; transform:none !important;',
'  }',
'  .um-pages-container .book-page:first-child { page-break-before:avoid !important; }',
'  @page { size:A4 portrait; margin:0mm; }',
'}',
''
    ].join('\n');
  },

  /**
   * Builds the interactive JS layer for TOC, dark mode, scroll progress,
   * keyboard navigation.
   */
  _buildInteractiveJS() {
    return [
'(function(){',
'"use strict";',
'',
'/* --- Progress Bar --- */',
'var pBar=document.querySelector(".um-progress-bar");',
'function updProg(){',
'  if(!pBar)return;',
'  var st=window.pageYOffset||document.documentElement.scrollTop;',
'  var dh=document.documentElement.scrollHeight-document.documentElement.clientHeight;',
'  pBar.style.width=(dh>0?(st/dh)*100:0)+"%";',
'}',
'window.addEventListener("scroll",updProg,{passive:true});',
'',
'/* --- TOC Sidebar Toggle --- */',
'var tocS=document.querySelector(".um-toc-sidebar");',
'var tocO=document.querySelector(".um-toc-overlay");',
'var tocBtn=document.querySelector("[data-action=\\"toggle-toc\\"]");',
'',
'function openTOC(){',
'  if(tocS)tocS.classList.add("open");',
'  if(tocO)tocO.classList.add("open");',
'}',
'function closeTOC(){',
'  if(tocS)tocS.classList.remove("open");',
'  if(tocO)tocO.classList.remove("open");',
'}',
'function toggleTOC(){',
'  if(tocS&&tocS.classList.contains("open")) closeTOC(); else openTOC();',
'}',
'if(tocBtn) tocBtn.addEventListener("click",toggleTOC);',
'if(tocO) tocO.addEventListener("click",closeTOC);',
'',
'/* --- TOC Item Clicks --- */',
'var tocItems=document.querySelectorAll(".um-toc-item");',
'tocItems.forEach(function(item){',
'  item.addEventListener("click",function(){',
'    var tid=this.getAttribute("data-target");',
'    var el=document.getElementById(tid);',
'    if(el){el.scrollIntoView({behavior:"smooth",block:"start"});closeTOC();}',
'  });',
'});',
'',
'/* --- Active TOC Highlight on Scroll --- */',
'var anchors=[];',
'tocItems.forEach(function(item){',
'  var tid=item.getAttribute("data-target");',
'  var el=document.getElementById(tid);',
'  if(el)anchors.push({el:el,tocItem:item});',
'});',
'function updTOC(){',
'  var sp=window.pageYOffset+120;',
'  var cur=null;',
'  anchors.forEach(function(a){if(a.el.offsetTop<=sp)cur=a;});',
'  tocItems.forEach(function(i){i.classList.remove("active");});',
'  if(cur)cur.tocItem.classList.add("active");',
'}',
'window.addEventListener("scroll",updTOC,{passive:true});',
'',
'/* --- Dark / Light Mode Toggle --- */',
'var darkBtn=document.querySelector("[data-action=\\"toggle-dark\\"]");',
'if(darkBtn){',
'  darkBtn.addEventListener("click",function(){',
'    var isDark=document.body.getAttribute("data-theme")==="dark";',
'    document.body.setAttribute("data-theme",isDark?"light":"dark");',
'    this.textContent=isDark?"\\u{1F319}":"\\u{2600}\\u{FE0F}";',
'    this.title=isDark?"Switch to Dark Mode":"Switch to Light Mode";',
'  });',
'}',
'',
'/* --- Back to Top --- */',
'var btt=document.querySelector(".um-back-to-top");',
'if(btt){',
'  window.addEventListener("scroll",function(){',
'    btt.classList.toggle("visible",window.pageYOffset>400);',
'  },{passive:true});',
'  btt.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});',
'}',
'',
'/* --- Keyboard Navigation --- */',
'var pages=document.querySelectorAll(".um-pages-container .book-page");',
'document.addEventListener("keydown",function(e){',
'  if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;',
'  var cur=null,sp=window.pageYOffset+window.innerHeight/3;',
'  pages.forEach(function(p){if(p.offsetTop<=sp)cur=p;});',
'  if(e.key==="ArrowDown"||e.key==="ArrowRight"){',
'    e.preventDefault();',
'    if(cur&&cur.nextElementSibling&&cur.nextElementSibling.classList.contains("book-page")){',
'      cur.nextElementSibling.scrollIntoView({behavior:"smooth",block:"start"});',
'    }',
'  }else if(e.key==="ArrowUp"||e.key==="ArrowLeft"){',
'    e.preventDefault();',
'    if(cur){',
'      var prev=cur.previousElementSibling;',
'      if(prev&&prev.classList.contains("book-page")){',
'        prev.scrollIntoView({behavior:"smooth",block:"start"});',
'      }else{window.scrollTo({top:0,behavior:"smooth"});}',
'    }',
'  }else if(e.key==="Escape"){closeTOC();}',
'});',
'',
'/* --- Init --- */',
'updProg(); updTOC();',
'',
'})();'
    ].join('\n');
  },

  /**
   * Deep-clones and sanitizes all book pages for export.
   * Strips all editor artifact elements and attributes.
   * Returns { pagesXhtml: string, tocItems: Array }
   */
  _buildExportPages(activePages) {
    let pagesXhtml = '';
    const tocItems = [];

    activePages.forEach((page, i) => {
      const pageId = 'um-page-' + (i + 1);
      const pageClone = page.cloneNode(true);

      // Remove ALL editor-only elements
      const editorSelectors = [
        '.transform-handle',
        '.card-move-arrows-overlay',
        '#ultraminds-context-menu',
        '#floating-selection-toolbar',
        '.um-resize-handle',
        '.um-card-quick-actions',
        '.page-overflow-badge',
        '.incard-element-bar',
        '.footer-delete-btn',
        '.add-bullet-btn',
        '.bullet-del-btn',
        '.subcard-actions',
        '.subcard-delete-btn',
        '.selected-card-outline',
        '.mascot-del-btn',
        '.um-qbtn',
        '.floating-btn'
      ];
      pageClone.querySelectorAll(editorSelectors.join(', ')).forEach(el => el.remove());

      // Strip all editor buttons that have delete or remove actions
      pageClone.querySelectorAll('button').forEach(btn => {
        const cl = btn.className || '';
        const oc = btn.getAttribute('onclick') || '';
        if (cl.includes('del') || cl.includes('btn') || oc.includes('remove') || oc.includes('delete') || oc.includes('LayoutEngine')) {
          btn.remove();
        }
      });

      // Strip editor attributes
      pageClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
      pageClone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
      pageClone.querySelectorAll('.selected-card').forEach(el => el.classList.remove('selected-card'));

      // Detect page title for TOC
      let pageTitle = 'Page ' + (i + 1);
      const banner = pageClone.querySelector('.page-type-banner, .page-header-banner, .banner-title, .page-type-title');
      if (banner) {
        const t = banner.textContent.trim();
        if (t && t.length > 2 && t.length < 80) pageTitle = t;
      }
      // Cover page uses the main mission title
      if (i === 0) {
        const coverTitle = pageClone.querySelector('.cover-main-title, .mission-main-title');
        if (coverTitle) {
          const ct = coverTitle.textContent.trim();
          if (ct) pageTitle = ct;
        }
      }

      tocItems.push({ id: pageId, num: i + 1, title: pageTitle });

      // Sanitize to valid XHTML
      const rawHtml = pageClone.innerHTML;
      const cleanXhtml = this.sanitizeToValidXHTML(rawHtml);

      pagesXhtml += '\n    <div class="book-page a4-page" id="' + pageId + '" data-page-num="' + (i + 1) + '">\n      ' + cleanXhtml + '\n    </div>\n';
    });

    return { pagesXhtml, tocItems };
  },

  /**
   * Assembles the final XHTML5 document with all compiled CSS, interactive JS,
   * pages, TOC, navigation, and LMS-compatible metadata.
   */
  _assembleXHTMLDocument({ title, missionNum, themeClass, css, js, pagesXhtml, tocItems }) {
    // Build TOC navigation items
    let tocHtml = '';
    tocItems.forEach(item => {
      tocHtml += '      <div class="um-toc-item" data-target="' + this._escapeXhtml(item.id) + '">'
        + '<span class="um-toc-num">' + item.num + '</span>'
        + '<span>' + this._escapeXhtml(item.title) + '</span>'
        + '</div>\n';
    });

    const safeTitle = this._escapeXhtml(title);
    const safeMission = this._escapeXhtml(missionNum);

    // Escape any ]]> inside CDATA sections
    const safeCss = css ? css.replace(/\]\]>/g, ']]]]><![CDATA[>') : '';
    const safeJs = js ? js.replace(/\]\]>/g, ']]]]><![CDATA[>') : '';

    return '<?xml version="1.0" encoding="utf-8"?>\n'
+ '<!DOCTYPE html>\n'
+ '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n'
+ '<head>\n'
+ '  <title>' + safeTitle + ' — UltraMinds</title>\n'
+ '  <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />\n'
+ '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
+ '  <meta name="generator" content="UltraMinds Publisher V7.2" />\n'
+ '  <meta name="description" content="' + safeTitle + ' — Interactive STEM Mission Package by UltraMinds" />\n'
+ '  <meta property="og:title" content="' + safeTitle + '" />\n'
+ '  <meta property="og:description" content="Interactive STEM Mission Package — UltraMinds AI Publisher" />\n'
+ '  <meta property="og:type" content="article" />\n'
+ '  <meta name="theme-color" content="#1E40AF" />\n'
+ '  <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
+ '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />\n'
+ '  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&amp;family=Inter:wght@400;600;700;900&amp;family=Outfit:wght@600;800;900&amp;display=swap" rel="stylesheet" />\n'
+ '  <style type="text/css">\n'
+ '  /*<![CDATA[*/\n'
+ safeCss + '\n'
+ '  /*]]>*/\n'
+ '  </style>\n'
+ '</head>\n'
+ '<body class="' + themeClass + '" data-theme="light">\n'
+ '\n'
+ '<!-- Progress Bar -->\n'
+ '<div class="um-progress-bar" style="width:0%"> </div>\n'
+ '\n'
+ '<!-- Navigation Header -->\n'
+ '<header class="um-nav-header">\n'
+ '  <div class="um-nav-brand">\n'
+ '    <span class="um-nav-brand-badge">UM</span>\n'
+ '    <span>' + safeTitle + '</span>\n'
+ '  </div>\n'
+ '  <nav class="um-nav-controls">\n'
+ '    <button class="um-nav-btn" data-action="toggle-toc" title="Table of Contents">&#9776; Contents</button>\n'
+ '    <button class="um-nav-btn" data-action="toggle-dark" title="Switch to Dark Mode">&#x1F319;</button>\n'
+ '  </nav>\n'
+ '</header>\n'
+ '\n'
+ '<!-- TOC Overlay -->\n'
+ '<div class="um-toc-overlay"> </div>\n'
+ '\n'
+ '<!-- TOC Sidebar -->\n'
+ '<aside class="um-toc-sidebar">\n'
+ '  <div class="um-toc-title">&#x1F4D1; Mission Contents</div>\n'
+ tocHtml
+ '</aside>\n'
+ '\n'
+ '<!-- Mission Pages -->\n'
+ '<div class="um-pages-container">\n'
+ pagesXhtml + '\n'
+ '</div>\n'
+ '\n'
+ '<!-- Footer -->\n'
+ '<footer class="um-export-footer">\n'
+ '  LEARN &#x2022; BUILD &#x2022; INNOVATE &#x2022; INSPIRE &#160;|&#160; <span>ULTRA</span>Minds AI\n'
+ '</footer>\n'
+ '\n'
+ '<!-- Back to Top -->\n'
+ '<button class="um-back-to-top" title="Back to Top">&#x2191;</button>\n'
+ '\n'
+ '<!-- Interactive Engine -->\n'
+ '<script type="text/javascript">\n'
+ '//<![CDATA[\n'
+ safeJs + '\n'
+ '//]]>\n'
+ '</script>\n'
+ '\n'
+ '</body>\n'
+ '</html>';
  },

  /**
   * Escapes a string for safe embedding in XHTML attribute or text content.
   */
  _escapeXhtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORD, PPTX & DOWNLOAD (UNCHANGED)
  // ═══════════════════════════════════════════════════════════════════════════

  exportWord() {
    const activePages = document.querySelectorAll('.book-page');
    if (!activePages.length) return alert("No pages found to export.");

    window.CanvasEditor.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();

    let cleanPagesHtml = '';

    activePages.forEach((page, i) => {
      const pageClone = page.cloneNode(true);
      pageClone.querySelectorAll('.transform-handle, #ultraminds-context-menu, #floating-selection-toolbar').forEach(el => el.remove());
      pageClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

      cleanPagesHtml += `
        <div class="word-page-container" style="page-break-after: always; margin-bottom: 30pt;">
          <h2 style="font-family: 'Segoe UI', Arial; color: #1E40AF; border-bottom: 2pt solid #2563EB; padding-bottom: 4pt; font-size: 14pt;">PAGE ${i + 1}</h2>
          ${pageClone.innerHTML}
        </div>
      `;
    });

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>UltraMinds Mission Export</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 { size: 595.3pt 841.9pt; margin: 36.0pt; }
          div.WordSection1 { page: WordSection1; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; line-height: 1.5; }
          .card-base, .concept-card, .code-snippet-card, .mistakes-card { border: 1.5pt solid #CBD5E1; padding: 12pt; margin-bottom: 14pt; background-color: #F8FAFC; border-radius: 8pt; }
          .capsule-header { background: #1E40AF; color: #FFFFFF; padding: 4pt 10pt; font-weight: bold; border-radius: 12pt; display: inline-block; margin-bottom: 8pt; font-size: 10pt; }
          .card-title-text { color: #FFFFFF; font-weight: bold; }
          .data-table { border-collapse: collapse; width: 100%; margin-top: 8pt; }
          .data-table th, .data-table td { border: 1pt solid #CBD5E1; padding: 6pt 10pt; text-align: left; font-size: 9.5pt; }
          .data-table th { background-color: #E2E8F0; font-weight: bold; }
          .code-box { background-color: #05070E; color: #00F0FF; padding: 10pt; font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; border-radius: 6pt; }
          .inline-sub-capsule { background-color: #2563EB; color: #FFFFFF; padding: 2pt 8pt; border-radius: 10pt; font-weight: bold; font-size: 9pt; }
          .text-highlight { background-color: #FEF08A; color: #0F172A; padding: 1pt 4pt; border-radius: 2pt; }
          .floating-clipart-sticker { display: inline-block; margin: 10pt; }
          .page-footer { border-top: 1pt solid #E2E8F0; padding-top: 6pt; font-size: 8.5pt; color: #64748B; margin-top: 16pt; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          ${cleanPagesHtml}
        </div>
      </body>
      </html>
    `;

    this.downloadFile(wordHtml, 'ultra-minds-mission.doc', 'application/msword');
  },

  async exportPPTX() {
    const activePages = document.querySelectorAll('.book-page');
    if (!activePages.length) return alert("No pages found to export.");

    window.CanvasEditor.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();

    // Check if PptxGenJS & html2canvas are loaded
    const PptxClass = window.PptxGenJS || window.pptxgen;
    if (PptxClass && window.html2canvas) {
      window.SaveEngine?._showToast('📊 Rendering high-res PowerPoint presentation...');
      try {
        const pptx = new PptxClass();
        pptx.layout = 'LAYOUT_16x9';

        for (let i = 0; i < activePages.length; i++) {
          const page = activePages[i];
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#FFFFFF'
          });
          const imgData = canvas.toDataURL('image/png');

          const slide = pptx.addSlide();
          slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
        }

        const safeTitle = (window.currentMission?.missionTitle || 'UltraMinds_Presentation').replace(/[^a-zA-Z0-9_\-]/g, '_');
        await pptx.writeFile({ fileName: `${safeTitle}.pptx` });
        window.SaveEngine?._showToast('✅ High-quality PPTX generated!');
        return;
      } catch (err) {
        console.warn('Native PPTX generation fallback:', err);
      }
    }

    // Fallback: Standalone HTML presentation slides
    let slidesHtml = '';
    activePages.forEach((page, i) => {
      const pageClone = page.cloneNode(true);
      pageClone.querySelectorAll('.transform-handle, #ultraminds-context-menu, #floating-selection-toolbar').forEach(el => el.remove());
      pageClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

      slidesHtml += `
        <div class="slide-frame">
          <div class="slide-header">
            <span class="slide-badge">SLIDE ${i + 1}</span>
            <span class="slide-title">ULTRAMINDS STEM MISSION SPREAD</span>
          </div>
          <div class="slide-content">
            ${pageClone.innerHTML}
          </div>
        </div>
      `;
    });

    const pptxHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>UltraMinds Mission Presentation Deck</title>
        <style>
          body { margin: 0; padding: 40px; background: #060913; font-family: 'Segoe UI', Roboto, sans-serif; color: #FFF; }
          .slide-frame { width: 1333px; height: 750px; background: #0F172A; border: 2px solid #00F0FF; border-radius: 16px; margin: 0 auto 50px auto; padding: 30px; box-sizing: border-box; page-break-after: always; box-shadow: 0 20px 50px rgba(0, 240, 255, 0.2); overflow: hidden; position: relative; }
          .slide-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgba(0, 240, 255, 0.3); padding-bottom: 12px; margin-bottom: 20px; }
          .slide-badge { background: linear-gradient(135deg, #2563EB, #00F0FF); color: #FFF; padding: 4px 12px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; }
          .slide-title { font-weight: 800; font-size: 1.1rem; color: #00F0FF; letter-spacing: 0.05em; }
          .slide-content { height: 630px; overflow-y: auto; }
          .card-base, .concept-card, .code-snippet-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 16px; margin-bottom: 16px; color: #F8FAFC; }
          .capsule-header { background: linear-gradient(135deg, #1E40AF, #1D4ED8); color: #FFF; padding: 6px 14px; border-radius: 16px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px; }
          .code-box { background: #05070E; color: #00F0FF; padding: 14px; border-radius: 8px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1 style="text-align: center; color: #00F0FF; font-size: 2rem; margin-bottom: 40px;">📊 ULTRAMINDS PRESENTATION SLIDE DECK</h1>
        ${slidesHtml}
      </body>
      </html>
    `;

    this.downloadFile(pptxHtml, 'ultra-minds-mission-slides.html', 'text/html');
  },

  downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
};
