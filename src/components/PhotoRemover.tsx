import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SAMPLE_IMAGES } from '../data/sampleMedia';
import { performLocalInpaint, calculateMaskBoundingBox } from '../utils/inpainting';
import { ProjectItem } from '../types';
import {
  Upload,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Sparkles,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Columns,
  Eye,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';

interface PhotoRemoverProps {
  initialSampleId?: string;
  onSaveProject: (project: ProjectItem) => void;
  onOpenBackend: () => void;
}

export const PhotoRemover: React.FC<PhotoRemoverProps> = ({
  initialSampleId,
  onSaveProject,
  onOpenBackend,
}) => {
  // Image & Canvas state
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [imageName, setImageName] = useState<string>('sample_urban_street.jpg');
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<string | null>(null);

  // Brush controls
  const [brushSize, setBrushSize] = useState<number>(36);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Comparison & View modes
  const [comparisonSliderPos, setComparisonSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'result'>('slider');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample image
  const loadSample = useCallback((sampleId: string) => {
    const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId) || SAMPLE_IMAGES[0];
    setImageSrc(sample.url);
    setImageName(`${sample.id}.png`);
    setProcessedResult(null);
    setStatusMessage(null);
  }, []);

  useEffect(() => {
    if (initialSampleId) {
      loadSample(initialSampleId);
    }
  }, [initialSampleId, loadSample]);

  // Load image into base canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalDim({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });

      // Init base canvas
      const baseCanvas = baseCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!baseCanvas || !maskCanvas) return;

      baseCanvas.width = img.naturalWidth;
      baseCanvas.height = img.naturalHeight;
      maskCanvas.width = img.naturalWidth;
      maskCanvas.height = img.naturalHeight;

      const baseCtx = baseCanvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (!baseCtx || !maskCtx) return;

      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(img, 0, 0);

      // Clear mask
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      // Save initial blank mask state in history
      const initialMaskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      setHistory([initialMaskData]);
      setHistoryIndex(0);
      setHasMask(false);

      // If sample has a preset callout circle, automatically apply a preset brush circle for instant test
      const sample = SAMPLE_IMAGES.find((s) => s.url === imageSrc);
      if (sample && sample.presetMask) {
        maskCtx.beginPath();
        maskCtx.arc(sample.presetMask.x, sample.presetMask.y, sample.presetMask.radius, 0, Math.PI * 2);
        maskCtx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        maskCtx.fill();
        const presetMaskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        setHistory([initialMaskData, presetMaskData]);
        setHistoryIndex(1);
        setHasMask(true);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatusMessage('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setImageName(file.name);
        setProcessedResult(null);
        setStatusMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drawing helpers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (processedResult) return;
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    lastPointRef.current = coords;
    drawStroke(coords.x, coords.y);
  };

  const drawStroke = (x: number, y: number) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    }

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = { x, y };
    setHasMask(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCanvasCoords(e);
    drawStroke(coords.x, coords.y);
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    // Push to history
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newSnapshot);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.putImageData(history[newIdx], 0, 0);

    const bbox = calculateMaskBoundingBox(history[newIdx].data, canvas.width, canvas.height);
    setHasMask(bbox !== null);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.putImageData(history[newIdx], 0, 0);
    setHasMask(true);
  };

  const handleClearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cleared = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([...history.slice(0, historyIndex + 1), cleared]);
    setHistoryIndex(historyIndex + 1);
    setHasMask(false);
  };

  // Perform object removal (real inpainting)
  const handleRemoveObject = async () => {
    if (!hasMask) {
      setStatusMessage('Please brush over an unwanted object first.');
      return;
    }

    const baseCanvas = baseCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!baseCanvas || !maskCanvas) return;

    const baseCtx = baseCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!baseCtx || !maskCtx) return;

    setIsProcessing(true);
    setStatusMessage('Analyzing object boundaries and texture synthesis...');

    try {
      // Allow UI render cycle before heavy pixel processing
      await new Promise((resolve) => setTimeout(resolve, 80));

      const imgData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

      // Real local content-aware patch synthesis inpainting
      const inpaintedData = performLocalInpaint(imgData, maskData);

      // Create high-res result canvas
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = baseCanvas.width;
      resultCanvas.height = baseCanvas.height;
      const resultCtx = resultCanvas.getContext('2d');
      if (resultCtx) {
        resultCtx.putImageData(inpaintedData, 0, 0);
        const dataUrl = resultCanvas.toDataURL('image/png', 1.0);
        setProcessedResult(dataUrl);

        // Record in recent projects
        onSaveProject({
          id: 'proj_' + Date.now(),
          name: `Clean_${imageName}`,
          tool: 'photo-remover',
          timestamp: Date.now(),
          previewUrl: dataUrl,
          dimensions: `${naturalDim.width}x${naturalDim.height}`,
        });
      }

      setStatusMessage('Object removed successfully! Compare with Before / After slider.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inpainting failed';
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Real native download
  const handleDownload = () => {
    if (!processedResult) return;
    const a = document.createElement('a');
    a.href = processedResult;
    a.download = `HYSI_${imageName.replace(/\.[^/.]+$/, '')}_removed.png`;
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
              AI Photo Remover
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              Content-Aware Telea
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Brush over watermarks, people, wires, or blemishes to erase them naturally.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>Upload Photo</span>
          </button>

          {processedResult && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Edited Image (.png)</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Demo Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-slate-500 font-bold shrink-0 uppercase tracking-wider text-[11px]">
          Demo Samples:
        </span>
        {SAMPLE_IMAGES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => loadSample(sample.id)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 transition-all cursor-pointer font-medium ${
              imageSrc === sample.url
                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                : 'border-white/10 bg-[#0d121c] text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Main Canvas Workspace & Toolbar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Interactive Canvas Area (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Canvas Container with dark checkered backdrop */}
          <div
            ref={containerRef}
            className="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#06080d] p-4 select-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(13, 20, 35, 0.4) 0%, #06080d 100%)',
            }}
          >
            {!processedResult ? (
              /* Drawing / Selection Mode */
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden border border-white/10"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
              >
                {/* Base Image Canvas */}
                <canvas ref={baseCanvasRef} className="block max-h-[70vh] w-auto max-w-full" />

                {/* Mask Drawing Canvas */}
                <canvas
                  ref={maskCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
                />
              </div>
            ) : (
              /* Before / After Inspection Mode */
              <div
                className="relative max-h-[70vh] w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl border border-white/10"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              >
                {viewMode === 'slider' ? (
                  /* Interactive Split Slider */
                  <div className="relative w-full h-[540px] select-none overflow-hidden bg-black">
                    {/* Processed (After) Image */}
                    <img
                      src={processedResult}
                      alt="After Object Removal"
                      className="absolute inset-0 h-full w-full object-contain"
                    />

                    {/* Original (Before) Image clipped by slider */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${comparisonSliderPos}%` }}
                    >
                      <img
                        src={imageSrc}
                        alt="Original Before"
                        className="absolute inset-0 h-full w-full object-contain max-w-none"
                        style={{ width: '100%', height: '100%' }}
                      />
                      <span className="absolute top-4 left-4 rounded bg-black/80 px-2 py-1 text-[11px] font-mono font-bold text-slate-300 border border-white/10">
                        ORIGINAL (BEFORE)
                      </span>
                    </div>

                    <span className="absolute top-4 right-4 rounded bg-cyan-950/80 px-2 py-1 text-[11px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                      CLEANED (AFTER)
                    </span>

                    {/* Draggable Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 z-20 flex w-1 cursor-ew-resize items-center justify-center bg-cyan-400"
                      style={{ left: `${comparisonSliderPos}%` }}
                    >
                      <div className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg shadow-cyan-400/50">
                        <Columns className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Invisible slider input for smooth touch/mouse control */}
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
                  /* Side-by-Side View */
                  <div className="grid grid-cols-2 gap-2 bg-black p-2">
                    <div className="relative">
                      <img src={imageSrc} alt="Before" className="w-full rounded object-contain" />
                      <span className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        ORIGINAL
                      </span>
                    </div>
                    <div className="relative">
                      <img
                        src={processedResult}
                        alt="After"
                        className="w-full rounded object-contain"
                      />
                      <span className="absolute top-2 left-2 rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        REMOVED
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute h-full w-full animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                  <Sparkles className="h-7 w-7 text-cyan-400 animate-pulse" />
                </div>
                <p className="mt-4 text-sm font-bold text-white tracking-wide">
                  RECONSTRUCTING BACKGROUND PIXELS...
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Synthesizing multi-scale texture patches
                </p>
              </div>
            )}
          </div>

          {/* Canvas Bottom Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d121c] p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px]">
                {naturalDim.width} × {naturalDim.height} px
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 truncate max-w-[200px]">{imageName}</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono text-[11px] text-slate-300 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                title="Fit to Screen"
                aria-label="Reset Zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Tools & Parameters Panel (1 col) */}
        <div className="space-y-4">
          {/* Tool Controls Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Brush Controls
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Adjust radius &amp; paint over unwanted areas
              </p>
            </div>

            {/* Brush Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Brush Radius</span>
                <span className="font-mono text-cyan-400">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-center pt-2">
                <div
                  className="rounded-full border border-cyan-400 bg-cyan-400/20"
                  style={{ width: `${brushSize}px`, height: `${brushSize}px` }}
                />
              </div>
            </div>

            {/* Tool Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsEraser(false)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  !isEraser
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Mask Brush</span>
              </button>

              <button
                onClick={() => setIsEraser(true)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isEraser
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Eraser</span>
              </button>
            </div>

            {/* History Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo last stroke"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>Undo</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo stroke"
              >
                <Redo2 className="h-3.5 w-3.5" />
                <span>Redo</span>
              </button>

              <button
                onClick={handleClearMask}
                disabled={!hasMask}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear all mask"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Remove Object CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleRemoveObject}
                disabled={!hasMask || isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isProcessing ? 'Removing Object...' : 'Remove Object'}</span>
              </button>
            </div>

            {/* Reset / Re-edit if result is shown */}
            {processedResult && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Inspection View
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewMode('slider')}
                    className={`rounded-lg py-1.5 text-xs font-medium border ${
                      viewMode === 'slider'
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-500/20'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Split Slider
                  </button>
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`rounded-lg py-1.5 text-xs font-medium border ${
                      viewMode === 'side-by-side'
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-500/20'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>

                <button
                  onClick={() => setProcessedResult(null)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Edit Another Region</span>
                </button>
              </div>
            )}
          </div>

          {/* Engine Status & Quality Notice */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Active Engine:</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                WebEngine 2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Processes pixels 100% locally on your device with multi-scale patch synthesis. Zero
              compression loss.
            </p>
            <button
              onClick={onOpenBackend}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium pt-1"
            >
              <span>Connect Python FastAPI / LaMa</span>
              <span>→</span>
            </button>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
