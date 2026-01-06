# Quick Troubleshooting Guide - Job Application

## 🚨 Current Issue: 404 Not Found

The error "Failed to load resource: the server responded with a status of 404" means the route is not being found.

---

## ✅ Step-by-Step Fix

### **Step 1: Verify Backend Server is Running**
```bash
# Check if backend is running on port 3000
# In your backend terminal, you should see:
# Server running on port 3000
# MongoDB Connected
```

### **Step 2: Restart Backend Server**
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### **Step 3: Verify Route is Registered**
Open `backend/app.js` and verify line 69:
```javascript
app.use('/api/job-applications', jobApplicationRoutes);
```

### **Step 4: Test the Route Directly**
Open browser console and run:
```javascript
fetch('http://localhost:3000/api/job-applications/apply/TEST_JOB_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  },
  body: JSON.stringify({
    coverLetter: "Test application",
    resume: ""
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### **Step 5: Check Backend Logs**
When you try to apply, check backend console for:
```
=== APPLY FOR JOB REQUEST ===
```

If you DON'T see this, the route is not being hit.

---

## 🔍 Common Issues

### **Issue A: Route Order Problem**
If the catch-all route `app.get('*', ...)` in production mode comes before API routes, it will intercept all requests.

**Fix:** Ensure API routes come BEFORE the static file serving in `backend/app.js`

### **Issue B: Route Not Exported**
**Check:** `backend/routes/jobApplication.js` should end with:
```javascript
module.exports = router;
```

### **Issue C: Middleware Blocking**
The validation middleware might be rejecting before reaching controller.

**Check:** Look for validation errors in backend logs.

### **Issue D: CORS Issue**
**Check:** CORS should allow requests from `http://localhost:5173`

---

## 🧪 Quick Test Checklist

- [ ] Backend server is running
- [ ] Backend console shows no errors on startup
- [ ] Route `/api/job-applications` is mounted in `app.js`
- [ ] Route `/apply/:jobId` exists in `jobApplication.js`
- [ ] Controller `applyForJob` is exported
- [ ] Frontend is calling `/api/job-applications/apply/:jobId`
- [ ] Authorization header includes valid JWT token
- [ ] College user is logged in
- [ ] Network tab shows request is being sent
- [ ] Backend logs show request being received

---

## 📝 Manual Database Check

If you want to verify manually in MongoDB:

```javascript
// 1. Check college is approved
db.colleges.findOne({ email: "college@example.com" })

// 2. Check job exists and is active
db.jobposts.findOne({ _id: ObjectId("JOB_ID") })

// 3. Approve college if needed
db.colleges.updateOne(
  { email: "college@example.com" },
  { $set: { approvalStatus: "approved" } }
)

// 4. Activate job if needed
db.jobposts.updateOne(
  { _id: ObjectId("JOB_ID") },
  { $set: { status: "active", isActive: true } }
)
```

---

## 🎯 Expected Behavior When Working

1. **Frontend:** Click "Apply Now" → Shows loading state
2. **Network:** POST request to `/api/job-applications/apply/:jobId`
3. **Backend:** Logs show "=== APPLY FOR JOB REQUEST ==="
4. **Backend:** Processes all validation checks
5. **Database:** New document created in `jobapplications` collection
6. **Frontend:** Shows "Application submitted successfully!"
7. **Email:** (If configured) Confirmation emails sent

---

## 🐛 Debug Steps

1. **Open Browser DevTools (F12)**
2. **Go to Network Tab**
3. **Click "Apply Now"**
4. **Find the POST request**
5. **Check:**
   - Request URL (should be `/api/job-applications/apply/...`)
   - Request Method (should be POST)
   - Status Code (200/201 = success, 404 = route not found, 403 = unauthorized, 400 = validation error)
   - Response body (shows actual error message)

6. **Check Backend Console:**
   - Should see request logs
   - Should see any error messages
   - Should see stack traces if errors occur

---

## 💡 Quick Fix if Route Still Not Found

If the route still returns 404 after restarting:

1. **Check if route file is being loaded:**
   Add this to `backend/routes/jobApplication.js`:
   ```javascript
   console.log('JobApplication routes loaded');
   ```

2. **Verify route order in app.js:**
   Make sure jobApplication routes are registered:
   ```javascript
   const jobApplicationRoutes = require('./routes/jobApplication');
   app.use('/api/job-applications', jobApplicationRoutes);
   ```

3. **Test a simpler route:**
   Add a test route to verify:
   ```javascript
   router.get('/test', (req, res) => {
     res.json({ message: 'Route is working!' });
   });
   ```
   Then test: `GET /api/job-applications/test`

---

**If still not working after these steps, share:**
1. Backend console output
2. Browser Network tab screenshot
3. Backend server startup logs

