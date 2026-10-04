const express = require('express');
const router = express.Router();
const { verifyTicket } = require('../controllers/checkinController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/verify', protect, authorize('ORGANIZER'), verifyTicket);

module.exports = router;
