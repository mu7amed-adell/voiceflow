import {
  transcribeAudio as transcribeWithOpenAI,
  generateSummary as generateSummaryWithOpenAI,
  generateReport as generateReportWithOpenAI,
} from './openai';

import {
  transcribeAudioWithGladia,
  checkGladiaConnection
} from './gladia';

// Import shared types from their own file
import type { TranscriptionResult, SummaryResult, ReportResult } from './ai-types';

import {
  generateSummaryWithOllama,
  generateReportWithOllama,
  checkOllamaConnection
} from './ollama';

export type AIProvider = 'openai' | 'ollama';
export type TranscriptionProvider = 'openai' | 'gladia';

const DEFAULT_AI_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
const DEFAULT_TRANSCRIPTION_PROVIDER: TranscriptionProvider = 'gladia'; // Changed default to Gladia

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

export async function getAvailableTranscriptionProviders(): Promise<{ openai: boolean; gladia: boolean }> {
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    gladia: true // Gladia is always available since we have the API key hardcoded
  };

  // Double-check Gladia connection if needed
  try {
    const gladiaAvailable = await checkGladiaConnection();
    providers.gladia = gladiaAvailable;
  } catch (error) {
    console.log('Gladia connection check failed:', error);
    // Keep gladia as true since we have the API key
    providers.gladia = true;
  }

  return providers;
}

export async function transcribeAudio(
  audioFile: File, 
  provider: TranscriptionProvider = DEFAULT_TRANSCRIPTION_PROVIDER
): Promise<TranscriptionResult> {
  const availableProviders = await getAvailableTranscriptionProviders();

  // Fallback logic: prefer Gladia if available, then OpenAI
  if (provider === 'gladia' && !availableProviders.gladia) {
    console.warn('Gladia not available, falling back to OpenAI');
    provider = 'openai';
  }

  if (provider === 'openai' && !availableProviders.openai) {
    console.warn('OpenAI not available, falling back to Gladia');
    provider = 'gladia';
  }

  // If neither is available, throw error
  if (!availableProviders.openai && !availableProviders.gladia) {
    throw new Error('No transcription provider available');
  }

  switch (provider) {
    case 'gladia':
      return transcribeAudioWithGladia(audioFile);
    case 'openai':
    default:
      if (!availableProviders.openai) {
        // Force use Gladia if OpenAI not available
        return transcribeAudioWithGladia(audioFile);
      }
      return transcribeWithOpenAI(audioFile);
  }
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

// Re-export the types for other parts of the application to use
export type { TranscriptionResult, SummaryResult, ReportResult, AIProvider, TranscriptionProvider };