import { OfflineSyncItem } from '../types';

const STORAGE_KEY = 'g1_offline_sync_queue_v2';
const PROCESSED_KEY = 'g1_offline_processed_ids_v2';

export class OfflineSyncEngine {
  private queue: OfflineSyncItem[] = [];
  private processedIds: Set<string> = new Set();

  constructor(initialItems?: OfflineSyncItem[]) {
    if (initialItems && initialItems.length > 0) {
      this.queue = [...initialItems];
    } else {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedQueue = localStorage.getItem(STORAGE_KEY);
        if (storedQueue) {
          this.queue = JSON.parse(storedQueue);
        }
        const storedProcessed = localStorage.getItem(PROCESSED_KEY);
        if (storedProcessed) {
          const arr: string[] = JSON.parse(storedProcessed);
          arr.forEach(id => this.processedIds.add(id));
        }
      }
    } catch {
      // Memory fallback if storage is disabled
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
        localStorage.setItem(PROCESSED_KEY, JSON.stringify(Array.from(this.processedIds)));
      }
    } catch {
      // Ignore storage write error
    }
  }

  getQueue(): OfflineSyncItem[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.queue.filter(i => i.status === 'QUEUED').length;
  }

  getFailedCount(): number {
    return this.queue.filter(i => i.status === 'FAILED_TIMEOUT' || i.status === 'FAILED_CONFLICT').length;
  }

  getReadyItems(): OfflineSyncItem[] {
    const now = Date.now();
    return this.queue.filter(i => i.status === 'QUEUED' && (!i.nextRetryAfter || now >= i.nextRetryAfter));
  }

  enqueue(item: Omit<OfflineSyncItem, 'id' | 'createdAt' | 'retryCount' | 'status'>): OfflineSyncItem {
    // Check client operation id deduplication
    const existing = this.queue.find(q => q.clientId === item.clientId);
    if (existing) {
      return existing;
    }

    const newItem: OfflineSyncItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'QUEUED',
    };

    this.queue.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  markSynced(clientId: string): boolean {
    const item = this.queue.find(q => q.clientId === clientId);
    if (item) {
      item.status = 'SYNCED';
      this.processedIds.add(clientId);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  recordRetry(clientId: string, errorMsg?: string): { retryCount: number; backoffMs: number } | null {
    const item = this.queue.find(q => q.clientId === clientId);
    if (item) {
      item.retryCount = (item.retryCount || 0) + 1;
      item.errorMessage = errorMsg || 'Connection timed out';
      item.lastAttemptAt = new Date().toISOString();

      // Exponential backoff: base 1000ms * 2^retryCount + jitter up to 30s
      const backoffMs = Math.min(30000, 1000 * Math.pow(2, item.retryCount) + Math.random() * 500);
      item.nextRetryAfter = Date.now() + backoffMs;

      if (item.retryCount >= 8) {
        item.status = 'FAILED_TIMEOUT';
      }
      this.saveToStorage();
      return { retryCount: item.retryCount, backoffMs };
    }
    return null;
  }

  requeueFailed(clientId?: string): number {
    let count = 0;
    this.queue.forEach(item => {
      if ((!clientId || item.clientId === clientId) && (item.status === 'FAILED_TIMEOUT' || item.status === 'FAILED_CONFLICT')) {
        item.status = 'QUEUED';
        item.retryCount = 0;
        item.nextRetryAfter = undefined;
        item.errorMessage = undefined;
        count++;
      }
    });
    if (count > 0) {
      this.saveToStorage();
    }
    return count;
  }

  markConflict(clientId: string, reason: string): boolean {
    const item = this.queue.find(q => q.clientId === clientId);
    if (item) {
      item.status = 'FAILED_CONFLICT';
      item.errorMessage = reason;
      item.lastAttemptAt = new Date().toISOString();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  isAlreadyProcessed(clientId: string): boolean {
    return this.processedIds.has(clientId);
  }

  clearSynced(): void {
    this.queue = this.queue.filter(q => q.status !== 'SYNCED');
    this.saveToStorage();
  }
}
