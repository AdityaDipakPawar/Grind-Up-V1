const nodemailer = require('nodemailer');

// Check if email configuration is available
const hasEmailConfig = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
};

// Log email configuration status (without exposing passwords)
if (!hasEmailConfig()) {
  console.warn('⚠️  Email configuration missing. Please check your .env file for SMTP settings.');
  console.warn('   Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
} else {
  console.log('✅ Email configuration found:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT || 587}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.SMTP_FROM || process.env.SMTP_USER}`);
}

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Add connection timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify transporter connection (optional, can be called on startup)
const verifyConnection = async () => {
  if (!hasEmailConfig()) {
    console.error('❌ Cannot verify email connection: Configuration missing');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Please check SMTP_USER and SMTP_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.error('   Connection failed. Please check SMTP_HOST and SMTP_PORT');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   Connection timeout. Please check your network or SMTP settings');
    }
    return false;
  }
};

// Normalize the frontend URL to avoid double slashes when composing links
const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

/**
 * Send registration confirmation email to college
 */
const sendCollegeRegistrationEmail = async (email, collegeName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Grind Up - College Registration Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Grind Up! 🎓</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${collegeName}</strong>,</p>
              <p>Thank you for registering with Grind Up! We're excited to have you on board.</p>
              
              <h3>What Happens Next?</h3>
              <ol>
                <li>Our team will verify your college details</li>
                <li>You'll receive an approval email within 24-48 hours</li>
                <li>Once approved, you can start exploring job opportunities</li>
              </ol>
              
              <p>In the meantime, you can:</p>
              <ul>
                <li>Complete your college profile</li>
                <li>Add student details and placement records</li>
                <li>Explore available internships and jobs</li>
              </ul>
              
              <p><a href="${frontendBaseUrl}/login" class="btn">Login to Your Account</a></p>
              
              <hr>
              <p><strong>Need Help?</strong> Contact us at support@grindup.co</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
              <p>Verified Two-Sided Placement Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending registration email to ${email}:`, error);
    return false;
  }
};

/**
 * Send registration confirmation email to company
 */
const sendCompanyRegistrationEmail = async (email, companyName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Grind Up - Company Registration Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Grind Up! 🚀</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${companyName}</strong>,</p>
              <p>Thank you for registering with Grind Up! We're thrilled to partner with you.</p>
              
              <h3>What Happens Next?</h3>
              <ol>
                <li>Our team will verify your company details</li>
                <li>You'll receive an approval email within 24-48 hours</li>
                <li>Once approved, you can start posting job opportunities</li>
              </ol>
              
              <p>Benefits of posting on Grind Up:</p>
              <ul>
                <li>Access to verified colleges and students</li>
                <li>Streamlined hiring process</li>
                <li>Direct communication with institutions</li>
                <li>Transparent and scam-free environment</li>
              </ul>
              
              <p><a href="${frontendBaseUrl}/login" class="btn">Login to Your Account</a></p>
              
              <hr>
              <p><strong>Questions?</strong> Contact us at support@grindup.co</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
              <p>Verified Two-Sided Placement Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending registration email to ${email}:`, error);
    return false;
  }
};

/**
 * Send approval confirmation email to college
 */
const sendCollegeApprovalEmail = async (email, collegeName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '✅ Your College Has Been Approved on Grind Up!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Approval Confirmed! 🎉</h1>
            </div>
            <div class="success">
              <p>Your college <strong>${collegeName}</strong> has been approved and verified on Grind Up!</p>
            </div>
            <div class="content">
              <p>You now have access to:</p>
              <ul>
                <li>✅ Browse all available job opportunities</li>
                <li>✅ Apply to internships and positions</li>
                <li>✅ Track your applications</li>
                <li>✅ Receive placement invitations from companies</li>
              </ul>
              
              <p>Start exploring opportunities now!</p>
              <p><a href="${frontendBaseUrl}/home" class="btn">View Jobs</a></p>
              
              <hr>
              <p>Thank you for being part of the verified Grind Up community!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending approval email to ${email}:`, error);
    return false;
  }
};

/**
 * Send approval confirmation email to company
 */
const sendCompanyApprovalEmail = async (email, companyName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '✅ Your Company Has Been Approved on Grind Up!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Approval Confirmed! 🎉</h1>
            </div>
            <div class="success">
              <p>Your company <strong>${companyName}</strong> has been approved and verified on Grind Up!</p>
            </div>
            <div class="content">
              <p>You're now ready to:</p>
              <ul>
                <li>✅ Post job opportunities</li>
                <li>✅ Connect with verified colleges</li>
                <li>✅ Receive applications from students</li>
                <li>✅ Manage your recruitment process</li>
              </ul>
              
              <p>Start posting your first job now!</p>
              <p><a href="${frontendBaseUrl}/post-job" class="btn">Post a Job</a></p>
              
              <hr>
              <p>Welcome to the verified Grind Up community!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending approval email to ${email}:`, error);
    return false;
  }
};

/**
 * Send job application notification to company
 */
const sendJobApplicationNotification = async (email, companyName, studentName, jobTitle) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `📋 New Application for ${jobTitle} - Grind Up`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Application Received! 📋</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${companyName}</strong>,</p>
              <p><strong>${studentName}</strong> has applied for the position of <strong>${jobTitle}</strong>.</p>
              
              <p>Review the application and take action:</p>
              <p><a href="${frontendBaseUrl}/dashboard" class="btn">View Applications</a></p>
              
              <hr>
              <p>Keep track of all your applications in your Grind Up dashboard.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Application notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending application notification to ${email}:`, error);
    return false;
  }
};

/**
 * Send job application confirmation to student
 */
const sendJobApplicationConfirmation = async (email, studentName, jobTitle, companyName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `✅ Application Submitted - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Submitted! ✅</h1>
            </div>
            <div class="success">
              <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully!</p>
            </div>
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              <p>We've received your application. The company will review it and get back to you soon.</p>
              
              <p>Track your application status:</p>
              <p><a href="${frontendBaseUrl}/my-applications" class="btn">View My Applications</a></p>
              
              <hr>
              <p>Best of luck with your application!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Application confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending application confirmation to ${email}:`, error);
    return false;
  }
};

/**
 * Send rejection email
 */
const sendRejectionEmail = async (email, candidateName, jobTitle, companyName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Application Update - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${candidateName}</strong>,</p>
              <p>Thank you for applying for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful review, we regret to inform you that your application has not been selected for this position.</p>
              
              <p>We encourage you to apply for other opportunities on Grind Up that match your profile!</p>
              <p><a href="${frontendBaseUrl}/jobs" class="btn">Explore More Jobs</a></p>
              
              <hr>
              <p>All the best with your career!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending rejection email to ${email}:`, error);
    return false;
  }
};

/**
 * Send weekly digest email to colleges
 */
const sendWeeklyDigest = async (email, collegeName, newJobs) => {
  try {
    const jobsList = newJobs
      .map(
        (job) =>
          `<li><strong>${job.title}</strong> at ${job.companyName} - ${job.location}</li>`
      )
      .join('');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `📊 Your Weekly Job Digest - Grind Up`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
            .job-list { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Weekly Job Digest</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${collegeName}</strong>,</p>
              <p>Here are the top new job opportunities for this week:</p>
              
              <div class="job-list">
                <ul>
                  ${jobsList}
                </ul>
              </div>
              
              <p>Don't miss out! Check out all available jobs:</p>
              <p><a href="${frontendBaseUrl}/jobs" class="btn">View All Jobs</a></p>
              
              <hr>
              <p>Happy applying!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Weekly digest sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending weekly digest to ${email}:`, error);
    return false;
  }
};

/**
 * Send OTP email for email verification
 */
const sendOTPEmail = async (email, otp, userName, userType) => {
  // Check if email configuration exists
  if (!hasEmailConfig()) {
    console.error('❌ Cannot send OTP email: SMTP configuration missing');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email - Grind Up',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff914d 0%, #ff7a3d 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .otp-box { background-color: #f5f5f5; border: 2px dashed #ff914d; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #ff914d; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email 📧</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Thank you for registering with Grind Up! Please verify your email address to complete your ${userType} registration.</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Important:</strong> This code will expire in 7 minutes. Do not share this code with anyone.</p>
              </div>
              
              <p>Enter this code on the verification page to activate your account.</p>
              
              <hr>
              <p style="font-size: 12px; color: #666;">If you didn't create an account with Grind Up, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Grind Up. All rights reserved.</p>
              <p>Verified Two-Sided Placement Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${email}`);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    
    // Provide specific error messages
    if (error.code === 'EAUTH') {
      console.error('❌ SMTP Authentication failed. Please check:');
      console.error('   - SMTP_USER is correct');
      console.error('   - SMTP_PASSWORD is correct (use App Password for Gmail)');
      console.error('   - For Gmail: Enable 2FA and use App Password, not regular password');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('❌ SMTP Connection failed. Please check:');
      console.error('   - SMTP_HOST is correct');
      console.error('   - SMTP_PORT is correct (587 for Gmail)');
      console.error('   - Internet connection is working');
      console.error('   - Firewall is not blocking the connection');
    } else if (error.code === 'EENVELOPE') {
      console.error('❌ Email envelope error. Please check:');
      console.error('   - SMTP_FROM is a valid email address');
      console.error('   - Recipient email is valid');
    } else {
      console.error('❌ Unknown email error. Full error:', error);
    }
    
    return false;
  }
};

module.exports = {
  sendCollegeRegistrationEmail,
  sendCompanyRegistrationEmail,
  sendCollegeApprovalEmail,
  sendCompanyApprovalEmail,
  sendJobApplicationNotification,
  sendJobApplicationConfirmation,
  sendRejectionEmail,
  sendWeeklyDigest,
  sendOTPEmail,
  verifyConnection,
  hasEmailConfig,
};
