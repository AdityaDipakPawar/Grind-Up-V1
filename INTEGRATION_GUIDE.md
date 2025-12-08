# Integration Guide: Dashboard & Validation Features

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

This installs `express-validator` which is required for input validation.

---

## 2. Environment Variables

Update your `.env` file with these new variables:

```env
# Email Configuration (optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@grindup.com
ADMIN_EMAIL=admin@grindup.com

# Application Settings
VERIFICATION_REQUIRED=true
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx
```

---

## 3. API Endpoints

### Dashboard Endpoints

#### Get Dashboard Stats (Auto-routes based on user type)
```
GET /api/dashboard/stats
Headers: Authorization: Bearer <JWT_TOKEN>
```

#### Get College Dashboard
```
GET /api/dashboard/college
Headers: Authorization: Bearer <JWT_TOKEN>
```

#### Get Company Dashboard
```
GET /api/dashboard/company
Headers: Authorization: Bearer <JWT_TOKEN>
```

---

## 4. Frontend Integration

### Add Dashboard Link to Navbar
In your `Navbar.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav>
      {/* ... other nav items ... */}
      {user && (
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
      )}
    </nav>
  );
}
```

### Update Signup Redirect
After successful signup, redirect to dashboard:

```jsx
// In Signup.jsx or CompanySignup.jsx
navigate('/dashboard');
```

---

## 5. Validation Examples

### Register College with Validation
```bash
curl -X POST http://localhost:3001/api/auth/register/college \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tpo@college.edu",
    "password": "SecurePass123",
    "collegeName": "IIT Delhi",
    "contactNo": "9876543210"
  }'
```

**Response on Success:**
```json
{
  "success": true,
  "message": "College registration successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "...",
      "email": "tpo@college.edu",
      "type": "college",
      "collegeName": "IIT Delhi"
    }
  }
}
```

**Response on Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "contactNo",
      "message": "Please provide a valid 10-digit Indian phone number"
    }
  ]
}
```

---

## 6. Job Posting with Validation
```bash
curl -X POST http://localhost:3001/api/job-posts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Software Engineer",
    "description": "We are looking for a talented software engineer...",
    "location": "Bangalore",
    "salary": "12-18",
    "positions": 5,
    "jobType": "Full-time",
    "deadline": "2025-12-31T23:59:59Z"
  }'
```

---

## 7. Dashboard Usage in Frontend

### Example: Display Dashboard in App
```jsx
// App.jsx already has:
<Route path="/dashboard" element={<Dashboard />} />

// Users access it via:
// College: http://localhost:5173/dashboard
// Company: http://localhost:5173/dashboard
```

### Example: Get Dashboard Data in Custom Component
```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function CustomDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Total Companies: {data?.metrics.totalCompanies}</h2>
      <h2>Active Jobs: {data?.metrics.activeJobOpenings}</h2>
    </div>
  );
}
```

---

## 8. Validation Rules Reference

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)

### Phone Number
- 10 digits
- Must start with 6-9 (Indian format)
- Example: 9876543210

### Email
- Valid RFC email format
- Automatically normalized to lowercase
- Trimmed of whitespace

### Job Title
- 3-100 characters
- Trimmed

### Description
- 20-5000 characters
- Used for job postings and applications

### Positions
- Integer between 1-1000

### Job Type Options
- Full-time
- Part-time
- Internship
- Contract

### Company Size Options
- 1-50
- 51-200
- 201-500
- 501-1000
- 1000+

---

## 9. Common Issues & Solutions

### Issue: "Validation failed" errors
**Solution**: Check the error details in response, ensure data matches validation rules

### Issue: Dashboard showing "No data available"
**Solution**: 
- Ensure user is logged in
- Check JWT token is valid
- Verify user type (college/company) is correct

### Issue: Dashboard metrics are 0
**Solution**:
- This is expected for new accounts
- Create job posts/invites to populate data

### Issue: CORS errors when accessing dashboard
**Solution**:
- Ensure FRONTEND_URL env variable is set correctly
- Clear browser cache and retry

---

## 10. Testing Checklist

- [ ] Test college registration with validation
- [ ] Test company registration with validation
- [ ] Test login with weak password (should fail)
- [ ] Test invalid email format (should fail)
- [ ] Test invalid phone number (should fail)
- [ ] Access college dashboard as logged-in college user
- [ ] Access company dashboard as logged-in company user
- [ ] Verify dashboard metrics update with new data
- [ ] Test pagination on dashboard tables
- [ ] Test mobile responsiveness of dashboard

---

## 11. Next Steps

1. **Install Nodemailer**: For email notifications feature
   ```bash
   npm install nodemailer
   ```

2. **Add Admin Panel**: For verification and moderation

3. **Create Email Templates**: For notifications and alerts

4. **Add Real-time Updates**: Implement WebSocket for live data

5. **Database Indexing**: Add indexes for frequently queried fields for better performance

---

## 12. Performance Tips

1. **Caching**: Consider caching dashboard data for frequently accessed periods
2. **Pagination**: Dashboard already implements limiting to top 10 results
3. **Query Optimization**: MongoDB aggregation pipelines used for efficiency
4. **Frontend**: Use React.memo() for dashboard components to prevent re-renders

---

## Support & Troubleshooting

For more details, refer to:
- `DASHBOARD_VALIDATION_IMPLEMENTATION.md` - Full documentation
- `backend/middleware/validation.js` - Validation rules source
- `backend/controllers/dashboardController.js` - Dashboard logic
- `frontend/src/components/Dashboard.jsx` - Frontend components
