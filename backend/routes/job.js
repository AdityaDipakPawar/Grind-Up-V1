const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const authorizeApprovedCompany = require('../middleware/authorizeApprovedCompany');

// Job posting routes (company only)
router.post('/', auth, authorizeApprovedCompany, jobController.createJob);
router.get('/company', auth, jobController.getCompanyJobs);
router.put('/:id', auth, authorizeApprovedCompany, jobController.updateJob);
router.delete('/:id', auth, authorizeApprovedCompany, jobController.deleteJob);

// Job viewing routes (all authenticated users)
router.get('/', auth, jobController.getAllJobs);
router.get('/:id', auth, jobController.getJobById);

// Job application routes
router.post('/:id/apply', auth, jobController.applyForJob);
router.get('/:id/applications', auth, jobController.getJobApplications);
router.put('/applications/:applicationId', auth, jobController.updateApplicationStatus);

// Invitation routes
router.post('/:id/invite', auth, jobController.inviteCollege);

module.exports = router;

