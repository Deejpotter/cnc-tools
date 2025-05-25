/**
 * MongoDB API Integration
 * Updated: 25/05/2025
 * Author: Deej Potter
 * Description: This file provides utility functions to interact with the MongoDB API.
 * It abstracts away the API call details and provides a simple interface for CRUD operations.
 *
 * CONSOLIDATION NOTE: This file should NOT be extended further.
 * All functionality exists as a copy in app/api/mongodb/route.ts.
 * This file is maintained for backward compatibility only.
 * For future changes, please update the route.ts file directly.
 */

/**
 * Fetches documents from a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param query The query object to filter documents (optional)
 * @param limit Maximum number of documents to return (default: 100)
 * @param skip Number of documents to skip (default: 0)
 * @returns Array of documents matching the query
 */
export async function fetchDocuments(
	collection: string,
	query: any = {},
	limit: number = 100,
	skip: number = 0
): Promise<any[]> {
	try {
		// Build the query string
		const queryParams = new URLSearchParams({
			collection,
			query: JSON.stringify(query),
			limit: limit.toString(),
			skip: skip.toString(),
		});

		// Make the API call
		const response = await fetch(`/api/mongodb?${queryParams.toString()}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching documents:", error);
		throw error;
	}
}

/**
 * Creates a new document in a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param document The document to insert
 * @returns Result object with insertedId
 */
export async function createDocument(
	collection: string,
	document: any
): Promise<any> {
	try {
		const response = await fetch("/api/mongodb", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collection,
				document,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating document:", error);
		throw error;
	}
}

/**
 * Creates multiple documents in a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param documents Array of documents to insert
 * @returns Result object with insertedIds and insertedCount
 */
export async function createDocuments(
	collection: string,
	documents: any[]
): Promise<any> {
	try {
		const response = await fetch("/api/mongodb", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collection,
				documents,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating documents:", error);
		throw error;
	}
}

/**
 * Updates a document in a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param filter Filter to identify the document to update
 * @param update Update operations to apply
 * @param upsert Whether to create the document if it doesn't exist (default: false)
 * @returns Result object with matchedCount and modifiedCount
 */
export async function updateDocument(
	collection: string,
	filter: any,
	update: any,
	upsert: boolean = false
): Promise<any> {
	try {
		const response = await fetch("/api/mongodb", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collection,
				filter,
				update,
				options: {
					upsert,
				},
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error updating document:", error);
		throw error;
	}
}

/**
 * Updates multiple documents in a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param filter Filter to identify documents to update
 * @param update Update operations to apply
 * @param upsert Whether to create documents if they don't exist (default: false)
 * @returns Result object with matchedCount and modifiedCount
 */
export async function updateDocuments(
	collection: string,
	filter: any,
	update: any,
	upsert: boolean = false
): Promise<any> {
	try {
		const response = await fetch("/api/mongodb", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collection,
				filter,
				update,
				options: {
					many: true,
					upsert,
				},
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error updating documents:", error);
		throw error;
	}
}

/**
 * Deletes a document from a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param filter Filter to identify the document to delete
 * @returns Result object with deletedCount
 */
export async function deleteDocument(
	collection: string,
	filter: any
): Promise<any> {
	try {
		const response = await fetch("/api/mongodb", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collection,
				filter,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error deleting document:", error);
		throw error;
	}
}

/**
 * Deletes multiple documents from a MongoDB collection through the API
 *
 * @param collection The name of the MongoDB collection
 * @param filter Filter to identify documents to delete
 * @returns Result object with deletedCount
 */
export async function deleteDocuments(
	collection: string,
	filter: any
): Promise<any> {
	try {
		const response = await fetch("/api/mongodb", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collection,
				filter,
				options: {
					many: true,
				},
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error deleting documents:", error);
		throw error;
	}
}
