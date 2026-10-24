import { jsPDF } from 'jspdf';
import { flyerPageMm, type CreativeExportGeometry } from './creativeExport';

/**
 * Vector/Hybrid PDF contract shared by every Flyer Studio document.
 * Coordinates and sizes are millimetres; photographs remain embedded bitmaps.
 * No page-sized screenshots are accepted as commands.
 */
export type VectorPdfCommand =
  | { kind: 'rect'; x: number; y: number; width: number; height: number; fill?: string; stroke?: string; lineWidth?: number; radius?: number }
  | { kind: 'line'; x: number; y: number; toX: number; toY: number; stroke: string; lineWidth?: number }
  | { kind: 'text'; x: number; y: number; text: string; sizePt: number; color: string; weight?: 'normal' | 'bold'; maxWidth?: number; align?: 'left' | 'center' | 'right' }
  | { kind: 'photo'; x: number; y: number; width: number; height: number; dataUrl: string; format: 'JPEG' | 'PNG' };

export interface VectorPdfPage {
  geometry: CreativeExportGeometry;
  commands: readonly VectorPdfCommand[];
}

function rgb(hex: string): [number, number, number] {
  const color = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(color)) throw new Error('Invalid vector PDF color: ' + hex);
  return [0, 2, 4].map(i => parseInt(color.slice(i, i + 2), 16)) as [number, number, number];
}

function verifyNumber(...values: number[]) {
  if (values.some(value => !Number.isFinite(value))) throw new Error('Non-finite vector PDF coordinate');
}

function paint(pdf: jsPDF, page: VectorPdfPage) {
  const [pageWidth, pageHeight] = flyerPageMm(page.geometry);
  for (const command of page.commands) {
    verifyNumber(command.x, command.y);
    if (command.kind === 'rect') {
      verifyNumber(command.width, command.height);
      if (command.fill) pdf.setFillColor(...rgb(command.fill));
      if (command.stroke) pdf.setDrawColor(...rgb(command.stroke));
      pdf.setLineWidth(command.lineWidth ?? 0.2);
      const style = command.fill && command.stroke ? 'FD' : command.fill ? 'F' : 'S';
      if (command.radius) pdf.roundedRect(command.x,command.y,command.width,command.height,command.radius,command.radius,style);
      else pdf.rect(command.x,command.y,command.width,command.height,style);
    } else if (command.kind === 'line') {
      verifyNumber(command.toX,command.toY);
      pdf.setDrawColor(...rgb(command.stroke));
      pdf.setLineWidth(command.lineWidth ?? 0.2);
      pdf.line(command.x,command.y,command.toX,command.toY);
    } else if (command.kind === 'text') {
      verifyNumber(command.sizePt);
      pdf.setFont('helvetica',command.weight === 'bold' ? 'bold' : 'normal');
      pdf.setFontSize(command.sizePt);
      pdf.setTextColor(...rgb(command.color));
      pdf.text(command.text,command.x,command.y,{
        align:command.align ?? 'left',
        maxWidth:command.maxWidth,
      });
    } else if (command.kind === 'photo') {
      verifyNumber(command.width,command.height);
      // A photograph is a legitimate embedded raster element, never a whole-page raster PDF.
      if (command.width >= pageWidth * 0.99 && command.height >= pageHeight * 0.99) {
        throw new Error('Whole-page raster images are not permitted in vector PDF export');
      }
      pdf.addImage(command.dataUrl,command.format,command.x,command.y,command.width,command.height);
    }
  }
}
export function renderVectorPdf(pages: readonly VectorPdfPage[], filename: string): void {
  if (!pages.length) throw new Error('Vector PDF requires at least one page');
  const first = pages[0];
  const pdf = new jsPDF({unit:'mm',format:flyerPageMm(first.geometry),orientation:first.geometry.orientation,compress:true});
  pages.forEach((page,index) => {
    if(index) pdf.addPage(flyerPageMm(page.geometry),page.geometry.orientation);
    paint(pdf,page);
  });
  pdf.save(filename);
}
