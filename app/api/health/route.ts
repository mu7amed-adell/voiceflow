import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getAvailableAIProviders } from '@/lib/services/ai-service';

export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('recordings')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Check AI providers
    const aiProviders = await getAvailableAIProviders();

    // Check if at least one AI provider is available
    const hasAIProvider = aiProviders.openai || aiProviders.ollama;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        storage: 'available',
        ai_providers: {
          openai: aiProviders.openai ? 'available' : 'unavailable',
          ollama: aiProviders.ollama ? 'available' : 'unavailable',
          any_available: hasAIProvider
        }
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}