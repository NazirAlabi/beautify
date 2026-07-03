import { db, isMockFirebase } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// ─── Local Storage Fallbacks (When Firebase is not configured) ─────────

const getLocal = (key, fallback) => {
  const data = localStorage.getItem(`beauty_tracker_${key}`);
  return data ? JSON.parse(data) : fallback;
};

const setLocal = (key, data) => {
  localStorage.setItem(`beauty_tracker_${key}`, JSON.stringify(data));
};

// ─── API Methods ───────────────────────────────────────────────────────

export const networkState = { hasError: false };

export const api = {
  // ─── Transactions ────────────────────────────────────────────────────
  async getTransactions() {
    if (isMockFirebase) {
      networkState.hasError = false;
      return getLocal('transactions', []);
    }
    try {
      const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      networkState.hasError = false;
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      networkState.hasError = true;
      return getLocal('transactions', []);
    }
  },

  async addTransaction(transaction) {
    if (isMockFirebase) {
      const local = getLocal('transactions', []);
      const newTx = { 
        ...transaction, 
        id: 't' + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLocal('transactions', [newTx, ...local]);
      return newTx;
    }
    console.log("Adding transaction to firebase")
    const docRef = doc(collection(db, 'transactions'));
    const newTransaction = {
      ...transaction,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, newTransaction);
    return newTransaction;
  },

  async deleteTransaction(id) {
    if (isMockFirebase) {
      const local = getLocal('transactions', []);
      setLocal('transactions', local.filter(t => t.id !== id));
      return;
    }
    const ref = doc(db, 'transactions', id);
    await deleteDoc(ref);
  },

  // ─── Clients ─────────────────────────────────────────────────────────
  async getClients() {
    if (isMockFirebase) {
      networkState.hasError = false;
      return getLocal('clients', []).filter(c => !c.isArchived);
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      networkState.hasError = false;
      return querySnapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => !c.isArchived);
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      networkState.hasError = true;
      return getLocal('clients', []).filter(c => !c.isArchived);
    }
  },

  async addClient(client) {
    if (isMockFirebase) {
      const local = getLocal('clients', []);
      const newClient = { 
        ...client, 
        id: 'c' + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLocal('clients', [newClient, ...local]);
      return newClient;
    }
    const docRef = doc(collection(db, 'clients'));
    const newClient = {
      ...client,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, newClient);
    return newClient;
  },

  async updateClient(id, updates) {
    if (isMockFirebase) {
      const local = getLocal('clients', []);
      const updated = local.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      setLocal('clients', updated);
      return;
    }
    const ref = doc(db, 'clients', id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  },

  async deleteClient(id) {
    if (isMockFirebase) {
      const local = getLocal('clients', []);
      setLocal('clients', local.map(c => c.id === id ? { ...c, isArchived: true, updatedAt: new Date().toISOString() } : c));
      return;
    }
    const ref = doc(db, 'clients', id);
    await updateDoc(ref, { isArchived: true, updatedAt: serverTimestamp() });
  },

  // ─── Services ────────────────────────────────────────────────────────
  async getServices() {
    if (isMockFirebase) {
      networkState.hasError = false;
      return getLocal('services', []).filter(s => !s.isArchived);
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      networkState.hasError = false;
      return querySnapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => !s.isArchived);
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      networkState.hasError = true;
      return getLocal('services', []).filter(s => !s.isArchived);
    }
  },

  async addService(service) {
    if (isMockFirebase) {
      const local = getLocal('services', []);
      const newService = { 
        ...service, 
        id: 's' + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLocal('services', [...local, newService]);
      return newService;
    }
    const docRef = doc(collection(db, 'services'));
    const newService = {
      ...service,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, newService);
    return newService;
  },

  async updateService(id, updates) {
    if (isMockFirebase) {
      const local = getLocal('services', []);
      setLocal('services', local.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
      return;
    }
    const ref = doc(db, 'services', id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  },

  async deleteService(id) {
    if (isMockFirebase) {
      const local = getLocal('services', []);
      setLocal('services', local.map(s => s.id === id ? { ...s, isArchived: true, updatedAt: new Date().toISOString() } : s));
      return;
    }
    const ref = doc(db, 'services', id);
    await updateDoc(ref, { isArchived: true, updatedAt: serverTimestamp() });
  },

  // ─── Expense Categories ──────────────────────────────────────────────
  async getExpenseCategories() {
    if (isMockFirebase) {
      networkState.hasError = false;
      return getLocal('expenseCategories', []);
    }
    try {
      const ref = doc(db, 'metadata', 'expenseCategories');
      const snap = await getDoc(ref);
      networkState.hasError = false;
      if (snap.exists()) {
        return snap.data().categories || [];
      }
      return [];
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      networkState.hasError = true;
      return getLocal('expenseCategories', []);
    }
  },

  async saveExpenseCategories(categories) {
    if (isMockFirebase) {
      setLocal('expenseCategories', categories);
      return;
    }
    const ref = doc(db, 'metadata', 'expenseCategories');
    await setDoc(ref, { categories });
  },

  // ─── Summary Metrics ──────────────────────────────────────────────────
  async getHomePageMetrics() {
    if (isMockFirebase) {
      networkState.hasError = false;
      return getLocal('homePageMetrics', null);
    }
    try {
      const ref = doc(db, 'summary', 'homePageMetrics');
      const snap = await getDoc(ref);
      networkState.hasError = false;
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      networkState.hasError = true;
      return getLocal('homePageMetrics', null);
    }
  },

  async saveHomePageMetrics(metrics) {
    if (isMockFirebase) {
      setLocal('homePageMetrics', metrics);
      return;
    }
    try {
      const ref = doc(db, 'summary', 'homePageMetrics');
      await setDoc(ref, metrics, { merge: true });
    } catch (e) {
      console.error("Failed to save home page metrics to Firestore:", e);
    }
  },

  // ─── Auth ────────────────────────────────────────────────────────────
  async getAuthConfig() {
    if (isMockFirebase) {
      return getLocal('authConfig', { 
        displayName: 'Ramat', 
        requireLoginEveryTime: false,
        passwordHash: '' 
      });
    }
    try {
      const ref = doc(db, 'settings', 'auth');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data();
      }
      return { 
        displayName: 'Ramat', 
        requireLoginEveryTime: false,
        passwordHash: ''
      };
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      return getLocal('authConfig', { 
        displayName: 'Ramat', 
        requireLoginEveryTime: false,
        passwordHash: ''
      });
    }
  },

  async updateAuthConfig(config) {
    if (isMockFirebase) {
      const current = getLocal('authConfig', {});
      setLocal('authConfig', { ...current, ...config });
      return;
    }
    const ref = doc(db, 'settings', 'auth');
    await setDoc(ref, config, { merge: true });
  }
};
