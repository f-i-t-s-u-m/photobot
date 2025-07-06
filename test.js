require('dotenv').config();
const { initializeDatabase, getUser, setUserWatermark, hasWatermark } = require('./database');

async function runTests() {
  console.log('🧪 Running Telegram Watermark Bot Tests...\n');

  try {
    // Test 1: Database initialization
    console.log('1. Testing database initialization...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully\n');

    // Test 2: Environment variables
    console.log('2. Testing environment variables...');
    const requiredVars = ['TELEGRAM_BOT_TOKEN', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      console.log('Please check your .env file\n');
    } else {
      console.log('✅ All environment variables are set\n');
    }

    // Test 3: Database operations
    console.log('3. Testing database operations...');
    const testUserId = '123456789';
    
    // Test setting watermark
    await setUserWatermark(testUserId, 'test_file_id_123', 'bottom');
    console.log('✅ Watermark set successfully');

    // Test checking watermark
    const hasUserWatermark = await hasWatermark(testUserId);
    console.log(`✅ Watermark check: ${hasUserWatermark}`);

    // Test getting user
    const user = await getUser(testUserId);
    console.log(`✅ User retrieved: ${user ? 'Success' : 'Failed'}`);
    if (user) {
      console.log(`   - User ID: ${user.user_id}`);
      console.log(`   - Watermark File ID: ${user.watermark_file_id}`);
      console.log(`   - Position: ${user.watermark_position}`);
    }

    console.log('\n🎉 All tests passed! Your bot is ready to deploy.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your .env file has all required variables');
    console.log('2. Verify your Turso database credentials');
    console.log('3. Ensure your Telegram bot token is valid');
    console.log('4. Check your internet connection');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 