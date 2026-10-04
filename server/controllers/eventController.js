const Event = require('../models/Event');

// @desc    Get all events with optional filters & search
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    const events = await Event.find(query).sort({ createdAt: -1 });

    let filteredEvents = events;
    if (status && status !== 'ALL') {
      filteredEvents = events.filter((ev) => ev.status === status);
    }

    res.status(200).json({
      success: true,
      count: filteredEvents.length,
      events: filteredEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer only)
const createEvent = async (req, res, next) => {
  try {
    const { name, description, date, time, venue, capacity, bannerUrl, category } = req.body;

    if (!name || !description || !date || !time || !venue || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, date, time, venue, capacity',
      });
    }

    const event = await Event.create({
      name,
      description,
      date,
      time,
      venue,
      capacity: Number(capacity),
      registeredCount: 0,
      bannerUrl: bannerUrl || '',
      category: category || 'Technical',
      organizer: req.user._id,
      organizerName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer only)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Ensure capacity cannot be set lower than already registered attendees
    if (req.body.capacity && Number(req.body.capacity) < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than current registered attendees (${event.registeredCount})`,
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer only)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
