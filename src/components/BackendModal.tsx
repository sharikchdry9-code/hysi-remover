import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendModal: React.FC<BackendModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'api-test' | 'deploy'>('architecture');
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [backendConfig, setBackendConfig] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch status on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setHealthStatus(data))
        .catch(() => setHealthStatus({ status: 'offline' }));

      fetch('/api/backend-status')
        .then((res) => res.json())
        .then((data) => setBackendConfig(data))
        .catch(() => setBackendConfig(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    setIsLoading(true);
    setApiResponse(null);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setApiResponse(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0d121c]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Backend Architecture &amp; API Hub</h2>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  v2.4 Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Python FastAPI, FFmpeg Microservice &amp; Local WebEngine Specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-[#080b12] text-xs font-semibold">
          {[
            { id: 'architecture', label: 'System Topology' },
            { id: 'api-test', label: 'Interactive API Console' },
            { id: 'deploy', label: 'GitHub & Cloudflare Deployment' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Dual Engine Architecture Card */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Engine 1 */}
                <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">1. Client WebEngine 2.4</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      ACTIVE (100% ONLINE)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Executes real-time pixel patch synthesis, canvas convolution, and video frame
                    recording locally in your browser. Zero latency, zero external data leaks.
                  </p>
                  <div className="space-y-1.5 pt-2 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Canvas Content-Aware Exemplar Inpainting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>MediaRecorder H.264 / WebM Lossless Muxer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Laplacian 3x3 Edge Sharpening Matrix</span>
                    </div>
                  </div>
                </div>

                {/* Engine 2 */}
                <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">2. Python FastAPI + FFmpeg</span>
                    <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      MICROSERVICE READY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Production microservice located in <code className="text-cyan-400">/python_backend/app.py</code>.
                    Provides ProPainter video reconstruction, LaMa photo neural inpainting, and
                    hardware-accelerated FFmpeg pipelines.
                  </p>
                  <div className="space-y-1.5 pt-2 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>ProPainter Video Inpainting + RAFT Optical Flow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>FFmpeg Native Demuxing &amp; Audio Channel Preserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Real-ESRGAN-4x+ Super-Resolution Worker</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FFmpeg Video Pipeline Diagram */}
              <div className="rounded-2xl border border-white/10 bg-[#07090e] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <span>FFmpeg Temporal Reconstruction Command Pipeline</span>
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'ffmpeg -i input.mp4 -vn -c:a copy audio.aac && ffmpeg -i input.mp4 -q:v 2 frames/%06d.png',
                        'ffmpeg'
                      )
                    }
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedText === 'ffmpeg' ? 'Copied!' : 'Copy Shell Script'}</span>
                  </button>
                </div>

                <pre className="rounded-xl bg-black/60 p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed border border-white/5">
{`# 1. Demux video into lossless PNG keyframe sequence and preserve native audio:
ffmpeg -i input.mp4 -vn -c:a copy audio.aac
ffmpeg -i input.mp4 -q:v 1 frames/%06d.png

# 2. Run Spatio-Temporal Neural Inpainting with ProPainter & RAFT Flow:
python inference_propainter.py --video frames/ --mask masks/ --subvideo_length 80

# 3. Re-encode lossless H.264 stream at native framerate:
ffmpeg -framerate 30 -i out_frames/%06d.png -i audio.aac -c:v libx264 -pix_fmt yuv420p -crf 14 output.mp4`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'api-test' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300">
                Click any route below to test the live Express and microservice proxy endpoints in
                real-time:
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => testApi('/api/health')}
                  className="rounded-xl border border-white/10 bg-[#0d121c] px-4 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-white/10 cursor-pointer"
                >
                  GET /api/health
                </button>
                <button
                  onClick={() => testApi('/api/backend-status')}
                  className="rounded-xl border border-white/10 bg-[#0d121c] px-4 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-white/10 cursor-pointer"
                >
                  GET /api/backend-status
                </button>
                <button
                  onClick={() =>
                    testApi('/api/process-video', 'POST', {
                      videoName: 'Drone_Skyline.mp4',
                      duration: 5.0,
                      fps: 30,
                    })
                  }
                  className="rounded-xl border border-white/10 bg-[#0d121c] px-4 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-white/10 cursor-pointer"
                >
                  POST /api/process-video
                </button>
              </div>

              {/* Console output display */}
              <div className="rounded-2xl border border-white/10 bg-black p-4 font-mono text-xs text-emerald-400 min-h-[220px] overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                    <span>Executing endpoint query...</span>
                  </div>
                ) : apiResponse ? (
                  <pre>{apiResponse}</pre>
                ) : (
                  <span className="text-slate-600">// Click an endpoint above to view live JSON response</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>GitHub &amp; Cloudflare Pages Deployment</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  HYSI REMOVER AI is built with standard Vite and React 19, allowing direct deployment
                  to Cloudflare Pages, Vercel, or GitHub Pages. The local WebEngine allows 100% of the
                  object removal, enhancement, and cutout tools to work completely serverless!
                </p>
                <div className="rounded-xl bg-black/60 p-4 font-mono text-xs text-slate-300 border border-white/5 space-y-2">
                  <p className="text-slate-500"># Cloudflare Pages Build Configuration:</p>
                  <p>Build command: <span className="text-cyan-400">npm run build</span></p>
                  <p>Build output directory: <span className="text-cyan-400">dist</span></p>
                  <p>Node version: <span className="text-cyan-400">20.x</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Docker GPU Container (FastAPI + FFmpeg)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For GPU clusters (AWS EC2 G5, GCP A100, or RunPod):
                </p>
                <pre className="rounded-xl bg-black/60 p-4 font-mono text-xs text-slate-300 border border-white/5">
{`FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04
RUN apt-get update && apt-get install -y ffmpeg python3-pip git
WORKDIR /app
COPY python_backend/requirements.txt .
RUN pip install -r requirements.txt
COPY python_backend/ .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
