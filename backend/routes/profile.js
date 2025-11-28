const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, profileController.createProfile);
router.get('/me', auth, profileController.getMyProfile);
router.put('/', auth, profileController.updateProfile);
router.delete('/', auth, profileController.deleteProfile);

// Placement records endpoints
router.post('/placement-records/upload', auth, upload.single('placementRecords'), profileController.uploadPlacementRecords);
router.delete('/placement-records', auth, profileController.deletePlacementRecords);

module.exports = router; 