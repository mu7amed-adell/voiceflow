interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

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

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function callOllama(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false,
        format: 'json'
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || data.response || '';
  } catch (error) {
    console.error('Ollama API error:', error);
    throw new Error(`Failed to connect to Ollama server at ${OLLAMA_BASE_URL}`);
  }
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function generateSummaryWithOllama(transcriptionText: string): Promise<SummaryResult> {
  try {
    const systemPrompt = `You are an expert at analyzing and summarizing voice recordings. Your task is to:
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
}`;

    const prompt = `Please analyze this transcription: ${transcriptionText}`;
    
    const result = await callOllama(prompt, systemPrompt);
    const parsed = JSON.parse(result);
    
    return {
      content: parsed.summary || 'Summary generation failed',
      keyPoints: parsed.keyPoints || [],
      topics: parsed.topics || [],
      sentimentScore: parsed.sentimentScore || 0
    };
  } catch (error) {
    console.error('Ollama summary generation error:', error);
    throw new Error('Failed to generate summary with Ollama');
  }
}

export async function generateReportWithOllama(transcriptionText: string, summary: SummaryResult): Promise<ReportResult> {
  try {
    const systemPrompt = `You are an expert communication analyst. Analyze the voice recording and provide detailed insights about:
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
}`;

    const prompt = `Analyze this transcription and summary:
          
Transcription: ${transcriptionText}

Summary: ${summary.content}

Key Points: ${summary.keyPoints.join(', ')}
Topics: ${summary.topics.join(', ')}
Sentiment Score: ${summary.sentimentScore}`;

    const result = await callOllama(prompt, systemPrompt);
    const parsed = JSON.parse(result);
    
    return {
      content: parsed.report || 'Report generation failed',
      insights: parsed.insights || [],
      metrics: parsed.metrics || {
        speakingTime: 80,
        pauseFrequency: 10,
        averageResponseTime: 2.0,
        sentimentTrend: 'neutral'
      },
      actionItems: parsed.actionItems || [],
      sentimentAnalysis: parsed.sentimentAnalysis || {
        overall: 'neutral',
        confidence: 0.5,
        emotions: ['neutral']
      }
    };
  } catch (error) {
    console.error('Ollama report generation error:', error);
    throw new Error('Failed to generate report with Ollama');
  }
}

// Note: Ollama doesn't have built-in transcription capabilities like OpenAI Whisper
// For transcription, you would still need to use OpenAI Whisper or another service
// This is a placeholder that would require additional setup with a local transcription model
export async function transcribeAudioWithOllama(audioFile: File): Promise<TranscriptionResult> {
  throw new Error('Audio transcription with Ollama requires additional setup with a local transcription model like Whisper.cpp');
}