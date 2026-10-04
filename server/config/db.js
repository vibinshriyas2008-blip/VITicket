const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[DB] Warning: Could not connect to configured MONGO_URI (${err.message}).`);
      console.warn(`[DB] Initializing embedded in-memory MongoDB fallback for instant local evaluation...`);
    }
  } else {
    console.log(`[DB] No MONGO_URI provided in environment. Initializing embedded in-memory MongoDB...`);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'viticket_db',
      },
    });
    const memoryUri = memoryServer.getUri();
    console.log(`[DB] In-memory MongoDB started successfully at: ${memoryUri}`);
    const conn = await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to in-memory database: ${conn.connection.name}`);
    return conn;
  } catch (memErr) {
    console.error(`[DB] Critical Error: Failed to initialize in-memory MongoDB fallback:`, memErr);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log(`[DB] Database connection closed gracefully.`);
  } catch (err) {
    console.error(`[DB] Error closing database connection:`, err);
  }
};

module.exports = { connectDB, closeDB };
