/**
 * Nebraska Backend Seed Script
 * Run this script with: node seedData.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/nebraska';

console.log('Connecting to database:', dbUrl);

// Define Schemas directly to operate on raw collections safely
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    vehicleName: { type: String },
    status: { type: String, enum: ['active', 'restricted', 'deleted'], default: 'active' },
    verified: { type: Boolean, default: true },
    role: { type: String, enum: ['admin', 'fan', 'driver'], default: 'fan' },
  },
  { timestamps: true }
);

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'live', 'completed'], default: 'pending' }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point', required: true },
  coordinates: { type: [Number], required: true }
}, { _id: false });

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: locationSchema, required: true },
    additionalInfo: { type: String, default: '' },
    pictures: { type: [String], default: [] },
    entryFee: { type: Number, required: true },
    class: { type: [classSchema], required: true }
  },
  { timestamps: true }
);
eventSchema.index({ location: '2dsphere' });

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    note: { type: String },
    drawPosition: { type: Number, default: null }
  },
  { timestamps: true }
);

const resultSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    distance: { type: Number, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    class: { type: String, required: true }
  },
  { timestamps: true }
);

// Instantiate Models
const User = mongoose.model('UserSeed', userSchema, 'users');
const Event = mongoose.model('EventSeed', eventSchema, 'events');
const EventRegistration = mongoose.model('EventRegistrationSeed', eventRegistrationSchema, 'eventregistrations');
const Result = mongoose.model('ResultSeed', resultSchema, 'results');

// 20 Realistic Driver Profiles
const realisticDrivers = [
  { name: 'Caleb Johnson', vehicle: 'Dirt Devastator', city: 'Lincoln, NE' },
  { name: 'Dustin Miller', vehicle: 'Midnight Bandit', city: 'Seward, NE' },
  { name: 'Garrett Smith', vehicle: 'Redline Rebel', city: 'North Platte, NE' },
  { name: 'Wyatt Davis', vehicle: 'Blue Thunder', city: 'Grand Island, NE' },
  { name: 'Travis Wilson', vehicle: 'Iron Eagle', city: 'Kearney, NE' },
  { name: 'Luke Anderson', vehicle: 'Night Crawler', city: 'Omaha, NE' },
  { name: 'Cody Martinez', vehicle: 'Smoke & Mirrors', city: 'Columbus, NE' },
  { name: 'Jesse Taylor', vehicle: 'Grave Digger Lite', city: 'Fremont, NE' },
  { name: 'Austin Thomas', vehicle: 'Turbo Charger', city: 'Hastings, NE' },
  { name: 'Tyler White', vehicle: 'Outlaw Express', city: 'Beatrice, NE' },
  { name: 'Cole Harris', vehicle: 'Earth Quaker', city: 'Norfolk, NE' },
  { name: 'Hunter Martin', vehicle: 'Double Trouble', city: 'York, NE' },
  { name: 'Shane Thompson', vehicle: 'Black Widow', city: 'Lexington, NE' },
  { name: 'Blake Garcia', vehicle: 'Thunderstruck', city: 'Sidney, NE' },
  { name: 'Tanner Robinson', vehicle: 'Rebel Rouser', city: 'Alliance, NE' },
  { name: 'Dylan Clark', vehicle: 'Bone Crusher', city: 'McCook, NE' },
  { name: 'Brody Rodriguez', vehicle: 'High Voltage', city: 'Gering, NE' },
  { name: 'Colton Lewis', vehicle: 'Nighthawk', city: 'Blair, NE' },
  { name: 'Clayton Walker', vehicle: 'Storm Chaser', city: 'Plattsmouth, NE' },
  { name: 'Dakota Hall', vehicle: 'Warp Speed', city: 'Cretin, NE' }
];

async function seed() {
  try {
    await mongoose.connect(dbUrl);
    console.log('MongoDB connected successfully!');

    // 1. Clean up mock seed data
    console.log('Cleaning up existing mock data...');
    await User.deleteMany({ email: /^mock_driver_/ });
    await Event.deleteMany({ name: /Champ|Nationals|Showdown|Pull/ });
    await EventRegistration.deleteMany({});
    await Result.deleteMany({});
    console.log('Cleanup finished.');

    // 2. Create 20 realistic driver accounts
    console.log('Creating 20 realistic driver accounts...');
    const hashedMockPassword = await bcrypt.hash('password123', 10);
    const driversToInsert = realisticDrivers.map((d, index) => {
      const idx = index + 1;
      return {
        email: `mock_driver_${idx}@gmail.com`,
        password: hashedMockPassword,
        fullName: d.name,
        phone: `+1 402-555-01${String(idx).padStart(2, '0')}`,
        address: `${200 + idx} West O Street, ${d.city}`,
        vehicleName: d.vehicle,
        status: 'active',
        verified: true,
        role: 'driver'
      };
    });
    
    const createdDrivers = await User.insertMany(driversToInsert);
    console.log(`Successfully created ${createdDrivers.length} realistic driver accounts.`);

    // 3. Create 3 realistic events with multiple classes and coordinates
    console.log('Creating 3 realistic events...');
    const today = new Date();
    
    const eventA = new Event({
      name: 'Nebraska State Championship Tractor Pull',
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      time: '17:00',
      venue: 'Lincoln County Fairgrounds Arena',
      location: { type: 'Point', coordinates: [-100.760155, 41.139433] },
      additionalInfo: 'The grand opening event of the Nebraskan pulling season. High horsepower competition, food vendors, and local drinks available.',
      pictures: [],
      entryFee: 25,
      class: [
        { name: 'Pro Stock Tractors', status: 'live' }, // Live class for results seeding
        { name: 'Super Farm Tractors', status: 'pending' }
      ]
    });

    const eventB = new Event({
      name: 'Seward County Summer Nationals',
      date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
      time: '18:30',
      venue: 'Seward County Fairgrounds Arena',
      location: { type: 'Point', coordinates: [-97.098083, 40.907500] },
      additionalInfo: 'Annual mid-summer championship pulling showdown. Featuring extreme engine mods and modified weight classes.',
      pictures: [],
      entryFee: 30,
      class: [
        { name: 'Limited Pro Stock', status: 'pending' },
        { name: 'Light Super Stock', status: 'pending' }
      ]
    });

    const eventC = new Event({
      name: 'Lancaster Super Pull Showdown',
      date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days in future
      time: '16:00',
      venue: 'Lancaster Event Center',
      location: { type: 'Point', coordinates: [-96.611111, 40.840278] },
      additionalInfo: 'Final season point-showdown tournament before regional finals. Drivers must register safety release hitches prior to entry.',
      pictures: [],
      entryFee: 35,
      class: [
        { name: 'Modified Tractors', status: 'pending' },
        { name: 'Two Wheel Drive Trucks', status: 'pending' }
      ]
    });

    await eventA.save();
    await eventB.save();
    await eventC.save();
    console.log('Successfully created 3 realistic events.');

    // 4. Create Event Registrations using the created driver accounts
    console.log('Submitting registrations for drivers...');
    const registrationsToInsert = [];

    // Drivers 1-15 register for Event A - Pro Stock Tractors
    for (let i = 0; i < 15; i++) {
      registrationsToInsert.push({
        event: eventA._id,
        driver: createdDrivers[i]._id,
        class: 'Pro Stock Tractors',
        status: 'approved', // Approve most requests
        drawPosition: i + 1
      });
    }

    // Drivers 16-18 register for Event A - Super Farm Tractors (Approved)
    for (let i = 15; i < 18; i++) {
      registrationsToInsert.push({
        event: eventA._id,
        driver: createdDrivers[i]._id,
        class: 'Super Farm Tractors',
        status: 'approved',
        drawPosition: i - 14
      });
    }

    // Driver 19 remains pending on Event A - Super Farm Tractors
    registrationsToInsert.push({
      event: eventA._id,
      driver: createdDrivers[18]._id,
      class: 'Super Farm Tractors',
      status: 'pending', // Leave a little requested/pending
      note: 'Driver must upload current safety certificate for the vehicle hitch release.'
    });

    // Driver 20 remains pending on Event A - Super Farm Tractors
    registrationsToInsert.push({
      event: eventA._id,
      driver: createdDrivers[19]._id,
      class: 'Super Farm Tractors',
      status: 'pending',
      note: 'Waiting for coordinator confirmation on tractor total dry weight class eligibility.'
    });

    // Drivers 1-5 register for Event B - Limited Pro Stock (Approved)
    for (let i = 0; i < 5; i++) {
      registrationsToInsert.push({
        event: eventB._id,
        driver: createdDrivers[i]._id,
        class: 'Limited Pro Stock',
        status: 'approved',
        drawPosition: i + 1
      });
    }

    // Drivers 6-7 register for Event B - Limited Pro Stock (Pending)
    registrationsToInsert.push({
      event: eventB._id,
      driver: createdDrivers[5]._id,
      class: 'Limited Pro Stock',
      status: 'pending',
      note: 'Awaiting signature confirmation on regional competition terms.'
    });

    registrationsToInsert.push({
      event: eventB._id,
      driver: createdDrivers[6]._id,
      class: 'Limited Pro Stock',
      status: 'pending',
      note: 'Requires upload of secondary vehicle insurance documentation.'
    });

    const createdRegistrations = await EventRegistration.insertMany(registrationsToInsert);
    console.log(`Successfully created ${createdRegistrations.length} registration entries.`);

    // 5. Record realistic pull results for approved driver users in Pro Stock Tractors
    console.log('Uploading pull results for live classes...');
    const resultsToInsert = [
      {
        driver: createdDrivers[0]._id, // Caleb Johnson
        distance: 318.45,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[1]._id, // Dustin Miller
        distance: 295.12,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[2]._id, // Garrett Smith
        distance: 328.80,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[3]._id, // Wyatt Davis
        distance: 312.50,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[4]._id, // Travis Wilson
        distance: 301.65,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[5]._id, // Luke Anderson
        distance: 332.90,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[6]._id, // Cody Martinez
        distance: 287.40,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[7]._id, // Jesse Taylor
        distance: 308.20,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[8]._id, // Austin Thomas
        distance: 291.50,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      },
      {
        driver: createdDrivers[9]._id, // Tyler White
        distance: 322.10,
        event: eventA._id,
        class: 'Pro Stock Tractors'
      }
    ];

    const createdResults = await Result.insertMany(resultsToInsert);
    console.log(`Successfully recorded ${createdResults.length} realistic race pull results.`);

    console.log('\n======================================================');
    console.log('REALISTIC SEEDING SUCCESSFUL!');
    console.log(`- Created 20 American driver accounts with custom vehicles`);
    console.log(`  Credential Format: mock_driver_[1-20]@gmail.com`);
    console.log(`  Password: password123`);
    console.log(`- Created 3 High-Fidelity events (Nebraska Champ, Seward County, Lancaster Center)`);
    console.log(`- Created registrations with status distribution:`);
    console.log(`  - 23 Approved`);
    console.log(`  - 4 Pending (with natural human coordinator notes)`);
    console.log(`- Scoped 'Pro Stock Tractors' class in Nebraska Championship as "live"`);
    console.log(`- Recorded 10 realistic leaderboard pull results (287ft to 332ft)`);
    console.log('======================================================\n');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

seed();
