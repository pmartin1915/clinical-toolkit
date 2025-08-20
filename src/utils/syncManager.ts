
interface SyncQueueItem {
  id: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
  type: 'patient' | 'assessment' | 'vital' | 'goal';
  data: unknown;
}

class SyncManager {
  private static instance: SyncManager;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private listeners: ((isOnline: boolean) => void)[] = [];

  private constructor() {
    this.initializeSync();
    this.loadSyncQueue();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private initializeSync() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Auto-sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  private loadSyncQueue() {
    const stored = localStorage.getItem('clinical-toolkit-sync-queue');
    if (stored) {
      try {
        this.syncQueue = JSON.parse(stored);
      } catch (error) {
        console.error('Error loading sync queue:', error);
        this.syncQueue = [];
      }
    }
  }

  private saveSyncQueue() {
    localStorage.setItem('clinical-toolkit-sync-queue', JSON.stringify(this.syncQueue));
  }

  public addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>) {
    const syncItem: SyncQueueItem = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...item
    };

    this.syncQueue.push(syncItem);
    this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    const processedItems: string[] = [];

    for (const item of itemsToProcess) {
      try {
        await this.syncItem(item);
        processedItems.push(item.id);
      } catch (error) {
        console.error('Sync error for item:', item.id, error);
        // Keep failed items in queue for retry
        break;
      }
    }

    // Remove successfully processed items
    this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item.id));
    this.saveSyncQueue();
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Simulate API call - replace with actual backend integration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          console.log(`Synced ${item.type} ${item.action}:`, item.data);
          resolve();
        } else {
          reject(new Error('Sync failed'));
        }
      }, 100);
    });
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public getPendingSyncCount(): number {
    return this.syncQueue.length;
  }

  public addConnectionListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    // Immediately call with current status
    callback(this.isOnline);
  }

  public removeConnectionListener(callback: (isOnline: boolean) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    await this.processSyncQueue();
  }

  public clearSyncQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
  }

  // Enhanced PWA update detection
  public async checkForUpdates(): Promise<boolean> {
    if (!this.isOnline) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return !!registration.waiting;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
    return false;
  }

  public async applyUpdate(): Promise<void> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

export const syncManager = SyncManager.getInstance();