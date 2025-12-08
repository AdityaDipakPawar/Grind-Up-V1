# Profile Completion Feature

## Overview
This feature ensures that college and company users complete their profiles after signup or login before accessing full platform features. The system includes:

1. **Profile Completion Detection** - Backend checks which required fields are missing
2. **Smart Redirects** - After signup, users are directed to complete their profile
3. **Warning Banners** - Home page displays profile completion status with missing fields
4. **Middleware Protection** - Incomplete profiles are detected and handled gracefully

## What Constitutes a "Complete" Profile

### College Profile Requirements
A college profile is considered complete when these fields are filled:
- `tpoName` - Training and Placement Officer Name
- `collegeCity` - City where college is located
- `avgCTC` - Average Cost to Company (CTC)
- `placementPercent` - Placement Percentage
- `placementRecordUrl` - URL/Link to placement records

### Company Profile Requirements
A company profile is considered complete when these fields are filled:
- `recruiterName` - Name of the recruiting officer
- `recruiterEmail` - Email of the recruiting officer
- `companyBio` - Company bio/description
- `yearsOfExperience` - Years of company experience

## Frontend Components

### ProfileCompletionWarning Component
**Location:** `frontend/src/components/ProfileCompletionWarning.jsx`

Displays a warning banner on the home page when profile is incomplete.

**Features:**
- Shows list of missing fields
- "Complete Profile" button redirects to profile page
- "Dismiss" button to temporarily hide the banner
- Responsive design for mobile, tablet, and desktop
- Animated slide-down entrance

**Styling:** `frontend/src/styles/ProfileCompletionWarning.css`

### ProtectedRoute Component
**Location:** `frontend/src/components/ProtectedRoute.jsx`

Wraps routes that require complete profiles.

**Usage:**
```jsx
<ProtectedRoute requireCompleteProfile={true}>
  <DashboardPage />
</ProtectedRoute>
```

## Backend Integration

### Enhanced Auth Controller
**Location:** `backend/controllers/authController.js`

**Helper Functions:**
- `isProfileComplete(profile, userType)` - Checks if profile has all required fields
- `getMissingFields(profile, userType)` - Returns list of missing required fields

**Updated Endpoints:**

1. **POST /auth/register/college** - College signup
   - Returns `profileComplete: false` in response

2. **POST /auth/register/company** - Company signup
   - Returns `profileComplete: false` in response

3. **POST /auth/login** - Login
   - Returns `profileComplete` status based on current profile state

4. **GET /auth/me** - Get current user
   - Returns `profileComplete` flag in user object

5. **GET /auth/check-profile-completion** (NEW)
   - Returns:
     ```json
     {
       "success": true,
       "profileComplete": boolean,
       "missingFields": [string]
     }
     ```

### Auth Routes
**Location:** `backend/routes/auth.js`

New endpoint added:
```javascript
router.get('/check-profile-completion', auth, authController.checkProfileCompletion);
```

## Frontend Auth Context

**Location:** `frontend/src/contexts/AuthContext.jsx`

**New Methods:**
- `checkProfileCompletion()` - Async function to check profile completion status

**Enhanced User Object:**
```javascript
user: {
  id: string,
  email: string,
  type: 'college' | 'company',
  collegeName?: string,
  companyName?: string,
  profileComplete: boolean  // NEW
}
```

## User Flow

### College User Flow
1. **Signup** → User fills college basic info (name, email, contact)
2. **Registration Response** → `profileComplete: false`, `profileComplete` status returned
3. **Redirect** → Sent to `/profile` page
4. **Profile Completion** → User fills required fields:
   - TPO Name
   - College City
   - Average CTC
   - Placement Percentage
   - Placement Record URL
5. **Profile Updated** → `profileComplete: true`
6. **Home Access** → Full access to platform features

### Company User Flow
1. **Signup** → User fills company basic info (name, email, industry, etc.)
2. **Registration Response** → `profileComplete: false` returned
3. **Redirect** → Sent to `/profile` page
4. **Profile Completion** → User fills required fields:
   - Recruiter Name
   - Recruiter Email
   - Company Bio
   - Years of Experience
5. **Profile Updated** → `profileComplete: true`
6. **Home Access** → Full access to platform features

### Home Page Behavior
- **Incomplete Profile** → Shows ProfileCompletionWarning banner with:
  - List of missing fields
  - "Complete Profile" button (navigates to /profile)
  - "Dismiss" button (hides banner temporarily)
  - Yellow warning styling
  
- **Complete Profile** → No warning banner shown

## API Service Updates

**Location:** `frontend/src/services/api.js`

New method in `authAPI`:
```javascript
checkProfileCompletion: async () => {
  const response = await api.get('/auth/check-profile-completion');
  return response.data;
}
```

## Integration with Signup/Login

### Signup Pages
**Files:**
- `frontend/src/Signup.jsx` (College)
- `frontend/src/CompanySignup.jsx` (Company)

**Change:** After successful signup, users are redirected to `/profile` instead of `/home`:
```javascript
navigate('/profile', { 
  state: { 
    from: '/home', 
    message: 'Please complete your profile to access full features' 
  } 
});
```

### Login Page
**File:** `frontend/src/Login.jsx`

**Behavior:** 
- Users logging in go to `/home`
- Home page displays ProfileCompletionWarning if profile is incomplete
- User can click "Complete Profile" button to go to `/profile`

## Database Models

### College Model
New field status is determined by presence of these fields:
- `tpoName`
- `collegeCity`
- `avgCTC`
- `placementPercent`
- `placementRecordUrl`

### Company Model
New field status is determined by presence of these fields:
- `recruiterName`
- `recruiterEmail`
- `companyBio`
- `yearsOfExperience`

## Testing the Feature

### Test Profile Completion Check
```bash
# As an authenticated user, check profile completion status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/check-profile-completion
```

### Test in Frontend
1. **Signup a new college:**
   - Should redirect to `/profile`
   - Home page should show warning when navigating back

2. **Complete profile:**
   - Fill all required fields
   - Profile update should set `profileComplete: true`

3. **Verify on home page:**
   - Warning banner should disappear
   - Full access to features

## Styling

The ProfileCompletionWarning component includes:
- Yellow warning color (#ffc107)
- Animated slide-down entrance
- Pulsing warning icon
- Responsive design for all screen sizes
- Smooth hover effects on buttons

### CSS Classes
- `.profile-warning-container` - Main container
- `.profile-warning-banner` - Banner wrapper
- `.warning-icon` - Warning emoji
- `.warning-content` - Text content area
- `.missing-fields` - List of missing fields
- `.warning-actions` - Action buttons
- `.btn-complete-profile` - Primary button
- `.btn-dismiss` - Secondary button

## Future Enhancements

1. **Progress Bar** - Show how much of profile is complete
2. **Required vs Optional Fields** - Distinguish between required and optional fields
3. **Conditional Redirects** - Redirect to profile page on specific actions if incomplete
4. **Email Reminders** - Send email reminders to complete profile
5. **Modal Instead of Banner** - Show modal on first login if profile incomplete
6. **Field-by-Field Wizard** - Step-through profile completion wizard

## Error Handling

- **Missing Profile Model** - Returns `profileComplete: false`
- **Auth Errors** - Properly handled by auth middleware
- **Database Errors** - Returns 500 with error message
- **Network Errors** - Frontend checks fall back to cached user data

## Security Considerations

- Profile completion check is performed server-side
- Only authenticated users can check their profile completion
- User can only see their own profile completion status
- Prevents privilege escalation attempts

## Database Queries

The feature uses efficient MongoDB queries:

```javascript
// Find profile for a user
const profile = await College.findOne({ user: userId });

// Check required fields in single query
const profileComplete = !!(
  profile?.tpoName &&
  profile?.collegeCity &&
  profile?.avgCTC &&
  profile?.placementPercent &&
  profile?.placementRecordUrl
);
```

## Performance Considerations

- Profile check is performed on user login/signup once
- Frontend caches profile completion status in user object
- Additional checks on home page are minimal (~1 API call)
- No N+1 query issues - single profile fetch per user

## Files Modified

1. `backend/controllers/authController.js` - Added profile completion logic
2. `backend/routes/auth.js` - Added new endpoint
3. `frontend/src/contexts/AuthContext.jsx` - Added profile completion check
4. `frontend/src/services/api.js` - Added API method
5. `frontend/src/Home.jsx` - Added warning banner
6. `frontend/src/Signup.jsx` - Modified redirect logic
7. `frontend/src/CompanySignup.jsx` - Modified redirect logic
8. `frontend/src/Login.jsx` - Added comment about flow

## Files Created

1. `frontend/src/components/ProfileCompletionWarning.jsx` - Warning banner component
2. `frontend/src/styles/ProfileCompletionWarning.css` - Styling
3. `frontend/src/components/ProtectedRoute.jsx` - Route protection component
4. `PROFILE_COMPLETION_FEATURE.md` - This documentation file
