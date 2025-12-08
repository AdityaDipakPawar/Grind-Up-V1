# System Architecture & Flow Diagrams

## 1. Input Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REQUEST                                  │
│              (E.g., Register College)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS ROUTE                                  │
│          /api/auth/register/college                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│            VALIDATION MIDDLEWARE (validation.js)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ validateCollegeRegister Array of validators:           │   │
│  │ • Email: isEmail() + normalizeEmail()                  │   │
│  │ • Password: isLength(8) + matches(regex)               │   │
│  │ • College Name: trim() + isLength(2-100)               │   │
│  │ • Contact: matches(regex) for Indian phone             │   │
│  │ • handleValidationErrors: Check & format errors        │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────┬───────────────────────┬──────────────────────────┘
               │                       │
        ✅ VALID                 ❌ INVALID
               │                       │
               ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  CONTROLLER      │    │  ERROR RESPONSE  │
    │  (authController)│    │                  │
    │  registerCollege │    │ {                │
    │                  │    │  success: false, │
    │  • Hash password │    │  message: "...", │
    │  • Save to DB    │    │  errors: [       │
    │  • Create JWT    │    │    {             │
    │  • Return token  │    │     field: "...", │
    │                  │    │     message: "..."│
    └────────┬─────────┘    │    }             │
             │              │  ]              │
             ▼              └──────────────────┘
    ┌──────────────────┐
    │  SUCCESS RESPONSE│
    │  {               │
    │   success: true, │
    │   token: "...",  │
    │   user: {...}    │
    │  }               │
    └──────────────────┘
```

---

## 2. Dashboard Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │             Dashboard.jsx (Router)                           │ │
│  │  Checks user.type (college/company)                         │ │
│  │  Redirects to appropriate dashboard                         │ │
│  └──┬───────────────────────────────────────┬───────────────────┘ │
│     │                                       │                      │
│  College User                        Company User                   │
│     │                                       │                      │
│     ▼                                       ▼                      │
│  ┌─────────────────────┐         ┌─────────────────────┐         │
│  │ CollegeDashboard.jsx│         │ CompanyDashboard.jsx│         │
│  │ • Fetch /api/      │         │ • Fetch /api/      │         │
│  │   dashboard/college│         │   dashboard/company│         │
│  │ • Display metrics  │         │ • Display metrics  │         │
│  │ • Tables & lists   │         │ • Tables & lists   │         │
│  │ • Charts data      │         │ • Charts data      │         │
│  └────────────┬───────┘         └─────────────┬──────┘         │
│               │                               │                   │
│               └───────────────┬───────────────┘                  │
│                               │                                   │
│                               ▼                                   │
│                    ┌──────────────────────┐                       │
│                    │  Dashboard.css       │                       │
│                    │ • Responsive Grid    │                       │
│                    │ • Metric Cards       │                       │
│                    │ • Tables             │                       │
│                    │ • Status Badges      │                       │
│                    │ • Animations         │                       │
│                    └──────────────────────┘                       │
└────────────────────────────────────────────────────────────────────┘
                               │
                               │ API Calls
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                       │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Dashboard Routes (dashboard.js)                 │ │
│  │  • GET /api/dashboard/stats (auto-routes)                   │ │
│  │  • GET /api/dashboard/college                               │ │
│  │  • GET /api/dashboard/company                               │ │
│  │  • auth middleware on all routes                            │ │
│  └──────────────┬───────────────────────────────────────────────┘ │
│                 │                                                   │
│                 ▼                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │       Dashboard Controller (dashboardController.js)          │ │
│  │  ┌────────────────────┐    ┌────────────────────┐           │ │
│  │  │getCollegeDashboard │    │getCompanyDashboard │           │ │
│  │  │ • Find college     │    │ • Find company     │           │ │
│  │  │ • Count companies  │    │ • Count colleges   │           │ │
│  │  │ • Get invites      │    │ • Get applications │           │ │
│  │  │ • Aggregate stats  │    │ • Aggregate stats  │           │ │
│  │  │ • Get trending     │    │ • Get top colleges │           │ │
│  │  └────────────────────┘    └────────────────────┘           │ │
│  └──────────────┬───────────────────────────────────────────────┘ │
│                 │                                                   │
│                 ▼                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              MongoDB Aggregation Pipeline                    │ │
│  │  • $match: Filter by user IDs                               │ │
│  │  • $group: Count and sum statistics                         │ │
│  │  • $lookup: Join related collections                        │ │
│  │  • $sort: Order results                                     │ │
│  │  • $limit: Get top N results                                │ │
│  └──────────────┬───────────────────────────────────────────────┘ │
│                 │                                                   │
│                 ▼                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   MongoDB Database                           │ │
│  │  Collections:                                               │ │
│  │  • users, colleges, companies                               │ │
│  │  • jobposts, jobapplications                                │ │
│  │  • invites, placements                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow: College Registration with Validation

```
┌─────────────────────────────────────┐
│    College Registration Form        │
│  • Email: tpo@college.edu           │
│  • Password: SecurePass123          │
│  • College Name: IIT Delhi          │
│  • Contact: 9876543210              │
└─────────────────────┬───────────────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │  Frontend Validation     │
        │ (Optional, for UX)       │
        │ • Check format           │
        │ • Show errors            │
        └──────────────┬───────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  POST /api/auth/register/  │
         │  college (with data)        │
         └────────────┬────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────┐
    │  Server Validation Middleware        │
    │  validateCollegeRegister array:      │
    │                                      │
    │  1. Email Validation                 │
    │     ✅ isEmail() → Valid format      │
    │     ✅ normalizeEmail() → Normalize  │
    │                                      │
    │  2. Password Validation              │
    │     ✅ isLength({min: 8})            │
    │     ✅ matches(regex for uppercase,  │
    │        lowercase, number)            │
    │                                      │
    │  3. College Name Validation          │
    │     ✅ trim() + notEmpty()           │
    │     ✅ isLength({min: 2, max: 100})  │
    │                                      │
    │  4. Contact Validation               │
    │     ✅ matches(/^[6-9]\d{9}$/)       │
    │                                      │
    │  5. Error Handler                    │
    │     ✅ Check for any errors          │
    │     ✅ Return formatted errors       │
    └──────────┬──────────────────────────┘
               │
        ✅ ALL VALID
               │
               ▼
    ┌──────────────────────────────┐
    │  authController.registerCollege()
    │                              │
    │  • Hash password with bcrypt │
    │  • Create User document      │
    │  • Create College document   │
    │  • Generate JWT token        │
    │  • Return success response   │
    └──────────┬──────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Success Response            │
    │  {                           │
    │    success: true,            │
    │    message: "...",           │
    │    data: {                   │
    │      token: "eyJ...",        │
    │      user: {                 │
    │        id: "...",            │
    │        email: "...",         │
    │        type: "college"       │
    │      }                       │
    │    }                         │
    │  }                           │
    └──────────┬──────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Frontend receives token     │
    │  • Saves to localStorage     │
    │  • Updates Auth context      │
    │  • Redirects to /dashboard   │
    └──────────────────────────────┘
```

---

## 4. College Dashboard Data Flow

```
┌─────────────────────────────┐
│   College User Logs In      │
│   Token stored in app       │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Navigate to /dashboard            │
│   CollegeDashboard component loads  │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Fetch: GET /api/dashboard/college      │
│  Header: Authorization: Bearer <token>  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│         Backend Processing (dashboardController)         │
│                                                          │
│  Step 1: Get College by user ID                          │
│  db.colleges.findOne({ user: userId })                  │
│                      │                                   │
│  Step 2: Count Companies                                │
│  db.invites.distinct('companyId')                       │
│            .find({ collegeId })                         │
│                      │                                   │
│  Step 3: Aggregate Invites Stats                        │
│  db.invites.aggregate([                                 │
│    { $match: { collegeId } },                          │
│    { $group: { _id: '$status', count } }               │
│  ])                                                     │
│                      │                                   │
│  Step 4: Get Recent Invites                             │
│  db.invites.find()                                      │
│    .populate('jobPostId', 'jobTitle salary')           │
│    .populate('companyId', 'companyName')               │
│    .sort({ createdAt: -1 })                            │
│    .limit(10)                                           │
│                      │                                   │
│  Step 5: Get Application Stats                          │
│  db.applications.aggregate([                            │
│    { $match: { collegeId } },                          │
│    { $group: { _id: '$status', count } }               │
│  ])                                                     │
│                      │                                   │
│  Step 6: Get Trending Companies                         │
│  db.invites.aggregate([                                 │
│    { $group: { _id: '$companyId', invites } },        │
│    { $sort: { invites: -1 } },                         │
│    { $limit: 5 },                                      │
│    { $lookup: { from: 'companies' } }                  │
│  ])                                                     │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  Response Data Structure:              │
│  {                                     │
│    college: {                          │
│      name, email, city, ...            │
│    },                                  │
│    metrics: {                          │
│      totalCompanies,                   │
│      activeJobOpenings,                │
│      totalApplications,                │
│      invites: {                        │
│        total, pending, accepted, ...   │
│      }                                 │
│    },                                  │
│    recentInvites: [array],             │
│    trendingCompanies: [array]          │
│  }                                     │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   Frontend Receives Data               │
│   • Sets state with dashboardData      │
│   • Re-renders component               │
│   • Displays metrics, tables, lists    │
│   • Applies CSS styling                │
└────────────────────────────────────────┘
```

---

## 5. Route Protection & Validation Stack

```
┌────────────────────────────────────────────────────────────┐
│                  Request to Protected Route                 │
│            POST /api/job-posts (with JWT token)            │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Authentication Middleware│
        │  auth.js                │
        │ • Check token in header │
        │ • Verify JWT signature  │
        │ • Attach user to req    │
        └────────────┬────────────┘
                     │
            ✅ Token Valid
                     │
                     ▼
        ┌──────────────────────────┐
        │  Input Validation        │
        │  validateJobPosting      │
        │ Array of validators:     │
        │ • body('jobTitle')       │
        │ • body('description')    │
        │ • body('location')       │
        │ • body('salary')         │
        │ • body('positions')      │
        │ • body('jobType')        │
        │ • body('deadline')       │
        │ • handleValidationErrors │
        └────────────┬─────────────┘
                     │
            ✅ All Valid
                     │
                     ▼
        ┌──────────────────────────┐
        │  Route Handler           │
        │  jobPostsController      │
        │  .createJobPost()        │
        │                          │
        │ • Validate ownership     │
        │ • Save to database       │
        │ • Return success         │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  Success Response        │
        │ {success: true, data}    │
        └──────────────────────────┘
```

---

## 6. Validation Middleware Stack

```
Request → Route Definition
         │
         ├─ auth (if protected)
         │  Check JWT token
         │
         ├─ validateJobPosting (if form data)
         │  body('jobTitle')
         │  body('description')
         │  body('location')
         │  ...
         │  handleValidationErrors
         │
         └─ Controller Function
            Process request
```

---

## 7. Database Schema Relationships

```
┌──────────┐
│  User    │
│ (Generic)│
└────┬─────┘
     │
     ├─ 1 ──────────────┬─ College (if type='college')
     │                  │
     │                  ├── Many Invites
     │                  ├── Many JobApplications
     │                  └── Many Placements
     │
     └─ 1 ──────────────┬─ Company (if type='company')
                        │
                        ├── Many JobPosts
                        ├── Many Invites
                        └── Many JobApplications
                        
┌──────────────────────────────┐
│   Data Flow in Dashboard     │
│                              │
│  College Dashboard:          │
│  College → Invites          │
│         → JobPosts          │
│         → Companies         │
│         → Applications      │
│                              │
│  Company Dashboard:          │
│  Company → JobPosts         │
│          → Invites          │
│          → Applications     │
│          → Colleges         │
└──────────────────────────────┘
```

---

## Summary

This architecture provides:

✅ **Layered Architecture**: Middleware → Controller → Database
✅ **Validation at Entry**: All inputs validated before processing
✅ **Efficient Queries**: MongoDB aggregation pipelines
✅ **Clean Separation**: Frontend components separate from logic
✅ **Error Handling**: Comprehensive validation error responses
✅ **Security**: JWT auth + input validation
✅ **Scalability**: Optimized queries, limiting results
✅ **Maintainability**: Clear file structure and documentation
