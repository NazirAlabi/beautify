import React, { createContext, useContext, useState, useEffect } from 'react';
import { subDays } from 'date-fns';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Initial Mock Data
const generateMockData = () => {
  const today = new Date();

  return {
    transactions: [
      { id: '1', type: 'income', amount: 150, category: 'Soft Glam', date: today.toISOString(), paymentMethod: 'Cash', clientName: 'Ama' },
      { id: '2', type: 'expense', amount: 80, category: 'Makeup products', date: today.toISOString(), description: 'Foundation', vendor: 'Melcom' },
      { id: '3', type: 'income', amount: 200, category: 'Bridal', date: subDays(today, 1).toISOString(), paymentMethod: 'Momo', clientName: 'Efia' },
    ],
    clients: [
      { id: 'c1', name: 'Ama', phone: '0241234567', instagram: '@ama', notes: 'Prefers soft glam' },
      { id: 'c2', name: 'Efia', phone: '0209876543', instagram: '@efia', notes: 'Bridal client' },
    ],
    services: [
      { id: 's1', name: 'Soft Glam', defaultPrice: 150 },
      { id: 's2', name: 'Bridal', defaultPrice: 200 },
      { id: 's3', name: 'Natural Makeup', defaultPrice: 100 },
    ],
    expenseCategories: [
      'Makeup products',
      'Transportation',
      'Food',
      'Equipment',
      'Utilities',
      'Miscellaneous',
    ],
  };
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('beauty_tracker_data');
    if (saved) return JSON.parse(saved);
    return generateMockData();
  });

  useEffect(() => {
    localStorage.setItem('beauty_tracker_data', JSON.stringify(data));
  }, [data]);

  // ─── Transactions ────────────────────────────

  const addTransaction = (transaction) => {
    setData(prev => {
      let updatedClients = [...prev.clients];
      let updatedServices = [...prev.services];
      let updatedCategories = [...prev.expenseCategories];

      // If a full custom client details payload is provided
      if (transaction.newClient) {
        const clientExists = prev.clients.some(
          c => c.name.toLowerCase() === transaction.newClient.name.toLowerCase()
        );
        if (!clientExists) {
          updatedClients = [
            {
              id: 'c' + Date.now(),
              name: transaction.newClient.name,
              phone: transaction.newClient.phone || '',
              instagram: transaction.newClient.instagram || '',
              notes: transaction.newClient.notes || '',
            },
            ...prev.clients,
          ];
        }
      } else if (
        transaction.clientName &&
        !prev.clients.some(c => c.name.toLowerCase() === transaction.clientName.toLowerCase())
      ) {
        updatedClients = [
          { id: 'c' + Date.now(), name: transaction.clientName, phone: '', instagram: '', notes: '' },
          ...prev.clients,
        ];
      }

      // If inline services array is provided
      if (transaction.newServices && Array.isArray(transaction.newServices)) {
        transaction.newServices.forEach((ns, idx) => {
          const serviceExists = prev.services.some(
            s => s.name.toLowerCase() === ns.name.toLowerCase()
          );
          if (!serviceExists) {
            updatedServices.push({
              id: 's' + Date.now() + '-' + idx,
              name: ns.name,
              defaultPrice: parseFloat(ns.defaultPrice) || 0,
            });
          }
        });
      } else if (transaction.newService) {
        const serviceExists = prev.services.some(
          s => s.name.toLowerCase() === transaction.newService.name.toLowerCase()
        );
        if (!serviceExists) {
          updatedServices = [
            ...prev.services,
            {
              id: 's' + Date.now(),
              name: transaction.newService.name,
              defaultPrice: parseFloat(transaction.newService.defaultPrice) || 0,
            },
          ];
        }
      } else if (
        transaction.type === 'income' &&
        transaction.category &&
        !prev.services.some(s => s.name.toLowerCase() === transaction.category.toLowerCase())
      ) {
        updatedServices = [
          ...prev.services,
          { id: 's' + Date.now(), name: transaction.category, defaultPrice: transaction.amount || 0 },
        ];
      }

      // Auto-create expense category
      if (
        transaction.type === 'expense' &&
        transaction.category &&
        !prev.expenseCategories.some(c => c.toLowerCase() === transaction.category.toLowerCase())
      ) {
        updatedCategories = [...prev.expenseCategories, transaction.category];
      }

      const cleanTransaction = { ...transaction };
      delete cleanTransaction.newClient;
      delete cleanTransaction.newService;
      delete cleanTransaction.newServices;

      return {
        ...prev,
        transactions: [{ ...cleanTransaction, id: Date.now().toString() }, ...prev.transactions],
        clients: updatedClients,
        services: updatedServices,
        expenseCategories: updatedCategories,
      };
    });
  };

  // ─── Clients ─────────────────────────────────

  const addClient = (client) => {
    setData(prev => ({
      ...prev,
      clients: [{ ...client, id: 'c' + Date.now() }, ...prev.clients],
    }));
  };

  // ─── Services ────────────────────────────────

  const addService = (service) => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, { ...service, id: 's' + Date.now() }],
    }));
  };

  const updateService = (id, updates) => {
    setData(prev => ({
      ...prev,
      services: prev.services.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteService = (id) => {
    setData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id),
    }));
  };

  // ─── Expense Categories ──────────────────────

  const addExpenseCategory = (category) => {
    setData(prev => ({
      ...prev,
      expenseCategories: [...prev.expenseCategories, category],
    }));
  };

  const removeExpenseCategory = (category) => {
    setData(prev => ({
      ...prev,
      expenseCategories: prev.expenseCategories.filter(c => c !== category),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        addTransaction,
        addClient,
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
