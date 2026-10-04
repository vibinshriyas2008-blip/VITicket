const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { registerForEvent } = require('../controllers/registrationController');
const { getEventCheckins, getEventStatistics } = require('../controllers/checkinController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getEvents)
  .post(protect, authorize('ORGANIZER'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('ORGANIZER'), updateEvent)
  .delete(protect, authorize('ORGANIZER'), deleteEvent);

// Register endpoint nested under event
router.post('/:id/register', protect, registerForEvent);

// Organizer event insights
router.get('/:id/checkins', protect, authorize('ORGANIZER'), getEventCheckins);
router.get('/:id/statistics', protect, authorize('ORGANIZER'), getEventStatistics);

module.exports = router;
