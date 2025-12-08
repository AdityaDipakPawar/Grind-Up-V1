const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Dashboard routes
router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/college', auth, dashboardController.getCollegeDashboard);
router.get('/company', auth, dashboardController.getCompanyDashboard);

module.exports = router;
