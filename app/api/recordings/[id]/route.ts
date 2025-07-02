import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: recording, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    // Transform database record to Recording interface
    const transformedRecording = {
      id: recording.id,
      title: recording.title,
      duration: recording.duration,
      createdAt: new Date(recording.created_at),
      audioUrl: recording.audio_url,
      size: recording.file_size,
      status: recording.status,
      transcription: recording.transcription_content ? {
        content: recording.transcription_content,
        confidence: recording.transcription_confidence || 0,
        language: recording.transcription_language || 'en',
        speakerCount: recording.transcription_speaker_count,
        timestamps: recording.transcription_timestamps
      } : null,
      summary: recording.summary_content ? {
        content: recording.summary_content,
        keyPoints: recording.summary_key_points || [],
        topics: recording.summary_topics || [],
        sentimentScore: recording.summary_sentiment_score
      } : null,
      report: recording.report_content ? {
        content: recording.report_content,
        insights: recording.report_insights || [],
        metrics: recording.report_metrics || {
          speakingTime: 80,
          pauseFrequency: 10,
          averageResponseTime: 2.0,
          sentimentTrend: 'neutral'
        },
        actionItems: recording.report_action_items || [],
        sentimentAnalysis: recording.report_sentiment_analysis || {
          overall: 'neutral',
          confidence: 0.5,
          emotions: ['neutral']
        }
      } : null
    };

    return NextResponse.json({ recording: transformedRecording });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete recording' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}