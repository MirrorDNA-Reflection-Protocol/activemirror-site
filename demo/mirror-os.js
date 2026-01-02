// mirror-os.js - The Kernel

const DB_NAME = 'MirrorOS';
const DB_VERSION = 1;

export class MirrorOS {
    constructor() {
        this.db = null;
        this.identity = null;
    }

    async init() {
        await this.openDB();
        this.identity = await this.getIdentity();
        return this.identity;
    }

    // ===== DATABASE =====
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Store: identity
                if (!db.objectStoreNames.contains('identity')) {
                    db.createObjectStore('identity', { keyPath: 'id' });
                }
                // Store: sessions
                if (!db.objectStoreNames.contains('sessions')) {
                    const store = db.createObjectStore('sessions', { keyPath: 'id' });
                    store.createIndex('started', 'started', { unique: false });
                }
                // Store: vault
                if (!db.objectStoreNames.contains('vault')) {
                    const store = db.createObjectStore('vault', { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ===== IDENTITY =====
    async getIdentity() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('identity', 'readonly');
            const store = tx.objectStore('identity');
            const request = store.get('mirror_seed');
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async createIdentity(preferences) {
        const seed = {
            id: 'mirror_seed',
            created: new Date().toISOString(),
            preferences: preferences
        };
        const tx = this.db.transaction('identity', 'readwrite');
        tx.objectStore('identity').put(seed);
        this.identity = seed;
        return seed;
    }

    // ===== SESSIONS =====
    async saveSession(session) {
        const tx = this.db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put(session);
    }

    async getRecentSessions() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('sessions', 'readonly');
            // Simplified: get all (in real app, use cursor/index)
            const request = tx.objectStore('sessions').getAll();
            request.onsuccess = () => {
                // simple sort desc
                const res = request.result.sort((a, b) => new Date(b.started) - new Date(a.started));
                resolve(res.slice(0, 10));
            };
        });
    }

    async exportAll() {
        const identity = await this.getIdentity();
        const sessions = await this.getRecentSessions();

        return {
            exported: new Date().toISOString(),
            version: '1.0',
            identity,
            sessions
        };
    }
}
