/**
 * LocalStorage Data Provider
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: LocalStorage implementation of the DataProvider interface
 * Handles all interactions with browser's localStorage for offline functionality
 */

import { DatabaseResponse } from "@/app/actions/mongodb/types";
import { DataProvider, DataProviderOptions, DEFAULT_OPTIONS } from "./DataProvider";

/**
 * LocalStorage Data Provider
 * Implements the DataProvider interface for browser's localStorage
 */
export class LocalStorageProvider implements DataProvider {
  /**
   * Base key prefix for all localStorage keys
   */
  private readonly LOCAL_STORAGE_PREFIX = "cnc-tools";

  /**
   * Generate a unique ID for new documents
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Gets the localStorage key for a collection
   */
  private getStorageKey(collection: string, options?: DataProviderOptions): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const userPart = opts.userId && !opts.isPublic ? `_${opts.userId}` : '';
    return `${this.LOCAL_STORAGE_PREFIX}_${collection}${userPart}`;
  }

  /**
   * Load documents from localStorage
   */
  private loadDocuments<T>(collection: string, options?: DataProviderOptions): T[] {
    if (typeof window === "undefined") return [];

    try {
      const key = this.getStorageKey(collection, options);
      const itemsJson = localStorage.getItem(key);
      return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
      console.error(`Error loading ${collection} from local storage:`, error);
      return [];
    }
  }

  /**
   * Save documents to localStorage
   */
  private saveDocuments<T>(collection: string, documents: T[], options?: DataProviderOptions): void {
    if (typeof window === "undefined") return;

    try {
      const key = this.getStorageKey(collection, options);
      localStorage.setItem(key, JSON.stringify(documents));
    } catch (error) {
      console.error(`Error saving ${collection} to local storage:`, error);
    }
  }

  /**
   * Get all documents from a collection
   */
  async getAllDocuments<T>(
    collection: string,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T[]>> {
    try {
      const documents = this.loadDocuments<T>(collection, options);
      return {
        success: true,
        data: documents,
        status: 200,
        message: "Documents retrieved successfully from local storage",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch documents from local storage",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get documents from a collection based on a filter
   */
  async getDocuments<T extends Record<string, any>>(
    collection: string, 
    filter: Record<string, any>,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T[]>> {
    try {
      const documents = this.loadDocuments<T>(collection, options);
      
      // Simple filtering logic
      const filtered = documents.filter(doc => {
        return Object.entries(filter).every(([key, value]) => {
          // Special case for deletedAt
          if (key === 'deletedAt' && value === null) {
            return doc.deletedAt === null || doc.deletedAt === undefined;
          }
          return doc[key] === value;
        });
      });
      
      return {
        success: true,
        data: filtered,
        status: 200,
        message: "Filtered documents retrieved successfully from local storage",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch filtered documents from local storage",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Create a new document in a collection
   */
  async createDocument<T>(
    collection: string, 
    document: Omit<T, "_id">,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    try {
      const documents = this.loadDocuments<T>(collection, options);
      const now = new Date().toISOString();
      
      const newDoc = {
        ...document,
        _id: this.generateId(),
        createdAt: now,
        updatedAt: now,
      } as unknown as T;
      
      documents.push(newDoc);
      this.saveDocuments(collection, documents, options);
      
      return {
        success: true,
        data: newDoc,
        status: 201,
        message: "Document created successfully in local storage",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create document in local storage",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Update a document in a collection
   */
  async updateDocument<T extends { _id: string }>(
    collection: string, 
    id: string,
    update: Partial<T>,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    try {
      const documents = this.loadDocuments<T>(collection, options);
      const index = documents.findIndex(doc => doc._id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: "Document not found",
          status: 404,
          message: "No document found with the specified ID",
        };
      }
      
      const now = new Date().toISOString();
      documents[index] = {
        ...documents[index],
        ...update,
        updatedAt: now,
      };
      
      this.saveDocuments(collection, documents, options);
      
      return {
        success: true,
        data: documents[index],
        status: 200,
        message: "Document updated successfully in local storage",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update document in local storage",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Delete a document from a collection (soft delete)
   */
  async deleteDocument<T extends { _id: string }>(
    collection: string, 
    id: string,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    try {
      const documents = this.loadDocuments<T>(collection, options);
      const index = documents.findIndex(doc => doc._id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: "Document not found",
          status: 404,
          message: "No document found with the specified ID",
        };
      }
      
      const now = new Date().toISOString();
      documents[index] = {
        ...documents[index],
        deletedAt: now,
        updatedAt: now,
      };
      
      this.saveDocuments(collection, documents, options);
      
      return {
        success: true,
        data: documents[index],
        status: 200,
        message: "Document deleted successfully in local storage",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete document in local storage",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}