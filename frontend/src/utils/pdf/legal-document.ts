import jsPDF from 'jspdf';
import { loadImageAsDataUrl, PDF_COLORS, wrapPdfText } from '@/utils/pdf/helpers';

export interface LegalPdfSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPdfInput {
  title: string;
  sections: LegalPdfSection[];
  fileName: string;
  /** Already localised, e.g. "Versión 2.0 · 8 de octubre de 2026". */
  versionLine: string;
  kicker: string;
  /** Footer lines, left column. */
  footerLines: string[];
  pageLabel: (page: number, total: number) => string;
}

const MARGIN = 20;
const TOP = 30;
const FOOTER_RESERVE = 28;
const LINE = 4.8;

/**
 * Renders a legal document (title + numbered sections of paragraphs and bullets) with the
 * Ordinaly header (logo) and footer (company data, version, page x of y) on every page.
 */
export async function generateLegalPDF(input: LegalPdfInput) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  const bottom = pageHeight - FOOTER_RESERVE;
  pdf.setProperties({ title: input.title, author: input.kicker, creator: input.kicker });

  let y = TOP;
  const ensureSpace = (height: number) => {
    if (y + height > bottom) {
      pdf.addPage();
      y = TOP;
    }
  };

  // Cover block
  pdf.setFillColor(PDF_COLORS.accentFill);
  pdf.rect(MARGIN, y, 1.2, 24, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(PDF_COLORS.accent);
  pdf.text(input.kicker.toUpperCase(), MARGIN + 5, y + 4, { charSpace: 0.5 });
  pdf.setFontSize(22);
  pdf.setTextColor(PDF_COLORS.ink);
  pdf.text(input.title, MARGIN + 5, y + 13);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(PDF_COLORS.muted);
  pdf.text(input.versionLine, MARGIN + 5, y + 20);
  y += 36;

  input.sections.forEach((section, index) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    const headingLines = wrapPdfText(pdf, `${index + 1}.  ${section.title}`, contentWidth, 10.5);
    // Keep the heading together with the first lines that follow it.
    ensureSpace(headingLines.length * 5 + LINE * 2 + 2);
    pdf.setTextColor(PDF_COLORS.accent);
    headingLines.forEach((line) => {
      pdf.text(line, MARGIN, y);
      y += 5;
    });
    y += 0.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(PDF_COLORS.text);
    section.paragraphs.forEach((paragraph) => {
      wrapPdfText(pdf, paragraph, contentWidth, 10).forEach((line) => {
        ensureSpace(LINE);
        pdf.text(line, MARGIN, y);
        y += LINE;
      });
      y += 1.6;
    });

    (section.bullets ?? []).forEach((bullet) => {
      const lines = wrapPdfText(pdf, bullet, contentWidth - 6, 10);
      lines.forEach((line, lineIndex) => {
        ensureSpace(LINE);
        if (lineIndex === 0) {
          pdf.setTextColor(PDF_COLORS.accentFill);
          pdf.text('•', MARGIN + 1.5, y);
          pdf.setTextColor(PDF_COLORS.text);
        }
        pdf.text(line, MARGIN + 6, y);
        y += LINE;
      });
      y += 1.2;
    });
    y += 4;
  });

  // Header and footer need the final page count.
  let logo: { dataUrl: string; width: number; height: number } | null = null;
  try {
    logo = await loadImageAsDataUrl('/logo.webp', 'image/png', { maxWidth: 200 });
  } catch {
    logo = null;
  }
  const logoHeight = 9;
  const logoWidth = logo ? (logo.width / logo.height) * logoHeight : 0;
  const total = pdf.getNumberOfPages();

  for (let page = 1; page <= total; page++) {
    pdf.setPage(page);

    if (logo) pdf.addImage(logo.dataUrl, 'PNG', MARGIN, 10, logoWidth, logoHeight);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(PDF_COLORS.ink);
    pdf.text('Ordinaly Software', MARGIN + (logo ? logoWidth + 3 : 0), 16);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(PDF_COLORS.muted);
    pdf.text(input.title, pageWidth - MARGIN, 16, { align: 'right' });
    pdf.setDrawColor(PDF_COLORS.rule);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, 22, pageWidth - MARGIN, 22);

    const footerTop = pageHeight - 22;
    pdf.line(MARGIN, footerTop, pageWidth - MARGIN, footerTop);
    pdf.setFontSize(7);
    input.footerLines.forEach((line, i) => pdf.text(line, MARGIN, footerTop + 4.5 + i * 3.4));
    pdf.text(input.versionLine, pageWidth - MARGIN, footerTop + 4.5, { align: 'right' });
    pdf.text(input.pageLabel(page, total), pageWidth - MARGIN, footerTop + 7.9, { align: 'right' });
  }

  pdf.save(input.fileName);
}
