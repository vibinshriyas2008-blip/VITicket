const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { verifySignedToken } = require('../services/tokenService');

// @desc    Verify and check-in student ticket
// @route   POST /api/checkin/verify
// @access  Private (Organizer only)
const verifyTicket = async (req, res, next) => {
  try {
    const { token, eventId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        verificationStatus: 'INVALID',
        message: 'This ticket could not be verified.',
        error: 'Missing ticket token',
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        verificationStatus: 'INVALID',
        message: 'Target event ID is required for verification.',
      });
    }

    // STEP 1 & 2: Extract signed token and verify cryptographic signature
    const verification = verifySignedToken(token.trim());
    if (!verification.valid) {
      console.warn(`[Check-In] Cryptographic verification failed: ${verification.error}`);
      return res.status(400).json({
        success: false,
        verificationStatus: 'INVALID',
        message: 'This ticket could not be verified.',
        error: verification.error,
      });
    }

    const { ticketId, eventId: tokenEventId, studentId } = verification.payload;

    // STEP 3: Find ticket in database
    const registration = await Registration.findOne({ ticketId })
      .populate('studentId', 'name email registrationNumber')
      .populate('eventId', 'name date time venue capacity');

    if (!registration) {
      console.warn(`[Check-In] Ticket ${ticketId} not found in database`);
      return res.status(400).json({
        success: false,
        verificationStatus: 'INVALID',
        message: 'This ticket could not be verified.',
        error: 'Ticket not found in system records',
      });
    }

    // STEP 4: Check if ticket belongs to the selected event
    if (registration.eventId._id.toString() !== eventId.toString()) {
      return res.status(400).json({
        success: false,
        verificationStatus: 'WRONG_EVENT',
        message: 'This ticket belongs to a different event.',
        ticket: {
          ticketId: registration.ticketId,
          studentName: registration.studentId ? registration.studentId.name : 'Unknown Student',
          ticketEventName: registration.eventId ? registration.eventId.name : 'Another Event',
        },
      });
    }

    // STEP 5: Check ticket status
    // CASE 2: ALREADY USED
    if (registration.status === 'CHECKED_IN' || registration.checkedInAt) {
      const originalTime = new Date(registration.checkedInAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      return res.status(409).json({
        success: false,
        verificationStatus: 'ALREADY_USED',
        message: 'Ticket has already been checked in.',
        ticket: {
          ticketId: registration.ticketId,
          studentName: registration.studentId ? registration.studentId.name : 'Unknown',
          eventName: registration.eventId ? registration.eventId.name : '',
          originalCheckInTime: originalTime,
          checkedInAt: registration.checkedInAt,
        },
      });
    }

    // CASE 1: VALID TICKET - Perform check-in
    const checkInTimestamp = new Date();
    registration.status = 'CHECKED_IN';
    registration.checkedInAt = checkInTimestamp;
    await registration.save();

    const formattedTime = checkInTimestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return res.status(200).json({
      success: true,
      verificationStatus: 'VALID',
      message: 'Ticket verified and checked in successfully.',
      ticket: {
        ticketId: registration.ticketId,
        studentName: registration.studentId ? registration.studentId.name : 'Attendee',
        studentEmail: registration.studentId ? registration.studentId.email : '',
        eventName: registration.eventId ? registration.eventId.name : '',
        status: 'CHECKED_IN',
        checkInTime: formattedTime,
        checkedInAt: checkInTimestamp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get check-in logs for an event
// @route   GET /api/events/:id/checkins
// @access  Private (Organizer only)
const getEventCheckins = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkins = await Registration.find({
      eventId: id,
      status: 'CHECKED_IN',
    })
      .populate('studentId', 'name email registrationNumber')
      .sort({ checkedInAt: -1 });

    res.status(200).json({
      success: true,
      count: checkins.length,
      checkins: checkins.map((item) => ({
        id: item._id,
        ticketId: item.ticketId,
        studentName: item.studentId ? item.studentId.name : 'Unknown',
        studentEmail: item.studentId ? item.studentId.email : '',
        registrationNumber: item.studentId ? item.studentId.registrationNumber : '',
        checkedInAt: item.checkedInAt,
        checkedInTime: item.checkedInAt
          ? new Date(item.checkedInAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : '',
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event statistics
// @route   GET /api/events/:id/statistics
// @access  Private (Organizer only)
const getEventStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const totalRegistrations = await Registration.countDocuments({ eventId: id });
    const totalCheckedIn = await Registration.countDocuments({ eventId: id, status: 'CHECKED_IN' });
    const remainingAttendees = Math.max(0, totalRegistrations - totalCheckedIn);

    const recentCheckins = await Registration.find({
      eventId: id,
      status: 'CHECKED_IN',
    })
      .populate('studentId', 'name email')
      .sort({ checkedInAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      statistics: {
        eventId: event._id,
        eventName: event.name,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        totalRegistrations,
        checkedInCount: totalCheckedIn,
        remainingAttendees,
        recentCheckins: recentCheckins.map((item) => ({
          ticketId: item.ticketId,
          studentName: item.studentId ? item.studentId.name : 'Unknown',
          studentEmail: item.studentId ? item.studentId.email : '',
          checkedInAt: item.checkedInAt,
          checkedInTime: item.checkedInAt
            ? new Date(item.checkedInAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : '',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyTicket,
  getEventCheckins,
  getEventStatistics,
};
