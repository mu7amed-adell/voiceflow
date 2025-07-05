/**
 * Ollama Connection Test Script and Utility
 * This script tests the connection to a local Ollama server and provides a reusable check function.
 */
const path = require('path');

// Load environment variables from .env.local in the project root
require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
});

/**
 * Checks the connection to the Ollama server and model availability.
 * @returns {Promise<{available: boolean, error?: string, url?: string, model?: string}>}
 */
async function checkOllamaConnection() {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL;

    if (!ollamaModel) {
        return { available: false, error: 'Missing OLLAMA_MODEL in .env.local' };
    }

    try {
        // Use a very simple prompt to check if the model can generate a response.
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: 'Hello', // A minimal prompt for a health check
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = `API request failed with status ${response.status}`;
            if (errorBody.includes('model')) {
                errorMessage = `The model '${ollamaModel}' may not be pulled. Try 'ollama pull ${ollamaModel}'`;
            }
            return { available: false, error: errorMessage, url: ollamaUrl, model: ollamaModel };
        }
        
        await response.json(); // We just need to know it worked
        return { available: true, url: ollamaUrl, model: ollamaModel };

    } catch (error) {
        let errorMessage = error.message;
        if (error.cause?.code === 'ECONNREFUSED') {
            errorMessage = `Connection refused. Is the Ollama server running at ${ollamaUrl}?`;
        }
        return { available: false, error: errorMessage, url: ollamaUrl, model: ollamaModel };
    }
}

async function testOllamaChat() {
    console.log('🧪 Testing Ollama Model Inference...\n');

    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL;

    if (!ollamaModel) {
        console.error('❌ Missing OLLAMA_MODEL in your .env.local file.');
        console.log('   Please specify which model to test (e.g., OLLAMA_MODEL=llama3.2)');
        return;
    }

    console.log(`- Using Ollama URL: ${ollamaUrl}`);
    console.log(`- Using Ollama Model: ${ollamaModel}\n`);

    const prompt = "Hello, please tell me your model name and reply with a friendly greeting.";
    console.log(`💬 Sending prompt: "${prompt}"`);

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            // Try to parse the error for a better message
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.error && errorJson.error.includes('model')) {
                     console.error(`❌ API Error: The model '${ollamaModel}' was not found.`);
                     console.error(`   Please make sure you have pulled the model with 'ollama pull ${ollamaModel}'`);
                     return;
                }
            } catch (e) {
                // Not a JSON error, just throw the original
            }
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        console.log(`\n✅ Model Response:`);
        console.log(`   ${data.response.trim()}`);
        console.log('\n🎉 Inference test successful!');

    } catch (error) {
        console.error('\n❌ An error occurred during the inference test:');
        if (error.cause?.code === 'ECONNREFUSED') {
             console.error(`   - Connection refused. Is the Ollama server running at ${ollamaUrl}?`);
        } else {
             console.error(`   - ${error.message}`);
        }
        console.log('\n📋 Troubleshooting Steps:');
        console.log('   1. Ensure the Ollama application is running on your computer.');
        console.log(`   2. Verify the Ollama server is accessible at the URL: ${ollamaUrl}`);
        console.log('   3. Check that the model name in .env.local is correct and has been pulled.');
    }
}


// Export the check function for other scripts to use
module.exports = { checkOllamaConnection, testOllamaChat };

// Run the test chat if called directly
if (require.main === module) {
  testOllamaChat();
}