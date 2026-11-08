import React from 'react';
import { ActiveTool } from '../types';
import {
  Wand2,
  Server,
  FolderClock,
  Sparkles,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  recentCount: number;
  onOpenRecent: () => void;
  onOpenBackend: () => void;
  backendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTool,
  setActiveTool,
  recentCount,
  onOpenRecent,
  onOpenBackend,
  backendConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080a0f]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTool('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="HYSI REMOVER AI Home"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-shadow">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07090e]">
                <Wand2 className="h-5 w-5 text-cyan-400 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-wider text-white">
                  HYSI<span className="text-cyan-400">REMOVER</span>
                </span>
                <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-cyan-300 border border-cyan-400/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-tight text-slate-400">
                Neural Video &amp; Photo Studio
              </p>
            </div>
          </button>
        </div>

        {/* Engine status indicator & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <button
            onClick={onOpenBackend}
            className="hidden md:flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0d121c]/80 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors"
            title="Inspect HYSI Neural Backend & FFmpeg Architecture"
            aria-label="Inspect Backend Architecture"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">WebEngine 2.4:</span>
            <span className="font-semibold text-emerald-400">Active</span>
            <span className="text-slate-600">|</span>
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-mono">
              FastAPI: <span className="text-cyan-400">{backendConnected ? 'Ready' : 'Standby'}</span>
            </span>
          </button>

          {/* Recent Projects button */}
          <button
            onClick={onOpenRecent}
            className="relative flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0d121c] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label={`Recent Projects (${recentCount})`}
          >
            <FolderClock className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Recent Projects</span>
            {recentCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
                {recentCount}
              </span>
            )}
          </button>

          {/* Architecture / API docs modal button */}
          <button
            onClick={onOpenBackend}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-sm shadow-cyan-500/20"
            aria-label="Open Neural Backend Diagnostics"
          >
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Backend API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
