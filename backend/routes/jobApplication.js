const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const auth = require('../middleware/auth');
const {
  validateJobApplication,
  validateMongoId
} = require('../middleware/validation');

// Protected routes
router.post('/apply/:jobId', auth, validateMongoId, validateJobApplication, jobApplicationController.applyForJob);
router.get('/job/:jobId', auth, validateMongoId, jobApplicationController.getJobApplications);
// Route for current user's applications (must come before /college/:collegeId to avoid route shadowing)
router.get('/college', auth, jobApplicationController.getCollegeApplications);
router.get('/college/:collegeId', auth, validateMongoId, jobApplicationController.getCollegeApplications);
router.get('/stats', auth, jobApplicationController.getApplicationStats);
router.get('/:applicationId', auth, validateMongoId, jobApplicationController.getApplicationById);
router.put('/:applicationId/status', auth, validateMongoId, jobApplicationController.updateApplicationStatus);
router.put('/:applicationId/withdraw', auth, validateMongoId, jobApplicationController.withdrawApplication);

module.exports = router;
