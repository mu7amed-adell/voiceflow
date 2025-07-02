/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...\n');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ];

  const missingVars = [];
  const presentVars = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      presentVars.push(varName);
      console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
    } else {
      missingVars.push(varName);
      console.log(`❌ ${varName}: Not set`);
    }
  });

  console.log('\n📊 Summary:');
  console.log(`✅ Present: ${presentVars.length}/${requiredVars.length}`);
  console.log(`❌ Missing: ${missingVars.length}/${requiredVars.length}`);

  if (missingVars.length > 0) {
    console.log('\n🚨 Missing Environment Variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n📋 Setup Instructions:');
    console.log('1. Create .env.local file in project root');
    console.log('2. Add the missing variables with your actual values');
    console.log('3. Restart the development server');
    
    return false;
  }

  console.log('\n🎉 All environment variables are set!');
  return true;
}

module.exports = { checkEnvironmentVariables };

// Run check if called directly
if (require.main === module) {
  checkEnvironmentVariables();
}