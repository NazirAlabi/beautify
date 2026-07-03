import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, UserPlus, Edit3, Trash2, X } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';

const ClientCard = ({ client, stats, onEdit, onDelete }) => (
  <GlassCard hover className="p-6 flex flex-col justify-between group relative overflow-hidden">
    {/* Subtle glass shimmer on hover */}
    <div className="absolute top-0 right-0 w-24 h-full bg-linear-to-b from-white/30 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity transform skew-x-12 translate-x-10 group-hover:translate-x-0 duration-700 pointer-events-none" />

    {/* Actions bar */}
    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
      <button
        onClick={() => onEdit(client)}
        className="p-2 rounded-lg bg-[var(--surface-hover)] border border-border/40 hover:text-primary transition-all duration-200"
        title="Edit Client"
      >
        <Edit3 size={14} />
      </button>
      <button
        onClick={() => onDelete(client)}
        className="p-2 rounded-lg bg-[var(--surface-hover)] border border-border/40 hover:text-destructive transition-all duration-200"
        title="Delete Client"
      >
        <Trash2 size={14} />
      </button>
    </div>

    <div className="flex items-start gap-4">
      <Avatar name={client.name} size="lg" />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-foreground tracking-tight truncate pr-16">{client.name}</h3>
        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
          {client.phone && <p>{client.phone}</p>}
          {client.instagram && (
            <p className="text-primary hover:underline cursor-pointer text-sm font-semibold">{client.instagram}</p>
          )}
        </div>
      </div>
    </div>

    {client.notes && (
      <p className="text-xs text-muted-foreground italic mt-3 bg-muted/30 p-2.5 rounded-xl border border-border/20 line-clamp-2">
        "{client.notes}"
      </p>
    )}

    <div className="mt-5 pt-4 border-t border-border/30 grid grid-cols-3 gap-3 text-center">
      <div>
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Spent</p>
        <p className="font-bold text-lg text-foreground mt-1">₵{stats.totalSpent.toFixed(0)}</p>
      </div>
      <div>
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Visits</p>
        <p className="font-bold text-lg text-foreground mt-1">{stats.visits}</p>
      </div>
      <div>
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Last</p>
        <p className="font-bold text-xs text-foreground mt-1.5">
          {stats.lastVisit
            ? new Date(stats.lastVisit).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : 'Never'}
        </p>
      </div>
    </div>
  </GlassCard>
);

export const Clients = () => {
  const { clients, transactions, addClient, updateClient, deleteClient } = useData();
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    phone: '',
    instagram: '',
    notes: '',
  });

  const getClientStats = (clientName) => {
    const clientTransactions = transactions.filter(
      t => t.type === 'income' && t.clientName === clientName,
    );
    const totalSpent = clientTransactions.reduce((sum, t) => sum + t.amount, 0);
    const visits = clientTransactions.length;
    const sorted = [...clientTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastVisit = sorted.length > 0 ? sorted[0].date : null;
    return { totalSpent, visits, lastVisit };
  };

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setModalForm({ name: '', phone: '', instagram: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setModalForm({
      name: client.name || '',
      phone: client.phone || '',
      instagram: client.instagram || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (client) => {
    if (window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      deleteClient(client.id);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!modalForm.name.trim()) return;

    const payload = {
      name: modalForm.name.trim(),
      phone: modalForm.phone.trim(),
      instagram: modalForm.instagram.trim(),
      notes: modalForm.notes.trim(),
    };

    if (editingClient) {
      updateClient(editingClient.id, payload);
    } else {
      addClient(payload);
    }
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Clients"
        subtitle="Manage your customer relationships"
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input h-11 pl-10 pr-4"
              />
            </div>
            <Button onClick={handleOpenAddModal} size="sm" icon={UserPlus} className="h-11">
              Add Client
            </Button>
          </div>
        }
      />

      {filteredClients.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              stats={getClientStats(client.name)}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-4">
          <EmptyState
            icon="👋"
            title="No clients found"
            message={
              search
                ? `We couldn't find anyone matching "${search}".`
                : "You haven't saved any clients yet. Add your first client to get started."
            }
            action={
              search ? (
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              ) : (
                <Button onClick={handleOpenAddModal} icon={UserPlus}>
                  Create Client
                </Button>
              )
            }
          />
        </GlassCard>
      )}

      {/* Glass Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <GlassCard className="w-full max-w-md p-6 relative overflow-hidden animate-scale-in" variant="heavy">
            <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent-coral" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">
                {editingClient ? 'Edit Client Profile' : 'Add New Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <FormField
                label="Full Name"
                required
                type="text"
                value={modalForm.name}
                onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                placeholder="e.g. Abena Mansa"
              />
              <FormField
                label="Phone Number"
                type="tel"
                value={modalForm.phone}
                onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                placeholder="e.g. 024XXXXXXX"
              />
              <FormField
                label="Instagram Handle"
                type="text"
                value={modalForm.instagram}
                onChange={(e) => setModalForm({ ...modalForm, instagram: e.target.value })}
                placeholder="e.g. @abena_nails"
              />
              <FormField label="Notes / Preferences">
                <textarea
                  rows="3"
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  className="glass-input py-3"
                  placeholder="Notes about style preferences, lash mappings, skin types, etc."
                />
              </FormField>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 h-11">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-11">
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
