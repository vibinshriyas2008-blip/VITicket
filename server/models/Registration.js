const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ticketToken: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['VALID', 'CHECKED_IN', 'INVALID', 'ALREADY_USED'],
      default: 'VALID',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active registration for the same student and event
registrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
