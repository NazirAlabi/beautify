import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const initialServicesSeed = [
  { name: 'Soft Glam', defaultPrice: 150 },
  { name: 'Bridal', defaultPrice: 200 },
  { name: 'Natural Makeup', defaultPrice: 100 },
];

const initialCategoriesSeed = [
  'Makeup products',
  'Transportation',
  'Food',
  'Equipment',
  'Utilities',
  'Miscellaneous',
];

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [txs, cls, srvs, cats] = await Promise.all([
          api.getTransactions(),
          api.getClients(),
          api.getServices(),
          api.getExpenseCategories()
        ]);

        setTransactions(txs);
        
        // Normalize any legacy/flat client objects to match the new socialMedia schema structure
        const normalizedClients = cls.map(c => {
          if (c.instagram && (!c.socialMedia || !c.socialMedia.instagram)) {
            return {
              ...c,
              socialMedia: {
                snapchat: c.socialMedia?.snapchat || '',
                instagram: c.instagram,
                tiktok: c.socialMedia?.tiktok || '',
                whatsapp: c.socialMedia?.whatsapp || '',
              }
            };
          }
          return c;
        });
        setClients(normalizedClients);

        // Auto-seed empty list states for a smoother first-run experience
        if (srvs.length === 0) {
          const seeded = await Promise.all(
            initialServicesSeed.map(s => api.addService(s))
          );
          setServices(seeded);
        } else {
          setServices(srvs);
        }

        if (cats.length === 0) {
          await api.saveExpenseCategories(initialCategoriesSeed);
          setExpenseCategories(initialCategoriesSeed);
        } else {
          setExpenseCategories(cats);
        }
      } catch (err) {
        console.error("Error loading application state:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // ─── Transactions ────────────────────────────

  const addTransaction = async (transaction) => {
    try {
      // 1. Handle inline client creation if provided
      let clientObj = null;
      if (transaction.newClient) {
        const clientExists = clients.some(
          c => c.name.toLowerCase() === transaction.newClient.name.toLowerCase()
        );
        if (!clientExists) {
          clientObj = await api.addClient({
            name: transaction.newClient.name,
            phone: transaction.newClient.phone || '',
            socialMedia: {
              instagram: transaction.newClient.instagram || '',
              snapchat: '',
              tiktok: '',
              whatsapp: '',
            },
            notes: transaction.newClient.notes || '',
          });
          setClients(prev => [clientObj, ...prev]);
        }
      } else if (
        transaction.clientName &&
        !clients.some(c => c.name.toLowerCase() === transaction.clientName.toLowerCase())
      ) {
        clientObj = await api.addClient({
          name: transaction.clientName,
          phone: '',
          socialMedia: {
            instagram: '',
            snapchat: '',
            tiktok: '',
            whatsapp: '',
          },
          notes: ''
        });
        setClients(prev => [clientObj, ...prev]);
      }

      // 2. Handle inline service creation array if provided
      if (transaction.newServices && Array.isArray(transaction.newServices)) {
        const createdServices = [];
        for (const ns of transaction.newServices) {
          const serviceExists = services.some(
            s => s.name.toLowerCase() === ns.name.toLowerCase()
          );
          if (!serviceExists) {
            const newSrv = await api.addService({
              name: ns.name,
              defaultPrice: parseFloat(ns.defaultPrice) || 0,
            });
            createdServices.push(newSrv);
          }
        }
        if (createdServices.length > 0) {
          setServices(prev => [...prev, ...createdServices]);
        }
      } else if (transaction.newService) {
        const serviceExists = services.some(
          s => s.name.toLowerCase() === transaction.newService.name.toLowerCase()
        );
        if (!serviceExists) {
          const newSrv = await api.addService({
            name: transaction.newService.name,
            defaultPrice: parseFloat(transaction.newService.defaultPrice) || 0,
          });
          setServices(prev => [...prev, newSrv]);
        }
      }

      // 3. Save clean transaction document
      const cleanTransaction = { ...transaction };
      delete cleanTransaction.newClient;
      delete cleanTransaction.newService;
      delete cleanTransaction.newServices;

      const savedTx = await api.addTransaction(cleanTransaction);
      setTransactions(prev => [savedTx, ...prev]);
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  // ─── Clients ─────────────────────────────────

  const addClient = async (client) => {
    try {
      const saved = await api.addClient(client);
      setClients(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Failed to add client:", err);
    }
  };

  const updateClient = async (id, updates) => {
    try {
      await api.updateClient(id, updates);
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) {
      console.error("Failed to update client:", err);
    }
  };

  const deleteClient = async (id) => {
    try {
      await api.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete client:", err);
    }
  };

  // ─── Services ────────────────────────────────

  const addService = async (service) => {
    try {
      const saved = await api.addService(service);
      setServices(prev => [...prev, saved]);
    } catch (err) {
      console.error("Failed to add service:", err);
    }
  };

  const updateService = async (id, updates) => {
    try {
      await api.updateService(id, updates);
      setServices(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    } catch (err) {
      console.error("Failed to update service:", err);
    }
  };

  const deleteService = async (id) => {
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  // ─── Expense Categories ──────────────────────

  const addExpenseCategory = async (category) => {
    try {
      const updated = [...expenseCategories, category];
      await api.saveExpenseCategories(updated);
      setExpenseCategories(updated);
    } catch (err) {
      console.error("Failed to add expense category:", err);
    }
  };

  const removeExpenseCategory = async (category) => {
    try {
      const updated = expenseCategories.filter(c => c !== category);
      await api.saveExpenseCategories(updated);
      setExpenseCategories(updated);
    } catch (err) {
      console.error("Failed to delete expense category:", err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        clients,
        services,
        expenseCategories,
        loading,
        addTransaction,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addExpenseCategory,
        removeExpenseCategory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
