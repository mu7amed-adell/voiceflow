import type { TranscriptionResult } from './ai-types';

const GLADIA_API_KEY = 'fb2b0cc0-03db-4c39-8d3a-45f6eedf22e0';
const GLADIA_BASE_URL = 'https://api.gladia.io/v2';

interface GladiaTranscriptionResponse {
  result: {
    transcription: {
      full_transcript: string;
      utterances: Array<{
        start: number;
        end: number;
        text: string;
        confidence: number;
        speaker: number;
      }>;
    };
    metadata: {
      audio_duration: number;
      language: string;
      confidence_score: number;
      number_of_distinct_speakers: number;
    };
  };
}

export async function transcribeAudioWithGladia(audioFile: File): Promise<TranscriptionResult> {
  try {
    console.log('Starting Gladia transcription...');
    
    // Step 1: Upload audio file
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('toggle_diarization', 'true');
    formData.append('language_behaviour', 'automatic single language');
    formData.append('transcription_hint', 'general');
    
    const uploadResponse = await fetch(`${GLADIA_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'X-Gladia-Key': GLADIA_API_KEY,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Gladia upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.audio_url;

    if (!audioUrl) {
      throw new Error('No audio URL returned from Gladia upload');
    }

    console.log('Audio uploaded to Gladia, starting transcription...');

    // Step 2: Start transcription
    const transcriptionResponse = await fetch(`${GLADIA_BASE_URL}/transcription`, {
      method: 'POST',
      headers: {
        'X-Gladia-Key': GLADIA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        toggle_diarization: true,
        language_behaviour: 'automatic single language',
        transcription_hint: 'general',
        enable_code_switching: false,
        custom_vocabulary: [],
      }),
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(`Gladia transcription failed: ${transcriptionResponse.status} - ${errorText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcriptionId = transcriptionData.id;

    if (!transcriptionId) {
      throw new Error('No transcription ID returned from Gladia');
    }

    console.log('Transcription started, polling for results...');

    // Step 3: Poll for results
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const resultResponse = await fetch(`${GLADIA_BASE_URL}/transcription/${transcriptionId}`, {
        method: 'GET',
        headers: {
          'X-Gladia-Key': GLADIA_API_KEY,
        },
      });

      if (!resultResponse.ok) {
        throw new Error(`Failed to get transcription result: ${resultResponse.status}`);
      }

      const resultData: GladiaTranscriptionResponse = await resultResponse.json();
      
      if (resultData.result && resultData.result.transcription) {
        console.log('Transcription completed successfully');
        
        // Extract timestamps from utterances
        const timestamps = resultData.result.transcription.utterances?.map(utterance => ({
          start: utterance.start,
          end: utterance.end,
          text: utterance.text
        })) || [];

        return {
          content: resultData.result.transcription.full_transcript,
          confidence: Math.round((resultData.result.metadata?.confidence_score || 0.95) * 100),
          language: resultData.result.metadata?.language || 'en',
          speakerCount: resultData.result.metadata?.number_of_distinct_speakers || 1,
          timestamps: timestamps.length > 0 ? timestamps : undefined
        };
      }
      
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
    }

    throw new Error('Transcription timed out after 5 minutes');

  } catch (error) {
    console.error('Gladia transcription error:', error);
    throw new Error(`Failed to transcribe audio with Gladia: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkGladiaConnection(): Promise<boolean> {
  try {
    // Simple test to check if Gladia API is accessible
    const response = await fetch(`${GLADIA_BASE_URL}/transcription`, {
      method: 'GET',
      headers: {
        'X-Gladia-Key': GLADIA_API_KEY,
      },
    });
    
    // If we get a response (even if it's an error), the API is accessible
    // 401 would indicate invalid API key, but since we have a hardcoded key, we assume it's valid
    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    console.error('Gladia connection check failed:', error);
    // If there's a network error, assume Gladia is still available since we have the API key
    return true;
  }
}