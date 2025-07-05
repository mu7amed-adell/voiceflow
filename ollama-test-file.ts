import dotenv from 'dotenv';
import path from 'path';
import { 
  checkOllamaConnection, 
  generateSummaryWithOllama, 
  generateReportWithOllama,
  transcribeAudioWithOllama,
  type TranscriptionResult,
  type SummaryResult,
  type ReportResult
} from './lib/services/ollama';

// Load environment variables from the root .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Test configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL; // Default model, can be changed in .env.local

// Sample test data
const SAMPLE_TRANSCRIPTION = `
Hello everyone, welcome to today's team meeting. I'm excited to share our quarterly results with you. 
We've achieved a 15% increase in sales compared to last quarter, which is fantastic news. 
Our customer satisfaction scores have also improved significantly, reaching 4.2 out of 5. 
However, we did face some challenges with our supply chain, which caused minor delays in product delivery. 
Moving forward, we need to focus on streamlining our operations and improving our inventory management. 
I want to thank everyone for their hard work and dedication. Let's continue this momentum into the next quarter.
`;

// Test utilities
export function logTest(testName: string, status: 'PASS' | 'FAIL' | 'SKIP' | 'INFO', message?: string) {
  const timestamp = new Date().toISOString();
  const statusColor = {
    'PASS': '\x1b[32m', // Green
    'FAIL': '\x1b[31m', // Red
    'SKIP': '\x1b[33m', // Yellow
    'INFO': '\x1b[36m'  // Cyan
  };
  const resetColor = '\x1b[0m';
  
  console.log(`[${timestamp}] ${statusColor[status]}${status}${resetColor} - ${testName}${message ? ': ' + message : ''}`);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
export async function testOllamaConnection(): Promise<boolean> {
  logTest('Connection Test', 'INFO', 'Testing Ollama server connection...');
  
  try {
    const isConnected = await checkOllamaConnection();
    if (isConnected) {
      logTest('Connection Test', 'PASS', `Successfully connected to ${OLLAMA_BASE_URL}`);
      return true;
    } else {
      logTest('Connection Test', 'FAIL', `Cannot connect to ${OLLAMA_BASE_URL}`);
      return false;
    }
  } catch (error) {
    logTest('Connection Test', 'FAIL', `Connection error: ${error}`);
    return false;
  }
}

export async function testModelAvailability(): Promise<boolean> {
  logTest('Model Availability Test', 'INFO', `Checking if model ${OLLAMA_MODEL} is available...`);
  
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      logTest('Model Availability Test', 'FAIL', `API error: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    const models = data.models || [];
    const modelExists = models.some((model: any) => model.name === OLLAMA_MODEL);
    
    if (modelExists) {
      logTest('Model Availability Test', 'PASS', `Model ${OLLAMA_MODEL} is available`);
      return true;
    } else {
      logTest('Model Availability Test', 'FAIL', `Model ${OLLAMA_MODEL} not found`);
      logTest('Available Models', 'INFO', models.map((m: any) => m.name).join(', '));
      return false;
    }
  } catch (error) {
    logTest('Model Availability Test', 'FAIL', `Error checking models: ${error}`);
    return false;
  }
}

export async function testSummaryGeneration(): Promise<boolean> {
  logTest('Summary Generation Test', 'INFO', 'Testing summary generation...');
  
  try {
    const startTime = Date.now();
    const summary: SummaryResult = await generateSummaryWithOllama(SAMPLE_TRANSCRIPTION);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Validate the response structure
    if (!summary.content || !Array.isArray(summary.keyPoints) || !Array.isArray(summary.topics)) {
      logTest('Summary Generation Test', 'FAIL', 'Invalid response structure');
      return false;
    }
    
    // Validate sentiment score is within expected range
    if (typeof summary.sentimentScore !== 'number' || summary.sentimentScore < -1 || summary.sentimentScore > 1) {
      logTest('Summary Generation Test', 'FAIL', `Invalid sentiment score: ${summary.sentimentScore}`);
      return false;
    }
    
    logTest('Summary Generation Test', 'PASS', `Generated in ${duration}ms`);
    logTest('Summary Content', 'INFO', summary.content.substring(0, 100) + '...');
    logTest('Key Points Count', 'INFO', `${summary.keyPoints.length} key points`);
    logTest('Topics Count', 'INFO', `${summary.topics.length} topics`);
    logTest('Sentiment Score', 'INFO', `${summary.sentimentScore}`);
    
    return true;
  } catch (error) {
    logTest('Summary Generation Test', 'FAIL', `Error: ${error}`);
    return false;
  }
}

export async function testReportGeneration(): Promise<boolean> {
  logTest('Report Generation Test', 'INFO', 'Testing report generation...');
  
  try {
    // First generate a summary to use for the report
    const summary: SummaryResult = await generateSummaryWithOllama(SAMPLE_TRANSCRIPTION);
    
    const startTime = Date.now();
    const report: ReportResult = await generateReportWithOllama(SAMPLE_TRANSCRIPTION, summary);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Validate the response structure
    if (!report.content || !Array.isArray(report.insights) || !Array.isArray(report.actionItems)) {
      logTest('Report Generation Test', 'FAIL', 'Invalid response structure');
      return false;
    }
    
    // Validate metrics object
    if (!report.metrics || typeof report.metrics !== 'object') {
      logTest('Report Generation Test', 'FAIL', 'Invalid metrics structure');
      return false;
    }
    
    // Validate sentiment analysis
    if (!report.sentimentAnalysis || !report.sentimentAnalysis.overall) {
      logTest('Report Generation Test', 'FAIL', 'Invalid sentiment analysis structure');
      return false;
    }
    
    logTest('Report Generation Test', 'PASS', `Generated in ${duration}ms`);
    logTest('Report Content', 'INFO', report.content.substring(0, 100) + '...');
    logTest('Insights Count', 'INFO', `${report.insights.length} insights`);
    logTest('Action Items Count', 'INFO', `${report.actionItems.length} action items`);
    logTest('Overall Sentiment', 'INFO', report.sentimentAnalysis.overall);
    
    return true;
  } catch (error) {
    logTest('Report Generation Test', 'FAIL', `Error: ${error}`);
    return false;
  }
}

export async function testTranscriptionFunction(): Promise<boolean> {
  logTest('Transcription Function Test', 'INFO', 'Testing transcription function...');
  
  try {
    const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
    await transcribeAudioWithOllama(mockFile);
    
    // This should not reach here as the function should throw an error
    logTest('Transcription Function Test', 'FAIL', 'Function should have thrown an error');
    return false;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Audio transcription with Ollama requires additional setup')) {
      logTest('Transcription Function Test', 'PASS', 'Correctly throws expected error');
      return true;
    } else {
      logTest('Transcription Function Test', 'FAIL', `Unexpected error: ${error}`);
      return false;
    }
  }
}

export async function testPerformance(): Promise<boolean> {
  logTest('Performance Test', 'INFO', 'Testing performance with multiple requests...');
  
  try {
    const requests = 3;
    const startTime = Date.now();
    
    const promises = Array.from({ length: requests }, () => 
      generateSummaryWithOllama(SAMPLE_TRANSCRIPTION)
    );
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    const avgDuration = totalDuration / requests;
    
    if (results.length === requests && results.every(r => r.content)) {
      logTest('Performance Test', 'PASS', `${requests} requests completed in ${totalDuration}ms (avg: ${avgDuration}ms)`);
      return true;
    } else {
      logTest('Performance Test', 'FAIL', 'Some requests failed');
      return false;
    }
  } catch (error) {
    logTest('Performance Test', 'FAIL', `Error: ${error}`);
    return false;
  }
}

// Main test runner
export async function runAllTests(): Promise<void> {
  console.log('🚀 Starting Ollama Service Tests\n');
  console.log(`Configuration:`);
  console.log(`- Base URL: ${OLLAMA_BASE_URL}`);
  console.log(`- Model: ${OLLAMA_MODEL}\n`);
  
  const testResults: { [key: string]: boolean } = {};
  
  // Test 1: Connection
  testResults['connection'] = await testOllamaConnection();
  
  if (!testResults['connection']) {
    logTest('Test Suite', 'FAIL', 'Connection failed - skipping remaining tests');
    console.log('\n❌ Test suite failed - Ollama server not accessible');
    return;
  }
  
  // Test 2: Model availability
  testResults['model'] = await testModelAvailability();
  
  if (!testResults['model']) {
    logTest('Test Suite', 'FAIL', 'Model not available - skipping generation tests');
    console.log('\n❌ Test suite failed - Required model not available');
    return;
  }
  
  await sleep(1000); // Brief pause between tests
  
  // Test 3: Summary generation
  testResults['summary'] = await testSummaryGeneration();
  
  await sleep(1000);
  
  // Test 4: Report generation
  testResults['report'] = await testReportGeneration();
  
  await sleep(1000);
  
  // Test 5: Transcription function
  testResults['transcription'] = await testTranscriptionFunction();
  
  await sleep(1000);
  
  // Test 6: Performance
  testResults['performance'] = await testPerformance();
  
  // Results summary
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test}`);
  });
  
  console.log(`\n${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Ollama service is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
    process.exit(1);
  }
}

// Command line interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      await runAllTests();
      break;
    case 'connection':
      await testOllamaConnection();
      break;
    case 'summary':
      await testSummaryGeneration();
      break;
    case 'report':
      await testReportGeneration();
      break;
    case 'performance':
      await testPerformance();
      break;
    default:
      console.log('Usage: tsx ollama-tests.ts [command]');
      console.log('Commands:');
      console.log('  test         - Run all tests');
      console.log('  connection   - Test Ollama connection only');
      console.log('  summary      - Test summary generation only');
      console.log('  report       - Test report generation only');
      console.log('  performance  - Test performance only');
      break;
  }
}

// Run the main function
main().catch(console.error);




// npm install --save-dev tsx
// npx tsx scripts/ollama-test-file.ts test
