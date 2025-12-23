const express = require('express');
const router = express.Router();
const jobPostsController = require('../controllers/jobPostsController');
const auth = require('../middleware/auth');
const authorizeApprovedCompany = require('../middleware/authorizeApprovedCompany');
const { 
  validateJobPosting, 
  validateMongoId,
  validateSearch
} = require('../middleware/validation');

// Public routes
router.get('/', jobPostsController.getAllJobPosts);
router.get('/search', validateSearch, jobPostsController.searchJobPosts);
router.get('/:id', validateMongoId, jobPostsController.getJobPostById);

// Protected routes
router.post('/', auth, authorizeApprovedCompany, validateJobPosting, jobPostsController.createJobPost);
router.put('/:id', auth, authorizeApprovedCompany, validateMongoId, validateJobPosting, jobPostsController.updateJobPost);
router.delete('/:id', auth, authorizeApprovedCompany, jobPostsController.deleteJobPost);
router.get('/company/:companyId', auth, validateMongoId, jobPostsController.getJobPostsByCompany);

module.exports = router;
