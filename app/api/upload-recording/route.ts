import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { transcribeAudio, generateSummary, generateReport } from '@/lib/services/ai-service';
import type { TranscriptionProvider, AIProvider } from '@/lib/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const title = formData.get('title') as string;
    const duration = parseInt(formData.get('duration') as string);
    const aiProvider = (formData.get('aiProvider') as string) || 'openai';
    const transcriptionProvider = (formData.get('transcriptionProvider') as string) || 'openai';

    if (!audioFile || !title || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${audioFile.name}`;

    // Upload audio file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('audio-recordings')
      .upload(fileName, audioFile, {
        contentType: audioFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabaseAdmin.storage
      .from('audio-recordings')
      .getPublicUrl(fileName);

    // Create initial recording entry in database
    const { data: recording, error: dbError } = await supabaseAdmin
      .from('recordings')
      .insert({
        title,
        duration,
        audio_url: urlData.publicUrl,
        file_size: audioFile.size,
        status: 'processing'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save recording metadata' },
        { status: 500 }
      );
    }

    // Start AI processing in the background
    processAudioInBackground(recording.id, audioFile, transcriptionProvider as TranscriptionProvider, aiProvider as AIProvider);

    return NextResponse.json({
      success: true,
      recording: {
        id: recording.id,
        title: recording.title,
        duration: recording.duration,
        createdAt: recording.created_at,
        audioUrl: recording.audio_url,
        size: recording.file_size,
        status: recording.status
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processAudioInBackground(
  recordingId: string, 
  audioFile: File, 
  transcriptionProvider: TranscriptionProvider = 'openai',
  aiProvider: AIProvider = 'openai'
) {
  try {
    console.log(`Starting audio processing for recording ${recordingId}`);
    console.log(`Using transcription provider: ${transcriptionProvider}`);
    console.log(`Using AI provider: ${aiProvider}`);

    // Step 1: Transcribe audio with selected provider
    const transcription = await transcribeAudio(audioFile, transcriptionProvider);
    
    // Update recording with transcription
    await supabaseAdmin
      .from('recordings')
      .update({
        transcription_content: transcription.content,
        transcription_confidence: transcription.confidence,
        transcription_language: transcription.language,
        transcription_speaker_count: transcription.speakerCount,
        transcription_timestamps: transcription.timestamps,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    console.log(`Transcription completed for recording ${recordingId}`);

    // Step 2: Generate summary with specified AI provider
    const summary = await generateSummary(transcription.content, aiProvider);
    
    // Update recording with summary
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

    console.log(`Summary generated for recording ${recordingId}`);

    // Step 3: Generate report with specified AI provider
    const report = await generateReport(transcription.content, summary, aiProvider);
    
    // Update recording with report and mark as completed
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

    console.log(`Processing completed for recording ${recordingId}`);

  } catch (error) {
    console.error('AI processing error:', error);
    
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