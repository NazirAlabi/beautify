import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, networkState } from '../lib/api';
import { useToast } from './ToastContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homePageMetrics, setHomePageMetrics] = useState(null);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(true);
  const toast = useToast();

  // Load all data on mount
  const loadAllData = useCallback(async () => {
    try {
      // First fetch cached metrics to unblock UI
      const cachedMetrics = await api.getHomePageMetrics();
      if (cachedMetrics) {
        setHomePageMetrics(cachedMetrics);
      }
      setLoading(false); // Unblock rendering immediately!

      // Now fetch the heavier datasets in the background
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

      setServices(srvs);
      setExpenseCategories(cats);
      setIsFetchingTransactions(false);

      // If a network error occurred during fetch, silently schedule a background retry
      if (networkState.hasError) {
        setTimeout(() => {
          if (networkState.hasError) { // only retry if it still hasn't resolved
            loadAllData();
          }
        }, 10000); // Retry every 10 seconds
      }
    } catch (err) {
      console.error("Error loading application state:", err);
      setLoading(false);
      setIsFetchingTransactions(false);
      
      // If a hard error occurred, also schedule a background retry
      setTimeout(loadAllData, 10000);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    // Trigger an immediate silent fetch when the browser detects connection restoration
    window.addEventListener('online', loadAllData);
    
    return () => {
      window.removeEventListener('online', loadAllData);
    };
  }, [loadAllData]);

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
          const existingService = services.find(
            s => s.name.toLowerCase() === ns.name.toLowerCase()
          );
          if (!existingService) {
            const newSrv = await api.addService({
              name: ns.name,
              defaultPrice: parseFloat(ns.defaultPrice) || 0,
            });
            createdServices.push(newSrv);
          } else if (parseFloat(existingService.defaultPrice) !== (parseFloat(ns.defaultPrice) || 0)) {
            // Update the price if it changed
            await api.updateService(existingService.id, { defaultPrice: parseFloat(ns.defaultPrice) || 0 });
            setServices(prev => prev.map(s => s.id === existingService.id ? { ...s, defaultPrice: parseFloat(ns.defaultPrice) || 0 } : s));
          }
        }
        if (createdServices.length > 0) {
          setServices(prev => [...prev, ...createdServices]);
        }
      } else if (transaction.newService) {
        const existingService = services.find(
          s => s.name.toLowerCase() === transaction.newService.name.toLowerCase()
        );
        if (!existingService) {
          const newSrv = await api.addService({
            name: transaction.newService.name,
            defaultPrice: parseFloat(transaction.newService.defaultPrice) || 0,
          });
          setServices(prev => [...prev, newSrv]);
        } else if (parseFloat(existingService.defaultPrice) !== (parseFloat(transaction.newService.defaultPrice) || 0)) {
          await api.updateService(existingService.id, { defaultPrice: parseFloat(transaction.newService.defaultPrice) || 0 });
          setServices(prev => prev.map(s => s.id === existingService.id ? { ...s, defaultPrice: parseFloat(transaction.newService.defaultPrice) || 0 } : s));
        }
      }

      // 3. Save clean transaction document
      const cleanTransaction = { ...transaction };
      delete cleanTransaction.newClient;
      delete cleanTransaction.newService;
      delete cleanTransaction.newServices;
      
      // Remove any undefined properties as Firestore does not support them
      Object.keys(cleanTransaction).forEach(key => {
        if (cleanTransaction[key] === undefined) {
          delete cleanTransaction[key];
        }
      });

      const savedTx = await api.addTransaction(cleanTransaction);
      setTransactions(prev => [savedTx, ...prev]);
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("Transaction deleted successfully");
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      toast.error("Failed to delete transaction");
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
      const existingService = services.find(
        s => s.name.toLowerCase() === service.name.toLowerCase()
      );

      if (existingService) {
        if (parseFloat(existingService.defaultPrice) === parseFloat(service.defaultPrice)) {
          // Exactly the same
          toast.info(`${service.name} already exists with this price.`);
          return;
        } else {
          // Same name, different price: update
          await updateService(existingService.id, { defaultPrice: service.defaultPrice });
          toast.success(`Updated price for ${service.name}.`);
          return;
        }
      }

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
        homePageMetrics,
        isFetchingTransactions,
        addTransaction,
        deleteTransaction,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addExpenseCategory,
        removeExpenseCategory,
        setHomePageMetrics,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
