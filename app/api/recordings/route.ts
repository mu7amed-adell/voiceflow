import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Recording } from '@/lib/types/recording';

export async function GET(request: NextRequest) {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recordings' },
        { status: 500 }
      );
    }

    // Transform database records to Recording interface
    const transformedRecordings: Recording[] = recordings.map(record => ({
      id: record.id,
      title: record.title,
      duration: record.duration,
      createdAt: new Date(record.created_at),
      audioUrl: record.audio_url,
      size: record.file_size,
      status: record.status,
      transcription: record.transcription_content ? {
        content: record.transcription_content,
        confidence: record.transcription_confidence || 0,
        language: record.transcription_language || 'en',
        speakerCount: record.transcription_speaker_count,
        timestamps: record.transcription_timestamps
      } : null,
      summary: record.summary_content ? {
        content: record.summary_content,
        keyPoints: record.summary_key_points || [],
        topics: record.summary_topics || [],
        sentimentScore: record.summary_sentiment_score
      } : null,
      report: record.report_content ? {
        content: record.report_content,
        insights: record.report_insights || [],
        metrics: record.report_metrics || {
          speakingTime: 80,
          pauseFrequency: 10,
          averageResponseTime: 2.0,
          sentimentTrend: 'neutral'
        },
        actionItems: record.report_action_items || [],
        sentimentAnalysis: record.report_sentiment_analysis || {
          overall: 'neutral',
          confidence: 0.5,
          emotions: ['neutral']
        }
      } : null
    }));

    return NextResponse.json({ recordings: transformedRecordings });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}