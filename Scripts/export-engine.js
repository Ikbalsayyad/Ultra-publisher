/**
 * UltraMinds Multi-Format Production Export Engine (V3 - Single & Two-Page Multi-Page PDF Print Engine)
 * Exports A4 pages to PDF, Word (.doc/.docx), PowerPoint Widescreen Slides, and Strict EPUB/OEBPS-compliant XHTML.
 */

window.ExportEngine = {
  exportPDF() {
    window.CanvasEditor.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();
    if (window.InCardDesigner) window.InCardDesigner.hideToolbar();

    const isTwoPageActive = document.body.classList.contains('view-two-page');
    const container = document.getElementById('a4-canvas-container');

    // Temporarily unwrap two-page spreads into single sequential pages for PDF print
    if (isTwoPageActive && container) {
      document.body.classList.remove('view-two-page');
      const pages = Array.from(container.querySelectorAll('.book-page'));
      container.innerHTML = '';
      pages.forEach(p => container.appendChild(p));
    }

    // Reset zoom temporarily
    const prevZoom = document.documentElement.style.getPropertyValue('--canvas-zoom');
    document.documentElement.style.setProperty('--canvas-zoom', '1');

    window.print();

    // Restore two-page mode after print
    setTimeout(() => {
      if (prevZoom) document.documentElement.style.setProperty('--canvas-zoom', prevZoom);
      if (isTwoPageActive) {
        document.body.classList.add('view-two-page');
        if (window.LayoutEngine) window.LayoutEngine.applyTwoPageSpreadMode();
      }
    }, 1000);
  },

  exportXHTML() {
    const activePages = document.querySelectorAll('.book-page');
    if (!activePages.length) return alert("No pages found to export.");

    window.CanvasEditor.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();

    let pagesXhtml = '';

    activePages.forEach((page, i) => {
      const pageClone = page.cloneNode(true);
      pageClone.querySelectorAll('.transform-handle, #ultraminds-context-menu, #floating-selection-toolbar').forEach(el => el.remove());
      pageClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

      const rawHtml = pageClone.innerHTML;
      const cleanXhtml = this.sanitizeToValidXHTML(rawHtml);

      pagesXhtml += `
    <!-- EPUB OEBPS PAGE ${i + 1} -->
    <div class="book-page a4-page" data-page-num="${i + 1}">
      ${cleanXhtml}
    </div>
  `;
    });

    const xhtmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>UltraMinds Mission Package</title>
  <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
  <style type="text/css">
    body { font-family: 'Inter', 'Segoe UI', sans-serif; background-color: #FFFFFF; color: #0F172A; margin: 0; padding: 0; }
    .book-page { width: 210mm; min-height: 297mm; padding: 20mm 15mm; margin: 0 auto 30px auto; box-sizing: border-box; background: #FFFFFF; page-break-after: always; position: relative; }
    .card-base, .concept-card, .code-snippet-card, .mistakes-card { border: 1.5px solid #CBD5E1; padding: 14px; border-radius: 8px; margin-bottom: 16px; background-color: #F8FAFC; }
    .capsule-header { background: #2563EB; color: #FFFFFF; padding: 4px 12px; border-radius: 14px; font-weight: bold; display: inline-block; margin-bottom: 10px; font-size: 0.9rem; }
    .round-icon-badge { display: inline-block; margin-right: 6px; }
    .card-title-text { color: #FFFFFF; font-weight: bold; }
    .data-table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    .data-table th, .data-table td { border: 1px solid #CBD5E1; padding: 6px 10px; text-align: left; font-size: 0.85rem; }
    .data-table th { background-color: #E2E8F0; font-weight: bold; }
    .code-box { background-color: #05070E; color: #00F0FF; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; }
    .inline-sub-capsule { background-color: #2563EB; color: #FFFFFF; padding: 2px 8px; border-radius: 10px; font-weight: bold; font-size: 0.8em; display: inline-block; margin: 2px; }
    .text-highlight { background-color: #FEF08A; color: #0F172A; padding: 1px 4px; border-radius: 3px; font-weight: 600; }
    .page-top-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 16px; }
    .page-ribbon { background: #1E40AF; color: #FFFFFF; padding: 3px 8px; font-weight: bold; font-size: 0.75rem; border-radius: 4px; }
    .top-mission-pill { background: #00F0FF; color: #0F172A; padding: 3px 10px; font-weight: bold; font-size: 0.75rem; border-radius: 10px; }
    .page-footer { border-top: 1px solid #E2E8F0; padding-top: 8px; font-size: 8.5pt; color: #64748B; margin-top: 20px; display: flex; justify-content: space-between; }
    .floating-clipart-sticker { display: block; position: absolute; }
  </style>
</head>
<body class="${document.body.className}">
${pagesXhtml}
</body>
</html>`;

    this.downloadFile(xhtmlContent, 'ultra-minds-mission.xhtml', 'application/xhtml+xml');
  },

  sanitizeToValidXHTML(htmlString) {
    if (!htmlString) return '';

    let clean = htmlString
      .replace(/\s*contenteditable="[^"]*"/gi, '')
      .replace(/\s*draggable="[^"]*"/gi, '')
      .replace(/<div class="transform-handle[^">]*><\/div>/gi, '');

    clean = clean.replace(/<br(\s+[^>]*?)?>/gi, (match) => {
      if (match.endsWith('/>')) return match;
      return match.replace(/>$/, ' />');
    });

    clean = clean.replace(/<img(\s+[^>]*?)?>/gi, (match) => {
      if (match.endsWith('/>')) return match;
      return match.replace(/>$/, ' />');
    });

    clean = clean.replace(/<hr(\s+[^>]*?)?>/gi, (match) => {
      if (match.endsWith('/>')) return match;
      return match.replace(/>$/, ' />');
    });

    clean = clean.replace(/<input(\s+[^>]*?)?>/gi, (match) => {
      if (match.endsWith('/>')) return match;
      return match.replace(/>$/, ' />');
    });

    return clean;
  },

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

  exportPPTX() {
    const activePages = document.querySelectorAll('.book-page');
    if (!activePages.length) return alert("No pages found to export.");

    window.CanvasEditor.deselectElement();
    if (window.ContextMenu) window.ContextMenu.hideMenu();

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
