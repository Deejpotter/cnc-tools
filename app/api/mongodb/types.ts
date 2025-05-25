/**
 * MongoDB Types
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: Types and interfaces for MongoDB documents and responses.
 * Moved from utils/data/mongoTypes.ts as part of API structure improvement.
 * Defines types and interfaces that are used throughout the application for MongoDB operations.
 */

import { ObjectId, WithId } from "mongodb";

/**
 * Base interface for all MongoDB documents
 * Includes common fields that all documents should have
 */
export interface MongoDocument {
	/** MongoDB ObjectId of the document (string when serialized for client use) */
	_id?: ObjectId | string;
	/** Timestamp when the document was created */
	createdAt?: Date;
	/** Timestamp when the document was last updated */
	updatedAt?: Date;
	/** Timestamp when the document was soft deleted (null if active) */
	deletedAt?: Date | null;
}

/**
 * Standard response format for database operations
 * Provides consistent error handling and type safety
 */
export interface DatabaseResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	status: number;
	message: string;
}

/** Type helper for MongoDB documents with required ID */
export type MongoDocumentWithId<T> = WithId<T & MongoDocument>;
