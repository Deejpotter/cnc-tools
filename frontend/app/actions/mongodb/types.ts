/**
 * MongoDB Types and Interfaces for Frontend
 * Updated: 05/13/2025
 * Author: Deej Potter
 * Description: Defines types and interfaces for MongoDB documents for frontend use.
 */

import { ObjectId } from "mongodb";

/**
 * Base interface for all MongoDB documents
 * Includes common fields that all documents should have
 */
export interface MongoDocument {
	/**
	 * MongoDB ObjectId of the document
	 * Can be string when serialized for client-side use
	 */
	_id?: string;

	/**
	 * Timestamp when the document was created
	 * Automatically set by MongoDB actions
	 */
	createdAt?: Date | string;

	/**
	 * Timestamp when the document was last updated
	 * Automatically updated by MongoDB actions
	 */
	updatedAt?: Date | string;

	/**
	 * Timestamp when the document was soft deleted
	 * Null if the document is active
	 */
	deletedAt?: Date | string | null;
}

/**
 * Standard response format for database operations
 * Provides consistent error handling and type safety
 */
export interface DatabaseResponse<T> {
	/** Indicates if the operation was successful */
	success: boolean;

	/** The data returned by the operation */
	data?: T;

	/** Error message if the operation failed */
	error?: string;
}
