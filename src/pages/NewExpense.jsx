import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { MinusCircle, FolderPlus } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';

export const NewExpense = () => {
  const { expenseCategories, addTransaction } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: '',
    amount: '',
    description: '',
    vendor: '',
  });

  const isNewCategory =
    formData.category.trim() &&
    !expenseCategories.some(c => c.toLowerCase() === formData.category.trim().toLowerCase());

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      type: 'expense',
      category: formData.category.trim(),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      vendor: formData.vendor,
    });
    navigate('/transactions');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <PageHeader
        title="Record Expense"
        subtitle="Track your business spending"
      />

      <GlassCard className="overflow-hidden">
        <div className="h-1 bg-linear-to-r from-destructive via-orange-400 to-accent-coral" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Date"
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            {/* Category — type to search or create new */}
            <FormField label="Category" required>
              <div className="relative">
                <input
                  list="category-suggestions"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="glass-input h-12"
                  placeholder="Search or type new category..."
                  required
                  autoComplete="off"
                />
                <datalist id="category-suggestions">
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              {isNewCategory && (
                <p className="text-xs text-muted-foreground mt-1.5 font-medium flex items-center gap-1.5 animate-fade-in">
                  <FolderPlus size={13} className="text-accent-lavender" />
                  <span>New category "<strong>{formData.category.trim()}</strong>" will be created</span>
                </p>
              )}
            </FormField>

            <FormField
              label="Amount"
              required
              type="number"
              min="0"
              step="0.01"
              prefix="₵"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />

            <FormField
              label="Vendor (Optional)"
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="Store name"
            />
          </div>

          <FormField label="Description" required>
            <textarea
              rows={1}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              className="glass-input py-3 resize-none overflow-y-auto max-h-[120px] min-h-[48px]"
              placeholder="What was this expense for?"
              required
            />
          </FormField>

          <div className="pt-4">
            <Button
              type="submit"
              variant="destructive"
              icon={MinusCircle}
              className="w-full h-12"
            >
              Save Expense
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
