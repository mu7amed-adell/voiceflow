import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    // Extract timestamps if available
    const timestamps = transcription.words?.map(word => ({
      start: word.start,
      end: word.end,
      text: word.word
    })) || [];

    return {
      content: transcription.text,
      confidence: 95, // Whisper doesn't provide confidence, using default
      language: transcription.language || 'en',
      speakerCount: 1, // Basic implementation, could be enhanced with speaker diarization
      timestamps: timestamps.length > 0 ? timestamps : undefined
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function generateSummary(transcriptionText: string): Promise<SummaryResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing and summarizing voice recordings. Your task is to:
1. Create a concise summary of the main content
2. Extract key points (3-7 bullet points)
3. Identify main topics discussed
4. Analyze the overall sentiment (-1 to 1 scale)

Respond in JSON format with the following structure:
{
  "summary": "Main summary text",
  "keyPoints": ["point 1", "point 2", ...],
  "topics": ["topic 1", "topic 2", ...],
  "sentimentScore": 0.2
}`
        },
        {
          role: 'user',
          content: `Please analyze this transcription: ${transcriptionText}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      content: result.summary || 'Summary generation failed',
      keyPoints: result.keyPoints || [],
      topics: result.topics || [],
      sentimentScore: result.sentimentScore || 0
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    throw new Error('Failed to generate summary');
  }
}

export async function generateReport(transcriptionText: string, summary: SummaryResult): Promise<ReportResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert communication analyst. Analyze the voice recording and provide detailed insights about:
1. Communication patterns and effectiveness
2. Speaking style and clarity
3. Engagement level and emotional tone
4. Actionable recommendations

Respond in JSON format with the following structure:
{
  "report": "Detailed analysis report",
  "insights": ["insight 1", "insight 2", ...],
  "metrics": {
    "speakingTime": 85,
    "pauseFrequency": 12,
    "averageResponseTime": 2.1,
    "sentimentTrend": "positive"
  },
  "actionItems": ["action 1", "action 2", ...],
  "sentimentAnalysis": {
    "overall": "positive",
    "confidence": 0.8,
    "emotions": ["confident", "engaged"]
  }
}`
        },
        {
          role: 'user',
          content: `Analyze this transcription and summary:
          
Transcription: ${transcriptionText}

Summary: ${summary.content}

Key Points: ${summary.keyPoints.join(', ')}
Topics: ${summary.topics.join(', ')}
Sentiment Score: ${summary.sentimentScore}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      content: result.report || 'Report generation failed',
      insights: result.insights || [],
      metrics: result.metrics || {
        speakingTime: 80,
        pauseFrequency: 10,
        averageResponseTime: 2.0,
        sentimentTrend: 'neutral'
      },
      actionItems: result.actionItems || [],
      sentimentAnalysis: result.sentimentAnalysis || {
        overall: 'neutral',
        confidence: 0.5,
        emotions: ['neutral']
      }
    };
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate report');
  }
}