/**
 * MongoDB Data Provider
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: MongoDB implementation of the DataProvider interface
 * Handles all interactions with MongoDB database
 */

import { ObjectId } from "mongodb";
import { getCollection } from "@/app/actions/mongodb/client";
import { DatabaseResponse, MongoDocument } from "@/app/actions/mongodb/types";
import { DataProvider, DataProviderOptions, DEFAULT_OPTIONS } from "./DataProvider";

/**
 * MongoDB Data Provider
 * Implements the DataProvider interface for MongoDB
 */
export class MongoDBProvider implements DataProvider {
  /**
   * Serializes MongoDB documents for client-side use
   * Converts ObjectId to string and handles Date objects
   */
  private serializeDocument<T extends MongoDocument>(doc: T): T {
    if (!doc) return doc;

    return {
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
      deletedAt: doc.deletedAt?.toISOString() || null,
    } as T;
  }

  /**
   * Serializes an array of MongoDB documents
   */
  private serializeDocuments<T extends MongoDocument>(docs: T[]): T[] {
    return docs.map((doc) => this.serializeDocument(doc));
  }

  /**
   * Prepares a collection name with user ID if needed
   */
  private getCollectionName(collection: string, options?: DataProviderOptions): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    if (opts.userId && !opts.isPublic) {
      return `${collection}_${opts.userId}`;
    }
    return collection;
  }

  /**
   * Get all documents from a collection
   */
  async getAllDocuments<T>(
    collection: string,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T[]>> {
    try {
      const collectionName = this.getCollectionName(collection, options);
      const coll = await getCollection(collectionName);
      const documents = await coll.find({}).toArray();
      
      return {
        success: true,
        data: this.serializeDocuments(documents as any),
        status: 200,
        message: "Documents retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching documents:", error);
      return {
        success: false,
        error: "Failed to fetch documents",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get documents from a collection based on a filter
   */
  async getDocuments<T>(
    collection: string, 
    filter: Record<string, any>,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T[]>> {
    try {
      const collectionName = this.getCollectionName(collection, options);
      const coll = await getCollection(collectionName);
      const documents = await coll.find(filter).toArray();
      
      return {
        success: true,
        data: this.serializeDocuments(documents as any),
        status: 200,
        message: "Documents retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching documents with filter:", error);
      return {
        success: false,
        error: "Failed to fetch documents with filter",
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
      const collectionName = this.getCollectionName(collection, options);
      const coll = await getCollection(collectionName);
      
      const docToInsert = {
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await coll.insertOne(docToInsert);
      const insertedDoc = { ...docToInsert, _id: result.insertedId } as any;

      return {
        success: true,
        data: this.serializeDocument(insertedDoc),
        status: 201,
        message: "Document created successfully",
      };
    } catch (error) {
      console.error("Error creating document:", error);
      return {
        success: false,
        error: "Failed to create document",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Update a document in a collection
   */
  async updateDocument<T>(
    collection: string, 
    id: string,
    update: Partial<T>,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    try {
      const collectionName = this.getCollectionName(collection, options);
      const coll = await getCollection(collectionName);
      const objectId = new ObjectId(id);

      const result = await coll.findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            ...update,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return {
          success: false,
          error: "Document not found",
          status: 404,
          message: "No document found with the specified ID",
        };
      }

      return {
        success: true,
        data: this.serializeDocument(result as any),
        status: 200,
        message: "Document updated successfully",
      };
    } catch (error) {
      console.error("Error updating document:", error);
      return {
        success: false,
        error: "Failed to update document",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Delete a document from a collection (soft delete)
   */
  async deleteDocument<T>(
    collection: string, 
    id: string,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    try {
      const collectionName = this.getCollectionName(collection, options);
      const coll = await getCollection(collectionName);
      const objectId = new ObjectId(id);

      const result = await coll.findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return {
          success: false,
          error: "Document not found",
          status: 404,
          message: "No document found with the specified ID",
        };
      }

      return {
        success: true,
        data: this.serializeDocument(result as any),
        status: 200,
        message: "Document deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting document:", error);
      return {
        success: false,
        error: "Failed to delete document",
        status: 500,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}