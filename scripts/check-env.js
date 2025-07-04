/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */
require('dotenv').config({ path: '../.env.local' });

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...\n');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const optionalVars = [
    'OPENAI_API_KEY',
    'OLLAMA_BASE_URL',
    'OLLAMA_MODEL',
    'AI_PROVIDER'
  ];

  const missingRequired = [];
  const presentRequired = [];
  const presentOptional = [];
  const missingOptional = [];

  // Check required variables
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      presentRequired.push(varName);
      console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
    } else {
      missingRequired.push(varName);
      console.log(`❌ ${varName}: Not set`);
    }
  });

  console.log('\n📋 Optional Variables (AI Providers):');
  
  // Check optional variables
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      presentOptional.push(varName);
      const value = varName.includes('KEY') 
        ? `${process.env[varName].substring(0, 10)}...` 
        : process.env[varName];
      console.log(`✅ ${varName}: ${value}`);
    } else {
      missingOptional.push(varName);
      console.log(`⚠️  ${varName}: Not set (optional)`);
    }
  });

  console.log('\n📊 Summary:');
  console.log(`✅ Required Present: ${presentRequired.length}/${requiredVars.length}`);
  console.log(`❌ Required Missing: ${missingRequired.length}/${requiredVars.length}`);
  console.log(`✅ Optional Present: ${presentOptional.length}/${optionalVars.length}`);
  console.log(`⚠️  Optional Missing: ${missingOptional.length}/${optionalVars.length}`);

  // AI Provider Analysis
  console.log('\n🤖 AI Provider Analysis:');
  const hasOpenAI = process.env.OPENAI_API_KEY;
  const hasOllama = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL;
  
  if (hasOpenAI) {
    console.log('✅ OpenAI: Configured (cloud AI available)');
  } else {
    console.log('⚠️  OpenAI: Not configured (add OPENAI_API_KEY)');
  }
  
  if (hasOllama) {
    console.log('✅ Ollama: Configured (local AI available)');
    console.log(`   URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
    console.log(`   Model: ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
  } else {
    console.log('⚠️  Ollama: Not configured (add OLLAMA_BASE_URL and OLLAMA_MODEL)');
  }

  if (!hasOpenAI && !hasOllama) {
    console.log('🚨 No AI providers configured! At least one is required.');
  }

  if (missingRequired.length > 0) {
    console.log('\n🚨 Missing Required Environment Variables:');
    missingRequired.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n📋 Setup Instructions:');
    console.log('1. Create .env.local file in project root');
    console.log('2. Add the missing variables with your actual values:');
    console.log('\n# Supabase Configuration (Required)');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
    console.log('\n# AI Providers (At least one required)');
    console.log('OPENAI_API_KEY=your_openai_api_key');
    console.log('OLLAMA_BASE_URL=http://localhost:11434');
    console.log('OLLAMA_MODEL=llama3.2');
    console.log('\n3. Restart the development server');
    
    return false;
  }

  if (!hasOpenAI && !hasOllama) {
    console.log('\n⚠️  Warning: No AI providers configured');
    console.log('Add at least one AI provider:');
    console.log('• OpenAI: Add OPENAI_API_KEY for cloud AI');
    console.log('• Ollama: Add OLLAMA_BASE_URL and OLLAMA_MODEL for local AI');
    return false;
  }

  console.log('\n🎉 Environment configuration is valid!');
  return true;
}

module.exports = { checkEnvironmentVariables };

// Run check if called directly
if (require.main === module) {
  checkEnvironmentVariables();
}