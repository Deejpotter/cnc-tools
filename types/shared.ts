/**
 * Shared types between frontend and backend
 * Updated: 2025-05-28
 * Maintainer: Deej Potter
 */

/**
 * CNC Tool data interface
 * Used for representing a CNC tool in the database and UI.
 */
export interface CNCTool {
	id: string;
	name: string;
	description?: string;
	price?: number;
	category?: string;
	/**
	 * Arbitrary metadata for extensibility. Use a stricter type if possible.
	 */
	metadata?: Record<string, unknown>;
}

/**
 * Chat message interface
 * Used for chat history and AI assistant features.
 */
export interface ChatMessage {
	id: string;
	content: string;
	role: "user" | "assistant" | "system";
	timestamp: string;
}

/**
 * Chat session interface
 * Represents a chat session with a user and the AI assistant.
 */
export interface ChatSession {
	id: string;
	messages: ChatMessage[];
	createdAt: string;
	updatedAt: string;
	userId?: string;
	/**
	 * Arbitrary metadata for extensibility. Use a stricter type if possible.
	 */
	metadata?: Record<string, unknown>;
}

/**
 * API response interface
 * Used for standardizing API responses across the app.
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * User profile interface
 * Used for authentication and user management.
 */
export interface UserProfile {
	id: string;
	email: string;
	name?: string;
	role: "user" | "admin";
	/**
	 * Arbitrary metadata for extensibility. Use a stricter type if possible.
	 */
	metadata?: Record<string, unknown>;
}
