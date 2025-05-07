/**
 * Data Service
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: Centralized service for data operations across the application
 * Makes it easy to access data with the appropriate provider and options
 */

import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import { DatabaseResponse } from "@/app/actions/mongodb/types";
import { DataProviderOptions } from "./DataProvider";
import { HybridDataProvider } from "./HybridDataProvider";

// Singleton instance of the hybrid provider
const dataProvider = new HybridDataProvider();

/**
 * Data Service
 * Provides specialized methods for each domain model
 */
export const DataService = {
  /**
   * Initialize the data service - call this early in the application lifecycle
   * Can be used to perform any necessary setup like loading initial data
   */
  initialize: async () => {
    // Trigger sync with remote on initialization
    await dataProvider.syncWithRemote?.();
  },

  /**
   * Box Shipping Calculator API
   * Specialized methods for ShippingItem operations
   */
  shippingItems: {
    /**
     * Get all available (non-deleted) shipping items
     */
    getAvailable: async (): Promise<DatabaseResponse<ShippingItem[]>> => {
      return dataProvider.getDocuments<ShippingItem>("Items", { deletedAt: null }, { isPublic: true });
    },

    /**
     * Add a new shipping item
     */
    add: async (item: Omit<ShippingItem, "_id">): Promise<DatabaseResponse<ShippingItem>> => {
      return dataProvider.createDocument<ShippingItem>("Items", {
        ...item,
        deletedAt: null,
      }, { isPublic: true });
    },

    /**
     * Update an existing shipping item
     */
    update: async (item: ShippingItem): Promise<DatabaseResponse<ShippingItem>> => {
      const { _id, ...updateData } = item;
      return dataProvider.updateDocument<ShippingItem>("Items", _id, updateData, { isPublic: true });
    },

    /**
     * Delete a shipping item (soft delete)
     */
    delete: async (id: string): Promise<DatabaseResponse<ShippingItem>> => {
      return dataProvider.deleteDocument<ShippingItem>("Items", id, { isPublic: true });
    },

    /**
     * Initialize with sample items if the collection is empty
     */
    initializeWithSamples: async (sampleItems: ShippingItem[]): Promise<void> => {
      const existingItems = await DataService.shippingItems.getAvailable();
      if (existingItems.success && (!existingItems.data || existingItems.data.length === 0)) {
        for (const item of sampleItems) {
          await DataService.shippingItems.add(item);
        }
      }
    },
  },

  /**
   * User-specific data API
   * Use these methods for data that should be associated with a specific user
   */
  userData: {
    /**
     * Get all documents from a user-specific collection
     */
    getAll: async <T>(collection: string, userId: string): Promise<DatabaseResponse<T[]>> => {
      return dataProvider.getAllDocuments<T>(collection, { userId, isPublic: false });
    },

    /**
     * Get filtered documents from a user-specific collection
     */
    getFiltered: async <T>(collection: string, userId: string, filter: Record<string, any>): Promise<DatabaseResponse<T[]>> => {
      return dataProvider.getDocuments<T>(collection, filter, { userId, isPublic: false });
    },

    /**
     * Add a document to a user-specific collection
     */
    add: async <T>(collection: string, userId: string, document: Omit<T, "_id">): Promise<DatabaseResponse<T>> => {
      return dataProvider.createDocument<T>(collection, document, { userId, isPublic: false });
    },

    /**
     * Update a document in a user-specific collection
     */
    update: async <T>(collection: string, userId: string, id: string, update: Partial<T>): Promise<DatabaseResponse<T>> => {
      return dataProvider.updateDocument<T>(collection, id, update, { userId, isPublic: false });
    },

    /**
     * Delete a document from a user-specific collection
     */
    delete: async <T>(collection: string, userId: string, id: string): Promise<DatabaseResponse<T>> => {
      return dataProvider.deleteDocument<T>(collection, id, { userId, isPublic: false });
    },
  },

  /**
   * Force sync with remote database
   */
  sync: async (): Promise<void> => {
    return dataProvider.syncWithRemote?.();
  },

  /**
   * Access to the raw data provider for advanced operations
   */
  provider: dataProvider,
};

export default DataService;