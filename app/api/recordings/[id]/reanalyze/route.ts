import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSummary, generateReport } from '@/lib/services/ai-service';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    // Get the recording
    const { data: recording, error } = await supabaseAdmin
      .from('recordings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !recording) {
      console.error('Recording not found:', error);
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    // Check if recording has transcription
    if (!recording.transcription_content) {
      return NextResponse.json(
        { error: 'Recording must have transcription to reanalyze' },
        { status: 400 }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from('recordings')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // Start reanalysis in background
    reanalyzeRecordingInBackground(id, recording.transcription_content);

    return NextResponse.json({ 
      success: true, 
      message: 'Reanalysis started' 
    });

  } catch (error) {
    console.error('Reanalysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function reanalyzeRecordingInBackground(recordingId: string, transcriptionText: string) {
  try {
    // Get AI provider from environment or default to OpenAI
    const aiProvider = process.env.AI_PROVIDER || 'openai';

    // Generate new summary
    const summary = await generateSummary(transcriptionText, aiProvider as any);
    
    // Update recording with new summary
    await supabaseAdmin
      .from('recordings')
      .update({
        summary_content: summary.content,
        summary_key_points: summary.keyPoints,
        summary_topics: summary.topics,
        summary_sentiment_score: summary.sentimentScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    // Generate new report
    const report = await generateReport(transcriptionText, summary, aiProvider as any);
    
    // Update recording with new report and mark as completed
    await supabaseAdmin
      .from('recordings')
      .update({
        report_content: report.content,
        report_insights: report.insights,
        report_metrics: report.metrics,
        report_action_items: report.actionItems,
        report_sentiment_analysis: report.sentimentAnalysis,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

  } catch (error) {
    console.error('Reanalysis background processing error:', error);
    
    // Mark recording as failed
    await supabaseAdmin
      .from('recordings')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);
  }
}