import { 
  transcribeAudio as transcribeWithOpenAI, 
  generateSummary as generateSummaryWithOpenAI, 
  generateReport as generateReportWithOpenAI,
  TranscriptionResult,
  SummaryResult,
  ReportResult
} from './openai';

import {
  generateSummaryWithOllama,
  generateReportWithOllama,
  checkOllamaConnection
} from './ollama';

type AIProvider = 'openai' | 'ollama';

const DEFAULT_AI_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';

export async function getAvailableAIProviders(): Promise<{ openai: boolean; ollama: boolean }> {
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    ollama: false
  };

  // Check Ollama connection
  try {
    providers.ollama = await checkOllamaConnection();
  } catch (error) {
    console.log('Ollama not available:', error);
  }

  return providers;
}

export async function transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
  // For now, transcription is only available through OpenAI Whisper
  // Ollama doesn't have built-in transcription capabilities
  return transcribeWithOpenAI(audioFile);
}

export async function generateSummary(
  transcriptionText: string, 
  provider: AIProvider = DEFAULT_AI_PROVIDER
): Promise<SummaryResult> {
  const availableProviders = await getAvailableAIProviders();

  // Fallback to OpenAI if requested provider is not available
  if (provider === 'ollama' && !availableProviders.ollama) {
    console.warn('Ollama not available, falling back to OpenAI');
    provider = 'openai';
  }

  if (provider === 'openai' && !availableProviders.openai) {
    throw new Error('No AI provider available for summary generation');
  }

  switch (provider) {
    case 'ollama':
      return generateSummaryWithOllama(transcriptionText);
    case 'openai':
    default:
      return generateSummaryWithOpenAI(transcriptionText);
  }
}

export async function generateReport(
  transcriptionText: string, 
  summary: SummaryResult,
  provider: AIProvider = DEFAULT_AI_PROVIDER
): Promise<ReportResult> {
  const availableProviders = await getAvailableAIProviders();

  // Fallback to OpenAI if requested provider is not available
  if (provider === 'ollama' && !availableProviders.ollama) {
    console.warn('Ollama not available, falling back to OpenAI');
    provider = 'openai';
  }

  if (provider === 'openai' && !availableProviders.openai) {
    throw new Error('No AI provider available for report generation');
  }

  switch (provider) {
    case 'ollama':
      return generateReportWithOllama(transcriptionText, summary);
    case 'openai':
    default:
      return generateReportWithOpenAI(transcriptionText, summary);
  }
}

export { TranscriptionResult, SummaryResult, ReportResult };