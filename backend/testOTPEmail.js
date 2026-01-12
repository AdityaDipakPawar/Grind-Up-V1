// Quick test script for OTP email system
require('dotenv').config();
const emailService = require('./services/emailService');

async function testOTPEmail() {
  console.log('🧪 Testing OTP Email System...\n');
  
  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'SET' : 'NOT SET');
  console.log('SMTP_FROM:', process.env.SMTP_FROM || 'NOT SET');
  console.log('');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ ERROR: SMTP_USER and SMTP_PASSWORD must be set in .env file');
    process.exit(1);
  }
  
  // Replace with your real email to test
  const testEmail = process.argv[2] || 'your-email@example.com';
  const testOTP = '123456';
  
  if (testEmail === 'your-email@example.com') {
    console.error('❌ ERROR: Please provide an email address as an argument');
    console.error('Usage: node testOTPEmail.js your-email@example.com');
    process.exit(1);
  }
  
  try {
    console.log(`📧 Sending test OTP email to: ${testEmail}`);
    console.log(`🔢 Test OTP: ${testOTP}\n`);
    
    const result = await emailService.sendOTPEmail(
      testEmail,
      testOTP,
      'Test User',
      'college'
    );
    
    if (result) {
      console.log('\n✅ SUCCESS! OTP email sent successfully!');
      console.log('📬 Check your inbox (and spam folder) for the OTP email.');
      console.log(`🔢 The OTP code should be: ${testOTP}`);
    } else {
      console.error('\n❌ FAILED! Email service returned false.');
      console.error('Check the error messages above for details.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR sending OTP email:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('\nFull error:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check SMTP credentials in .env file');
    console.error('2. Verify SMTP_PASSWORD is Gmail app password (not Gmail password)');
    console.error('3. Enable 2-Factor Authentication for Gmail');
    console.error('4. Generate a new App Password from: https://myaccount.google.com/apppasswords');
  }
  
  process.exit(result ? 0 : 1);
}

testOTPEmail();

