// Quick test script for email system
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailSystem() {
  console.log('🧪 Testing Email System...\n');
  
  // Replace with your real email to test
  const testEmail = 'your-email@example.com'; // CHANGE THIS!
  
  try {
    console.log(`📧 Sending test email to: ${testEmail}`);
    
    await emailService.sendCollegeRegistrationEmail(
      testEmail,
      'Test College'
    );
    
    console.log('\n✅ SUCCESS! Email sent successfully!');
    console.log('📬 Check your inbox (and spam folder) for the welcome email.');
    
  } catch (error) {
    console.error('\n❌ ERROR sending email:');
    console.error(error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check SMTP credentials in .env file');
    console.error('2. Verify SMTP_PASSWORD is Gmail app password (not Gmail password)');
    console.error('3. Enable 2-Factor Authentication for Gmail');
    console.error('4. Check if Less Secure Apps is enabled (if applicable)');
  }
  
  process.exit();
}

testEmailSystem();
