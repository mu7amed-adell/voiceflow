import type { TranscriptionResult } from './ai-types';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || 'hf_demo'; // You can set this in .env.local
const HUGGINGFACE_MODEL = 'MohamedRashad/Arabic-Whisper-CodeSwitching-Edition';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

interface HuggingFaceResponse {
  text: string;
}

export async function transcribeAudioWithHuggingFace(audioFile: File): Promise<TranscriptionResult> {
  try {
    console.log('Starting Hugging Face Arabic Whisper transcription...');
    
    // Convert file to ArrayBuffer for API
    const audioBuffer = await audioFile.arrayBuffer();
    
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'audio/wav', // Hugging Face expects audio content type
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle model loading case
      if (response.status === 503) {
        throw new Error('Model is loading, please try again in a few minutes');
      }
      
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result: HuggingFaceResponse = await response.json();
    
    if (!result.text) {
      throw new Error('No transcription text returned from Hugging Face');
    }

    console.log('Hugging Face transcription completed successfully');

    // Since this is a specialized Arabic model, we can assume high confidence for Arabic content
    // and detect if the content contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(result.text);
    const confidence = hasArabic ? 95 : 85; // Higher confidence for Arabic content
    
    return {
      content: result.text.trim(),
      confidence: confidence,
      language: hasArabic ? 'ar' : 'en', // Detect Arabic vs English/code-switching
      speakerCount: 1, // Basic implementation - Hugging Face Inference API doesn't provide speaker diarization
      timestamps: undefined // Hugging Face Inference API doesn't provide word-level timestamps
    };

  } catch (error) {
    console.error('Hugging Face transcription error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Model is loading')) {
        throw new Error('Arabic Whisper model is loading. Please try again in 2-3 minutes.');
      }
      throw new Error(`Failed to transcribe with Arabic Whisper: ${error.message}`);
    }
    
    throw new Error('Failed to transcribe audio with Hugging Face Arabic Whisper');
  }
}

export async function checkHuggingFaceConnection(): Promise<boolean> {
  try {
    // Test with a simple request to check if the model is available
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body to test connection
    });
    
    // Model is available if we get any response (even errors are ok, means API is reachable)
    // 503 means model is loading, which is still "available"
    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    console.error('Hugging Face connection check failed:', error);
    return false;
  }
}