import React from 'react';
import { ProjectItem } from '../types';
import {
  X,
  FolderClock,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface RecentProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  onDeleteProject: (id: string) => void;
  onClearAll: () => void;
  onSelectProject: (tool: any) => void;
}

export const RecentProjectsModal: React.FC<RecentProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onDeleteProject,
  onClearAll,
  onSelectProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0d121c]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FolderClock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Recent Workspace Projects</h2>
              <p className="text-xs text-slate-400">
                {projects.length} edited assets saved in your local workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {projects.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium mr-2"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderClock className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No projects saved yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Whenever you remove an object from a video or photo, your project is automatically
                cached here for quick export.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d121c] p-3 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-black/60 border border-white/5">
                      {proj.previewUrl && !proj.previewUrl.startsWith('blob:') ? (
                        <img
                          src={proj.previewUrl}
                          alt={proj.name}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-950/40 to-blue-950/40 text-[10px] font-mono text-cyan-400">
                          MEDIA
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{proj.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(proj.timestamp).toLocaleTimeString()} · {proj.dimensions || '1080p'}
                      </div>
                      <span className="inline-block mt-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 border border-cyan-500/20">
                        {proj.tool.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={proj.previewUrl}
                      download={proj.name}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      title="Download Asset"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
