import React, { useState, useEffect } from 'react';
import { ActiveTool, ProjectItem } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VideoRemover } from './components/VideoRemover';
import { PhotoRemover } from './components/PhotoRemover';
import { PhotoEnhancer } from './components/PhotoEnhancer';
import { BackgroundRemover } from './components/BackgroundRemover';
import { ExpandableSuite } from './components/ExpandableSuite';
import { BackendModal } from './components/BackendModal';
import { RecentProjectsModal } from './components/RecentProjectsModal';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState<boolean>(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Selected sample IDs for instant testing
  const [selectedPhotoSample, setSelectedPhotoSample] = useState<string | undefined>(undefined);
  const [selectedVideoSample, setSelectedVideoSample] = useState<string | undefined>(undefined);

  // Persisted Recent Projects
  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>(() => {
    try {
      const stored = localStorage.getItem('hysi_recent_projects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save project to recent
  const handleSaveProject = (project: ProjectItem) => {
    setRecentProjects((prev) => {
      const updated = [project, ...prev.filter((p) => p.id !== project.id)].slice(0, 12);
      try {
        localStorage.setItem('hysi_recent_projects', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage limit reached for projects:', e);
      }
      return updated;
    });
  };

  const handleDeleteProject = (id: string) => {
    setRecentProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('hysi_recent_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllProjects = () => {
    setRecentProjects([]);
    localStorage.removeItem('hysi_recent_projects');
  };

  // Check backend heartbeat
  useEffect(() => {
    fetch('/api/backend-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.neuralBackend?.status === 'connected') {
          setBackendConnected(true);
        }
      })
      .catch(() => setBackendConnected(false));
  }, []);

  // Quick load handlers from Dashboard
  const handleQuickLoadPhoto = (sampleId: string) => {
    setSelectedPhotoSample(sampleId);
    setActiveTool('photo-remover');
  };

  const handleQuickLoadVideo = (sampleId: string) => {
    setSelectedVideoSample(sampleId);
    setActiveTool('video-remover');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        recentCount={recentProjects.length}
        onOpenRecent={() => setIsRecentModalOpen(true)}
        onOpenBackend={() => setIsBackendModalOpen(true)}
        backendConnected={backendConnected}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 transition-all duration-300">
          {/* Mobile hamburger header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-[#090d15] px-4 py-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4 text-cyan-400" />
              <span>Studio Tools</span>
            </button>
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
              {activeTool.replace('-', ' ')}
            </span>
          </div>

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {activeTool === 'dashboard' && (
              <Dashboard
                setActiveTool={setActiveTool}
                recentProjects={recentProjects}
                onOpenRecent={() => setIsRecentModalOpen(true)}
                onOpenBackend={() => setIsBackendModalOpen(true)}
                onQuickLoadPhotoSample={handleQuickLoadPhoto}
                onQuickLoadVideoSample={handleQuickLoadVideo}
              />
            )}

            {activeTool === 'video-remover' && (
              <VideoRemover
                initialSampleId={selectedVideoSample}
                onSaveProject={handleSaveProject}
                onOpenBackend={() => setIsBackendModalOpen(true)}
              />
            )}

            {activeTool === 'photo-remover' && (
              <PhotoRemover
                initialSampleId={selectedPhotoSample}
                onSaveProject={handleSaveProject}
                onOpenBackend={() => setIsBackendModalOpen(true)}
              />
            )}

            {activeTool === 'photo-enhancer' && (
              <PhotoEnhancer
                initialSampleId={selectedPhotoSample}
                onSaveProject={handleSaveProject}
                onOpenBackend={() => setIsBackendModalOpen(true)}
              />
            )}

            {activeTool === 'bg-remover' && (
              <BackgroundRemover
                initialSampleId={selectedPhotoSample}
                onSaveProject={handleSaveProject}
                onOpenBackend={() => setIsBackendModalOpen(true)}
              />
            )}

            {activeTool === 'expandable-suite' && <ExpandableSuite />}

            {activeTool === 'backend-architecture' && (
              <div className="py-4">
                <BackendModal isOpen={true} onClose={() => setActiveTool('dashboard')} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <BackendModal isOpen={isBackendModalOpen} onClose={() => setIsBackendModalOpen(false)} />

      <RecentProjectsModal
        isOpen={isRecentModalOpen}
        onClose={() => setIsRecentModalOpen(false)}
        projects={recentProjects}
        onDeleteProject={handleDeleteProject}
        onClearAll={handleClearAllProjects}
        onSelectProject={(tool) => {
          setActiveTool(tool);
          setIsRecentModalOpen(false);
        }}
      />
    </div>
  );
}
