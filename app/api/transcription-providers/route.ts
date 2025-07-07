import { NextResponse } from 'next/server';
import { getAvailableTranscriptionProviders } from '@/lib/services/ai-service';

export async function GET() {
  try {
    const providers = await getAvailableTranscriptionProviders();
    
    return NextResponse.json({
      providers,
      default: 'openai'
    });
  } catch (error) {
    console.error('Error checking transcription providers:', error);
    return NextResponse.json(
      { error: 'Failed to check transcription providers' },
      { status: 500 }
    );
  }
}