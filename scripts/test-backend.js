/**
 * Backend Testing Script
 * Tests the complete audio processing pipeline including AI providers
 */
require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { checkOllamaConnection } = require('./test-ollama-server.js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required Supabase environment variables');
  console.log('Please ensure SUPABASE credentials are set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testBackend() {
  console.log('🧪 Testing Backend Architecture...\n');

  const results = {
    database: false,
    storage: false,
    api: false,
    openai: false,
    ollama: false,
    dataFlow: false
  };

  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('recordings').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
      results.database = true;
    }

    // Test 2: Storage Connection
    console.log('\n2. Testing storage connection...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Storage connection failed:', storageError.message);
    } else {
      const audioBucket = buckets.find(bucket => bucket.name === 'audio-recordings');
      if (!audioBucket) {
        console.log('⚠️  Audio recordings bucket not found');
        console.log('   Create bucket "audio-recordings" in Supabase dashboard');
      } else {
        console.log('✅ Storage connection successful');
        results.storage = true;
      }
    }

    // Test 3: API Endpoints
    console.log('\n3. Testing API endpoints...');
    try {
      const response = await fetch('http://localhost:3000/api/recordings');
      if (response.ok) {
        console.log('✅ Recordings API endpoint working');
        results.api = true;
      } else {
        console.log('⚠️  Recordings API endpoint not responding (server may not be running)');
      }
    } catch (error) {
      console.log('⚠️  Cannot test API endpoints (development server not running)');
      console.log('   Start server with: npm run dev');
    }

    // Test 4: OpenAI Connection
    console.log('\n4. Testing OpenAI connection...');
    if (OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        });
        
        if (completion.choices[0].message.content) {
          console.log('✅ OpenAI connection successful');
          results.openai = true;
        }
      } catch (error) {
        console.error('❌ OpenAI connection failed:', error.message);
        console.log('   Check your OPENAI_API_KEY and account credits');
      }
    } else {
      console.log('⚠️  OpenAI API key not configured');
      console.log('   Add OPENAI_API_KEY to .env.local for cloud AI');
    }

    // Test 5: Ollama Connection
    console.log('\n5. Testing Ollama connection...');
    const ollamaResult = await checkOllamaConnection();
    if (ollamaResult.available) {
      console.log('✅ Ollama connection successful');
      results.ollama = true;
    } else {
      console.log(`⚠️  Ollama not available: ${ollamaResult.error}`);
    }

    // Test 6: Data Flow
    console.log('\n6. Testing data flow...');
    const { data: recordings } = await supabase
      .from('recordings')
      .select('*')
      .limit(3);

    if (recordings && recordings.length > 0) {
      console.log(`✅ Found ${recordings.length} recordings in database`);
      
      const completedRecordings = recordings.filter(r => r.status === 'completed');
      const processingRecordings = recordings.filter(r => r.status === 'processing');
      
      console.log(`   - ${completedRecordings.length} completed recordings`);
      console.log(`   - ${processingRecordings.length} processing recordings`);
      
      if (completedRecordings.length > 0) {
        const sample = completedRecordings[0];
        console.log('\n📊 Sample completed recording:');
        console.log(`   Title: ${sample.title}`);
        console.log(`   Transcription: ${sample.transcription_content ? '✅' : '❌'}`);
        console.log(`   Summary: ${sample.summary_content ? '✅' : '❌'}`);
        console.log(`   Report: ${sample.report_content ? '✅' : '❌'}`);
      }
      results.dataFlow = true;
    } else {
      console.log('⚠️  No recordings found in database');
      console.log('   Run: npm run setup:supabase to add sample data');
    }

    // Summary
    console.log('\n🎉 Backend testing complete!');
    console.log('\n📊 Test Results Summary:');
    console.log(`   Database: ${results.database ? '✅' : '❌'} ${results.database ? 'Connected' : 'Failed'}`);
    console.log(`   Storage: ${results.storage ? '✅' : '❌'} ${results.storage ? 'Connected' : 'Failed'}`);
    console.log(`   API: ${results.api ? '✅' : '⚠️'} ${results.api ? 'Working' : 'Not tested'}`);
    console.log(`   OpenAI: ${results.openai ? '✅' : '⚠️'} ${results.openai ? 'Connected' : 'Not configured'}`);
    console.log(`   Ollama: ${results.ollama ? '✅' : '⚠️'} ${results.ollama ? 'Connected' : 'Not available'}`);
    console.log(`   Data Flow: ${results.dataFlow ? '✅' : '❌'} ${results.dataFlow ? 'Working' : 'Failed'}`);

    // AI Provider Status
    console.log('\n🤖 AI Provider Status:');
    if (results.openai && results.ollama) {
      console.log('🎉 Both AI providers available - Full functionality enabled!');
    } else if (results.openai) {
      console.log('☁️  OpenAI only - Cloud AI processing available');
    } else if (results.ollama) {
      console.log('🏠 Ollama only - Local AI processing available');
    } else {
      console.log('⚠️  No AI providers available - Limited functionality');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!results.openai && !results.ollama) {
      console.log('   🚨 Configure at least one AI provider for full functionality');
    }
    if (!results.openai) {
      console.log('   ☁️  Add OpenAI API key for best transcription accuracy');
    }
    if (!results.ollama) {
      console.log('   🏠 Install Ollama for privacy-focused local AI processing');
    }
    if (!results.storage) {
      console.log('   📦 Create "audio-recordings" bucket in Supabase dashboard');
    }

    return results;

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    return results;
  }
}

// Run tests
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend };