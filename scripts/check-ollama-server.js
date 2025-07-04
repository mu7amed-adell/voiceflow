/**
 * Ollama Server Connection Checker
 * Validates Ollama server availability and model status
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function checkOllamaConnection() {
  console.log('🦙 Checking Ollama server connection...\n');

  try {
    // Test 1: Check if Ollama server is running
    console.log('1. Testing Ollama server availability...');
    const serverResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!serverResponse.ok) {
      throw new Error(`Server responded with status: ${serverResponse.status}`);
    }

    const serverData = await serverResponse.json();
    console.log('✅ Ollama server is running');
    console.log(`   URL: ${OLLAMA_BASE_URL}`);
    console.log(`   Available models: ${serverData.models?.length || 0}`);

    // Test 2: Check available models
    console.log('\n2. Checking available models...');
    if (serverData.models && serverData.models.length > 0) {
      console.log('✅ Models found:');
      serverData.models.forEach(model => {
        const isConfiguredModel = model.name.includes(OLLAMA_MODEL);
        const status = isConfiguredModel ? '🎯 (configured)' : '📦';
        console.log(`   ${status} ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
      });
    } else {
      console.log('⚠️  No models found');
      console.log('   Run: ollama pull llama3.2');
    }

    // Test 3: Check configured model
    console.log('\n3. Testing configured model...');
    const configuredModel = serverData.models?.find(model => 
      model.name.includes(OLLAMA_MODEL) || model.name === OLLAMA_MODEL
    );

    if (configuredModel) {
      console.log(`✅ Configured model "${OLLAMA_MODEL}" is available`);
      console.log(`   Size: ${(configuredModel.size / 1024 / 1024 / 1024).toFixed(1)}GB`);
      console.log(`   Modified: ${new Date(configuredModel.modified_at).toLocaleDateString()}`);
    } else {
      console.log(`⚠️  Configured model "${OLLAMA_MODEL}" not found`);
      console.log(`   Available models: ${serverData.models?.map(m => m.name).join(', ') || 'none'}`);
      console.log(`   Run: ollama pull ${OLLAMA_MODEL}`);
    }

    // Test 4: Test model inference
    console.log('\n4. Testing model inference...');
    try {
      const testResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: 'Hello, respond with just "OK"',
          stream: false,
          options: {
            num_predict: 5,
            temperature: 0.1
          }
        }),
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ Model inference test successful');
        console.log(`   Response: ${testData.response?.trim() || 'No response'}`);
      } else {
        throw new Error(`Inference test failed: ${testResponse.status}`);
      }
    } catch (inferenceError) {
      console.log('⚠️  Model inference test failed:', inferenceError.message);
      console.log('   Model may not be properly loaded');
    }

    console.log('\n🎉 Ollama connection check complete!');
    console.log('\n📊 Summary:');
    console.log(`   Server: ✅ Running at ${OLLAMA_BASE_URL}`);
    console.log(`   Models: ${serverData.models?.length || 0} available`);
    console.log(`   Configured: ${configuredModel ? '✅' : '⚠️'} ${OLLAMA_MODEL}`);

    return {
      available: true,
      serverRunning: true,
      modelsCount: serverData.models?.length || 0,
      configuredModelAvailable: !!configuredModel,
      url: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL
    };

  } catch (error) {
    console.log('❌ Ollama connection failed:', error.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Install Ollama:');
    console.log('   • macOS: brew install ollama');
    console.log('   • Linux: curl -fsSL https://ollama.ai/install.sh | sh');
    console.log('   • Windows: Download from https://ollama.ai');
    console.log('\n2. Start Ollama server:');
    console.log('   ollama serve');
    console.log('\n3. Pull a model:');
    console.log(`   ollama pull ${OLLAMA_MODEL}`);
    console.log('\n4. Verify installation:');
    console.log('   ollama list');
    console.log(`\n5. Test connection: curl ${OLLAMA_BASE_URL}/api/tags`);

    return {
      available: false,
      serverRunning: false,
      modelsCount: 0,
      configuredModelAvailable: false,
      url: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      error: error.message
    };
  }
}

module.exports = { checkOllamaConnection };

// Run check if called directly
if (require.main === module) {
  checkOllamaConnection();
}