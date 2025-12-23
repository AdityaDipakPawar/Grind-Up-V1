const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { 
  validateCollegeRegister, 
  validateCompanyRegister, 
  validateLogin 
} = require('../middleware/validation');

// Registration routes with validation
router.post('/register/college', validateCollegeRegister, authController.registerCollege);
router.post('/register/company', validateCompanyRegister, authController.registerCompany);
// Admin registration (uses ADMIN_SIGNUP_KEY, no public validation middleware)
router.post('/register/admin', authController.registerAdmin);

// Authentication routes with validation
router.post('/login', validateLogin, authController.login);
router.post('/logout', auth, authController.logout);

// User info route
router.get('/me', auth, authController.getMe);
router.get('/check-profile-completion', auth, authController.checkProfileCompletion);

module.exports = router;
