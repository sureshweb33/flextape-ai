import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import { TapeDesign } from "./aiService";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

export interface PrintOptions {
  design: TapeDesign;
  tapeWidthInches: number;
  orderNumber: string;
  designId: string;
  orientation?: "horizontal" | "vertical";
}

// A4 size in points (1 inch = 72 points)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 36; // 0.5 inch

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

export async function generatePrintReadyPDF(options: PrintOptions): Promise<{ pdfBytes: Uint8Array; fileName: string }> {
  const { design, tapeWidthInches, orderNumber, designId } = options;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText("CUSTOM TAPE - PRINT READY", {
    x: MARGIN,
    y: A4_HEIGHT - 30,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Order: ${orderNumber}  |  Design: ${designId}  |  Width: ${tapeWidthInches}"`, {
    x: MARGIN,
    y: A4_HEIGHT - 48,
    size: 9,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(`Generated: ${new Date().toLocaleString("en-IN")}`, {
    x: MARGIN,
    y: A4_HEIGHT - 62,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Cutting guides note
  page.drawText("CUT ALONG THE DASHED LINES  •  SAFE MARGIN INCLUDED", {
    x: MARGIN,
    y: 20,
    size: 8,
    font,
    color: rgb(0.5, 0.2, 0.1),
  });

  const tapeHeightPts = tapeWidthInches * 72;
  const usableWidth = A4_WIDTH - 2 * MARGIN;
  const usableHeight = A4_HEIGHT - 100; // space for header/footer

  const gap = 12;
  let currentY = A4_HEIGHT - 90;

  const primaryColor = hexToRgb(design.colors[0]?.hex || "#888888");
  const secondaryColor = hexToRgb(design.colors[1]?.hex || design.colors[0]?.hex || "#666666");

  // Draw multiple tape strips
  while (currentY - tapeHeightPts > 40) {
    // Tape body
    page.drawRectangle({
      x: MARGIN,
      y: currentY - tapeHeightPts,
      width: usableWidth,
      height: tapeHeightPts,
      color: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
    });

    // Pattern based on type
    if (design.patternType === "border") {
      const borderH = Math.min(8, tapeHeightPts * 0.15);
      page.drawRectangle({
        x: MARGIN,
        y: currentY - borderH,
        width: usableWidth,
        height: borderH,
        color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b),
      });
      page.drawRectangle({
        x: MARGIN,
        y: currentY - tapeHeightPts,
        width: usableWidth,
        height: borderH,
        color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b),
      });
    } else if (design.patternType === "stripe") {
      const stripeH = tapeHeightPts / 3;
      page.drawRectangle({
        x: MARGIN,
        y: currentY - tapeHeightPts + stripeH,
        width: usableWidth,
        height: stripeH,
        color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b),
      });
    } else if (design.patternType === "gradient") {
      // Approximate gradient with strips
      const steps = 8;
      for (let s = 0; s < steps; s++) {
        const t = s / (steps - 1);
        const r = primaryColor.r * (1 - t) + secondaryColor.r * t;
        const g = primaryColor.g * (1 - t) + secondaryColor.g * t;
        const b = primaryColor.b * (1 - t) + secondaryColor.b * t;
        page.drawRectangle({
          x: MARGIN + (usableWidth / steps) * s,
          y: currentY - tapeHeightPts,
          width: usableWidth / steps + 0.5,
          height: tapeHeightPts,
          color: rgb(r, g, b),
        });
      }
    }

    // Dashed cutting guide (top)
    drawDashedLine(page, MARGIN - 5, currentY, MARGIN + usableWidth + 5, currentY);

    // Label on the strip
    page.drawText(`${design.name}  |  ${tapeWidthInches}"  |  ${orderNumber}`, {
      x: MARGIN + 6,
      y: currentY - tapeHeightPts / 2 - 4,
      size: 7,
      font,
      color: rgb(1, 1, 1),
      opacity: 0.7,
    });

    currentY -= tapeHeightPts + gap;
  }

  // Footer info
  page.drawText("DEMO PRINT FILE - For A4 printer testing only. Not for production use.", {
    x: MARGIN,
    y: 8,
    size: 7,
    font,
    color: rgb(0.6, 0.3, 0.1),
  });

  const pdfBytes = await pdfDoc.save();
  const fileName = `tape-${orderNumber}-${designId.slice(0, 8)}.pdf`;

  return { pdfBytes, fileName };
}

function drawDashedLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number) {
  const dashLen = 4;
  const gapLen = 3;
  const totalLen = x2 - x1;
  let x = x1;
  while (x < x2) {
    const end = Math.min(x + dashLen, x2);
    page.drawLine({
      start: { x, y: y1 },
      end: { x: end, y: y1 },
      thickness: 0.5,
      color: rgb(0.2, 0.2, 0.2),
      opacity: 0.6,
    });
    x += dashLen + gapLen;
  }
}

export async function savePrintFile(pdfBytes: Uint8Array, fileName: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "prints");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, pdfBytes);
  return `/prints/${fileName}`;
}
