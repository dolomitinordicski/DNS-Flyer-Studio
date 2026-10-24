import { flyerPageMm, type CreativeExportGeometry } from './creativeExport';

/**
 * Browser print pipeline: retain actual text and SVG vectors and place
 * photographs as image assets. No html2canvas or page bitmap involved.
 *
 * The user selects "Save as PDF" in the browser's print dialog.
 */
export async function printVectorFlyerFromDOM(roots: HTMLElement | readonly HTMLElement[], geometry: CreativeExportGeometry): Promise<void> {
  const pages = Array.isArray(roots) ? roots : [roots as HTMLElement];
  if (!pages.length) throw new Error('No flyer pages available for print');
  for (const root of pages) {
    if (root.dataset.pricingState && root.dataset.pricingState !== 'ready') throw new Error('Official DNS price data is not ready');
  }
  await document.fonts.ready;
  const pictures = pages.flatMap(root => [...root.querySelectorAll('img')]);
  await Promise.all(pictures.map(async image => {
    if (!image.complete || image.naturalWidth <= 0) {
      throw new Error('Missing flyer image: ' + (image.currentSrc || image.src));
    }
    if (image.decode) await image.decode();
  }));

  const [w, h] = flyerPageMm(geometry);
  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'DNS vector print');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const printWindow = frame.contentWindow;
  if (!doc || !printWindow) {
    frame.remove();
    throw new Error('Unable to initialize browser print document');
  }

  const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
    .map(node => node.outerHTML).join('\n');
  const clones = pages.map(root => {
    const clone=root.cloneNode(true) as HTMLElement;
    clone.style.transform='none';
    clone.style.margin='0';
    clone.style.boxShadow='none';
    clone.style.width=w+'mm';
    clone.style.height=h+'mm';
    clone.style.overflow='hidden';
    clone.classList.add('dns-print-page');
    for (const img of [...clone.querySelectorAll('img')]) {
      img.src=new URL(img.getAttribute('src') || '', document.baseURI).href;
    }
    return clone;
  });
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><base href="${document.baseURI}">
    ${styles}
    <style>
      @page { size: ${w}mm ${h}mm; margin:0; }
      html, body {margin:0!important;padding:0!important;width:${w}mm!important;min-height:${h}mm!important;}\n      .dns-print-page {break-after:page;page-break-after:always;break-inside:avoid;page-break-inside:avoid;}\n      .dns-print-page:last-child {break-after:auto;page-break-after:auto;}
      *, *::before, *::after { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
      [data-dns-fit] {transform:none!important;}
    </style></head><body></body></html>`);
  doc.close();
  for (const clone of clones) doc.body.appendChild(doc.importNode(clone, true));
  try {
    await Promise.all([
      doc.fonts.ready,
      ...[...doc.images].map(image => image.decode ? image.decode() : Promise.resolve()),
    ]);
    // Allow the browser to compute final print layout before invoking print().
    await new Promise<void>(resolve => printWindow.requestAnimationFrame(() => printWindow.requestAnimationFrame(() => resolve())));
    printWindow.focus();
    printWindow.print();
  } finally {
    // Chrome fires afterprint after the dialog closes; Firefox may not.
    const cleanup = () => frame.remove();
    printWindow.addEventListener('afterprint', cleanup, {once:true});
    // Retain iframe if afterprint is not supported; it is removed on next print.
  }
}
