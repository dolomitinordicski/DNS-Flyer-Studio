import type { CreativeExportGeometry } from './creativeExport';
import { flyerPageMm } from './creativeExport';
import type { VectorPdfCommand, VectorPdfPage } from './vectorPdf';

/**
 * First-stage DNS price-list vector proof. Works on the actually rendered,
 * authenticated DNS Core price list: never copies tariffs from demo defaults.
 * Deliberately refuses invisible or unsupported essential assets.
 *
 * This is a proof builder, not yet the production PDF exporter: SVG logos,
 * font embedding, clipping and visual parity still need validation.
 */
export interface PriceListProofResult {
  page: VectorPdfPage;
  warnings: string[];
  textNodes: number;
  imageNodes: number;
}

const isVisible = (el: Element) => {
  const css = getComputedStyle(el);
  return css.display !== 'none' && css.visibility !== 'hidden' && Number(css.opacity) > 0;
};
function rgbHex(css: string): string | null {
  const numbers = css.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!numbers) return null;
  if (css.startsWith('rgba(') && /,\s*0(?:\.0+)?\s*\)$/.test(css)) return null;
  return '#' + numbers.slice(1,4).map(n=>Number(n).toString(16).padStart(2,'0')).join('');
}
async function imageData(img: HTMLImageElement): Promise<{ dataUrl: string; format: 'PNG' }> {
  if (!img.complete || !img.naturalWidth) throw new Error('Photo/logo failed to load: '+img.currentSrc);
  await img.decode();
  const canvas=document.createElement('canvas');
  const displayed=img.getBoundingClientRect();
  const targetWidth=Math.max(1,Math.round(displayed.width));
  const targetHeight=Math.max(1,Math.round(displayed.height));
  canvas.width=targetWidth;
  canvas.height=targetHeight;
  const context=canvas.getContext('2d');
  if (!context) throw new Error('Image canvas unavailable');
  const fit=getComputedStyle(img).objectFit;
  if(fit === 'cover') {
    const scale=Math.max(targetWidth/img.naturalWidth,targetHeight/img.naturalHeight);
    const drawWidth=img.naturalWidth*scale;
    const drawHeight=img.naturalHeight*scale;
    const position=getComputedStyle(img).objectPosition.split(/\\s+/);
    const xPercent=(position[0]||'50%').endsWith('%') ? parseFloat(position[0])/100 : 0.5;
    const yPercent=(position[1]||'50%').endsWith('%') ? parseFloat(position[1])/100 : 0.5;
    context.drawImage(img,(targetWidth-drawWidth)*xPercent,(targetHeight-drawHeight)*yPercent,drawWidth,drawHeight);
  } else {
    context.drawImage(img,0,0,targetWidth,targetHeight);
  }
  try { return {dataUrl:canvas.toDataURL('image/png'),format:'PNG'}; }
  catch { throw new Error('Image is not CORS-safe for vector PDF: '+img.currentSrc); }
}
export async function buildDnsPriceListVectorProof(root: HTMLElement, geometry: CreativeExportGeometry): Promise<PriceListProofResult> {
  if (root.dataset.pricingState !== 'ready') throw new Error('Official DNS tariffs not ready');
  const [pageWidth,pageHeight]=flyerPageMm(geometry);
  const bounds=root.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) throw new Error('Price list has no measurable dimensions');
  const commands: VectorPdfCommand[]=[];
  const warnings: string[]=[];
  const mmX=pageWidth/bounds.width,mmY=pageHeight/bounds.height;
  let textNodes=0,imageNodes=0;
  await document.fonts.ready;
  const elements=[root,...Array.from(root.querySelectorAll('*'))];
  for (const element of elements) {
    if (!isVisible(element)) continue;
    const box=element.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    const x=(box.left-bounds.left)*mmX, y=(box.top-bounds.top)*mmY;
    const width=box.width*mmX,height=box.height*mmY;
    if (x < -1 || y < -1 || x+width > pageWidth+1 || y+height > pageHeight+1) {
      warnings.push('Out-of-page node: '+element.tagName);
      continue;
    }
    const style=getComputedStyle(element);
    const background=rgbHex(style.backgroundColor);
    if (background && width>0.1 && height>0.1) {
      commands.push({kind:'rect',x,y,width,height,fill:background});
    }
    if (element instanceof HTMLImageElement) {
      const image=await imageData(element);
      commands.push({kind:'photo',x,y,width,height,...image});
      imageNodes++;
    }
    if (element instanceof SVGElement && element.tagName.toLowerCase()==='svg') {
      warnings.push('SVG requires vector path adapter: '+(element.getAttribute('aria-label')||'graphic'));
    }
    // Text is drawn separately as vector glyphs; positioning is estimated
    // from actual DOM ranges, with single-word spans to avoid whitespace loss.
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType!==Node.TEXT_NODE || !child.textContent?.trim()) continue;
      const raw=child.textContent;
      const fontSize=parseFloat(style.fontSize);
      if (!Number.isFinite(fontSize)) continue;
      const words=/\S+/g;
      let match:RegExpExecArray|null;
      while ((match=words.exec(raw))) {
        const range=document.createRange();
        range.setStart(child,match.index);
        range.setEnd(child,match.index+match[0].length);
        const r=range.getBoundingClientRect();
        if (r.width<0.1 || r.height<0.1) continue;
        const color=rgbHex(style.color)||'#0D4D5E';
        commands.push({kind:'text',x:(r.left-bounds.left)*mmX,y:(r.bottom-bounds.top)*mmY-0.4,text:match[0],sizePt:Math.max(3,fontSize*mmY*72/25.4),color,weight:Number(style.fontWeight)>=600?'bold':'normal'});
        textNodes++;
      }
    }
  }
  if (!imageNodes) warnings.push('No image elements recorded: photography could be missing');
  // Do not treat a proof with unsupported SVG assets as print-ready.
  if(warnings.some(message => message.startsWith('SVG requires'))) warnings.push('Vector proof incomplete: SVG assets must be embedded before PDF activation');
  if (!textNodes) throw new Error('No text nodes recorded for vector PDF');
  return {page:{geometry,commands},warnings:[...new Set(warnings)],textNodes,imageNodes};
}
