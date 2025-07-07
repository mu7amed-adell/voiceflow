export interface Recording {
  id: string;
  title: string;
  duration: number; // in seconds
  createdAt: Date;
  audioUrl: string;
  size: number; // in bytes
  status: 'pending' | 'processing' | 'completed' | 'failed';
  patientName?: string;
  sessionDate?: string;
  sessionType?: string;
  transcription: Transcription | null;
  summary: Summary | null;
  report: Report | null;
}

export interface Transcription {
  content: string;
  confidence: number; // 0-100
  language: string;
  speakerCount?: number;
  timestamps?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface Summary {
  content: string;
  keyPoints?: string[];
  topics?: string[];
  sentimentScore?: number; // -1 to 1
}

export interface Report {
  content: string;
  insights?: string[];
  metrics?: {
    speakingTime: number;
    pauseFrequency: number;
    averageResponseTime: number;
    sentimentTrend: string;
  };
  actionItems?: string[];
  sentimentAnalysis?: {
    overall: string;
    confidence: number;
    emotions: string[];
  };
}