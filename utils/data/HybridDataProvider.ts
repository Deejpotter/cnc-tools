/**
 * Hybrid Data Provider
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: Combines MongoDB and localStorage data providers
 * Provides seamless online/offline functionality with automatic syncing
 */

import { DatabaseResponse } from "@/app/actions/mongodb/types";
import { DataProvider, DataProviderOptions, DEFAULT_OPTIONS } from "./DataProvider";
import { LocalStorageProvider } from "./LocalStorageProvider";
import { MongoDBProvider } from "./MongoDBProvider";

/**
 * Hybrid Data Provider
 * Uses localStorage for offline functionality and syncs with MongoDB when online
 * Provides a unified interface for data operations with automatic fallbacks
 */
export class HybridDataProvider implements DataProvider {
  private localProvider: LocalStorageProvider;
  private remoteProvider: MongoDBProvider;

  /**
   * Set of pending operations to sync when online
   */
  private pendingOperations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    document: any;
    id?: string;
    options?: DataProviderOptions;
  }> = [];

  constructor() {
    this.localProvider = new LocalStorageProvider();
    this.remoteProvider = new MongoDBProvider();

    // Load pending operations from storage
    this.loadPendingOperations();

    // Set up online/offline detection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
    }
  }

  /**
   * Check if the browser is online
   */
  private isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  /**
   * Handle coming back online - trigger sync
   */
  private handleOnline = () => {
    this.syncWithRemote();
  }

  /**
   * Save pending operations to localStorage
   */
  private savePendingOperations(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('cnc-tools_pending_operations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }

  /**
   * Load pending operations from localStorage
   */
  private loadPendingOperations(): void {
    if (typeof window === 'undefined') return;
    try {
      const operations = localStorage.getItem('cnc-tools_pending_operations');
      if (operations) {
        this.pendingOperations = JSON.parse(operations);
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }

  /**
   * Add an operation to the pending queue
   */
  private addPendingOperation(
    type: 'create' | 'update' | 'delete',
    collection: string,
    document: any,
    id?: string,
    options?: DataProviderOptions
  ): void {
    this.pendingOperations.push({ type, collection, document, id, options });
    this.savePendingOperations();
  }

  /**
   * Sync pending operations with the remote database
   */
  public async syncWithRemote(): Promise<void> {
    if (!this.isOnline() || this.pendingOperations.length === 0) return;

    const operations = [...this.pendingOperations];
    // Clear pending operations, we'll add back any that fail
    this.pendingOperations = [];
    this.savePendingOperations();

    for (const op of operations) {
      try {
        let success = false;
        switch (op.type) {
          case 'create':
            const createResult = await this.remoteProvider.createDocument(
              op.collection, 
              op.document,
              op.options
            );
            success = createResult.success;
            break;
          case 'update':
            if (op.id) {
              const updateResult = await this.remoteProvider.updateDocument(
                op.collection, 
                op.id,
                op.document,
                op.options
              );
              success = updateResult.success;
            }
            break;
          case 'delete':
            if (op.id) {
              const deleteResult = await this.remoteProvider.deleteDocument(
                op.collection, 
                op.id,
                op.options
              );
              success = deleteResult.success;
            }
            break;
        }

        // If operation failed, add it back to the queue
        if (!success) {
          this.pendingOperations.push(op);
        }
      } catch (error) {
        // On error, add the operation back to try again later
        console.error(`Failed to sync operation ${op.type}:`, error);
        this.pendingOperations.push(op);
      }
    }

    // Save any operations that failed
    if (this.pendingOperations.length > 0) {
      this.savePendingOperations();
    }
  }

  /**
   * Get all documents from a collection
   */
  async getAllDocuments<T>(
    collection: string,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T[]>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Try remote first if online and remote is enabled
    if (this.isOnline() && opts.useRemote) {
      try {
        const remoteResult = await this.remoteProvider.getAllDocuments<T>(collection, options);
        if (remoteResult.success) {
          // Save to local for offline access
          if (opts.useLocalStorage) {
            // For each item, store in local storage
            for (const doc of remoteResult.data || []) {
              await this.localProvider.createDocument(collection, doc as any, options);
            }
          }
          return remoteResult;
        }
      } catch (error) {
        console.warn('Failed to fetch from remote, falling back to local:', error);
      }
    }

    // Fallback to local storage
    if (opts.useLocalStorage) {
      return this.localProvider.getAllDocuments<T>(collection, options);
    }

    return {
      success: false,
      error: 'Failed to fetch documents: device is offline and local storage is disabled',
      status: 503,
      message: 'Service unavailable',
    };
  }

  /**
   * Get documents from a collection based on a filter
   */
  async getDocuments<T>(
    collection: string, 
    filter: Record<string, any>,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T[]>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Try remote first if online and remote is enabled
    if (this.isOnline() && opts.useRemote) {
      try {
        const remoteResult = await this.remoteProvider.getDocuments<T>(collection, filter, options);
        if (remoteResult.success) {
          // No need to sync to local here - we'd need complex merging logic
          return remoteResult;
        }
      } catch (error) {
        console.warn('Failed to fetch from remote with filter, falling back to local:', error);
      }
    }

    // Fallback to local storage
    if (opts.useLocalStorage) {
      return this.localProvider.getDocuments<T>(collection, filter, options);
    }

    return {
      success: false,
      error: 'Failed to fetch documents with filter: device is offline and local storage is disabled',
      status: 503,
      message: 'Service unavailable',
    };
  }

  /**
   * Create a new document in a collection
   */
  async createDocument<T>(
    collection: string, 
    document: Omit<T, "_id">,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Always save to local storage first for immediate feedback
    let localResult: DatabaseResponse<T> | null = null;
    if (opts.useLocalStorage) {
      localResult = await this.localProvider.createDocument<T>(collection, document, options);
      if (!localResult.success) {
        return localResult;
      }
    }

    // Then try to save to remote if online
    if (this.isOnline() && opts.useRemote) {
      try {
        const remoteResult = await this.remoteProvider.createDocument<T>(collection, document, options);
        if (remoteResult.success) {
          return remoteResult;
        }
      } catch (error) {
        console.warn('Failed to create document in remote, queuing for sync:', error);
        
        // Queue for later sync
        if (localResult?.success && localResult?.data) {
          this.addPendingOperation('create', collection, localResult.data, undefined, options);
        }
      }
    } else if (opts.useRemote) {
      // Queue for later sync
      if (localResult?.success && localResult?.data) {
        this.addPendingOperation('create', collection, localResult.data, undefined, options);
      }
    }

    // Return local result if available
    return localResult || {
      success: false,
      error: 'Failed to create document: device is offline and local storage is disabled',
      status: 503,
      message: 'Service unavailable',
    };
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
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Always update local storage first for immediate feedback
    let localResult: DatabaseResponse<T> | null = null;
    if (opts.useLocalStorage) {
      localResult = await this.localProvider.updateDocument<T>(collection, id, update, options);
      if (!localResult.success) {
        return localResult;
      }
    }

    // Then try to update remote if online
    if (this.isOnline() && opts.useRemote) {
      try {
        const remoteResult = await this.remoteProvider.updateDocument<T>(collection, id, update, options);
        if (remoteResult.success) {
          return remoteResult;
        }
      } catch (error) {
        console.warn('Failed to update document in remote, queuing for sync:', error);
        
        // Queue for later sync
        this.addPendingOperation('update', collection, update, id, options);
      }
    } else if (opts.useRemote) {
      // Queue for later sync
      this.addPendingOperation('update', collection, update, id, options);
    }

    // Return local result if available
    return localResult || {
      success: false,
      error: 'Failed to update document: device is offline and local storage is disabled',
      status: 503,
      message: 'Service unavailable',
    };
  }

  /**
   * Delete a document from a collection (soft delete)
   */
  async deleteDocument<T>(
    collection: string, 
    id: string,
    options?: DataProviderOptions
  ): Promise<DatabaseResponse<T>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Always delete from local storage first for immediate feedback
    let localResult: DatabaseResponse<T> | null = null;
    if (opts.useLocalStorage) {
      localResult = await this.localProvider.deleteDocument<T>(collection, id, options);
      if (!localResult.success) {
        return localResult;
      }
    }

    // Then try to delete from remote if online
    if (this.isOnline() && opts.useRemote) {
      try {
        const remoteResult = await this.remoteProvider.deleteDocument<T>(collection, id, options);
        if (remoteResult.success) {
          return remoteResult;
        }
      } catch (error) {
        console.warn('Failed to delete document in remote, queuing for sync:', error);
        
        // Queue for later sync
        this.addPendingOperation('delete', collection, {}, id, options);
      }
    } else if (opts.useRemote) {
      // Queue for later sync
      this.addPendingOperation('delete', collection, {}, id, options);
    }

    // Return local result if available
    return localResult || {
      success: false,
      error: 'Failed to delete document: device is offline and local storage is disabled',
      status: 503,
      message: 'Service unavailable',
    };
  }
}