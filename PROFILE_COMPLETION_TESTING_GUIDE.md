# Profile Completion Feature - Testing Guide

## Prerequisites
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173
- MongoDB connected and working

## 🧪 Test Scenarios

### Test 1: College Signup and Profile Completion

**Objective:** Verify college signup flow with profile completion redirect

**Steps:**
1. Open browser and go to `http://localhost:5173/signup`
2. Fill in signup form:
   - College Name: "Test College"
   - Email: "test.college@example.com"
   - Contact No: "9876543210"
   - Password: "TestPass123"
   - Confirm Password: "TestPass123"
3. Click "Signup" button

**Expected Results:**
- ✅ Form validates successfully
- ✅ User is created in database
- ✅ College profile is created (empty/partial)
- ✅ Redirect to `/profile` page (NOT to `/home`)
- ✅ Auth token stored in localStorage
- ✅ User object has `profileComplete: false`

**Verify in Browser Console:**
```javascript
// Check localStorage
localStorage.getItem('user')
// Should show: { ..., profileComplete: false }

// Check network tab
// POST /auth/register/college should return profileComplete: false
```

---

### Test 2: Company Signup and Profile Completion

**Objective:** Verify company signup flow with profile completion redirect

**Steps:**
1. Open browser and go to `http://localhost:5173/company-signup`
2. Fill in signup form:
   - Company Name: "Test Company Ltd"
   - Email: "hr@testcompany.com"
   - Contact No: "9876543210"
   - Industry: "Technology"
   - Company Size: "100-500"
   - Location: "Bangalore"
   - Password: "TestPass123"
   - Confirm Password: "TestPass123"
3. Click "Signup" button

**Expected Results:**
- ✅ Form validates successfully
- ✅ User is created in database
- ✅ Company profile is created (empty/partial)
- ✅ Redirect to `/profile` page (NOT to `/home`)
- ✅ Auth token stored in localStorage
- ✅ User object has `profileComplete: false`

---

### Test 3: Profile Completion Warning Banner

**Objective:** Verify warning banner appears on home page for incomplete profiles

**Prerequisites:**
- Complete Test 1 or Test 2 (have an incomplete profile user)

**Steps:**
1. On the profile page (from previous test), click browser back button
2. Or manually navigate to `http://localhost:5173/home`
3. Observe the home page

**Expected Results:**
- ✅ ProfileCompletionWarning banner appears at top
- ✅ Banner is yellow with warning icon (⚠️)
- ✅ Title shows "Complete Your Profile"
- ✅ Message explains profile is incomplete
- ✅ List of missing fields is displayed:
  ```
  - TPO Name (for college)
  - College City (for college)
  - Average CTC (for college)
  - Placement Percentage (for college)
  - Placement Record (for college)
  
  OR
  
  - Recruiter Name (for company)
  - Recruiter Email (for company)
  - Company Bio (for company)
  - Years of Experience (for company)
  ```
- ✅ Two buttons visible:
  - "Complete Profile" (yellow button)
  - "Dismiss" (white button)

**Verify in Browser Console:**
```javascript
// Check banner presence
document.querySelector('.profile-warning-banner')
// Should return the banner element

// Check missing fields list
document.querySelectorAll('.missing-fields li').length
// Should return 5 (for college) or 4 (for company)
```

---

### Test 4: Complete Profile Button Navigation

**Objective:** Verify "Complete Profile" button navigates to profile page

**Prerequisites:**
- Have warning banner visible on home page

**Steps:**
1. On home page with visible warning banner
2. Click "Complete Profile" button (yellow button)
3. Observe navigation

**Expected Results:**
- ✅ Navigates to `/profile` page
- ✅ Profile form is displayed
- ✅ Profile form has prepopulated fields with existing data
- ✅ Shows all required fields (college or company specific)

---

### Test 5: Dismiss Button

**Objective:** Verify "Dismiss" button hides warning banner temporarily

**Prerequisites:**
- Have warning banner visible on home page

**Steps:**
1. On home page with visible warning banner
2. Click "Dismiss" button (white button)
3. Observe banner visibility
4. Refresh the page (Ctrl+R or Cmd+R)
5. Observe banner again

**Expected Results:**
- ✅ Banner disappears immediately after clicking Dismiss
- ✅ Banner reappears after page refresh (if profile still incomplete)
- ✅ Page content below banner is accessible

---

### Test 6: Profile Completion and Banner Disappearance

**Objective:** Verify banner disappears after profile is completed

**Prerequisites:**
- Have incomplete profile user
- Warning banner visible on home page

**Steps:**
1. Click "Complete Profile" button
2. Fill all required fields in profile form:
   - **For College:**
     - TPO Name: "Dr. John Smith"
     - College City: "Bangalore"
     - Grade: "A"
     - Average CTC: "8.5 LPA"
     - Placement Percentage: "95%"
     - Placement Record URL: "https://example.com/placements"
   
   - **For Company:**
     - Recruiter Name: "Jane Doe"
     - Recruiter Email: "jane@company.com"
     - Company Bio: "Leading tech company..."
     - Years of Experience: "10"
     - Website: "https://company.com"

3. Click "Save Profile" or "Update Profile" button
4. Navigate back to home page (or should redirect automatically)
5. Observe warning banner

**Expected Results:**
- ✅ Profile is saved successfully
- ✅ User object updates with `profileComplete: true`
- ✅ No warning banner appears on home page
- ✅ Full home page content is visible without warning
- ✅ Refresh page still shows no banner

**Verify in Browser Console:**
```javascript
// Check updated user object
let user = JSON.parse(localStorage.getItem('user'));
console.log(user.profileComplete); // Should be true
```

---

### Test 7: Login with Incomplete Profile

**Objective:** Verify login shows warning banner for incomplete profiles

**Prerequisites:**
- Have a college/company account with incomplete profile
- Know the login credentials

**Steps:**
1. Logout if currently logged in (click profile menu → logout)
2. Go to `/login`
3. Enter credentials for incomplete profile user
4. Click "Login" button
5. Observe navigation and warning banner

**Expected Results:**
- ✅ User successfully logs in
- ✅ Redirects to `/home` (not `/profile`)
- ✅ Warning banner is visible on home page
- ✅ Missing fields list is displayed
- ✅ User can use all home page features (view jobs, etc.)
- ✅ User can still navigate to profile using the banner button

---

### Test 8: Login with Complete Profile

**Objective:** Verify login does NOT show warning for complete profiles

**Prerequisites:**
- Have a college/company account with complete profile
- Know the login credentials

**Steps:**
1. Logout if currently logged in
2. Go to `/login`
3. Enter credentials for complete profile user
4. Click "Login" button
5. Observe navigation and home page

**Expected Results:**
- ✅ User successfully logs in
- ✅ Redirects to `/home`
- ✅ NO warning banner visible
- ✅ Home page displays normally
- ✅ Full access to all features

**Verify in Browser Console:**
```javascript
// Check user profileComplete status
let user = JSON.parse(localStorage.getItem('user'));
console.log(user.profileComplete); // Should be true

// Check banner is absent
document.querySelector('.profile-warning-banner')
// Should return null
```

---

### Test 9: API Endpoint - Check Profile Completion

**Objective:** Verify the check-profile-completion API endpoint works

**Prerequisites:**
- Have logged-in user (any profile status)

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run these commands:

```javascript
// Get auth token
const token = localStorage.getItem('authToken');

// Call the API
fetch('http://localhost:3000/api/auth/check-profile-completion', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

**Expected Results:**
- ✅ API returns successful response
- ✅ Response has structure:
  ```json
  {
    "success": true,
    "profileComplete": boolean,
    "missingFields": ["field1", "field2", ...]
  }
  ```
- ✅ `profileComplete` matches user object value
- ✅ `missingFields` array contains relevant fields

---

### Test 10: API Endpoint - Get Current User

**Objective:** Verify GET /auth/me returns profileComplete flag

**Prerequisites:**
- Have logged-in user

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:

```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

**Expected Results:**
- ✅ API returns user object
- ✅ User object includes `profileComplete` flag
- ✅ Value is boolean (true/false)
- ✅ Matches the profile completion status

---

### Test 11: Responsive Design - Mobile

**Objective:** Verify warning banner is responsive on mobile

**Prerequisites:**
- Have incomplete profile user
- Warning banner visible on home page

**Steps:**
1. Open DevTools (F12)
2. Click Device Toggle (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, etc.)
4. Observe warning banner layout

**Expected Results:**
- ✅ Banner displays correctly on mobile
- ✅ Banner stacks vertically on small screens
- ✅ Buttons are large enough to tap
- ✅ Text is readable
- ✅ Warning icon is visible
- ✅ Missing fields list displays properly
- ✅ No overflow or layout issues

---

### Test 12: Responsive Design - Tablet

**Objective:** Verify warning banner is responsive on tablet

**Prerequisites:**
- Have incomplete profile user
- Warning banner visible on home page

**Steps:**
1. Open DevTools (F12)
2. Click Device Toggle (Ctrl+Shift+M)
3. Select tablet device (iPad, etc.)
4. Observe warning banner layout

**Expected Results:**
- ✅ Banner displays correctly on tablet
- ✅ Layout adapts to tablet width
- ✅ All elements are visible and accessible
- ✅ Buttons are properly sized
- ✅ No horizontal scroll needed

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] `authController.js` has `isProfileComplete()` function
- [ ] `authController.js` has `getMissingFields()` function
- [ ] `authController.js` has `checkProfileCompletion()` function
- [ ] `loginauth.js` returns `profileComplete` in responses
- [ ] `/auth/check-profile-completion` endpoint exists
- [ ] Profile model has all required fields
- [ ] No compilation errors in backend

### Frontend Verification
- [ ] `ProfileCompletionWarning.jsx` component exists
- [ ] `ProfileCompletionWarning.css` exists
- [ ] `ProtectedRoute.jsx` component exists
- [ ] `AuthContext.jsx` has `checkProfileCompletion()` method
- [ ] `api.js` has `checkProfileCompletion()` method
- [ ] `Home.jsx` imports and uses ProfileCompletionWarning
- [ ] `Signup.jsx` redirects to `/profile` after signup
- [ ] `CompanySignup.jsx` redirects to `/profile` after signup
- [ ] No console errors on home page

### Visual Verification
- [ ] Warning banner has yellow background
- [ ] Warning icon displays with pulse animation
- [ ] Missing fields list is formatted correctly
- [ ] Buttons are clickable and styled correctly
- [ ] Banner slides down smoothly
- [ ] Dismiss button hides banner
- [ ] Banner reappears on refresh

### Functional Verification
- [ ] Signup redirects to profile page
- [ ] Warning shows on home with incomplete profile
- [ ] Warning disappears after profile completion
- [ ] Login shows warning for incomplete profiles
- [ ] Login hides warning for complete profiles
- [ ] API endpoints return correct data
- [ ] LocalStorage has profileComplete flag

---

## 🐛 Common Issues and Solutions

### Issue: Warning banner not showing
**Solution:**
1. Check that `user.profileComplete` is false
2. Verify ProfileCompletionWarning is imported in Home.jsx
3. Clear browser cache and refresh
4. Check console for import errors

### Issue: Wrong redirect after signup
**Solution:**
1. Verify Signup.jsx navigate('/profile') is correct
2. Check that navigate() function is working
3. Look at network tab to see redirect response

### Issue: API endpoint returns 404
**Solution:**
1. Verify route is added to `backend/routes/auth.js`
2. Check that authController has the function
3. Ensure proper auth middleware is applied
4. Restart backend server

### Issue: Profile completion not updating
**Solution:**
1. Verify profile is saved correctly
2. Check that getMe is called after profile save
3. Verify user object is updated in context
4. Check network tab for API responses

### Issue: Styling looks broken
**Solution:**
1. Verify ProfileCompletionWarning.css is imported
2. Check for CSS syntax errors
3. Clear browser cache (Ctrl+Shift+Delete)
4. Reload page (Ctrl+F5)

---

## 📊 Test Results Template

Use this template to record test results:

```
Test Date: ___________
Tester: ___________
Environment: Dev / Staging / Production

Test 1: College Signup Profile Completion
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 2: Company Signup Profile Completion
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 3: Profile Completion Warning Banner
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 4: Complete Profile Button
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 5: Dismiss Button
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 6: Profile Completion and Banner Disappearance
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 7: Login with Incomplete Profile
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 8: Login with Complete Profile
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 9: API Endpoint - Check Profile Completion
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 10: API Endpoint - Get Current User
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 11: Responsive Design - Mobile
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Test 12: Responsive Design - Tablet
Result: [ ] PASS [ ] FAIL
Notes: _________________________________

Overall Result: [ ] PASS [ ] FAIL
Comments: _________________________________
```

---

## 🚀 Testing Tips

1. **Clear Cache:** Always clear browser cache before testing critical flows
2. **Use Incognito:** Use incognito mode to avoid cached auth tokens
3. **Check Network:** Monitor network tab to see API responses
4. **Use Console:** Check console for JavaScript errors
5. **Test Both Types:** Test with both college and company users
6. **Test Edge Cases:** Test with very long names, special characters, etc.
7. **Multiple Browsers:** Test in Chrome, Firefox, Safari
8. **Take Screenshots:** Document any issues with screenshots

---

## ✅ Sign-Off

After completing all tests successfully:

- [ ] All 12 tests passed
- [ ] No console errors
- [ ] Responsive design verified
- [ ] API endpoints working
- [ ] Feature ready for production

**Tested By:** ___________
**Date:** ___________
**Version:** ___________
