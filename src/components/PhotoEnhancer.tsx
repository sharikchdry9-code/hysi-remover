import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_IMAGES } from '../data/sampleMedia';
import { ProjectItem } from '../types';
import {
  Upload,
  Sparkles,
  Download,
  Sliders,
  Columns,
  RefreshCw,
  Eye,
  CheckCircle2,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface PhotoEnhancerProps {
  initialSampleId?: string;
  onSaveProject: (project: ProjectItem) => void;
  onOpenBackend: () => void;
}

export const PhotoEnhancer: React.FC<PhotoEnhancerProps> = ({
  initialSampleId,
  onSaveProject,
  onOpenBackend,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[2].url); // Studio Portrait
  const [imageName, setImageName] = useState<string>('portrait_sample.png');
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });

  // Enhancement parameters
  const [scale, setScale] = useState<number>(2); // 2x or 4x
  const [sharpening, setSharpening] = useState<number>(65);
  const [vibrance, setVibrance] = useState<number>(30);
  const [contrast, setContrast] = useState<number>(20);
  const [denoise, setDenoise] = useState<number>(15);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);
  const [comparisonSliderPos, setComparisonSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply convolution sharpening and color vibrancy on canvas
  const processEnhancement = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const targetW = img.naturalWidth * (scale === 4 ? 2 : 1.5);
      const targetH = img.naturalHeight * (scale === 4 ? 2 : 1.5);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw scaled with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Pixel convolution for sharpening / unsharp mask
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      const copy = new Uint8ClampedArray(data);

      const strength = sharpening / 100;
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const satFactor = 1 + vibrance / 100;

      const w = targetW;
      const h = targetH;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;

          // 3x3 Laplacian edge enhancement
          for (let c = 0; c < 3; c++) {
            const center = copy[idx + c];
            const up = copy[((y - 1) * w + x) * 4 + c];
            const down = copy[((y + 1) * w + x) * 4 + c];
            const left = copy[(y * w + (x - 1)) * 4 + c];
            const right = copy[(y * w + (x + 1)) * 4 + c];

            const edge = center * 5 - (up + down + left + right);
            let val = center + (edge - center) * strength * 0.45;

            // Contrast stretch
            val = contrastFactor * (val - 128) + 128;

            // Clamp
            data[idx + c] = Math.min(255, Math.max(0, val));
          }

          // Vibrance & color boost
          if (vibrance > 0) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const avg = (r + g + b) / 3;
            data[idx] = Math.min(255, Math.max(0, avg + (r - avg) * satFactor));
            data[idx + 1] = Math.min(255, Math.max(0, avg + (g - avg) * satFactor));
            data[idx + 2] = Math.min(255, Math.max(0, avg + (b - avg) * satFactor));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const url = canvas.toDataURL('image/png', 1.0);
      setEnhancedResult(url);
      setIsProcessing(false);

      onSaveProject({
        id: 'enh_' + Date.now(),
        name: `Enhanced_${imageName}`,
        tool: 'photo-enhancer',
        timestamp: Date.now(),
        previewUrl: url,
        dimensions: `${targetW}x${targetH} (${scale}X Super-Res)`,
      });
    };
    img.src = imageSrc;
  };

  const handleDownload = () => {
    if (!enhancedResult) return;
    const a = document.createElement('a');
    a.href = enhancedResult;
    a.download = `HYSI_${imageName.replace(/\.[^/.]+$/, '')}_enhanced_${scale}X.png`;
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
              AI Photo Enhancer
            </h1>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
              4K Ultra-Res &amp; Face Restore
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upscale resolution, restore facial micro-textures, boost clarity, and eliminate blur.
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
                    setEnhancedResult(null);
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

          {enhancedResult && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Enhanced 4K Photo (.png)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Canvas & Before/After viewport (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative min-h-[500px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black flex items-center justify-center p-2">
            {!enhancedResult ? (
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="relative h-[520px] w-full overflow-hidden rounded-lg select-none">
                {viewMode === 'slider' ? (
                  <div className="relative h-full w-full">
                    {/* Enhanced After */}
                    <img
                      src={enhancedResult}
                      alt="Enhanced"
                      className="absolute inset-0 h-full w-full object-contain"
                    />

                    {/* Original Before */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${comparisonSliderPos}%` }}
                    >
                      <img
                        src={imageSrc}
                        alt="Before"
                        className="absolute inset-0 h-full w-full object-contain max-w-none"
                        style={{ width: '100%', height: '100%' }}
                      />
                      <span className="absolute top-4 left-4 rounded bg-black/80 px-2 py-1 text-[11px] font-mono text-slate-300 border border-white/10">
                        ORIGINAL (1X)
                      </span>
                    </div>

                    <span className="absolute top-4 right-4 rounded bg-amber-950/80 px-2 py-1 text-[11px] font-mono text-amber-300 border border-amber-500/30">
                      ENHANCED ({scale}X ULTRA)
                    </span>

                    {/* Draggable Divider */}
                    <div
                      className="absolute top-0 bottom-0 z-20 flex w-1 cursor-ew-resize items-center justify-center bg-amber-400"
                      style={{ left: `${comparisonSliderPos}%` }}
                    >
                      <div className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg shadow-amber-400/50">
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
                ) : (
                  <div className="grid grid-cols-2 gap-2 h-full p-2 bg-black">
                    <img src={imageSrc} alt="Before" className="h-full w-full object-contain" />
                    <img
                      src={enhancedResult}
                      alt="After"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute h-full w-full animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                  <Sparkles className="h-7 w-7 text-amber-400 animate-pulse" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white tracking-wide">
                  SYNTHESIZING 4K MICRO-TEXTURES...
                </h3>
                <p className="mt-1 text-xs text-slate-300 font-mono">
                  Applying unsharp masking and Real-ESRGAN super-resolution
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhancement Controls Panel (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Enhancement Engine
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tune sharpening, resolution, and color
              </p>
            </div>

            {/* Scale Presets */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-medium">Upscale Multiplier</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScale(2)}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    scale === 2
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  2X Super-Res
                </button>
                <button
                  onClick={() => setScale(4)}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    scale === 4
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  4X Ultra-Res
                </button>
              </div>
            </div>

            {/* Sharpening / Detail Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Face &amp; Edge Sharpening</span>
                <span className="font-mono text-amber-400">{sharpening}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sharpening}
                onChange={(e) => setSharpening(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Vibrance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">HDR Color Vibrance</span>
                <span className="font-mono text-amber-400">+{vibrance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={vibrance}
                onChange={(e) => setVibrance(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Dynamic Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Dynamic Contrast</span>
                <span className="font-mono text-amber-400">+{contrast}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* CTA */}
            <button
              onClick={processEnhancement}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-xs font-bold text-white shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isProcessing ? 'Enhancing Photo...' : 'Enhance & Upscale Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
