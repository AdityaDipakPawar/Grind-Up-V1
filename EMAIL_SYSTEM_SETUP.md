# Email Notifications System - Setup Guide

## ✅ Implementation Complete!

The email notification system has been fully integrated into your Grind Up application. Here's what's been added:

---

## 📧 Email Service Features

### **1. Registration Confirmation Emails**
- ✅ College registration confirmation
- ✅ Company registration confirmation
- Sent immediately after registration

### **2. Approval/Rejection Emails**
- ✅ College approval notification
- ✅ Company approval notification
- Sent when admin approves registrations

### **3. Job Application Emails**
- ✅ Application notification to company
- ✅ Application confirmation to college student
- Sent when student applies for a job

### **4. Additional Features (Ready to Use)**
- ✅ Application rejection email
- ✅ Weekly digest email for colleges
- Ready to integrate into your dashboard

---

## 🔧 Configuration Required

### **Step 1: Update Your `.env` File**

Add these email configuration variables to your `backend/.env`:

```plaintext
# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@grindup.com
```

### **Step 2: Get Gmail App Password**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Go to **Security** → **App passwords**
4. Select **Mail** and **Windows Computer**
5. Copy the generated 16-character password
6. Paste it in `SMTP_PASSWORD` in your `.env`

### **Step 3: Alternative Email Providers**

**Using SendGrid:**
```plaintext
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com
```

**Using Outlook/Office365:**
```plaintext
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
SMTP_FROM=your_email@outlook.com
```

---

## 📁 Files Created/Modified

### **New Files:**
- ✅ `backend/services/emailService.js` - Main email service with 8 functions
- ✅ `backend/templates/email/` - Email template directory

### **Modified Files:**
- ✅ `backend/controllers/authController.js` - Added registration email triggers
- ✅ `backend/controllers/adminController.js` - Added approval email triggers
- ✅ `backend/controllers/jobApplicationController.js` - Added application email triggers

---

## 🚀 How It Works

### **Email Flow:**

1. **Registration**
   ```
   User registers → Email Service triggered → HTML email sent
   ```

2. **Approval**
   ```
   Admin approves → setApproval() → Email Service sends approval email
   ```

3. **Job Application**
   ```
   Student applies → Application saved → 
   Email to company + confirmation to student
   ```

---

## 📧 Email Templates Included

### **1. College Registration**
- Welcome message
- Next steps explanation
- CTA button to login

### **2. Company Registration**
- Welcome message
- Platform benefits
- CTA button to login

### **3. College Approval**
- Approval confirmation
- Available features unlocked
- View jobs button

### **4. Company Approval**
- Approval confirmation
- Ready to post jobs
- Post job button

### **5. Job Application (to Company)**
- New application notification
- Applicant name and job title
- Dashboard link to review

### **6. Job Application (to College)**
- Confirmation email
- Job and company details
- Track applications link

### **7. Application Rejection**
- Rejection notification
- Encouragement to apply elsewhere
- Browse jobs link

### **8. Weekly Digest** (Optional)
- Top 5 new jobs for the week
- Personalized for each college
- Browse all jobs link

---

## 🧪 Testing the Email System

### **Test Email Sending:**

```javascript
// In your backend server, test with:
const emailService = require('./services/emailService');

// Test college registration email
await emailService.sendCollegeRegistrationEmail(
  'test@college.com',
  'Test College'
);

// Test approval email
await emailService.sendCollegeApprovalEmail(
  'test@college.com',
  'Test College'
);
```

### **Using Mailtrap for Testing:**

1. Go to [Mailtrap.io](https://mailtrap.io/)
2. Create a free account
3. Copy SMTP credentials
4. Use credentials in your `.env` for testing without sending real emails

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use app-specific passwords** - Don't use your actual Gmail password
3. **Limit email rate** - Add rate limiting to prevent spam
4. **Validate email addresses** - Use middleware to validate before sending
5. **Log email sends** - Monitor failed emails in logs

---

## 📊 Email Service Functions Reference

### **Available Functions:**

```javascript
// College emails
sendCollegeRegistrationEmail(email, collegeName)
sendCollegeApprovalEmail(email, collegeName)

// Company emails
sendCompanyRegistrationEmail(email, companyName)
sendCompanyApprovalEmail(email, companyName)

// Application emails
sendJobApplicationNotification(email, companyName, studentName, jobTitle)
sendJobApplicationConfirmation(email, studentName, jobTitle, companyName)
sendRejectionEmail(email, candidateName, jobTitle, companyName)

// Optional
sendWeeklyDigest(email, collegeName, newJobs)
```

---

## 🎯 Next Steps

### **To enable additional features:**

1. **Weekly Digest Emails** - Set up a cron job to send every Sunday
2. **Application Status Updates** - Add rejection emails when companies reject applications
3. **Custom Email Templates** - Modify HTML templates in `backend/services/emailService.js`
4. **Email Analytics** - Track opens and clicks with SendGrid or Mailgun
5. **Batch Email Sending** - Optimize for large numbers of recipients

---

## ⚠️ Troubleshooting

### **Emails not sending?**

1. **Check SMTP credentials** - Verify email and password in `.env`
2. **Enable Less Secure Apps** - For Gmail: https://myaccount.google.com/lesssecureapps
3. **Check firewall** - Ensure port 587 is open
4. **Review logs** - Check console for error messages

### **Gmail Authentication Error?**

- Use app-specific password (not your Gmail password)
- Enable 2-Factor Authentication first
- Verify SMTP_USER is your full Gmail address

### **Email going to spam?**

- Set SMTP_FROM to a proper domain
- Add SPF/DKIM records to your domain
- Use authenticated email service (SendGrid/Mailgun)

---

## 📈 Production Checklist

- [ ] Configure SMTP with production email service
- [ ] Update FRONTEND_URL to your production domain
- [ ] Test all email templates in production environment
- [ ] Set up email monitoring/logging
- [ ] Configure rate limiting on API endpoints
- [ ] Add email unsubscribe functionality (optional)
- [ ] Set up bounce handling
- [ ] Enable email activity tracking

---

## 💡 Recommendations

1. **Use SendGrid or Mailgun** for production (more reliable than Gmail SMTP)
2. **Add email verification** for new registrations
3. **Implement email preferences** so users can opt out
4. **Create email templates as separate files** for easier maintenance
5. **Add email queue** for better performance with many emails
6. **Monitor email delivery rates** to catch issues early

---

## 📞 Support

If emails are not working:
1. Check `.env` configuration
2. Verify SMTP credentials
3. Check backend logs for errors
4. Test with Mailtrap first
5. Use cloud email service (SendGrid) for production

---

**Status: ✅ Email System Ready for Use!**

Your application is now equipped with professional email notifications!
