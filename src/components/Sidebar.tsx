import React from 'react';
import { ActiveTool } from '../types';
import {
  LayoutDashboard,
  Video,
  Eraser,
  Sparkles,
  Scissors,
  Layers,
  Server,
  Zap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  setActiveTool,
  mobileOpen,
  setMobileOpen,
}) => {
  const mainNavItems = [
    {
      id: 'dashboard' as ActiveTool,
      label: 'Studio Dashboard',
      icon: LayoutDashboard,
      badge: 'Hub',
      badgeColor: 'text-slate-400 bg-slate-800/80',
    },
    {
      id: 'video-remover' as ActiveTool,
      label: 'AI Video Remover',
      icon: Video,
      badge: 'PRO',
      badgeColor: 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/30',
    },
    {
      id: 'photo-remover' as ActiveTool,
      label: 'AI Photo Remover',
      icon: Eraser,
      badge: '0.8s',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30',
    },
    {
      id: 'photo-enhancer' as ActiveTool,
      label: 'AI Photo Enhancer',
      icon: Sparkles,
      badge: '4K Ultra',
      badgeColor: 'text-amber-300 bg-amber-500/20 border border-amber-400/30',
    },
    {
      id: 'bg-remover' as ActiveTool,
      label: 'AI Background Remover',
      icon: Scissors,
      badge: 'Cutout',
      badgeColor: 'text-blue-300 bg-blue-500/20 border border-blue-400/30',
    },
  ];

  const secondaryNavItems = [
    {
      id: 'expandable-suite' as ActiveTool,
      label: 'Future Studio Suite',
      icon: Layers,
      description: 'Stabilizer, Subtitles, 8+ Tools',
    },
    {
      id: 'backend-architecture' as ActiveTool,
      label: 'FastAPI & FFmpeg API',
      icon: Server,
      description: 'Microservice Blueprint',
    },
  ];

  const handleSelect = (tool: ActiveTool) => {
    setActiveTool(tool);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-white/10 bg-[#07090e]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Main Studio Tools */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Primary AI Engines
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Architecture & Expandable Suite */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Architecture &amp; Labs
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mt-0.5 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Specs & Privacy Assurance */}
        <div className="p-4 border-t border-white/10 bg-[#05070a]/60">
          <div className="rounded-xl border border-white/5 bg-[#0b0e14] p-3 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Full Fidelity Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Native resolution &amp; frame-rate preserved. Zero lossy recompression.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>H.264 / WebM Lossless</span>
              <span className="text-emerald-400">100% Client/API</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
