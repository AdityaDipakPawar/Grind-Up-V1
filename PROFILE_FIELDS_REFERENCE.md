# Profile Mandatory Fields Reference

## College Profile - Mandatory Fields (6 required)

### Must be filled to save:
| Field Name | Field Key | Description |
|-----------|-----------|-------------|
| College Name * | collegeName | Name of the college institution |
| Contact No * | contactNo | Contact number for the college |
| City * | collegeCity | Location/city of the college |
| TPO Name * | tpoName | Training & Placement Officer name |
| Average CTC * | avgCTC | Average Cost to Company offered in placements |
| Placement Percent * | placementPercent | Percentage of students placed |

### Optional fields:
| Field Name | Field Key |
|-----------|-----------|
| Grade | grade |
| TPO Contact No | tpoContactNo |
| University Affiliation | universityAffiliation |
| Courses | courses |
| Number of Students | numStudents |
| Highest CGPA | highestCGPA |
| Average Placed | avgPlaced |
| Last 3 Years Placement Records | placementRecordUrl |

---

## Company Profile - Mandatory Fields (8 required)

### Must be filled to save:
| Field Name | Field Key | Description |
|-----------|-----------|-------------|
| Company Name * | companyName | Official name of the company |
| Contact No * | contactNo | Company contact number |
| Industry * | industry | Industry/sector of the company |
| Company Size * | companySize | Size category (Small, Medium, Large, etc.) |
| Recruiter Name * | recruiterName | Name of the recruiter/HR contact |
| Recruiter Email * | recruiterEmail | Email of the recruiter |
| Company Bio * | companyBio | Description/biography of the company |
| Years of Experience * | yearsOfExperience | Years the company has been operating |

### Optional fields:
| Field Name | Field Key |
|-----------|-----------|
| Location | location |

---

## Validation Rules

### For ALL users:
✅ All mandatory fields must have values (not empty strings)
✅ Whitespace-only values are treated as empty
✅ At least ONE mandatory field must be NEW/changed from original
✅ Optional fields can be empty
✅ Optional fields don't affect save validation

### Specific to College:
✅ Placement Records upload is completely optional
✅ College can save without uploading placement records file

### Specific to Company:
✅ All 8 listed fields are truly mandatory
✅ No fields are optional for company complete profile

---

## Error Messages

### When saving with NO NEW DATA:
```
"Please enter new data in at least one mandatory field to save"
```

### When saving with INCOMPLETE mandatory fields:
```
"Mandatory fields missing: collegeName, tpoName"
```

### When saving with invalid data:
```
"Mandatory fields missing: [field1], [field2], [field3]"
```

---

## Database Schema (Reference)

### College Model
```javascript
{
  user: ObjectId,                    // Required (reference to User)
  collegeName: String,               // Required
  contactNo: String,                 // Required
  collegeCity: String,               // Required
  grade: String,                     // Optional
  tpoName: String,                   // Required
  tpoContactNo: String,              // Optional
  universityAffiliation: String,     // Optional
  courses: String,                   // Optional
  numStudents: Number,               // Optional
  highestCGPA: String,               // Optional
  avgCTC: String,                    // Required
  avgPlaced: Number,                 // Optional
  placementPercent: String,          // Required
  placementRecordUrl: String,        // Optional (file URL)
  placementRecordUploadedAt: Date,   // Optional (timestamp)
}
```

### Company Model
```javascript
{
  user: ObjectId,                    // Required (reference to User)
  companyName: String,               // Required
  contactNo: String,                 // Required
  industry: String,                  // Required
  companySize: String,               // Required
  location: String,                  // Optional
  recruiterName: String,             // Required
  recruiterEmail: String,            // Required
  companyBio: String,                // Required
  yearsOfExperience: Number,         // Required
}
```

---

## Frontend Validation Code Location

**File**: `frontend/src/pages/Profile.jsx`

**Key Functions**:
```javascript
// Line ~75: Define mandatory fields
const getMandatoryFields = () => { ... }

// Line ~85: Validate all mandatory fields are filled
const validateForm = () => { ... }

// Line ~105: Check if any mandatory field changed
const hasNewData = () => { ... }

// Line ~115: Handle form submission with validation
const handleSubmit = (e) => { ... }
```

---

## Backend Validation Code Location

**File**: `backend/controllers/profileController.js`

**Key Functions**:
```javascript
// Line ~6-8: Define mandatory fields object
const MANDATORY_FIELDS = { ... }

// Line ~11-15: Validate mandatory fields
const validateMandatoryFields = (data, userType) => { ... }

// Line ~18-22: Check if data changed
const hasDataChanged = (newData, oldData, userType) => { ... }

// Line ~99: Updated updateProfile endpoint with validation
exports.updateProfile = async (req, res) => { ... }
```

---

## How to Update Mandatory Fields

If you need to add/remove mandatory fields in future:

### Frontend Changes
Update `getMandatoryFields()` function in Profile.jsx:
```javascript
const getMandatoryFields = () => {
  if (user?.type === 'college') {
    return ['collegeName', 'contactNo', 'collegeCity', 'tpoName', 'avgCTC', 'placementPercent'];
    // Add or remove field names here
  } else {
    return ['companyName', 'contactNo', 'industry', 'companySize', 'recruiterName', 'recruiterEmail', 'companyBio', 'yearsOfExperience'];
    // Add or remove field names here
  }
};
```

### Backend Changes
Update `MANDATORY_FIELDS` object in profileController.js:
```javascript
const MANDATORY_FIELDS = {
  college: ['collegeName', 'contactNo', 'collegeCity', 'tpoName', 'avgCTC', 'placementPercent'],
  // Add or remove field names here
  company: ['companyName', 'contactNo', 'industry', 'companySize', 'recruiterName', 'recruiterEmail', 'companyBio', 'yearsOfExperience'],
  // Add or remove field names here
};
```

### Form Display Changes
Add/remove field labels with asterisks in the JSX form:
```jsx
<label>Field Name <span style={{ color: 'red' }}>*</span></label>
```

---

## Quick Test Checklist

- [ ] College: Try saving with empty College Name → Error shown
- [ ] College: Try saving without changes → "Please enter new data..." shown
- [ ] College: Fill all 6 mandatory fields → Saves successfully
- [ ] College: Placement Records optional → Can save without uploading
- [ ] Company: Try saving with empty Company Name → Error shown
- [ ] Company: Try saving without changes → "Please enter new data..." shown
- [ ] Company: Fill all 8 mandatory fields → Saves successfully
- [ ] Company: Recruiter fields visible and mandatory → All fields work
- [ ] Validation errors appear in red below empty fields
- [ ] Red asterisks appear on all mandatory field labels
- [ ] Success message shows after successful save
- [ ] Can make changes and save again → Works correctly
- [ ] Profile loads with previously saved data → Data persists

---

**Last Updated**: December 8, 2025
**Status**: ✅ Implementation Complete
**Ready for**: Testing and Deployment
