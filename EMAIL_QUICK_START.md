# ⚡ Email System - Quick Start

## 🎯 What's Ready

Your Grind Up app now automatically sends emails for:

| Event | Who Gets Email | Status |
|-------|---|---------|
| College Registration | College | ✅ Active |
| Company Registration | Company | ✅ Active |
| Approval (College) | College | ✅ Active |
| Approval (Company) | Company | ✅ Active |
| Job Application | Company + Student | ✅ Active |
| Application Rejection | Student | ⏳ Ready |
| Weekly Job Digest | College | ⏳ Ready |

---

## ⚙️ 3-Minute Setup

### **1. Open `.env` file (backend/.env)**

Add these 5 lines:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your16charapppassword
SMTP_FROM=noreply@grindup.com
```

### **2. Get Gmail App Password**

- Go to: https://myaccount.google.com/
- Click "Security" on left
- Click "App passwords" 
- Select Mail + Windows Computer
- Copy 16-character password
- Paste in SMTP_PASSWORD above

### **3. Restart Backend**

```bash
npm run dev
```

**Done!** ✅ Emails now working

---

## 🧪 Test It

1. Register a college account
2. Check email inbox for welcome email
3. Admin approves college
4. Check email for approval email

---

## 📧 Email Templates Breakdown

### **Registration Email**
```
✅ Sent to: College/Company after signup
📝 Content: Welcome + next steps + login button
⏱️ When: Immediately after registration
```

### **Approval Email**
```
✅ Sent to: College/Company after admin approval
📝 Content: Congratulations + features unlocked + CTA button
⏱️ When: When admin clicks "Approve"
```

### **Application Email** (Company)
```
✅ Sent to: Company email when student applies
📝 Content: New application alert + student name + job title
⏱️ When: When student submits application
```

### **Application Email** (Student)
```
✅ Sent to: College email after applying
📝 Content: Confirmation + job details + track status link
⏱️ When: When application submitted
```

---

## 🔧 If Emails Don't Work

### **Check #1: Is SMTP configured?**
```bash
# Look in backend/.env
# Should have: SMTP_USER, SMTP_PASSWORD
```

### **Check #2: Is it a Gmail?**
- You need app-specific password (not Gmail password)
- Enable 2-FA first at: https://myaccount.google.com/security

### **Check #3: Check Logs**
```bash
# Look at terminal output from "npm run dev"
# Look for ✅ or ❌ symbols
```

### **Check #4: Test Email Sending**
```bash
# Use Mailtrap.io for free testing
# No real emails sent, but you can see if system works
```

---

## 📊 Where Code Was Added

| File | Change | Lines |
|------|--------|-------|
| `authController.js` | Added email send on register | +2 lines |
| `adminController.js` | Added email on approval | +8 lines |
| `jobApplicationController.js` | Added email on apply | +15 lines |
| `emailService.js` | **NEW** - All email logic | 400+ lines |

---

## 💡 Pro Tips

1. **For Testing:** Use Mailtrap.io (free, no real emails)
2. **For Production:** Use SendGrid or Mailgun (more reliable)
3. **Personalization:** Emails have company/college names
4. **Mobile Friendly:** All emails are responsive
5. **Branded:** Purple gradient matches your design

---

## 🚀 Next Features

Ready to implement:
- ⏳ Weekly job digest emails
- ⏳ Application status updates
- ⏳ Email preferences (opt-out)
- ⏳ Job expiry reminders
- ⏳ Scheduled email campaigns

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Use app password, not Gmail password |
| "Port 587 blocked" | Check firewall, use port 465 if needed |
| "Email goes to spam" | Use domain email (SendGrid) in production |
| "No errors but no email" | Check `SMTP_USER` spelling, verify .env loaded |

---

## ✅ Checklist for Production

- [ ] Gmail app password working
- [ ] All 5 SMTP env vars set
- [ ] Tested with real registration
- [ ] Emails appear in inbox (not spam)
- [ ] SMTP_FROM looks professional
- [ ] FRONTEND_URL updated to production domain

---

**Status: Ready to Use! 🎉**

All email functionality is integrated. Just add SMTP credentials to `.env` and restart the server.
