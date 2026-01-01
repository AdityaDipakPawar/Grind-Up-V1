const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');

// All routes below require admin
router.use(auth, authorizeAdmin);

// Analytics route
router.get('/analytics', analyticsController.getAnalytics);

// GET /api/admin/pending/colleges
router.get('/pending/colleges', (req, res, next) => {
  req.params.type = 'colleges';
  return adminController.listPending(req, res, next);
});

// GET /api/admin/pending/companies
router.get('/pending/companies', (req, res, next) => {
  req.params.type = 'companies';
  return adminController.listPending(req, res, next);
});

// GET /api/admin/approved/colleges
router.get('/approved/colleges', (req, res, next) => {
  req.params.type = 'colleges';
  return adminController.listApproved(req, res, next);
});

// GET /api/admin/approved/companies
router.get('/approved/companies', (req, res, next) => {
  req.params.type = 'companies';
  return adminController.listApproved(req, res, next);
});

// POST /api/admin/colleges/:id/approval  { action: 'approve' | 'reject' }
router.post('/colleges/:id/approval', (req, res, next) => {
  req.params.type = 'colleges';
  return adminController.setApproval(req, res, next);
});

// POST /api/admin/companies/:id/approval  { action: 'approve' | 'reject' }
router.post('/companies/:id/approval', (req, res, next) => {
  req.params.type = 'companies';
  return adminController.setApproval(req, res, next);
});

module.exports = router;
