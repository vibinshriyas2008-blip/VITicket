const dotenv = require('dotenv');
dotenv.config();

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { generateTicketId, generateSignedToken } = require('../services/tokenService');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing existing collections...');

    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});

    console.log('[Seed] Creating demo accounts...');

    // 1. Create Organizer
    const organizer = await User.create({
      name: 'Dr. S. K. Ramanathan (Faculty Organizer)',
      email: 'organizer@vit.ac.in',
      password: 'Admin@1234',
      role: 'ORGANIZER',
      registrationNumber: 'FAC-8821',
    });

    // 2. Create Students
    const student1 = await User.create({
      name: 'Vibin Shriyas',
      email: 'vibin@vitstudent.ac.in',
      password: 'Student@1234',
      role: 'STUDENT',
      registrationNumber: '21BCE1042',
    });

    const student2 = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@vitstudent.ac.in',
      password: 'Student@1234',
      role: 'STUDENT',
      registrationNumber: '21BCE1089',
    });

    const student3 = await User.create({
      name: 'Ananya Singh',
      email: 'ananya@vitstudent.ac.in',
      password: 'Student@1234',
      role: 'STUDENT',
      registrationNumber: '21BCE1150',
    });

    console.log('[Seed] Creating sample campus events...');

    // Event 1: AWS Student Hackathon (Available)
    const event1 = await Event.create({
      name: 'AWS Student Hackathon 2026',
      description: 'The flagship 24-hour national hackathon hosted by VIT Cloud Club. Build scalable cloud solutions, explore serverless architectures, and compete for $5,000 in cloud credits and internships.',
      date: '15 October 2026',
      time: '10:00 AM',
      venue: 'Anna Auditorium, VIT Campus',
      organizer: organizer._id,
      organizerName: 'AWS VIT Cloud Club',
      capacity: 100,
      registeredCount: 0,
      category: 'Hackathon',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    });

    // Event 2: AI & Robotics National Symposium (Almost Full: 8/10)
    const event2 = await Event.create({
      name: 'AI & Robotics National Symposium',
      description: 'Deep dive into generative AI, humanoid robotics, and autonomous systems with keynotes from premier research laboratories and hands-on demonstrations.',
      date: '22 October 2026',
      time: '02:00 PM',
      venue: 'Dr. M.G.R Block Seminar Hall',
      organizer: organizer._id,
      organizerName: 'Robotics Association of VIT',
      capacity: 10,
      registeredCount: 8,
      category: 'Technical',
      bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    });

    // Event 3: Google Cloud DevOps Workshop (Sold out: 2/2)
    const event3 = await Event.create({
      name: 'Google Cloud DevOps Workshop',
      description: 'Hands-on CI/CD pipelines, Kubernetes cluster provisioning, and microservices observability using Google Cloud Platform tools. Strict capacity limit.',
      date: '28 October 2026',
      time: '11:00 AM',
      venue: 'Technology Tower Lab 4',
      organizer: organizer._id,
      organizerName: 'Developer Student Clubs VIT',
      capacity: 2,
      registeredCount: 2,
      category: 'Workshop',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    });

    // Event 4: VIT Riviera Cultural Night (Available)
    const event4 = await Event.create({
      name: 'VIT Riviera Cultural Night 2026',
      description: 'An electrifying evening of university music bands, choreography showcases, fusion dances, and celebrity DJ performances under the stars.',
      date: '05 November 2026',
      time: '06:00 PM',
      venue: 'Outdoor Sports Stadium, VIT Campus',
      organizer: organizer._id,
      organizerName: 'Riviera Student Committee',
      capacity: 350,
      registeredCount: 42,
      category: 'Cultural',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    });

    console.log('[Seed] Generating test registrations & tickets for AWS Hackathon...');

    // 1. Ticket for Vibin (VALID, not yet checked-in)
    const ticketId1 = generateTicketId();
    const token1 = generateSignedToken({ ticketId: ticketId1, eventId: event1._id, studentId: student1._id });
    const reg1 = await Registration.create({
      studentId: student1._id,
      eventId: event1._id,
      ticketId: ticketId1,
      ticketToken: token1,
      status: 'VALID',
      registeredAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    });

    // 2. Ticket for Rahul (ALREADY CHECKED-IN for testing duplicate check-in case)
    const ticketId2 = generateTicketId();
    const token2 = generateSignedToken({ ticketId: ticketId2, eventId: event1._id, studentId: student2._id });
    const reg2 = await Registration.create({
      studentId: student2._id,
      eventId: event1._id,
      ticketId: ticketId2,
      ticketToken: token2,
      status: 'CHECKED_IN',
      registeredAt: new Date(Date.now() - 3600000 * 4),
      checkedInAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
    });

    // 3. Ticket for Ananya (Checked-in 30 mins ago)
    const ticketId3 = generateTicketId();
    const token3 = generateSignedToken({ ticketId: ticketId3, eventId: event1._id, studentId: student3._id });
    const reg3 = await Registration.create({
      studentId: student3._id,
      eventId: event1._id,
      ticketId: ticketId3,
      ticketToken: token3,
      status: 'CHECKED_IN',
      registeredAt: new Date(Date.now() - 3600000 * 3),
      checkedInAt: new Date(Date.now() - 1800000), // 30 mins ago
    });

    // Update event1 registered count
    event1.registeredCount = 3;
    await event1.save();

    console.log('\n===============================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===============================================================');
    console.log('👤 TEST ORGANIZER ACCOUNT:');
    console.log('   Email:    organizer@vit.ac.in');
    console.log('   Password: Admin@1234');
    console.log('---------------------------------------------------------------');
    console.log('🎓 TEST STUDENT ACCOUNT:');
    console.log('   Email:    vibin@vitstudent.ac.in');
    console.log('   Password: Student@1234');
    console.log('---------------------------------------------------------------');
    console.log('🎫 TEST TICKETS FOR AWS HACKATHON (Event ID: ' + event1._id + '):');
    console.log(`   1) [VALID TICKET - Vibin Shriyas]`);
    console.log(`      Ticket ID: ${ticketId1}`);
    console.log(`      Token:     ${token1}`);
    console.log(`   2) [ALREADY USED TICKET - Rahul Kumar]`);
    console.log(`      Ticket ID: ${ticketId2}`);
    console.log(`      Token:     ${token2}`);
    console.log('===============================================================\n');

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
