import type jsPDF from 'jspdf';

/** Brand colours shared by every generated PDF. */
export const PDF_COLORS = {
  ink: '#141413',
  text: '#333333',
  muted: '#5E5D59',
  rule: '#D8D6CC',
  accent: '#A0401D',
  accentFill: '#B84A28',
} as const;

export const wrapPdfText = (pdf: jsPDF, text: string, maxWidth: number, fontSize: number): string[] => {
  pdf.setFontSize(fontSize);
  return pdf.splitTextToSize(text, maxWidth);
};

export const stripMarkdown = (text: string) => {
  if (!text) return '';
  let value = text;
  value = value.replace(/```[\s\S]*?```/g, '');
  value = value.replace(/`[^`]*`/g, '');
  value = value.replace(/!\[[^\]]*?\]\([^)]+?\)/g, '');
  value = value.replace(/\[([^\]]+?)\]\([^)]+?\)/g, '$1');
  value = value.replace(/~~([^~]+)~~/g, '$1');
  value = value.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
  value = value.replace(/^>+\s?/gm, '');
  value = value.replace(/^#{1,6}\s+/gm, '');
  value = value.replace(/^\s*[-*+]\s+/gm, '');
  value = value.replace(/^\s*\d+\.\s+/gm, '');
  let previous: string;
  do {
    previous = value;
    value = value.replace(/<[^>]+>/g, '');
  } while (value !== previous);
  value = value.replace(/\s{2,}/g, ' ');
  return value.trim();
};

export const truncatePdfLines = (pdf: jsPDF, lines: string[], maxLines: number, maxWidth: number) => {
  if (lines.length <= maxLines) {
    return lines;
  }
  const truncated = lines.slice(0, maxLines);
  const ellipsis = '...';
  const getTextWidth = (pdf as jsPDF & { getTextWidth?: (text: string) => number }).getTextWidth;
  let last = truncated[maxLines - 1];
  if (getTextWidth) {
    while (last.length > 0 && getTextWidth.call(pdf, `${last}${ellipsis}`) > maxWidth) {
      last = last.slice(0, -1);
    }
  } else if (last.length > 3) {
    last = last.slice(0, -3);
  }
  truncated[maxLines - 1] = `${last}${ellipsis}`;
  return truncated;
};

export const resolveImageUrl = (imagePath?: string | null) => {
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) return `${apiBase}${imagePath}`;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${imagePath}`;
    }
  }
  return imagePath;
};

export const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    throw new Error('Failed to load image as base64');
  }
};

/**
 * Loads any image the browser can decode (WebP included) and re-encodes it through a
 * canvas as PNG or JPEG, the only formats jsPDF accepts. `maxWidth` downsizes large
 * sources so they don't bloat the PDF.
 */
export const loadImageAsDataUrl = async (
  imagePath: string,
  mime: 'image/png' | 'image/jpeg' = 'image/jpeg',
  options: { quality?: number; maxWidth?: number } = {},
): Promise<{ dataUrl: string; width: number; height: number }> => {
  try {
    const source = await loadImageAsBase64(imagePath);
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const scale = options.maxWidth && img.naturalWidth > options.maxWidth ? options.maxWidth / img.naturalWidth : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context unavailable'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({ dataUrl: canvas.toDataURL(mime, options.quality ?? 0.9), width: canvas.width, height: canvas.height });
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = source;
    });
  } catch {
    throw new Error('Failed to load/convert image');
  }
};
