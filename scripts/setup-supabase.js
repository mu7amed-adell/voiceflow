/**
 * Supabase Setup Script
 * This script helps you set up your Supabase project and add sample data
 */

require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { checkOllamaConnection } = require('./check-ollama-server');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('\n📋 Setup Instructions:');
  console.log('1. Create a .env.local file in your project root');
  console.log('2. Add your Supabase credentials:');
  console.log('\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  console.log('OPENAI_API_KEY=your_openai_api_key');
  console.log('OLLAMA_BASE_URL=http://localhost:11434');
  console.log('OLLAMA_MODEL=llama3.2');
  console.log('\n3. Get these values from your Supabase dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample recordings data
const sampleRecordings = [
  {
    title: 'Team Meeting Notes - Q1 Planning',
    duration: 1847,
    audio_url: 'https://example.com/sample-audio-1.webm',
    file_size: 2456789,
    status: 'completed',
    transcription_content: 'Good morning everyone, thank you for joining today\'s Q1 planning meeting. We have several important topics to cover including our product roadmap, budget allocation, and team objectives for the upcoming quarter. Let\'s start with the product roadmap. Sarah, could you walk us through the key features we\'re planning to release? Absolutely, thanks John. We have three major features planned for Q1. First is the new user dashboard which will provide better analytics and insights. Second is the mobile app optimization that our users have been requesting. And third is the integration with third-party tools that will streamline workflows.',
    transcription_confidence: 94,
    transcription_language: 'en',
    transcription_speaker_count: 3,
    summary_content: 'This Q1 planning meeting covered three main areas: product roadmap, budget allocation, and team objectives. The product team outlined three major features for release: a new user dashboard with enhanced analytics, mobile app optimization, and third-party tool integrations. The discussion emphasized user-requested improvements and workflow streamlining.',
    summary_key_points: [
      'Three major features planned for Q1 release',
      'New user dashboard with better analytics and insights',
      'Mobile app optimization based on user feedback',
      'Third-party tool integrations for workflow improvement',
      'Focus on user-requested features and improvements'
    ],
    summary_topics: ['Product Planning', 'Q1 Roadmap', 'User Experience', 'Mobile Optimization', 'Integrations'],
    summary_sentiment_score: 0.3,
    report_content: 'This meeting demonstrates excellent collaborative planning with clear communication and structured agenda management. The team shows strong alignment on priorities and user-focused development approach. Speaking patterns indicate engaged participation from multiple team members with balanced contribution levels.',
    report_insights: [
      'Clear agenda structure improved meeting efficiency',
      'Multiple speakers contributed balanced perspectives',
      'User-centric approach evident in feature prioritization',
      'Strong team alignment on quarterly objectives'
    ],
    report_metrics: {
      speakingTime: 78,
      pauseFrequency: 15,
      averageResponseTime: 2.3,
      sentimentTrend: 'positive'
    },
    report_action_items: [
      'Sarah to provide detailed timeline for dashboard feature',
      'Schedule mobile optimization user testing sessions',
      'Research and evaluate third-party integration options',
      'Set up weekly check-ins for Q1 progress tracking'
    ],
    report_sentiment_analysis: {
      overall: 'positive',
      confidence: 0.85,
      emotions: ['focused', 'collaborative', 'optimistic']
    }
  },
  {
    title: 'Client Feedback Session - Product Demo',
    duration: 892,
    audio_url: 'https://example.com/sample-audio-2.webm',
    file_size: 1234567,
    status: 'completed',
    transcription_content: 'Thank you for taking the time to review our product demo. I\'d love to get your thoughts and feedback on what you\'ve seen so far. The interface looks really clean and intuitive. I particularly like how easy it is to navigate between different sections. The dashboard gives a great overview of all the key metrics we need. One thing I\'d suggest is maybe adding some customization options for the widgets. That would be really helpful for different user types. That\'s excellent feedback, thank you. Customization is definitely something we\'ve been considering. What specific widgets would you want to customize?',
    transcription_confidence: 96,
    transcription_language: 'en',
    transcription_speaker_count: 2,
    summary_content: 'Client feedback session revealed positive reception of the product demo, particularly praising the clean interface and intuitive navigation. The client appreciated the dashboard\'s comprehensive metric overview and suggested adding widget customization options for different user types. This feedback aligns with user-centric design principles.',
    summary_key_points: [
      'Clean and intuitive interface design received positive feedback',
      'Dashboard provides comprehensive metric overview',
      'Navigation between sections is user-friendly',
      'Client requested widget customization options',
      'Different user types would benefit from personalization'
    ],
    summary_topics: ['User Interface', 'Dashboard Design', 'Client Feedback', 'Customization', 'User Experience'],
    summary_sentiment_score: 0.6,
    report_content: 'This client feedback session demonstrates effective product presentation and receptive client engagement. The conversation flow shows good listening skills and follow-up questioning. The client\'s constructive feedback indicates genuine interest and potential for successful partnership.',
    report_insights: [
      'Client shows high engagement with positive feedback',
      'Constructive suggestions indicate serious consideration',
      'Good balance of presentation and interactive discussion',
      'Follow-up questions demonstrate active listening'
    ],
    report_metrics: {
      speakingTime: 65,
      pauseFrequency: 8,
      averageResponseTime: 1.8,
      sentimentTrend: 'very positive'
    },
    report_action_items: [
      'Research widget customization implementation options',
      'Create user persona-based customization mockups',
      'Schedule follow-up meeting to present customization concepts',
      'Document specific widget customization requirements'
    ],
    report_sentiment_analysis: {
      overall: 'very positive',
      confidence: 0.92,
      emotions: ['satisfied', 'interested', 'constructive']
    }
  },
  {
    title: 'Personal Voice Note - Daily Reflection',
    duration: 234,
    audio_url: 'https://example.com/sample-audio-3.webm',
    file_size: 456789,
    status: 'processing',
    transcription_content: 'Today was a really productive day. I managed to complete the quarterly report ahead of schedule and had a great brainstorming session with the design team. We came up with some innovative ideas for the user interface redesign. I\'m feeling optimistic about the direction we\'re heading. Tomorrow I need to follow up on the client proposals and prepare for the board presentation. I should also remember to schedule that one-on-one with Sarah to discuss her career development goals.',
    transcription_confidence: 98,
    transcription_language: 'en',
    transcription_speaker_count: 1,
    summary_content: null,
    summary_key_points: null,
    summary_topics: null,
    summary_sentiment_score: null,
    report_content: null,
    report_insights: null,
    report_metrics: null,
    report_action_items: null,
    report_sentiment_analysis: null
  }
];

async function setupSupabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Test connection
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.from('recordings').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n📋 Setup Checklist:');
      console.log('   □ Create Supabase project at https://supabase.com');
      console.log('   □ Run the migration SQL in your Supabase SQL Editor');
      console.log('   □ Add your credentials to .env.local');
      console.log('   □ Create storage bucket named "audio-recordings"');
      console.log('\n🔗 Visit /setup for a detailed setup guide');
      return;
    }
    
    console.log('✅ Connection successful!');

    // Check if we already have data
    console.log('\n2. Checking existing data...');
    const { data: existingRecordings } = await supabase
      .from('recordings')
      .select('id, title')
      .limit(5);

    if (existingRecordings && existingRecordings.length > 0) {
      console.log(`✅ Found ${existingRecordings.length} existing recordings:`);
      existingRecordings.forEach(recording => {
        console.log(`   - ${recording.title}`);
      });
      console.log('\n✨ Database already has data. Setup complete!');
      return;
    }

    // Add sample data
    console.log('\n3. Adding sample recordings...');
    const { data: insertedRecordings, error: insertError } = await supabase
      .from('recordings')
      .insert(sampleRecordings)
      .select();

    if (insertError) {
      console.error('❌ Failed to insert sample data:', insertError.message);
      return;
    }

    console.log(`✅ Successfully added ${insertedRecordings.length} sample recordings!`);
    
    console.log('\n📊 Sample Data Added:');
    insertedRecordings.forEach((recording, index) => {
      console.log(`   ${index + 1}. ${recording.title} (${recording.status})`);
    });

    // Check AI providers
    console.log('\n4. Checking AI provider availability...');
    
    // Check OpenAI
    const hasOpenAI = process.env.OPENAI_API_KEY;
    if (hasOpenAI) {
      console.log('✅ OpenAI: Configured for cloud AI processing');
    } else {
      console.log('⚠️  OpenAI: Not configured (add OPENAI_API_KEY)');
    }

    // Check Ollama
    const ollamaResult = await checkOllamaConnection();
    if (ollamaResult.available) {
      console.log('✅ Ollama: Available for local AI processing');
    } else {
      console.log('⚠️  Ollama: Not available (install and start Ollama server)');
    }

    console.log('\n🎉 Supabase setup complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Create storage bucket "audio-recordings" in Supabase dashboard');
    
    if (!hasOpenAI && !ollamaResult.available) {
      console.log('   2. Configure at least one AI provider:');
      console.log('      • OpenAI: Add OPENAI_API_KEY to .env.local');
      console.log('      • Ollama: Install and start Ollama server');
    } else if (!hasOpenAI) {
      console.log('   2. Optional: Add OpenAI API key for best transcription accuracy');
    } else if (!ollamaResult.available) {
      console.log('   2. Optional: Install Ollama for local AI processing');
    }
    
    console.log('   3. Start the development server: npm run dev');
    console.log('   4. Test recording functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔗 Visit /setup for a detailed setup guide');
  }
}

// Run setup
setupSupabase();