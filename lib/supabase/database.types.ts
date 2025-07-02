export interface Database {
  public: {
    Tables: {
      recordings: {
        Row: {
          id: string;
          title: string;
          duration: number;
          created_at: string;
          audio_url: string;
          file_size: number;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          transcription_content: string | null;
          transcription_confidence: number | null;
          transcription_language: string | null;
          transcription_speaker_count: number | null;
          transcription_timestamps: any | null;
          summary_content: string | null;
          summary_key_points: string[] | null;
          summary_topics: string[] | null;
          summary_sentiment_score: number | null;
          report_content: string | null;
          report_insights: string[] | null;
          report_metrics: any | null;
          report_action_items: string[] | null;
          report_sentiment_analysis: any | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          duration: number;
          created_at?: string;
          audio_url: string;
          file_size: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          transcription_content?: string | null;
          transcription_confidence?: number | null;
          transcription_language?: string | null;
          transcription_speaker_count?: number | null;
          transcription_timestamps?: any | null;
          summary_content?: string | null;
          summary_key_points?: string[] | null;
          summary_topics?: string[] | null;
          summary_sentiment_score?: number | null;
          report_content?: string | null;
          report_insights?: string[] | null;
          report_metrics?: any | null;
          report_action_items?: string[] | null;
          report_sentiment_analysis?: any | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          duration?: number;
          created_at?: string;
          audio_url?: string;
          file_size?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          transcription_content?: string | null;
          transcription_confidence?: number | null;
          transcription_language?: string | null;
          transcription_speaker_count?: number | null;
          transcription_timestamps?: any | null;
          summary_content?: string | null;
          summary_key_points?: string[] | null;
          summary_topics?: string[] | null;
          summary_sentiment_score?: number | null;
          report_content?: string | null;
          report_insights?: string[] | null;
          report_metrics?: any | null;
          report_action_items?: string[] | null;
          report_sentiment_analysis?: any | null;
          updated_at?: string;
        };
      };
    };
  };
}