export interface TranscriptionResult {
  content: string;
  confidence: number;
  language: string;
  speakerCount?: number;
  timestamps?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface SummaryResult {
  content: string;
  keyPoints: string[];
  topics: string[];
  sentimentScore: number;
}

export interface ReportResult {
  content: string;
  insights: string[];
  metrics: {
    speakingTime: number;
    pauseFrequency: number;
    averageResponseTime: number;
    sentimentTrend: string;
  };
  actionItems: string[];
  sentimentAnalysis: {
    overall: string;
    confidence: number;
    emotions: string[];
  };
}