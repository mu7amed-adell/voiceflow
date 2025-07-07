import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSummary, generateReport } from '@/lib/services/ai-service';
import type { AIProvider } from '@/lib/services/ai-service';

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

function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER;
  if (provider === 'openai' || provider === 'ollama') {
    return provider;
  }
  // Default to 'openai' if the env var is missing or invalid
  console.warn(`Invalid AI_PROVIDER: "${provider}". Falling back to "openai".`);
  return 'openai';
}

async function reanalyzeRecordingInBackground(recordingId: string, transcriptionText: string) {
  try {
    const aiProvider = getAIProvider();

    // Generate new summary
    const summary = await generateSummary(transcriptionText, aiProvider);

    // Generate new report
    const report = await generateReport(transcriptionText, summary, aiProvider);

    // Update recording with new summary, report, and mark as completed in a single call
    await supabaseAdmin
      .from('recordings')
      .update({
        summary_content: summary.content,
        summary_key_points: summary.keyPoints,
        summary_topics: summary.topics,
        summary_sentiment_score: summary.sentimentScore,
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