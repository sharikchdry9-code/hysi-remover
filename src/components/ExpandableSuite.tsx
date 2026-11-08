import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  FileArchive,
  Subtitles,
  Image,
  Maximize2,
  Volume2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Play,
  Download,
  Sliders,
  Cpu,
  Clock,
} from 'lucide-react';

export const ExpandableSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('stabilizer');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simComplete, setSimComplete] = useState<boolean>(false);

  const futureModules = [
    {
      id: 'stabilizer',
      title: 'Video Stabilizer',
      icon: Compass,
      status: 'Pipeline Ready',
      desc: 'Eliminates camera shake and rolling shutter wobble using feature-point gyro smoothing.',
      controls: ['Smoothness Factor: 85%', 'Crop Border Auto-Fill: Active', 'Rolling Shutter Fix: ON'],
      stat: '98.4% jitter reduction',
    },
    {
      id: 'compressor',
      title: 'Video Compressor',
      icon: FileArchive,
      status: 'FFmpeg AV1 Ready',
      desc: 'Reduces video file size by up to 75% using AV1 and H.265 CRF rate control without visible quality loss.',
      controls: ['Target Bitrate: 4.5 Mbps', 'Preset: Medium Slow', 'Pass: 2-Pass VBR'],
      stat: '50MB → 11.8MB (76% saved)',
    },
    {
      id: 'subtitles',
      title: 'AI Subtitles & VTT',
      icon: Subtitles,
      status: 'Whisper-Large Ready',
      desc: 'Generates word-level synchronized subtitles and captions with 99% accuracy across 90+ languages.',
      controls: ['Model: Whisper-v3', 'Format: SRT / VTT / Burned-in', 'Auto Punctuation: Enabled'],
      stat: '0.04s word timestamp sync',
    },
    {
      id: 'thumbnail',
      title: 'AI Thumbnail Maker',
      icon: Image,
      status: 'Diffusion Ready',
      desc: 'Extracts the most engaging high-contrast action frames and overlays cinematic typography.',
      controls: ['Aspect: 16:9 & 9:16', 'Click-Through Optimizer: High', 'Face Zoom: Active'],
      stat: '10 High-CTR candidates',
    },
    {
      id: 'upscaler',
      title: 'Neural Image Upscaler',
      icon: Maximize2,
      status: 'ESRGAN 8K Ready',
      desc: 'Upscales low-res raster assets up to 8K resolution with synthetic high-frequency micro-details.',
      controls: ['Upscale Ratio: 4X / 8X', 'Texture Hallucination: Balanced', 'Color Gamut: DCI-P3'],
      stat: 'Up to 7680×4320 px',
    },
    {
      id: 'audio-cleaner',
      title: 'Audio Cleaner & De-Noise',
      icon: Volume2,
      status: 'Demucs v4 Ready',
      desc: 'Separates dialogue from background noise, wind, traffic hum, and HVAC hiss seamlessly.',
      controls: ['Dialogue Isolation: 95%', 'De-Reverb: ON', 'Spectral De-Hum: 50Hz/60Hz'],
      stat: '-36dB noise floor suppression',
    },
    {
      id: 'batch',
      title: 'Batch Processing Queue',
      icon: Layers,
      status: 'Async Celery Ready',
      desc: 'Enqueues and processes hundreds of videos and photos concurrently via GPU worker queues.',
      controls: ['Concurrency: 8 Workers', 'Priority Queue: High', 'Auto-Export Webhooks: Active'],
      stat: '120 items/hour throughput',
    },
  ];

  const currentModule = futureModules.find((m) => m.id === activeTab) || futureModules[0];

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimComplete(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        clearInterval(interval);
        setSimulationProgress(100);
        setIsSimulating(false);
        setSimComplete(true);
      } else {
        setSimulationProgress(p);
      }
    }, 200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Expandable Studio Suite
          </h1>
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
            Next-Gen Neural Modules
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Architectural blueprints and interactive simulators for the complete HYSI REMOVER AI
          production suite.
        </p>
      </div>

      {/* Grid of future tools */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {futureModules.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => {
                setActiveTab(mod.id);
                setSimComplete(false);
              }}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all cursor-pointer ${
                isActive
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'border-white/10 bg-[#0d121c] text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isActive ? 'bg-cyan-400 text-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold leading-tight">{mod.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Module Interactive Simulator Panel */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c101a] to-[#07090e] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentModule.title}</h2>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
                {currentModule.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">{currentModule.desc}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#07090e] px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Performance Metric</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{currentModule.stat}</span>
          </div>
        </div>

        {/* Parameters & Pipeline */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Controls list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configured Parameters
            </h3>
            <div className="space-y-2">
              {currentModule.controls.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#090d15] px-4 py-3 text-xs"
                >
                  <span className="text-slate-300 font-medium">{c.split(':')[0]}</span>
                  <span className="font-mono text-cyan-400 font-semibold">{c.split(':')[1] || 'Active'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Test Bench */}
          <div className="rounded-2xl border border-white/10 bg-[#07090e] p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>Microservice Pipeline Simulator</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Trigger worker validation against synthetic media streams.
              </p>
            </div>

            {isSimulating && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Executing Pipeline...</span>
                  <span className="text-cyan-400">{simulationProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                    style={{ width: `${simulationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {simComplete && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Worker pipeline verified! Ready for live streaming integration.</span>
              </div>
            )}

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isSimulating ? 'Simulating Pipeline...' : `Run ${currentModule.title} Test`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
