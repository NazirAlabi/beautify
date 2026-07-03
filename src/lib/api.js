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
  orderBy
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

export const api = {
  // ─── Transactions ────────────────────────────────────────────────────
  async getTransactions() {
    if (isMockFirebase) return getLocal('transactions', []);
    try {
      const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      return getLocal('transactions', []);
    }
  },

  async addTransaction(transaction) {
    if (isMockFirebase) {
      const local = getLocal('transactions', []);
      const newTx = { ...transaction, id: 't' + Date.now().toString() + Math.random().toString(36).substring(2, 6) };
      setLocal('transactions', [newTx, ...local]);
      return newTx;
    }
    const docRef = await addDoc(collection(db, 'transactions'), transaction);
    return { id: docRef.id, ...transaction };
  },

  // ─── Clients ─────────────────────────────────────────────────────────
  async getClients() {
    if (isMockFirebase) return getLocal('clients', []).filter(c => !c.isArchived);
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      return querySnapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => !c.isArchived);
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      return getLocal('clients', []).filter(c => !c.isArchived);
    }
  },

  async addClient(client) {
    if (isMockFirebase) {
      const local = getLocal('clients', []);
      const newClient = { ...client, id: 'c' + Date.now().toString() + Math.random().toString(36).substring(2, 6) };
      setLocal('clients', [newClient, ...local]);
      return newClient;
    }
    const docRef = await addDoc(collection(db, 'clients'), client);
    return { id: docRef.id, ...client };
  },

  async updateClient(id, updates) {
    if (isMockFirebase) {
      const local = getLocal('clients', []);
      const updated = local.map(c => c.id === id ? { ...c, ...updates } : c);
      setLocal('clients', updated);
      return;
    }
    const ref = doc(db, 'clients', id);
    await updateDoc(ref, updates);
  },

  async deleteClient(id) {
    if (isMockFirebase) {
      const local = getLocal('clients', []);
      setLocal('clients', local.map(c => c.id === id ? { ...c, isArchived: true } : c));
      return;
    }
    const ref = doc(db, 'clients', id);
    await updateDoc(ref, { isArchived: true });
  },

  // ─── Services ────────────────────────────────────────────────────────
  async getServices() {
    if (isMockFirebase) return getLocal('services', []).filter(s => !s.isArchived);
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      return querySnapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => !s.isArchived);
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
      return getLocal('services', []).filter(s => !s.isArchived);
    }
  },

  async addService(service) {
    if (isMockFirebase) {
      const local = getLocal('services', []);
      const newService = { ...service, id: 's' + Date.now().toString() + Math.random().toString(36).substring(2, 6) };
      setLocal('services', [...local, newService]);
      return newService;
    }
    const docRef = await addDoc(collection(db, 'services'), service);
    return { id: docRef.id, ...service };
  },

  async updateService(id, updates) {
    if (isMockFirebase) {
      const local = getLocal('services', []);
      setLocal('services', local.map(s => s.id === id ? { ...s, ...updates } : s));
      return;
    }
    const ref = doc(db, 'services', id);
    await updateDoc(ref, updates);
  },

  async deleteService(id) {
    if (isMockFirebase) {
      const local = getLocal('services', []);
      setLocal('services', local.map(s => s.id === id ? { ...s, isArchived: true } : s));
      return;
    }
    const ref = doc(db, 'services', id);
    await updateDoc(ref, { isArchived: true });
  },

  // ─── Expense Categories ──────────────────────────────────────────────
  async getExpenseCategories() {
    if (isMockFirebase) return getLocal('expenseCategories', []);
    try {
      const ref = doc(db, 'metadata', 'expenseCategories');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data().categories || [];
      }
      return [];
    } catch (e) {
      console.warn("Firestore error, falling back to local storage:", e);
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
