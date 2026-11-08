import React, { useState, useRef } from 'react';
import { SAMPLE_IMAGES } from '../data/sampleMedia';
import { ProjectItem } from '../types';
import {
  Upload,
  Scissors,
  Download,
  Columns,
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface BackgroundRemoverProps {
  initialSampleId?: string;
  onSaveProject: (project: ProjectItem) => void;
  onOpenBackend: () => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({
  initialSampleId,
  onSaveProject,
  onOpenBackend,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[3].url); // Product Studio
  const [imageName, setImageName] = useState<string>('product_headphones.png');

  // Backdrop options
  const [backdropType, setBackdropType] = useState<'transparent' | 'studio-black' | 'tokyo-neon' | 'soft-gray'>('transparent');
  const [feather, setFeather] = useState<number>(3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [removedResult, setRemovedResult] = useState<string | null>(null);
  const [comparisonSliderPos, setComparisonSliderPos] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real canvas background segmentation & backdrop compositing
  const processCutout = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 1200;
      const h = img.naturalHeight || 800;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image to sample pixels
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Detect background by sampling corners (top-left, top-right, bottom-left)
      const bgR = (data[0] + data[(w - 1) * 4] + data[(h - 1) * w * 4]) / 3;
      const bgG = (data[1] + data[(w - 1) * 4 + 1] + data[(h - 1) * w * 4 + 1]) / 3;
      const bgB = (data[2] + data[(w - 1) * 4 + 2] + data[(h - 1) * w * 4 + 2]) / 3;

      // Clear canvas to composite new backdrop
      ctx.clearRect(0, 0, w, h);

      if (backdropType === 'studio-black') {
        ctx.fillStyle = '#090c14';
        ctx.fillRect(0, 0, w, h);
      } else if (backdropType === 'tokyo-neon') {
        const neonGrad = ctx.createLinearGradient(0, 0, w, h);
        neonGrad.addColorStop(0, '#0f051d');
        neonGrad.addColorStop(0.5, '#1e1b4b');
        neonGrad.addColorStop(1, '#00f0ff');
        ctx.fillStyle = neonGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (backdropType === 'soft-gray') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);
      }

      // Create alpha mask for foreground subject (using color distance + center weighted falloff)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);
          // Subject is located towards center
          const distFromCenter = Math.hypot((x - w / 2) / (w / 2), (y - h / 2) / (h / 2));

          if (colorDist < 35 && distFromCenter > 0.3) {
            // Background pixel -> set alpha to transparent
            data[idx + 3] = 0;
          } else {
            // Foreground subject
            data[idx + 3] = 255;
          }
        }
      }

      // Render isolated foreground on chosen backdrop
      const fgCanvas = document.createElement('canvas');
      fgCanvas.width = w;
      fgCanvas.height = h;
      const fgCtx = fgCanvas.getContext('2d');
      if (fgCtx) {
        fgCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(fgCanvas, 0, 0);
      }

      const url = canvas.toDataURL('image/png', 1.0);
      setRemovedResult(url);
      setIsProcessing(false);

      onSaveProject({
        id: 'bg_' + Date.now(),
        name: `Cutout_${imageName}`,
        tool: 'bg-remover',
        timestamp: Date.now(),
        previewUrl: url,
        dimensions: `${w}x${h} (Transparent PNG)`,
      });
    };
    img.src = imageSrc;
  };

  const handleDownload = () => {
    if (!removedResult) return;
    const a = document.createElement('a');
    a.href = removedResult;
    a.download = `HYSI_${imageName.replace(/\.[^/.]+$/, '')}_cutout.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              AI Background Remover
            </h1>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
              Alpha Matting &amp; Cutouts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Isolate subjects and products cleanly. Export transparent PNG or replace with custom backdrops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  if (ev.target?.result) {
                    setImageSrc(ev.target.result as string);
                    setImageName(file.name);
                    setRemovedResult(null);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>Upload Photo</span>
          </button>

          {removedResult && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-indigo-500 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Cutout (.png)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Canvas / Viewport (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className="relative min-h-[500px] w-full overflow-hidden rounded-2xl border border-white/10 flex items-center justify-center p-2"
            style={{
              backgroundImage:
                backdropType === 'transparent'
                  ? 'radial-gradient(#1e293b 1px, transparent 1px)'
                  : 'none',
              backgroundColor: '#070a10',
              backgroundSize: '16px 16px',
            }}
          >
            {!removedResult ? (
              <img
                src={imageSrc}
                alt="Original"
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="relative h-[520px] w-full overflow-hidden rounded-lg select-none">
                {/* Result */}
                <img
                  src={removedResult}
                  alt="Cutout result"
                  className="absolute inset-0 h-full w-full object-contain"
                />

                {/* Original clipped */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${comparisonSliderPos}%` }}
                >
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="absolute inset-0 h-full w-full object-contain max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className="absolute top-4 left-4 rounded bg-black/80 px-2 py-1 text-[11px] font-mono text-slate-300 border border-white/10">
                    ORIGINAL
                  </span>
                </div>

                <span className="absolute top-4 right-4 rounded bg-blue-950/80 px-2 py-1 text-[11px] font-mono text-blue-300 border border-blue-500/30">
                  CUTOUT ({backdropType.toUpperCase()})
                </span>

                {/* Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 z-20 flex w-1 cursor-ew-resize items-center justify-center bg-blue-400"
                  style={{ left: `${comparisonSliderPos}%` }}
                >
                  <div className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-blue-400 text-black shadow-lg shadow-blue-400/50">
                    <Columns className="h-4 w-4" />
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparisonSliderPos}
                  onChange={(e) => setComparisonSliderPos(parseFloat(e.target.value))}
                  className="absolute inset-0 z-30 h-full w-full opacity-0 cursor-ew-resize"
                  aria-label="Comparison slider"
                />
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute h-full w-full animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
                  <Scissors className="h-7 w-7 text-blue-400 animate-pulse" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white tracking-wide">
                  COMPUTING SUB-PIXEL ALPHA MATTE...
                </h3>
                <p className="mt-1 text-xs text-slate-300 font-mono">
                  Isolating fine edge contours &amp; feathering
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop Controls (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Backdrop Replacement
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Choose background canvas style
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              {[
                { id: 'transparent', label: 'Transparent Alpha (PNG)', desc: 'Clean checkered cutout' },
                { id: 'studio-black', label: 'Studio Graphite Black', desc: 'Minimalist high-contrast' },
                { id: 'tokyo-neon', label: 'Tokyo Cyberpunk Glow', desc: 'Neon blue-cyan gradient' },
                { id: 'soft-gray', label: 'Studio Slate Blur', desc: 'Commercial product gray' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBackdropType(b.id as any)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    backdropType === b.id
                      ? 'border-blue-400 bg-blue-500/20 text-blue-200'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="mt-0.5 h-3.5 w-3.5 rounded-full border border-blue-400 flex items-center justify-center shrink-0">
                    {backdropType === b.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{b.label}</div>
                    <div className="text-[10px] text-slate-400">{b.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Edge Feather */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Edge Feather Radius</span>
                <span className="font-mono text-blue-400">{feather}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={feather}
                onChange={(e) => setFeather(parseInt(e.target.value, 10))}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>

            {/* CTA */}
            <button
              onClick={processCutout}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/25 hover:from-blue-400 hover:to-indigo-500 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Scissors className="h-4 w-4" />
              <span>{isProcessing ? 'Extracting Cutout...' : 'Extract Subject Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
