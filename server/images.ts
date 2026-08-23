import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

let geminiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Generate AI image or fall back to high-resolution dynamic infographic
 */
export async function generateAIImage(
  promptText: string,
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4' = '16:9'
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const ai = getClient();
    const response = await ai.models.generateImages({
      model: process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002',
      prompt: `${promptText}. Premium editorial technology visual, clear visual storytelling, cinematic lighting, polished composition, deep charcoal palette with restrained cyan, gold and violet accents, high contrast, subtle grain, no words, no logos, no watermarks.`,
      config: {
        numberOfImages: 1,
        aspectRatio,
        outputMimeType: 'image/jpeg',
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    return imageBytes ? `data:image/jpeg;base64,${imageBytes}` : null;
  } catch (err: any) {
    console.warn('[ImageGeneration] Falling back to branded SVG:', err?.message || err);
    return null;
  }
}

export interface InfographicData {
  title: string;
  category: string;
  badge?: string;
  metricHighlight?: { before: string; after: string; label: string };
  flowSteps?: { step: number; title: string; subtitle: string; tag: string }[];
  keyTakeaways?: string[];
  techStack?: string[];
}

/**
 * Generate Platform-Specific Visual Assets:
 * - LinkedIn: 1 Landscape 16:9 Technical Blueprint & System Architecture Diagram
 * - Instagram: 4-Slide Educational Carousel (Cover + 3 Breakdown Steps) with 1:1 format
 * - Facebook: 1 Landscape 16:9 Community Discussion Infographic & ROI Comparison
 */
export async function generatePlatformVisualAssets(
  topic: string,
  category: string,
  platformPrompts: {
    linkedin: { prompt: string; hook: string };
    instagram: { prompt: string; hook: string; slides?: { slideNumber: number; title: string; content: string }[] };
    facebook: { prompt: string; hook: string };
  }
): Promise<{
  linkedin: { visualImageUrl: string; visualType: 'ai_generated' | 'workflow_diagram' | 'branded_graphic' };
  instagram: {
    visualImageUrl: string;
    carouselSlides: { slideNumber: number; title: string; content: string; slideImageUrl: string }[];
    visualType: 'ai_generated' | 'workflow_diagram' | 'branded_graphic';
  };
  facebook: { visualImageUrl: string; visualType: 'ai_generated' | 'workflow_diagram' | 'branded_graphic' };
}> {
  // Extract topic-specific workflow steps
  const topicLower = topic.toLowerCase();
  let step1Title = '1. Intake & Trigger';
  let step1Desc = 'Webhook / Event Ingestion';
  let step2Title = '2. State Graph Engine';
  let step2Desc = 'Deterministic State Machine';
  let step3Title = '3. Schema Validation';
  let step3Desc = 'Strict Pydantic / Zod Gates';
  let step4Title = '4. Production Action';
  let step4Desc = 'Idempotent API / DB Write';

  if (topicLower.includes('zapier') || topicLower.includes('webhook')) {
    step1Title = '1. Event Trigger';
    step1Desc = 'Zapier / n8n Webhook';
    step2Title = '2. Fast Middleware';
    step2Desc = 'Payload Sanitization & Queue';
    step3Title = '3. Microservice Sync';
    step3Desc = 'FastAPI / Async Worker';
    step4Title = '4. Verified Output';
    step4Desc = 'CRM & Database Update';
  } else if (topicLower.includes('saas') || topicLower.includes('mvp')) {
    step1Title = '1. User Request';
    step1Desc = 'API Gateway / Auth Gate';
    step2Title = '2. Core Logic';
    step2Desc = 'Async Background Worker';
    step3Title = '3. Model Pipeline';
    step3Desc = 'Optimized LLM Execution';
    step4Title = '4. Live Delivery';
    step4Desc = 'Real-time WebSocket Push';
  }

  // 1. LinkedIn (16:9 Technical Architecture Infographic)
  const linkedinImageUri = generateArchitectureInfographicSvg({
    platform: 'linkedin',
    title: topic,
    category,
    badge: 'SYSTEM ARCHITECTURE BLUEPRINT ⚡',
    flowSteps: [
      { step: 1, title: step1Title, subtitle: step1Desc, tag: 'INGEST' },
      { step: 2, title: step2Title, subtitle: step2Desc, tag: 'PROCESS' },
      { step: 3, title: step3Title, subtitle: step3Desc, tag: 'VALIDATE' },
      { step: 4, title: step4Title, subtitle: step4Desc, tag: 'DEPLOY' },
    ],
    metricHighlight: {
      before: '4 Hours Manual',
      after: '45s Autonomous',
      label: 'Turnaround Latency',
    },
    techStack: ['LangGraph', 'Zapier Webhooks', 'FastAPI', 'PostgreSQL'],
  });

  // 2. Facebook (16:9 Community Discussion & ROI Comparison Infographic)
  const facebookImageUri = generateArchitectureInfographicSvg({
    platform: 'facebook',
    title: topic,
    category,
    badge: 'OPERATIONAL ROI & WORKFLOW AUDIT 📊',
    flowSteps: [
      { step: 1, title: 'Manual Bottleneck', subtitle: 'Disconnected spreadsheets & human handoffs', tag: 'BEFORE' },
      { step: 2, title: 'Autonomous Engine', subtitle: 'Self-healing 24/7 AI workflow pipeline', tag: 'AFTER' },
      { step: 3, title: 'Measured Impact', subtitle: '99.4% task accuracy with zero latency', tag: 'ROI' },
    ],
    metricHighlight: {
      before: '25+ hrs / week lost',
      after: 'Zero human bottleneck',
      label: 'Operational Leverage',
    },
    techStack: ['AI Automation', 'CRM Sync', 'Zapier', 'API Pipelines'],
  });

  // 3. Instagram Carousel (1:1 Multi-Slide Deck)
  const defaultSlides = [
    { slideNumber: 1, title: 'The Problem: Flaky Demos', content: 'Freeform AI prompt loops fail 90% of the time in production due to unstructured hallucinations and cascading retries.' },
    { slideNumber: 2, title: 'The Root Cause: Zero Guardrails', content: 'Without rigid schema checkpoints, a single malformed API response crashes the entire downstream workflow.' },
    { slideNumber: 3, title: 'The Architecture: State Machine', content: 'Constrain agent transitions as finite state graphs (LangGraph). Every node validates against strict Pydantic/Zod schemas.' },
    { slideNumber: 4, title: 'The Outcome: 99.8% Reliability', content: 'Sub-minute turnaround, zero data-entry errors, and full human-in-the-loop fallback when confidence drops below 92%.' },
  ];

  const inputSlides = platformPrompts.instagram.slides && platformPrompts.instagram.slides.length > 0
    ? platformPrompts.instagram.slides
    : defaultSlides;

  // Instagram Cover (1:1)
  const instagramCoverUri = generateInstagramCoverSvg(topic, category, 'SWIPE FOR 4-STEP BLUEPRINT 👉', [
    step1Title.replace(/^\d+\.\s*/, ''),
    step2Title.replace(/^\d+\.\s*/, ''),
    step3Title.replace(/^\d+\.\s*/, ''),
  ]);

  // Generate enriched slides
  const enrichedSlides = inputSlides.map((slide) => {
    const slideSvg = generateCarouselSlideSvg(slide.slideNumber, slide.title, slide.content, topic, category);
    return {
      ...slide,
      slideImageUrl: slideSvg,
    };
  });

  const [linkedinAi, instagramCoverAi, facebookAi, ...slideAi] = await Promise.all([
    generateAIImage(platformPrompts.linkedin.prompt, '16:9'),
    generateAIImage(platformPrompts.instagram.prompt, '1:1'),
    generateAIImage(platformPrompts.facebook.prompt, '16:9'),
    ...inputSlides.slice(0, 4).map((slide) =>
      generateAIImage(
        `${platformPrompts.instagram.prompt}. This is slide ${slide.slideNumber} of a four-slide educational carousel. Visualize the concept: ${slide.title}. Supporting idea: ${slide.content}`,
        '1:1'
      )
    ),
  ]);

  const enrichedSlidesWithAi = enrichedSlides.map((slide, index) => ({
    ...slide,
    slideImageUrl: slideAi[index] || slide.slideImageUrl,
  }));

  return {
    linkedin: {
      visualImageUrl: linkedinAi || linkedinImageUri,
      visualType: linkedinAi ? 'ai_generated' : 'workflow_diagram',
    },
    instagram: {
      visualImageUrl: instagramCoverAi || instagramCoverUri,
      carouselSlides: enrichedSlidesWithAi,
      visualType: instagramCoverAi ? 'ai_generated' : 'workflow_diagram',
    },
    facebook: {
      visualImageUrl: facebookAi || facebookImageUri,
      visualType: facebookAi ? 'ai_generated' : 'branded_graphic',
    },
  };
}

/**
 * Generate Ultra-Modern Architecture Infographic SVG (1200x675 Landscape)
 */
export function generateArchitectureInfographicSvg(data: {
  platform: 'linkedin' | 'facebook';
  title: string;
  category: string;
  badge: string;
  flowSteps: { step: number; title: string; subtitle: string; tag: string }[];
  metricHighlight?: { before: string; after: string; label: string };
  techStack?: string[];
}): string {
  const width = 1200;
  const height = 675;

  const safeTitle = data.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .slice(0, 110);

  const safeCategory = data.category.toUpperCase().slice(0, 30);
  const safeBadge = data.badge.slice(0, 50);

  const steps = data.flowSteps.slice(0, 4);
  const stepCount = steps.length;
  const stepWidth = (width - 160 - (stepCount - 1) * 24) / stepCount;

  const nodeColors = [
    { border: '#38bdf8', bg: '#0369a1', glow: '#38bdf8' },
    { border: '#818cf8', bg: '#4338ca', glow: '#818cf8' },
    { border: '#c084fc', bg: '#7e22ce', glow: '#c084fc' },
    { border: '#34d399', bg: '#059669', glow: '#34d399' },
  ];

  // Render steps SVG
  const stepsSvg = steps
    .map((s, idx) => {
      const x = 80 + idx * (stepWidth + 24);
      const color = nodeColors[idx % nodeColors.length];
      const safeStepTitle = s.title.replace(/&/g, '&amp;').slice(0, 32);
      const safeStepSub = s.subtitle.replace(/&/g, '&amp;').slice(0, 45);
      const safeTag = s.tag.replace(/&/g, '&amp;').slice(0, 14);

      return `
      <!-- Step Node ${idx + 1} -->
      <g transform="translate(${x}, ${height * 0.48})">
        <!-- Glow Backing -->
        <rect x="0" y="0" width="${stepWidth}" height="140" rx="16" fill="#0f172a" stroke="${color.border}" stroke-width="2" />
        
        <!-- Tag Pill -->
        <rect x="16" y="14" width="70" height="24" rx="12" fill="${color.bg}" fill-opacity="0.5" stroke="${color.border}" stroke-width="1" />
        <text x="51" y="30" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" letter-spacing="1">${safeTag}</text>

        <!-- Step Number -->
        <circle cx="${stepWidth - 26}" cy="26" r="12" fill="#1e293b" stroke="#475569" stroke-width="1" />
        <text x="${stepWidth - 26}" y="30" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="700">${s.step}</text>

        <!-- Title -->
        <text x="16" y="72" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800">${safeStepTitle}</text>
        
        <!-- Subtitle / Technical Note -->
        <foreignObject x="16" y="84" width="${stepWidth - 32}" height="45">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #94a3b8; font-size: 12px; line-height: 1.35; font-weight: 500;">
            ${safeStepSub}
          </div>
        </foreignObject>
      </g>
      ${
        idx < stepCount - 1
          ? `<!-- Connector Arrow -->
        <g transform="translate(${x + stepWidth + 4}, ${height * 0.48 + 58})">
          <circle cx="8" cy="12" r="10" fill="#1e293b" stroke="#475569" stroke-width="1" />
          <path d="M5 12 L11 12 M8 9 L11 12 L8 15" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </g>`
          : ''
      }
    `;
    })
    .join('');

  // Tech stack pills
  const techPills = (data.techStack || ['AI Agents', 'State Graphs', 'Zapier', 'APIs'])
    .map((tech, i) => {
      return `<tspan dx="16" fill="#38bdf8" font-weight="700">[${tech}]</tspan>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a12" />
      <stop offset="50%" stop-color="#0c1322" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="cyanViolet" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Atmospheric Glow Orbs -->
  <circle cx="1050" cy="120" r="320" fill="#38bdf8" opacity="0.12" filter="url(#neonGlow)" />
  <circle cx="150" cy="550" r="320" fill="#818cf8" opacity="0.10" filter="url(#neonGlow)" />
  <circle cx="600" cy="300" r="240" fill="#c084fc" opacity="0.06" filter="url(#neonGlow)" />

  <!-- Subtle Engineering Grid -->
  <g opacity="0.05" stroke="#38bdf8" stroke-width="1">
    <line x1="0" y1="135" x2="${width}" y2="135" />
    <line x1="0" y1="270" x2="${width}" y2="270" />
    <line x1="0" y1="405" x2="${width}" y2="405" />
    <line x1="0" y1="540" x2="${width}" y2="540" />
    <line x1="300" y1="0" x2="300" y2="${height}" />
    <line x1="600" y1="0" x2="600" y2="${height}" />
    <line x1="900" y1="0" x2="900" y2="${height}" />
  </g>

  <!-- Outer Glassmorphism Card Frame -->
  <rect x="36" y="36" width="${width - 72}" height="${height - 72}" rx="24" fill="#0f172a" fill-opacity="0.4" stroke="#334155" stroke-width="1.5" />

  <!-- Header Section: Category Badge + Status -->
  <g transform="translate(80, 75)">
    <!-- Category Pill -->
    <rect width="210" height="34" rx="17" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <circle cx="18" cy="17" r="4.5" fill="#38bdf8" />
    <text x="32" y="22" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5">${safeCategory}</text>
    
    <!-- Top Right Badge -->
    <text x="${width - 160}" y="22" text-anchor="end" fill="#f59e0b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" letter-spacing="1">${safeBadge}</text>
  </g>

  <!-- Main Headline Title -->
  <foreignObject x="80" y="125" width="${width - 160}" height="140">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; font-size: 34px; font-weight: 800; line-height: 1.25; letter-spacing: -0.02em;">
      ${safeTitle}
    </div>
  </foreignObject>

  <!-- Flowchart Title Divider -->
  <g transform="translate(80, 275)">
    <text x="0" y="0" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5">EXECUTION PIPELINE &amp; ARCHITECTURAL NODES</text>
    <line x1="330" y1="-4" x2="${width - 160}" y2="-4" stroke="#334155" stroke-width="1" stroke-dasharray="4,4" />
  </g>

  <!-- Step Flowchart Cards -->
  ${stepsSvg}

  <!-- Footer Section: Tech Stack & Verification Badge -->
  <g transform="translate(80, ${height - 65})">
    <text x="0" y="0" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">
      Built with: ${techPills}
    </text>
    <text x="${width - 160}" y="0" text-anchor="end" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800">
      ✓ PRODUCTION VERIFIED
    </text>
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate Instagram Cover SVG (1:1 1080x1080)
 */
export function generateInstagramCoverSvg(
  title: string,
  category: string,
  ctaText: string,
  previewPoints: string[]
): string {
  const width = 1080;
  const height = 1080;

  const safeTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .slice(0, 90);

  const safeCategory = category.toUpperCase().slice(0, 30);
  const safeCta = ctaText.slice(0, 45);

  const pointsSvg = previewPoints
    .slice(0, 3)
    .map((p, i) => {
      const y = 620 + i * 85;
      const safeP = p.replace(/&/g, '&amp;').slice(0, 45);
      return `
      <g transform="translate(100, ${y})">
        <rect width="${width - 200}" height="68" rx="16" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
        <circle cx="34" cy="34" r="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <text x="34" y="38" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="800">${i + 1}</text>
        <text x="64" y="41" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">${safeP}</text>
      </g>
      `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="igBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a13" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <filter id="igGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="80" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#igBg)" />
  <circle cx="900" cy="150" r="350" fill="#38bdf8" opacity="0.16" filter="url(#igGlow)" />
  <circle cx="180" cy="900" r="350" fill="#c084fc" opacity="0.14" filter="url(#igGlow)" />

  <rect x="50" y="50" width="${width - 100}" height="${height - 100}" rx="32" fill="#0f172a" fill-opacity="0.3" stroke="#334155" stroke-width="2" />

  <!-- Category & Slide Indicator -->
  <g transform="translate(100, 110)">
    <rect width="240" height="44" rx="22" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <circle cx="22" cy="22" r="5" fill="#38bdf8" />
    <text x="38" y="27" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" letter-spacing="1.5">${safeCategory}</text>
    <text x="${width - 200}" y="27" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="700">CAROUSEL GUIDE</text>
  </g>

  <!-- Big Cover Headline -->
  <foreignObject x="100" y="190" width="${width - 200}" height="380">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; font-size: 52px; font-weight: 800; line-height: 1.18; letter-spacing: -0.03em;">
      ${safeTitle}
    </div>
  </foreignObject>

  <!-- Key Architecture Breakdown Highlights -->
  ${pointsSvg}

  <!-- Footer Action Callout -->
  <g transform="translate(100, ${height - 110})">
    <rect width="${width - 200}" height="56" rx="28" fill="#1e293b" stroke="#818cf8" stroke-width="2" />
    <text x="${(width - 200) / 2}" y="35" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" letter-spacing="1">${safeCta}</text>
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate Individual Instagram Carousel Slide SVG (1:1 1080x1080)
 */
export function generateCarouselSlideSvg(
  slideNumber: number,
  title: string,
  content: string,
  topic: string,
  category: string
): string {
  const width = 1080;
  const height = 1080;

  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 60);
  const safeContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 260);
  const safeCategory = category.toUpperCase().slice(0, 30);

  const colors = [
    { primary: '#38bdf8', secondary: '#0284c7', label: 'PHASE 1: THE BOTTLENECK ⚠️', icon: '🚨' },
    { primary: '#ec4899', secondary: '#be185d', label: 'PHASE 2: ROOT CAUSE ANALYSIS 🔍', icon: '⚡' },
    { primary: '#818cf8', secondary: '#4f46e5', label: 'PHASE 3: THE ARCHITECTURAL FIX 🛠️', icon: '📐' },
    { primary: '#34d399', secondary: '#059669', label: 'PHASE 4: PRODUCTION EXECUTION 🚀', icon: '✓' },
  ];

  const theme = colors[(slideNumber - 1) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="slideBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#slideBg)" />
  <circle cx="${slideNumber % 2 === 0 ? 900 : 180}" cy="${slideNumber % 2 === 0 ? 200 : 800}" r="300" fill="${theme.primary}" opacity="0.12" />

  <!-- Frame -->
  <rect x="50" y="50" width="${width - 100}" height="${height - 100}" rx="32" fill="#0f172a" fill-opacity="0.4" stroke="#334155" stroke-width="2" />

  <!-- Slide Counter Badge -->
  <g transform="translate(90, 105)">
    <rect width="170" height="44" rx="22" fill="#0f172a" stroke="${theme.primary}" stroke-width="2" />
    <text x="85" y="28" text-anchor="middle" fill="${theme.primary}" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="1">SLIDE ${slideNumber} OF 4</text>
  </g>

  <!-- Category Tag -->
  <g transform="translate(${width - 320}, 105)">
    <text x="230" y="28" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="700">${safeCategory}</text>
  </g>

  <!-- Step Phase Label -->
  <text x="90" y="235" fill="${theme.primary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" letter-spacing="2">${theme.label}</text>

  <!-- Slide Title -->
  <foreignObject x="90" y="260" width="${width - 180}" height="170">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; font-size: 44px; font-weight: 800; line-height: 1.22; letter-spacing: -0.02em;">
      ${safeTitle}
    </div>
  </foreignObject>

  <!-- Content Glassmorphism Box -->
  <g transform="translate(90, 460)">
    <rect width="${width - 180}" height="420" rx="24" fill="#0f172a" stroke="#334155" stroke-width="2" />
    
    <!-- Visual Accent Header Bar -->
    <rect x="0" y="0" width="${width - 180}" height="8" rx="4" fill="${theme.primary}" />

    <!-- Content Paragraph -->
    <foreignObject x="45" y="45" width="${width - 270}" height="330">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #cbd5e1; font-size: 28px; font-weight: 500; line-height: 1.55;">
        ${safeContent}
      </div>
    </foreignObject>
  </g>

  <!-- Footer Navigation -->
  <g transform="translate(90, ${height - 100})">
    <text x="0" y="0" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      ${slideNumber < 4 ? 'Swipe for Next Step 👉' : 'Save & Share Blueprint 📌'}
    </text>
    <text x="${width - 180}" y="0" text-anchor="end" fill="${theme.primary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800">
      @AIAutomationAgency
    </text>
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
