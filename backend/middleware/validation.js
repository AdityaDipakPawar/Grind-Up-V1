const { body, validationResult, param, query } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Authentication validation rules
const validateCollegeRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('collegeName')
    .trim()
    .notEmpty()
    .withMessage('College name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('College name must be between 2 and 100 characters'),
  body('contactNo')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  handleValidationErrors
];

const validateCompanyRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('contactNo')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
  body('companySize')
    .isIn(['1-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Job posting validation
const validateJobPosting = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('location')
    .optional()
    .custom((value) => {
      if (typeof value === 'object' && value.city && value.state) {
        return true;
      }
      throw new Error('Location must include city and state');
    }),
  body('salary')
    .optional(),
  body('vacancies')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Vacancies must be a number between 1 and 1000'),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type'),
  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline date'),
  handleValidationErrors
];

// Job application validation
// Note: For college applications, cover letter and resume are optional
// Colleges apply on behalf of their students, not individual student applications
const validateJobApplication = [
  // jobId comes from route params, not body
  body('resume')
    .optional()
    .trim(),
  body('coverLetter')
    .optional()
    .trim()
    .custom((value) => {
      // If cover letter is provided, it must be between 10 and 2000 characters
      if (value && value.length > 0) {
        if (value.length < 10 || value.length > 2000) {
          throw new Error('Cover letter must be between 10 and 2000 characters if provided');
        }
      }
      return true;
    }),
  // Allow other optional fields - these are for individual student applications (future feature)
  body('studentDetails').optional(),
  body('academicInfo').optional(),
  body('skills').optional(),
  body('technicalSkills').optional(),
  body('projects').optional(),
  body('internships').optional(),
  body('additionalInfo').optional(),
  body('documents').optional(),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('tpoName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('TPO name must be between 2 and 50 characters'),
  body('tpoContactNo')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('avgCTC')
    .optional()
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Invalid CTC format'),
  body('placementPercent')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Placement percentage must be between 0 and 100'),
  handleValidationErrors
];

// Invite validation
const validateInvite = [
  body('collegeId')
    .isMongoId()
    .withMessage('Invalid college ID'),
  body('jobPostId')
    .isMongoId()
    .withMessage('Invalid job post ID'),
  handleValidationErrors
];

// ID parameter validation
const validateMongoId = [
  param()
    .custom((value, { req }) => {
      // Validate any mongo ID parameter in the route (id, jobId, collegeId, applicationId, etc)
      const paramKeys = Object.keys(req.params);
      for (const key of paramKeys) {
        const paramValue = req.params[key];
        if (!paramValue.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error(`Invalid ${key} format`);
        }
      }
      return true;
    }),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Search and filter validation
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'accepted', 'declined'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

module.exports = {
  validateCollegeRegister,
  validateCompanyRegister,
  validateLogin,
  validateJobPosting,
  validateJobApplication,
  validateProfileUpdate,
  validateInvite,
  validateMongoId,
  validatePagination,
  validateSearch,
  handleValidationErrors
};
