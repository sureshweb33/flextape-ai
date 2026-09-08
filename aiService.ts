import sharp from "sharp";
import { z } from "zod";

// Color extraction and design suggestion service
// In production: replace analysis with real Grok/OpenAI vision call

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
  percentage: number;
}

export interface TapeDesign {
  id: string;
  name: string;
  colors: ColorInfo[];
  description: string;
  matchingScore: number;
  recommendedWidth: string;
  finish: string;
  patternType: "solid" | "stripe" | "border" | "gradient" | "pattern";
  previewSvg: string;
}

export interface AnalysisResult {
  dominantColors: ColorInfo[];
  secondaryColors: ColorInfo[];
  designStyle: string;
  contrast: string;
  suggestedTapeDesigns: TapeDesign[];
}

const DesignSchema = z.object({
  name: z.string(),
  colors: z.array(z.object({
    hex: z.string(),
    name: z.string(),
  })),
  description: z.string(),
  matchingScore: z.number().min(0).max(100),
  recommendedWidth: z.string(),
  finish: z.string(),
  patternType: z.enum(["solid", "stripe", "border", "gradient", "pattern"]),
});

// Simple color name approximation
function getColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;

  if (max - min < 30) {
    if (lightness > 0.85) return "White";
    if (lightness > 0.6) return "Light Grey";
    if (lightness > 0.3) return "Grey";
    if (lightness > 0.1) return "Dark Grey";
    return "Black";
  }

  const hue = (() => {
    if (max === r) return ((g - b) / (max - min)) * 60;
    if (max === g) return (2 + (b - r) / (max - min)) * 60;
    return (4 + (r - g) / (max - min)) * 60;
  })();

  const h = (hue + 360) % 360;

  if (h < 15 || h >= 345) return lightness > 0.6 ? "Light Red" : "Red";
  if (h < 45) return lightness > 0.7 ? "Light Orange" : "Orange";
  if (h < 70) return lightness > 0.7 ? "Light Yellow" : "Yellow";
  if (h < 150) return lightness > 0.6 ? "Light Green" : "Green";
  if (h < 200) return lightness > 0.6 ? "Light Cyan" : "Cyan";
  if (h < 260) return lightness > 0.6 ? "Light Blue" : "Blue";
  if (h < 290) return lightness > 0.6 ? "Light Purple" : "Purple";
  if (h < 330) return lightness > 0.6 ? "Light Pink" : "Pink";
  return "Magenta";
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

async function extractDominantColors(imageBuffer: Buffer, count = 6): Promise<ColorInfo[]> {
  // Resize for faster processing
  const { data, info } = await sharp(imageBuffer)
    .resize(100, 100, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorMap = new Map<string, number>();
  const step = info.channels;

  for (let i = 0; i < data.length; i += step * 4) { // sample every 4th pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // quantize
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr},${qg},${qb}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  const total = sorted.reduce((sum, [, c]) => sum + c, 0);

  return sorted.map(([key, count]) => {
    const [r, g, b] = key.split(",").map(Number);
    return {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      name: getColorName(r, g, b),
      percentage: Math.round((count / total) * 100),
    };
  });
}

function generateDesigns(colors: ColorInfo[], style: string): TapeDesign[] {
  const primary = colors[0];
  const secondary = colors[1] || colors[0];
  const tertiary = colors[2] || secondary;

  const designs: Omit<TapeDesign, "id" | "previewSvg">[] = [
    {
      name: `${primary.name} Solid Match`,
      colors: [primary],
      description: `Clean solid ${primary.name.toLowerCase()} tape that perfectly matches the dominant color of your flex.`,
      matchingScore: 94 + Math.floor(Math.random() * 5),
      recommendedWidth: "1.5 inch",
      finish: "Matte",
      patternType: "solid",
    },
    {
      name: `${primary.name} + ${secondary.name} Border`,
      colors: [primary, secondary],
      description: `Main body in ${primary.name.toLowerCase()} with elegant ${secondary.name.toLowerCase()} border for premium look.`,
      matchingScore: 90 + Math.floor(Math.random() * 6),
      recommendedWidth: "2 inch",
      finish: "Glossy",
      patternType: "border",
    },
    {
      name: `${secondary.name} Contrast`,
      colors: [secondary],
      description: `Contrasting ${secondary.name.toLowerCase()} tape that creates visual separation while staying harmonious.`,
      matchingScore: 85 + Math.floor(Math.random() * 8),
      recommendedWidth: "1 inch",
      finish: "Matte",
      patternType: "solid",
    },
    {
      name: `Dual Stripe ${primary.name}/${tertiary.name}`,
      colors: [primary, tertiary],
      description: `Modern dual-stripe pattern using your flex's primary and accent colors.`,
      matchingScore: 88 + Math.floor(Math.random() * 7),
      recommendedWidth: "2 inch",
      finish: "Glossy",
      patternType: "stripe",
    },
    {
      name: `Premium Gradient ${primary.name}`,
      colors: [primary, secondary],
      description: `Subtle gradient from ${primary.name.toLowerCase()} to ${secondary.name.toLowerCase()} for a high-end finish.`,
      matchingScore: 87 + Math.floor(Math.random() * 8),
      recommendedWidth: "1.5 inch",
      finish: "Metallic look",
      patternType: "gradient",
    },
    {
      name: `AI Recommended Classic`,
      colors: [primary, secondary, tertiary],
      description: `Balanced multi-color design derived directly from your image palette. Best overall match.`,
      matchingScore: 92 + Math.floor(Math.random() * 6),
      recommendedWidth: "2 inch",
      finish: "Matte",
      patternType: "pattern",
    },
  ];

  return designs.map((d, i) => ({
    ...d,
    id: `design-${i + 1}-${Date.now()}`,
    previewSvg: generatePreviewSvg(d.colors, d.patternType),
  }));
}

function generatePreviewSvg(colors: ColorInfo[], pattern: string): string {
  const c1 = colors[0]?.hex || "#888888";
  const c2 = colors[1]?.hex || c1;
  const c3 = colors[2]?.hex || c2;

  if (pattern === "solid") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60" viewBox="0 0 300 60">
      <rect width="300" height="60" fill="${c1}"/>
      <rect x="0" y="0" width="300" height="4" fill="#00000022"/>
      <rect x="0" y="56" width="300" height="4" fill="#00000022"/>
    </svg>`;
  }
  if (pattern === "border") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60" viewBox="0 0 300 60">
      <rect width="300" height="60" fill="${c1}"/>
      <rect x="0" y="0" width="300" height="8" fill="${c2}"/>
      <rect x="0" y="52" width="300" height="8" fill="${c2}"/>
    </svg>`;
  }
  if (pattern === "stripe") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60" viewBox="0 0 300 60">
      <rect width="300" height="60" fill="${c1}"/>
      <rect x="0" y="20" width="300" height="20" fill="${c2}"/>
    </svg>`;
  }
  if (pattern === "gradient") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60" viewBox="0 0 300 60">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="60" fill="url(#g)"/>
    </svg>`;
  }
  // pattern
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60" viewBox="0 0 300 60">
    <rect width="300" height="60" fill="${c1}"/>
    <rect x="0" y="0" width="300" height="10" fill="${c2}"/>
    <rect x="0" y="25" width="300" height="10" fill="${c3}"/>
    <rect x="0" y="50" width="300" height="10" fill="${c2}"/>
  </svg>`;
}

export async function analyzeImage(imageBuffer: Buffer): Promise<AnalysisResult> {
  const colors = await extractDominantColors(imageBuffer, 8);

  const dominant = colors.slice(0, 3);
  const secondary = colors.slice(3, 6);

  // Simple style detection based on color variety
  const variety = colors.length;
  let designStyle = "Modern";
  if (variety <= 3) designStyle = "Minimal / Clean";
  else if (variety >= 6) designStyle = "Vibrant / Colorful";

  const designs = generateDesigns(colors, designStyle);

  return {
    dominantColors: dominant,
    secondaryColors: secondary,
    designStyle,
    contrast: dominant[0] && secondary[0] ? "Medium-High" : "Medium",
    suggestedTapeDesigns: designs,
  };
}

// Future: Real AI provider interface
export interface AIProvider {
  analyzeImage(imageBase64: string, mimeType: string): Promise<AnalysisResult>;
}

export class LocalColorAIProvider implements AIProvider {
  async analyzeImage(imageBase64: string, mimeType: string): Promise<AnalysisResult> {
    const buffer = Buffer.from(imageBase64, "base64");
    return analyzeImage(buffer);
  }
}

// Placeholder for real Grok provider
export class GrokAIProvider implements AIProvider {
  constructor(private apiKey: string) {}
  async analyzeImage(imageBase64: string, mimeType: string): Promise<AnalysisResult> {
    // TODO: Call xAI Grok vision API with structured prompt
    // For now fallback to local
    console.warn("GrokAIProvider not fully implemented, falling back to local analysis");
    const buffer = Buffer.from(imageBase64, "base64");
    return analyzeImage(buffer);
  }
}
