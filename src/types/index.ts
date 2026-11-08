export type ActiveTool =
  | 'dashboard'
  | 'video-remover'
  | 'photo-remover'
  | 'photo-enhancer'
  | 'bg-remover'
  | 'expandable-suite'
  | 'backend-architecture';

export interface ProjectItem {
  id: string;
  name: string;
  tool: 'video-remover' | 'photo-remover' | 'photo-enhancer' | 'bg-remover';
  timestamp: number;
  previewUrl: string;
  fileSize?: string;
  dimensions?: string;
}

export interface VideoKeyframePoint {
  frame: number;
  timeSec: number;
  x: number;
  y: number;
  radius: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  detail: string;
  logs: string[];
}

export interface SampleMediaItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'image' | 'video';
  url: string;
  aspectRatio: string;
  description: string;
  presetMask?: { x: number; y: number; radius: number };
}
