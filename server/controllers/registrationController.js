const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { generateTicketId, generateSignedToken } = require('../services/tokenService');
const { generateQRCodeDataURL } = require('../services/qrService');
const { sendTicketEmail } = require('../services/emailService');

// @desc    Register for an event with atomic capacity check & anti-race condition
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res, next) => {
  const eventId = req.params.id;
  const studentId = req.user._id;

  try {
    // Step 1: Check if student has already registered for this event
    const existingRegistration = await Registration.findOne({ studentId, eventId });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event. Check "My Tickets" to view your pass.',
        ticketId: existingRegistration.ticketId,
      });
    }

    // Step 2: Atomic find and increment with capacity constraint to prevent race conditions
    // Only increments registeredCount IF registeredCount < capacity
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ['$registeredCount', '$capacity'] },
      },
      {
        $inc: { registeredCount: 1 },
      },
      { new: true }
    );

    if (!event) {
      // Check if event actually exists to provide accurate error message
      const eventExists = await Event.findById(eventId);
      if (!eventExists) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // If event exists but could not be updated, capacity is full!
      return res.status(400).json({
        success: false,
        message: 'Registration Closed - Maximum Capacity Reached',
      });
    }

    // Step 3: Generate unique ticket ID and cryptographically signed token
    const ticketId = generateTicketId();
    const ticketToken = generateSignedToken({ ticketId, eventId: event._id, studentId });

    // Step 4: Create registration record
    let registration;
    try {
      registration = await Registration.create({
        studentId,
        eventId: event._id,
        ticketId,
        ticketToken,
        status: 'VALID',
        registeredAt: new Date(),
      });
    } catch (createErr) {
      // Rollback the incremented registeredCount if registration creation fails (e.g. duplicate constraint)
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      throw createErr;
    }

    // Step 5: Generate QR code Data URL
    const qrDataUrl = await generateQRCodeDataURL(ticketToken);

    // Step 6: Dispatch confirmation email asynchronously (does not block HTTP response)
    sendTicketEmail({
      to: req.user.email,
      studentName: req.user.name,
      eventName: event.name,
      date: event.date,
      time: event.time,
      venue: event.venue,
      registrationId: registration._id.toString(),
      ticketId,
      ticketToken,
    }).catch((emailErr) => {
      console.error('[Registration] Background email sending failed:', emailErr.message);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your digital ticket and QR pass have been generated.',
      registration: {
        id: registration._id,
        ticketId,
        ticketToken,
        status: registration.status,
        registeredAt: registration.registeredAt,
        qrCode: qrDataUrl,
        event: {
          id: event._id,
          name: event.name,
          date: event.date,
          time: event.time,
          venue: event.venue,
        },
        student: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations / tickets for current student
// @route   GET /api/my-registrations
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate('eventId', 'name description date time venue bannerUrl category organizerName')
      .sort({ registeredAt: -1 });

    // Append QR code data URL to each registration for UI rendering
    const enhancedRegistrations = await Promise.all(
      registrations.map(async (reg) => {
        let qrCode = null;
        try {
          qrCode = await generateQRCodeDataURL(reg.ticketToken);
        } catch (e) {
          console.warn('[MyRegistrations] Error generating QR for ticket:', reg.ticketId);
        }

        return {
          id: reg._id,
          ticketId: reg.ticketId,
          ticketToken: reg.ticketToken,
          status: reg.status,
          registeredAt: reg.registeredAt,
          checkedInAt: reg.checkedInAt,
          qrCode,
          event: reg.eventId,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedRegistrations.length,
      registrations: enhancedRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket details by ticket ID or registration ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by ticketId (TKT-XXXXXX) or MongoDB _id
    let registration;
    if (id.startsWith('TKT-')) {
      registration = await Registration.findOne({ ticketId: id })
        .populate('eventId')
        .populate('studentId', 'name email registrationNumber');
    } else {
      registration = await Registration.findById(id)
        .populate('eventId')
        .populate('studentId', 'name email registrationNumber');
    }

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Authorization: User must be ticket owner or organizer
    const isOwner = req.user._id.toString() === registration.studentId._id.toString();
    const isOrganizer = req.user.role === 'ORGANIZER';

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this ticket' });
    }

    const qrCode = await generateQRCodeDataURL(registration.ticketToken);

    res.status(200).json({
      success: true,
      ticket: {
        id: registration._id,
        ticketId: registration.ticketId,
        ticketToken: registration.ticketToken,
        status: registration.status,
        registeredAt: registration.registeredAt,
        checkedInAt: registration.checkedInAt,
        qrCode,
        event: registration.eventId,
        student: registration.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getTicketById,
};
