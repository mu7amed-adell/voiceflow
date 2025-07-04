import { NextResponse } from 'next/server';
import { getAvailableAIProviders } from '@/lib/services/ai-service';

export async function GET() {
  try {
    const providers = await getAvailableAIProviders();
    
    return NextResponse.json({
      providers,
      default: process.env.AI_PROVIDER || 'openai'
    });
  } catch (error) {
    console.error('Error checking AI providers:', error);
    return NextResponse.json(
      { error: 'Failed to check AI providers' },
      { status: 500 }
    );
  }
}