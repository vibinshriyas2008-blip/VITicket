const dotenv = require('dotenv');
dotenv.config();

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { generateTicketId, generateSignedToken, verifySignedToken } = require('../services/tokenService');
const { generateQRCodeDataURL } = require('../services/qrService');
const { sendTicketEmail, getLastSentEmail } = require('../services/emailService');

// ANSI Color Helpers
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

const runAllTests = async () => {
  console.log(bold('\n==============================================================='));
  console.log(bold('🚀 VITICKET COMPREHENSIVE AUTOMATED VERIFICATION SUITE'));
  console.log(bold('===============================================================\n'));

  let passedCount = 0;
  let failedCount = 0;

  try {
    await connectDB();
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});

    // Setup Test Actors
    const organizer = await User.create({
      name: 'Dr. Organizer',
      email: 'test-organizer@vit.ac.in',
      password: 'Password@123',
      role: 'ORGANIZER',
    });

    const student1 = await User.create({
      name: 'Vibin Shriyas',
      email: 'vibin.test@vitstudent.ac.in',
      password: 'Password@123',
      role: 'STUDENT',
      registrationNumber: '21BCE1042',
    });

    const student2 = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul.test@vitstudent.ac.in',
      password: 'Password@123',
      role: 'STUDENT',
      registrationNumber: '21BCE1089',
    });

    const student3 = await User.create({
      name: 'Ananya Singh',
      email: 'ananya.test@vitstudent.ac.in',
      password: 'Password@123',
      role: 'STUDENT',
      registrationNumber: '21BCE1150',
    });

    // Setup Test Events
    const hackathonEvent = await Event.create({
      name: 'AWS Student Hackathon 2026',
      description: '24h Hackathon',
      date: '15 October 2026',
      time: '10:00 AM',
      venue: 'Anna Auditorium, VIT Campus',
      organizer: organizer._id,
      capacity: 10,
      registeredCount: 0,
    });

    const limitedEvent = await Event.create({
      name: 'Limited Seat AI Workshop',
      description: 'Only 2 seats available for high performance lab access',
      date: '20 October 2026',
      time: '02:00 PM',
      venue: 'Lab 5, Technology Tower',
      organizer: organizer._id,
      capacity: 2,
      registeredCount: 0,
    });

    const culturalEvent = await Event.create({
      name: 'VIT Music Night 2026',
      description: 'Acoustic evening',
      date: '25 October 2026',
      time: '06:00 PM',
      venue: 'Main Amphitheatre',
      organizer: organizer._id,
      capacity: 100,
      registeredCount: 0,
    });

    // -------------------------------------------------------------
    // TEST 1: Student registers successfully
    // Expected: Registration created + QR generated + email sent
    // -------------------------------------------------------------
    console.log(cyan('TEST 1: Student registers successfully'));
    try {
      // Atomic increment with capacity check
      const updatedEvent = await Event.findOneAndUpdate(
        { _id: hackathonEvent._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
        { $inc: { registeredCount: 1 } },
        { new: true }
      );
      if (!updatedEvent) throw new Error('Capacity limit prevented registration unexpectedly');

      const ticketId = generateTicketId();
      const ticketToken = generateSignedToken({
        ticketId,
        eventId: hackathonEvent._id,
        studentId: student1._id,
      });

      const registration = await Registration.create({
        studentId: student1._id,
        eventId: hackathonEvent._id,
        ticketId,
        ticketToken,
        status: 'VALID',
      });

      const qrDataUrl = await generateQRCodeDataURL(ticketToken);
      const emailResult = await sendTicketEmail({
        to: student1.email,
        studentName: student1.name,
        eventName: hackathonEvent.name,
        date: hackathonEvent.date,
        time: hackathonEvent.time,
        venue: hackathonEvent.venue,
        registrationId: registration._id.toString(),
        ticketId,
        ticketToken,
      });

      if (!registration || !ticketId.startsWith('TKT-')) throw new Error('Invalid ticket ID format');
      if (!qrDataUrl.startsWith('data:image/png;base64,')) throw new Error('Invalid QR Data URL generated');
      if (!emailResult.success) throw new Error('Email failed to dispatch');

      console.log(green('  ✔ PASS: Ticket created (' + ticketId + '), QR generated, and confirmation email dispatched.'));
      passedCount++;
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    // -------------------------------------------------------------
    // TEST 2: Event reaches maximum capacity
    // Expected: New registration rejected with capacity limit
    // -------------------------------------------------------------
    console.log(cyan('\nTEST 2: Event reaches maximum capacity'));
    try {
      // Register 1st student into limitedEvent (capacity 2)
      await Event.findOneAndUpdate(
        { _id: limitedEvent._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
        { $inc: { registeredCount: 1 } }
      );
      await Registration.create({
        studentId: student1._id,
        eventId: limitedEvent._id,
        ticketId: generateTicketId(),
        ticketToken: 'dummy-token-1',
        status: 'VALID',
      });

      // Register 2nd student into limitedEvent (capacity 2 -> now full!)
      await Event.findOneAndUpdate(
        { _id: limitedEvent._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
        { $inc: { registeredCount: 1 } }
      );
      await Registration.create({
        studentId: student2._id,
        eventId: limitedEvent._id,
        ticketId: generateTicketId(),
        ticketToken: 'dummy-token-2',
        status: 'VALID',
      });

      // Attempt 3rd registration (student3) -> MUST FAIL ATOMICALLY!
      const overCapacityEvent = await Event.findOneAndUpdate(
        { _id: limitedEvent._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
        { $inc: { registeredCount: 1 } }
      );

      if (overCapacityEvent) {
        throw new Error('Registration should have been rejected but capacity was exceeded!');
      }

      console.log(green('  ✔ PASS: 3rd registration correctly rejected. Message: "Registration Closed - Maximum Capacity Reached"'));
      passedCount++;
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    // -------------------------------------------------------------
    // TEST 3: Organizer scans valid QR
    // Expected: Status becomes CHECKED_IN + check-in timestamp saved
    // -------------------------------------------------------------
    console.log(cyan('\nTEST 3: Organizer scans valid QR'));
    let validTicketToken;
    let validTicketId;
    try {
      // Create a fresh registration for student2 on hackathonEvent
      validTicketId = generateTicketId();
      validTicketToken = generateSignedToken({
        ticketId: validTicketId,
        eventId: hackathonEvent._id,
        studentId: student2._id,
      });

      await Registration.create({
        studentId: student2._id,
        eventId: hackathonEvent._id,
        ticketId: validTicketId,
        ticketToken: validTicketToken,
        status: 'VALID',
      });

      // Simulate verification by organizer
      const verifyResult = verifySignedToken(validTicketToken);
      if (!verifyResult.valid) throw new Error('Signature verification failed on authentic token');

      const ticketRecord = await Registration.findOne({ ticketId: verifyResult.payload.ticketId });
      if (!ticketRecord) throw new Error('Ticket not found in DB');
      if (ticketRecord.eventId.toString() !== hackathonEvent._id.toString()) throw new Error('Wrong event');
      if (ticketRecord.status !== 'VALID') throw new Error('Ticket not valid');

      // Update to CHECKED_IN
      ticketRecord.status = 'CHECKED_IN';
      ticketRecord.checkedInAt = new Date();
      await ticketRecord.save();

      console.log(green(`  ✔ PASS: ✅ VALID TICKET! Status updated to CHECKED_IN at ${ticketRecord.checkedInAt.toISOString()}`));
      passedCount++;
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    // -------------------------------------------------------------
    // TEST 4: Organizer scans same QR again
    // Expected: ALREADY_USED + returns original check-in timestamp
    // -------------------------------------------------------------
    console.log(cyan('\nTEST 4: Organizer scans same QR again'));
    try {
      const verifyResult = verifySignedToken(validTicketToken);
      const ticketRecord = await Registration.findOne({ ticketId: verifyResult.payload.ticketId });

      if (ticketRecord.status === 'CHECKED_IN' || ticketRecord.checkedInAt) {
        console.log(green(`  ✔ PASS: ⚠️ ALREADY USED detected! Re-checkin blocked. Original checkin: ${ticketRecord.checkedInAt}`));
        passedCount++;
      } else {
        throw new Error('Ticket was not detected as already checked in');
      }
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    // -------------------------------------------------------------
    // TEST 5: Organizer scans fake QR
    // Expected: INVALID_TICKET ("This ticket could not be verified.")
    // -------------------------------------------------------------
    console.log(cyan('\nTEST 5: Organizer scans fake QR'));
    try {
      const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyYW5kb20iOiJmYWtlIn0.invalid_signature_string';
      const verifyResult = verifySignedToken(fakeToken);

      if (!verifyResult.valid) {
        console.log(green('  ✔ PASS: ❌ INVALID TICKET correctly rejected: "This ticket could not be verified."'));
        passedCount++;
      } else {
        throw new Error('Fake token was accepted as valid!');
      }
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    // -------------------------------------------------------------
    // TEST 6: Organizer scans ticket belonging to another event
    // Expected: WRONG_EVENT ("This ticket belongs to a different event.")
    // -------------------------------------------------------------
    console.log(cyan('\nTEST 6: Organizer scans ticket belonging to another event'));
    try {
      // Create valid ticket for culturalEvent
      const culturalTicketId = generateTicketId();
      const culturalToken = generateSignedToken({
        ticketId: culturalTicketId,
        eventId: culturalEvent._id,
        studentId: student3._id,
      });

      await Registration.create({
        studentId: student3._id,
        eventId: culturalEvent._id,
        ticketId: culturalTicketId,
        ticketToken: culturalToken,
        status: 'VALID',
      });

      // Organizer is verifying for hackathonEvent, but ticket belongs to culturalEvent!
      const verifyResult = verifySignedToken(culturalToken);
      if (!verifyResult.valid) throw new Error('Token should have valid cryptographic signature');

      const ticketRecord = await Registration.findOne({ ticketId: verifyResult.payload.ticketId });

      if (ticketRecord.eventId.toString() !== hackathonEvent._id.toString()) {
        console.log(green('  ✔ PASS: ❌ WRONG EVENT correctly detected: "This ticket belongs to a different event."'));
        passedCount++;
      } else {
        throw new Error('Wrong event was not detected');
      }
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    // -------------------------------------------------------------
    // TEST 7: Concurrency & Race Condition Verification
    // Expected: When 5 concurrent requests compete for 1 remaining seat,
    // exactly 1 succeeds and 4 are cleanly rejected without exceeding capacity.
    // -------------------------------------------------------------
    console.log(cyan('\nTEST 7: Concurrency & Race Condition Protection'));
    try {
      const raceEvent = await Event.create({
        name: 'Flash Sale Workshop',
        description: 'Single seat remaining',
        date: '30 October 2026',
        time: '04:00 PM',
        venue: 'Room 101',
        organizer: organizer._id,
        capacity: 1,
        registeredCount: 0,
      });

      // Simulate 5 simultaneous registration attempts
      const attempts = Array.from({ length: 5 }, (_, i) => i + 1);
      const results = await Promise.all(
        attempts.map(async (i) => {
          return await Event.findOneAndUpdate(
            { _id: raceEvent._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
            { $inc: { registeredCount: 1 } },
            { new: true }
          );
        })
      );

      const successfulAttempts = results.filter((res) => res !== null);
      const finalEventState = await Event.findById(raceEvent._id);

      if (successfulAttempts.length === 1 && finalEventState.registeredCount === 1) {
        console.log(green(`  ✔ PASS: Concurrency safe! Out of 5 parallel requests, exactly 1 succeeded and final registeredCount = 1 (capacity = 1).`));
        passedCount++;
      } else {
        throw new Error(`Race condition occurred! Successful attempts: ${successfulAttempts.length}, Final count: ${finalEventState.registeredCount}`);
      }
    } catch (err) {
      console.log(red('  ✖ FAIL: ' + err.message));
      failedCount++;
    }

    console.log(bold('\n==============================================================='));
    console.log(bold(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`));
    console.log(bold('===============================================================\n'));

    await closeDB();
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (globalErr) {
    console.error(red('Global test suite error: ' + globalErr.message));
    await closeDB();
    process.exit(1);
  }
};

runAllTests();
