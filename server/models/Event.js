const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    organizerName: {
      type: String,
      default: 'VIT Student Council',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Technical',
      enum: ['Technical', 'Workshop', 'Hackathon', 'Cultural', 'Sports', 'Conference'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});

eventSchema.virtual('status').get(function () {
  if (this.registeredCount >= this.capacity) {
    return 'REGISTRATION CLOSED';
  }
  if (this.registeredCount >= Math.floor(this.capacity * 0.8)) {
    return 'ALMOST FULL';
  }
  return 'AVAILABLE';
});

module.exports = mongoose.model('Event', eventSchema);
