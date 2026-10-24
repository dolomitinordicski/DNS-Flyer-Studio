import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { createDNSCapabilityRuntime, type DNSCapabilityAdapter } from '@dolomitinordicski/dns-shared-data/capability-runtime';
import type { PaperFormat, PaperOrientation } from '../../types';

/** Foundation governs capability registration; Flyer Studio owns creative geometry/rendering. */
export interface CreativeExportGeometry { format: PaperFormat; orientation: PaperOrientation }
export function flyerPageMm({format, orientation}: CreativeExportGeometry): [number, number] {
  const [w,h] = format === 'A3' ? [297,420] : format === 'A5' ? [148,210] : [210,297];
  return orientation === 'landscape' ? [h,w] : [w,h];
}
export async function captureCreativeFlyer(element: HTMLElement): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  await Promise.all(Array.from(element.querySelectorAll('img')).map(async img => {
    if (!img.complete) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Image timed out: ' + img.currentSrc)), 10000);
        const cleanup = () => window.clearTimeout(timeout);
        img.addEventListener('load', () => { cleanup(); resolve(); }, { once: true });
        img.addEventListener('error', () => { cleanup(); reject(new Error('Image failed: ' + img.currentSrc)); }, { once: true });
      });
    }
    if (img.naturalWidth === 0 || img.naturalHeight === 0) throw new Error('Image unavailable for export: ' + img.currentSrc);
    if (img.decode) await img.decode();
  }));
  return html2canvas(element, {
    scale: 3, useCORS: true, allowTaint: false, logging: false,
    backgroundColor: '#ffffff',
    width: element.clientWidth, height: element.clientHeight,
    onclone: doc => {
      const stage=doc.querySelector<HTMLElement>('[data-dns-export-stage]');
      if(stage){ stage.style.left='0px'; stage.style.top='0px'; }
    },
  });
}
type ExportInput = { canvases: HTMLCanvasElement[]; geometry: CreativeExportGeometry; filename: string };
const adapters: DNSCapabilityAdapter[] = [{
  id: 'dns-flyer-creative-export',
  capabilities: ['export.pdf','export.png'],
  execute(input: unknown, context) {
    const {canvases,geometry,filename}=input as ExportInput;
    if(!canvases.length) throw new Error('No rendered flyer pages');
    if(context.capability === 'export.pdf') {
      const [w,h]=flyerPageMm(geometry);
      const pdf=new jsPDF({unit:'mm',orientation:geometry.orientation,format:[w,h],compress:true});
      canvases.forEach((canvas,i)=>{
        if (!canvas.width || !canvas.height) throw new Error('Empty flyer export canvas');
        if(i) pdf.addPage([w,h],geometry.orientation);
        const pageW=pdf.internal.pageSize.getWidth();
        const pageH=pdf.internal.pageSize.getHeight();
        const rasterRatio=canvas.width/canvas.height;
        const paperRatio=pageW/pageH;
        // Never stretch typography or images. A mismatch is a layout error, not a scaling opportunity.
        if (Math.abs(rasterRatio-paperRatio)/paperRatio > 0.012) {
          throw new Error(`Flyer export dimensions differ from ${geometry.format} ${geometry.orientation}: image ${canvas.width}x${canvas.height}, page ${pageW.toFixed(1)}x${pageH.toFixed(1)}mm`);
        }
        const imageHeight=pageW/rasterRatio;
        const top=(pageH-imageHeight)/2;
        pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,top,pageW,imageHeight);
      });
      pdf.save(filename);
      return {filename,pages:canvases.length};
    }
    if(canvases.length!==1) throw new Error('PNG export requires exactly one page');
    const anchor=document.createElement('a');
    anchor.download=filename;
    anchor.href=canvases[0].toDataURL('image/png');
    anchor.click();
    return {filename,pages:1};
  },
}];
const runtime=createDNSCapabilityRuntime({declared:['export.pdf','export.png'],adapters});
export const exportCreativePDF=(input:ExportInput)=>runtime.run('export.pdf',input);
export const exportCreativePNG=(input:ExportInput)=>runtime.run('export.png',input);
