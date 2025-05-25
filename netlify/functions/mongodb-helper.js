/**
 * MongoDB Helper for Netlify Functions
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: Helper module for handling MongoDB connections in Netlify functions.
 * This file ensures proper MongoDB client connection in serverless environments.
 */

// This file helps Netlify functions establish and maintain MongoDB connections
// by providing a reusable connection pool that persists across function invocations.

const { MongoClient } = require('mongodb');

// Cache connection for reuse across function invocations
let cachedClient = null;
let cachedDb = null;

// Connection options optimized for serverless
const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB and return both client and db instances
 * @returns {Promise<{client: MongoClient, db: Db}>} The MongoDB client and database
 */
async function connectToMongoDB() {
  // If we already have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Create a new client and connect
  const client = new MongoClient(process.env.MONGODB_URI, connectionOptions);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'CncTools');

  // Cache the client and db for reuse
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * Get a MongoDB collection by name
 * @param {string} collectionName - The name of the collection
 * @returns {Promise<Collection>} The MongoDB collection
 */
async function getCollection(collectionName) {
  const { db } = await connectToMongoDB();
  return db.collection(collectionName);
}

/**
 * Ping the MongoDB server to test the connection
 * @returns {Promise<boolean>} True if ping was successful
 */
async function pingMongoDB() {
  try {
    const { db } = await connectToMongoDB();
    const result = await db.admin().command({ ping: 1 });
    return result?.ok === 1;
  } catch (error) {
    console.error('MongoDB ping failed:', error);
    return false;
  }
}

module.exports = {
  connectToMongoDB,
  getCollection,
  pingMongoDB,
};
