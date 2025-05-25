/**
 * Shared types between frontend and backend
 * Updated: 25/05/25
 * Author: Deej Potter
 */

/**
 * CNC Tool data interface
 */
export interface CNCTool {
	id: string;
	name: string;
	description?: string;
	price?: number;
	category?: string;
	metadata?: Record<string, any>;
}

/**
 * Chat message interface
 */
export interface ChatMessage {
	id: string;
	content: string;
	role: "user" | "assistant" | "system";
	timestamp: string;
}

/**
 * Chat session interface
 */
export interface ChatSession {
	id: string;
	messages: ChatMessage[];
	createdAt: string;
	updatedAt: string;
	userId?: string;
	metadata?: Record<string, any>;
}

/**
 * API response interface
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * User profile interface
 */
export interface UserProfile {
	id: string;
	email: string;
	name?: string;
	role: "user" | "admin";
	metadata?: Record<string, any>;
}
