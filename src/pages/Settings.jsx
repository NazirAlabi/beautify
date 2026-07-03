import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, Save, X, Sparkles, Receipt, Shield } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';

export const Settings = () => {
  const {
    services,
    expenseCategories,
    addService,
    updateService,
    deleteService,
    addExpenseCategory,
    removeExpenseCategory,
  } = useData();

  const { authConfig, updateConfig } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  // Service Forms States
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Handlers for Services
  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;
    
    addService({
      name: newServiceName.trim(),
      defaultPrice: parseFloat(newServicePrice) || 0,
    });
    
    toast.success('Service created successfully!');
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleStartEdit = (service) => {
    setEditingServiceId(service.id);
    setEditServiceName(service.name);
    setEditServicePrice(service.defaultPrice.toString());
  };

  const handleSaveEdit = (id) => {
    if (!editServiceName.trim() || !editServicePrice) return;
    
    updateService(id, {
      name: editServiceName.trim(),
      defaultPrice: parseFloat(editServicePrice) || 0,
    });
    
    toast.success('Service updated successfully!');
    setEditingServiceId(null);
  };

  const handleDeleteService = async (id, name) => {
    const isConfirmed = await confirm({
      title: 'Delete Service',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
    });
    if (isConfirmed) {
      deleteService(id);
      toast.success('Service deleted.');
    }
  };

  // Handlers for Categories
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const formattedCategory = newCategoryName.trim();
    
    // Avoid duplicates (case-insensitive)
    if (expenseCategories.some(c => c.toLowerCase() === formattedCategory.toLowerCase())) {
      toast.error("This category already exists.");
      return;
    }

    addExpenseCategory(formattedCategory);
    toast.success('Category created successfully!');
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (category) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category}"?`,
      confirmText: 'Delete',
    });
    if (isConfirmed) {
      removeExpenseCategory(category);
      toast.success('Category deleted.');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Settings"
        subtitle="Manage services, catalog listings, and category preferences"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Services Manager */}
        <GlassCard className="p-6 flex flex-col justify-between" variant="heavy">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <Sparkles size={20} />
              <h3 className="text-lg text-foreground font-display">Services Catalog</h3>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/15 border border-border/20 transition-all duration-300"
                >
                  {editingServiceId === service.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editServiceName}
                        onChange={(e) => setEditServiceName(e.target.value)}
                        className="glass-input h-9 text-xs py-1 px-3 flex-1"
                        placeholder="Service Name"
                      />
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-muted-foreground">₵</span>
                        <input
                          type="number"
                          value={editServicePrice}
                          onChange={(e) => setEditServicePrice(e.target.value)}
                          className="glass-input h-9 text-xs py-1 px-3 w-20"
                          placeholder="Price"
                        />
                        <button
                          onClick={() => handleSaveEdit(service.id)}
                          className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                          title="Save changes"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => setEditingServiceId(null)}
                          className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{service.name}</p>
                        <p className="text-xs text-primary font-bold mt-0.5">₵{service.defaultPrice}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(service)}
                          className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-all duration-200"
                          title="Edit Service"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id, service.name)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                          title="Delete Service"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Service Block */}
          <form onSubmit={handleAddService} className="mt-8 pt-6 border-t border-border/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Create New Service</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="e.g. Silk Press"
                required
              />
              <FormField
                type="number"
                min="0"
                step="0.01"
                prefix="₵"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" icon={Plus} disabled={!newServiceName.trim() || !newServicePrice}>
                Add Service
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Expense Categories Manager */}
        <GlassCard className="p-6 flex flex-col justify-between" variant="heavy">
          <div>
            <div className="flex items-center gap-2 text-accent-coral font-bold mb-6">
              <Receipt size={20} />
              <h3 className="text-lg text-foreground font-display">Expense Categories</h3>
            </div>

            {/* Grid of existing category badges */}
            <div className="flex flex-wrap gap-2.5 max-h-[350px] overflow-y-auto pr-1">
              {expenseCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/15 hover:bg-secondary/25 border border-border/20 text-sm font-semibold text-foreground transition-all duration-200"
                >
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                    title={`Delete category "${category}"`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add Category Block */}
          <form onSubmit={handleAddCategory} className="mt-8 pt-6 border-t border-border/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add New Category</h4>
            <div className="flex gap-2">
              <input
                type="text"
                className="glass-input h-11 flex-1"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Rent, Marketing"
                required
              />
              <button
                type="submit"
                disabled={!newCategoryName.trim()}
                className="h-11 px-4 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus size={18} />
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Advanced Settings */}
      <div className="grid gap-6 mt-6">
        <GlassCard className="p-6" variant="heavy">
          <div className="flex items-center gap-2 text-info font-bold mb-6">
            <Shield size={20} />
            <h3 className="text-lg text-foreground font-display">Security Settings</h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold">Login every time</p>
              <p className="text-sm text-muted-foreground mt-1">If enabled, you will be required to log in every 4 hours instead of every 2 days.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={authConfig?.requireLoginEveryTime || false}
                onChange={(e) => {
                  updateConfig({ requireLoginEveryTime: e.target.checked });
                  toast.success("Security preferences updated");
                }}
              />
              <div className="w-11 h-6 bg-secondary/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
