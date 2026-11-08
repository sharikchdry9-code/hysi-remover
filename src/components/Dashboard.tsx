import React from 'react';
import { ActiveTool, ProjectItem } from '../types';
import { SAMPLE_IMAGES, SAMPLE_VIDEOS } from '../data/sampleMedia';
import {
  Video,
  Eraser,
  Sparkles,
  Scissors,
  ArrowRight,
  Upload,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  ShieldCheck,
  FolderClock,
  Sparkle,
} from 'lucide-react';

interface DashboardProps {
  setActiveTool: (tool: ActiveTool) => void;
  recentProjects: ProjectItem[];
  onOpenRecent: () => void;
  onOpenBackend: () => void;
  onQuickLoadPhotoSample: (sampleId: string) => void;
  onQuickLoadVideoSample: (sampleId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTool,
  recentProjects,
  onOpenRecent,
  onOpenBackend,
  onQuickLoadPhotoSample,
  onQuickLoadVideoSample,
}) => {
  const primaryTools = [
    {
      id: 'video-remover' as ActiveTool,
      title: 'AI Video Remover',
      tagline: 'Spatio-Temporal Video Reconstruction',
      description:
        'Select unwanted people, watermarks, timestamps or objects. Reconstructs background across frames with optical flow & temporal consistency.',
      icon: Video,
      accentColor: 'from-cyan-500 to-blue-600',
      glowColor: 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_35px_rgba(0,240,255,0.15)]',
      features: [
        'Frame-by-frame temporal optical flow',
        'Brush & keyframe tracker selection',
        'Direct MP4 / WebM lossless export',
        'Supports MP4, MOV, WebM up to 4K',
      ],
      sampleLabel: 'Load Drone Skyline Sample',
      sampleId: 'video-drone-city',
      isSampleVideo: true,
    },
    {
      id: 'photo-remover' as ActiveTool,
      title: 'AI Photo Remover',
      tagline: 'Content-Aware Neural Inpainting',
      description:
        'Erase tourists, text, powerlines, blemishes, and unwanted objects seamlessly with exemplar patch synthesis and zero edge artifacts.',
      icon: Eraser,
      accentColor: 'from-emerald-400 to-cyan-500',
      glowColor: 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_35px_rgba(16,185,129,0.15)]',
      features: [
        'Smart pixel exemplar texture synthesis',
        'Interactive precision brush with zoom',
        'Instant Before & After slider comparison',
        'Lossless full-resolution PNG download',
      ],
      sampleLabel: 'Load Street Scene Sample',
      sampleId: 'sample-street',
      isSampleVideo: false,
    },
    {
      id: 'photo-enhancer' as ActiveTool,
      title: 'AI Photo Enhancer',
      tagline: '4K Super Resolution & Face Recovery',
      description:
        'Restore low-light, blurry, or low-resolution photography. Boosts clarity, recovers facial micro-details, and removes noise.',
      icon: Sparkles,
      accentColor: 'from-amber-400 to-orange-500',
      glowColor: 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_35px_rgba(245,158,11,0.15)]',
      features: [
        '2x & 4x neural detail upscaling',
        'Face recovery & unsharp sharpening',
        'Dynamic contrast & color vibrance boost',
        'Retains fine micro-texture realism',
      ],
      sampleLabel: 'Load Portrait Studio Sample',
      sampleId: 'sample-portrait',
      isSampleVideo: false,
    },
    {
      id: 'bg-remover' as ActiveTool,
      title: 'AI Background Remover',
      tagline: 'Sub-Pixel Alpha Matting & Studio Cutouts',
      description:
        'Extract subjects, products, or portraits in 1 click. Export transparent PNGs or replace with studio black, neon Tokyo, or blurred backdrops.',
      icon: Scissors,
      accentColor: 'from-blue-500 to-indigo-600',
      glowColor: 'group-hover:border-blue-500/50 group-hover:shadow-[0_0_35px_rgba(59,130,246,0.15)]',
      features: [
        'Hair & edge sub-pixel feathering',
        'Transparent PNG or custom studio backdrops',
        'Clean product & e-commerce isolation',
        'Batch export ready architecture',
      ],
      sampleLabel: 'Load Product Studio Sample',
      sampleId: 'sample-product',
      isSampleVideo: false,
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner with Cinematic Glow */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c101a] via-[#080b12] to-[#04060a] p-6 sm:p-10 shadow-2xl">
        {/* Glow ambient spots */}
        <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Sparkle className="h-3.5 w-3.5 text-cyan-400" />
            <span>HYSI REMOVER AI 2.4 — CINEMATIC MEDIA RESTORATION</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
            Remove unwanted objects from{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              video and photos
            </span>{' '}
            with surgical neural precision.
          </h1>

          <p className="text-base text-slate-300 sm:text-lg leading-relaxed max-w-3xl">
            Reconstruct missing pixels naturally across frames with optical flow temporal
            consistency. Full resolution preservation, native frame rate retention, and zero lossy
            recompression.
          </p>

          {/* 5-Step Workflow Banner */}
          <div className="pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                Workflow:
              </span>
              {['UPLOAD', 'SELECT', 'REMOVE', 'PREVIEW', 'DOWNLOAD'].map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-slate-200 font-mono font-semibold">
                    {step}
                  </span>
                  {idx < arr.length - 1 && <ArrowRight className="h-3 w-3 text-cyan-400" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Large Tool Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Main AI Studios</h2>
            <p className="text-xs text-slate-400">
              Select a dedicated engine below or test immediately with built-in high-res samples
            </p>
          </div>
          <button
            onClick={onOpenBackend}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-medium"
          >
            <span>Architecture &amp; FFmpeg Spec</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {primaryTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0d121c]/90 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${tool.glowColor}`}
              >
                {/* Top Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.accentColor} p-0.5 shadow-lg`}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#090d15]">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono font-medium text-slate-300">
                      {tool.tagline}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {tool.description}
                    </p>
                  </div>

                  {/* Bullet features */}
                  <ul className="space-y-1.5 pt-2">
                    {tool.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setActiveTool(tool.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
                  >
                    <span>Launch {tool.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (tool.isSampleVideo) {
                        onQuickLoadVideoSample(tool.sampleId);
                      } else {
                        onQuickLoadPhotoSample(tool.sampleId);
                      }
                      setActiveTool(tool.id);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Load ready-to-test demo asset without uploading"
                  >
                    <Play className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Try Sample</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Projects Preview or Quick Start Strip */}
      <div className="rounded-2xl border border-white/10 bg-[#090d15] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderClock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Workspace Projects ({recentProjects.length})
            </h3>
          </div>
          {recentProjects.length > 0 && (
            <button
              onClick={onOpenRecent}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All
            </button>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-8 text-center">
            <Upload className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-400">No edited projects yet.</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-md">
              Start by selecting one of the 4 studios above or clicking "Try Sample" to begin
              erasing objects immediately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentProjects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                onClick={() => setActiveTool(proj.tool)}
                className="group cursor-pointer rounded-xl border border-white/10 bg-[#0f1422] p-2.5 transition-all hover:border-cyan-500/40"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/50">
                  {proj.previewUrl && !proj.previewUrl.startsWith('blob:') ? (
                    <img
                      src={proj.previewUrl}
                      alt={proj.name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-950/40 to-blue-950/40 text-[10px] font-mono text-cyan-400">
                      MEDIA RENDER
                    </div>
                  )}
                  <span className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400">
                    {proj.tool.replace('-remover', '').replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                  {proj.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(proj.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Architecture & Future Features Callout */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-blue-950/20 to-slate-900/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>Expandable Multi-Tool Architecture Ready</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Ready for Video Enhancer, Stabilizer, Smart Compressor, AI Subtitles, Thumbnail Maker,
            Image Upscaler, and Audio Cleaner microservice workers.
          </p>
        </div>
        <button
          onClick={() => setActiveTool('expandable-suite')}
          className="shrink-0 flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-md shadow-cyan-500/10"
        >
          <span>Explore Future Suite</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
