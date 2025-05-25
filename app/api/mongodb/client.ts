/**
 * MongoDB Client
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: MongoDB client management utility.
 * Provides a cached MongoDB client for server-side and API route use.
 * Moved from utils/data/mongoClient.ts as part of API structure improvement.
 * Optimized for serverless environments to properly handle connection pooling.
 */

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
	throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// These options are important for serverless environments to avoid connection issues
const options = {
	maxPoolSize: 10, // Maintain up to 10 socket connections
	serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// In serverless environments, we need to cache the client differently
// Global variables are maintained across function invocations
declare global {
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

/**
 * Returns a cached MongoDB client promise for efficient connection reuse.
 * Uses global variable in development to avoid multiple connections with hot reload.
 * Optimized for serverless environments to properly handle connection pooling.
 */
export function getClientPromise() {
	if (process.env.NODE_ENV === "development") {
		if (!global._mongoClientPromise) {
			client = new MongoClient(uri, options);
			global._mongoClientPromise = client.connect();
		}
		return global._mongoClientPromise;
	}
	// In production, we still want to cache the client within a request
	// but not across function invocations, which is handled by global scope
	if (!clientPromise) {
		client = new MongoClient(uri, options);
		clientPromise = client.connect();
	}
	return clientPromise;
}

/**
 * Returns a MongoDB collection by name, using the cached client.
 */
export async function getCollection(collectionName: string) {
	try {
		const clientPromise = getClientPromise();
		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_DB || "CncTools");
		return db.collection(collectionName);
	} catch (error) {
		console.error("Database connection error:", error);
		throw error;
	}
}

/**
 * Connects to MongoDB and returns both client and db instance.
 */
export async function connectToDatabase() {
	try {
		const clientPromise = getClientPromise();
		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_DB || "CncTools");
		return { client, db };
	} catch (error) {
		console.error("Database connection error:", error);
		throw error;
	}
}
