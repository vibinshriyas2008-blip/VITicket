const express = require('express');
const router = express.Router();
const { getMyRegistrations, getTicketById } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-registrations', protect, getMyRegistrations);
router.get('/tickets/:id', protect, getTicketById);

module.exports = router;
