import type { FlyerContent, LanguageCode } from '../types';

/**
 * Portable, script-free HTML snapshot of the same DOM used for PNG/PDF.
 * CSS is inlined so LTS/Partner Portal can use the layout without React,
 * Tailwind or DNS Flyer Studio. It is a reference template, NOT TicWeb-native.
 */
export async function downloadFlyerCodeHtml(
  element: HTMLElement,
  content: FlyerContent,
  language: LanguageCode,
): Promise<void> {
  // Wait for all fonts and HTML images before taking the export snapshot.
  await document.fonts.ready;
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>(resolve => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }));

  const clone = element.cloneNode(true) as HTMLElement;
  const originalElements = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];
  const clonedElements = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];

  for (let index = 0; index < originalElements.length; index++) {
    const original = originalElements[index];
    const copy = clonedElements[index];
    if (!copy) continue;
    // Avoid exposing event code, CSS dependencies or application internals.
    for (const attribute of Array.from(copy.attributes)) {
      if (attribute.name.startsWith('on')) copy.removeAttribute(attribute.name);
    }
    const style = window.getComputedStyle(original);
    const declarations: string[] = [];
    for (let i = 0; i < style.length; i++) {
      const property = style.item(i);
      if (!property || property.startsWith('--')) continue;
      declarations.push(`${property}: ${style.getPropertyValue(property)};`);
    }
    copy.setAttribute('style', declarations.join(' '));
  }

  // Preview-only transforms must not enter the exported page.
  clone.style.transform = 'none';
  clone.style.marginBottom = '0';
  clone.style.transformOrigin = 'initial';
  clone.removeAttribute('data-pricing-state');
  clone.removeAttribute('tabindex');

  // Do not ship script tags from the editor's DOM.
  clone.querySelectorAll('script, iframe').forEach(node => node.remove());

  const languageTag = language === 'de' ? 'de' : language === 'en' ? 'en' : 'it';
  const ticket = content.layoutTemplateId.startsWith('ticket_online_');
  const bindings = ticket
    ? ['holder_name', 'issue_date', 'issuer_name', 'ticket_serial', 'ticket_status', 'qr_payload', 'valid_from', 'valid_until', 'price_amount', 'area_id']
    : ['recipient_name', 'document_id', 'issue_date', 'qr_payload', 'price_amount'];
  const manifest = {
    schema: 'dns.code-export',
    version: 1,
    format: 'html',
    product: content.layoutTemplateId,
    language: languageTag,
    page: { format: content.format, orientation: content.orientation },
    bindings,
    integration: 'reference-only',
    notes: 'A static corporate-design HTML reference. LTS or Partner Portal must map runtime fields and QR semantics to its own validated backend. No issued ticket or voucher is generated.',
  };
  const safeJson = JSON.stringify(manifest, null, 2).replace(/</g, '\\u003c');
  const width = content.format === 'A3' ? 297 : content.format === 'A5' ? 148 : 210;
  const height = content.format === 'A3' ? 420 : content.format === 'A5' ? 210 : 297;
  const [pageWidth, pageHeight] = content.orientation === 'landscape' ? [height, width] : [width, height];

  // HTML comments make intended integration points discoverable to LTS.
  const html = `<!doctype html>
<html lang="${languageTag}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DNS ${escapeHtml(content.title || 'Document')} — ${languageTag.toUpperCase()}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;600;700;900&display=swap');
@page { size: ${pageWidth}mm ${pageHeight}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
*, *::before, *::after { box-sizing: border-box; }
@media print { html,body { width: ${pageWidth}mm; height: ${pageHeight}mm; } }
</style>
<script type="application/json" id="dns-code-export-manifest">
${safeJson}
</script>
</head>
<body>
<!-- DNS CODE EXPORT: visual reference only; generated using the current Flyer Studio DOM.
     Not an issued ticket/voucher, not an executable TicWeb template.
     See dns-code-export-manifest for the proposed dynamic fields. -->
${clone.outerHTML}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const product = content.layoutTemplateId.replace(/[^a-z0-9_-]/gi, '_');
  link.download = `DNS_${product}_${languageTag.toUpperCase()}_Code.html`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
