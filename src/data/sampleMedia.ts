import { SampleMediaItem } from '../types';

/**
 * Creates a crisp high-res SVG data-URL representing a realistic scene with an obvious unwanted object
 * (e.g. photobomber, watermark, powerline, trash can) so users can test removal immediately.
 */
function createSampleImage(title: string, theme: 'street' | 'nature' | 'portrait' | 'product'): string {
  const width = 1200;
  const height = 800;

  if (theme === 'street') {
    // City street with a bright orange cone / trash bin in the foreground that needs removal
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="building" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="cone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff6b00"/>
            <stop offset="100%" stop-color="#ff3300"/>
          </linearGradient>
        </defs>
        <!-- Background Sky -->
        <rect width="${width}" height="450" fill="url(#sky)" />
        <!-- Buildings -->
        <rect x="50" y="100" width="180" height="350" fill="url(#building)" />
        <rect x="250" y="60" width="220" height="390" fill="#182234" />
        <rect x="500" y="140" width="160" height="310" fill="#1e293b" />
        <rect x="700" y="80" width="260" height="370" fill="#141c2c" />
        <rect x="990" y="120" width="160" height="330" fill="#1e293b" />
        <!-- Windows -->
        <g fill="#fef08a" opacity="0.65">
          <rect x="80" y="140" width="20" height="30" />
          <rect x="120" y="140" width="20" height="30" />
          <rect x="80" y="200" width="20" height="30" />
          <rect x="120" y="200" width="20" height="30" />
          <rect x="280" y="100" width="25" height="35" />
          <rect x="330" y="100" width="25" height="35" />
          <rect x="740" y="120" width="25" height="35" />
          <rect x="800" y="120" width="25" height="35" />
        </g>
        <!-- Sidewalk & Road -->
        <rect y="450" width="${width}" height="70" fill="#64748b" />
        <rect y="520" width="${width}" height="280" fill="url(#road)" />
        <!-- Road markings -->
        <rect x="100" y="650" width="150" height="12" fill="#e2e8f0" opacity="0.8"/>
        <rect x="400" y="650" width="150" height="12" fill="#e2e8f0" opacity="0.8"/>
        <rect x="700" y="650" width="150" height="12" fill="#e2e8f0" opacity="0.8"/>
        <rect x="1000" y="650" width="150" height="12" fill="#e2e8f0" opacity="0.8"/>
        <!-- UNWANTED OBJECT: Distracting Orange Construction Cone / Trash Can in right foreground -->
        <g id="unwanted-object">
          <polygon points="860,720 900,560 920,560 960,720" fill="url(#cone)" />
          <rect x="878" y="610" width="64" height="24" fill="#ffffff" opacity="0.9" />
          <rect x="868" y="660" width="84" height="24" fill="#ffffff" opacity="0.9" />
          <ellipse cx="910" cy="720" rx="65" ry="14" fill="#b91c1c" />
          <!-- Neon Marker Callout -->
          <circle cx="910" cy="640" r="85" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6 4" opacity="0.85"/>
          <text x="910" y="520" font-family="sans-serif" font-size="18" font-weight="bold" fill="#00f0ff" text-anchor="middle">OBJECT TO REMOVE</text>
        </g>
      </svg>
    `)}`;
  }

  if (theme === 'nature') {
    // Majestic mountain landscape with distracting power lines and pole
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="alpine-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="60%" stop-color="#bae6fd"/>
            <stop offset="100%" stop-color="#fed7aa"/>
          </linearGradient>
          <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="30%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="100%" stop-color="#0c4a6e"/>
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#alpine-sky)" />
        <!-- Mountains -->
        <polygon points="100,500 350,180 600,500" fill="url(#mtn)" />
        <polygon points="450,500 750,120 1050,500" fill="url(#mtn)" />
        <polygon points="-50,500 150,260 400,500" fill="#64748b" opacity="0.7"/>
        <polygon points="800,500 1050,220 1250,500" fill="#64748b" opacity="0.7"/>
        <!-- Pine Forest -->
        <rect y="480" width="${width}" height="60" fill="#14532d" />
        <!-- Lake Water -->
        <rect y="540" width="${width}" height="260" fill="url(#lake)" />
        <!-- UNWANTED OBJECT: Distracting Utility Power Pole and Lines cutting across view -->
        <g id="unwanted-powerpole">
          <line x1="380" y1="200" x2="380" y2="600" stroke="#1c1917" stroke-width="10" />
          <line x1="330" y1="250" x2="430" y2="250" stroke="#1c1917" stroke-width="6" />
          <line x1="0" y1="240" x2="1200" y2="300" stroke="#292524" stroke-width="3" />
          <line x1="0" y1="260" x2="1200" y2="320" stroke="#292524" stroke-width="3" />
          <circle cx="380" cy="380" r="90" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6 4" opacity="0.85"/>
          <text x="380" y="170" font-family="sans-serif" font-size="18" font-weight="bold" fill="#00f0ff" text-anchor="middle">OBJECT TO REMOVE</text>
        </g>
      </svg>
    `)}`;
  }

  if (theme === 'portrait') {
    // Clean portrait photo with accidental watermark / photo-bomber tag
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="studio" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <radialGradient id="rimlight" cx="60%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#studio)" />
        <rect width="${width}" height="${height}" fill="url(#rimlight)" />
        <!-- Model Silhouette / Portrait -->
        <ellipse cx="600" cy="720" rx="260" ry="240" fill="#334155" />
        <circle cx="600" cy="360" r="160" fill="#fcd34d" />
        <path d="M 440,340 C 440,160 760,160 760,340 Z" fill="#18181b" />
        <ellipse cx="550" cy="350" rx="14" ry="10" fill="#1e293b" />
        <ellipse cx="650" cy="350" rx="14" ry="10" fill="#1e293b" />
        <path d="M 560,420 Q 600,450 640,420" stroke="#b91c1c" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- UNWANTED OBJECT: Large Watermark Stamp & Photobomb Shadow -->
        <g id="unwanted-watermark">
          <rect x="750" y="520" width="340" height="130" rx="12" fill="#ef4444" opacity="0.85" />
          <text x="920" y="570" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">WATERMARK</text>
          <text x="920" y="615" font-family="sans-serif" font-size="16" fill="#fef2f2" text-anchor="middle">STOCK_PREVIEW_SAMPLE_#9201</text>
          <circle cx="920" cy="585" r="95" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6 4" opacity="0.9"/>
          <text x="920" y="490" font-family="sans-serif" font-size="18" font-weight="bold" fill="#00f0ff" text-anchor="middle">WATERMARK TO REMOVE</text>
        </g>
      </svg>
    `)}`;
  }

  // Product on busy table with unwanted barcode / cable
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="350" fill="#1e293b" />
      <rect y="350" width="${width}" height="450" fill="url(#wood)" />
      <!-- High end headphone product -->
      <g transform="translate(480, 260)">
        <path d="M 40,160 A 100,100 0 0,1 200,160" fill="none" stroke="#94a3b8" stroke-width="26" stroke-linecap="round"/>
        <rect x="15" y="150" width="50" height="90" rx="25" fill="#00f0ff" />
        <rect x="175" y="150" width="50" height="90" rx="25" fill="#00f0ff" />
      </g>
      <!-- UNWANTED OBJECT: Tangled messy cable & barcode sticker -->
      <g id="unwanted-cable">
        <path d="M 220,540 Q 340,680 460,520 T 640,640 T 780,500" fill="none" stroke="#ef4444" stroke-width="12" stroke-linecap="round"/>
        <circle cx="480" cy="580" r="90" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6 4"/>
        <text x="480" y="700" font-family="sans-serif" font-size="18" font-weight="bold" fill="#00f0ff" text-anchor="middle">CABLE TO REMOVE</text>
      </g>
    </svg>
  `)}`;
}

export const SAMPLE_IMAGES: SampleMediaItem[] = [
  {
    id: 'sample-street',
    title: 'Urban Street — Road Cone',
    subtitle: 'High contrast foreground distraction',
    type: 'image',
    url: createSampleImage('Urban Street', 'street'),
    aspectRatio: '16:9',
    description: 'Clean street with a prominent orange traffic cone ready for instant 1-click inpainting.',
    presetMask: { x: 910, y: 640, radius: 85 },
  },
  {
    id: 'sample-nature',
    title: 'Alpine Vista — Power Lines',
    subtitle: 'Geometric obstacle across scenery',
    type: 'image',
    url: createSampleImage('Alpine Vista', 'nature'),
    aspectRatio: '16:9',
    description: 'Mountain landscape with utility pole and power lines cutting across the vista.',
    presetMask: { x: 380, y: 380, radius: 90 },
  },
  {
    id: 'sample-portrait',
    title: 'Studio Portrait — Watermark',
    subtitle: 'Copyright stamp & tag removal',
    type: 'image',
    url: createSampleImage('Studio Portrait', 'portrait'),
    aspectRatio: '16:9',
    description: 'Studio portrait with an obtrusive stock watermark stamp in the lower corner.',
    presetMask: { x: 920, y: 585, radius: 95 },
  },
  {
    id: 'sample-product',
    title: 'Product Studio — Wire Cable',
    subtitle: 'Commercial product cleanup',
    type: 'image',
    url: createSampleImage('Product Studio', 'product'),
    aspectRatio: '16:9',
    description: 'Electronics product photo with an untidy charging wire across the wooden tabletop.',
    presetMask: { x: 480, y: 580, radius: 90 },
  },
];

export const SAMPLE_VIDEOS: SampleMediaItem[] = [
  {
    id: 'video-drone-city',
    title: 'Drone Skyline (1080p · 60fps)',
    subtitle: 'Watermark & drone prop removal',
    type: 'video',
    url: '', // Dynamically generated in canvas video player
    aspectRatio: '16:9',
    description: 'Cinematic drone pan over sunset metropolis with unwanted sponsor tag in upper corner.',
    presetMask: { x: 880, y: 160, radius: 60 },
  },
  {
    id: 'video-traffic-passerby',
    title: 'Urban Boulevard Walk (4K · 30fps)',
    subtitle: 'Moving photobomber tracking',
    type: 'video',
    url: '',
    aspectRatio: '16:9',
    description: 'Walking shot through commercial plaza with an unwanted passerby walking through frame.',
    presetMask: { x: 620, y: 440, radius: 75 },
  },
];
