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
  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('salary')
    .optional()
    .matches(/^\d+(-\d+)?$/)
    .withMessage('Invalid salary format'),
  body('positions')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Positions must be a number between 1 and 1000'),
  body('jobType')
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract'])
    .withMessage('Invalid job type'),
  body('deadline')
    .isISO8601()
    .withMessage('Invalid deadline date'),
  handleValidationErrors
];

// Job application validation
const validateJobApplication = [
  body('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('resumeUrl')
    .trim()
    .notEmpty()
    .withMessage('Resume URL is required'),
  body('coverLetter')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Cover letter must be between 10 and 2000 characters'),
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
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
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
