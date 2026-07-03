import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { Search, UserPlus, Edit3, Trash2, X, Plus } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';

const ClientCard = ({ client, stats, onEdit, onDelete }) => {
  const socialEntries = Object.entries(client.socialMedia || {}).filter(
    ([, val]) => val && val.trim(),
  );

  return (
    <GlassCard hover className="p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Subtle glass shimmer on hover */}
      <div className="absolute top-0 right-0 w-24 h-full bg-linear-to-b from-white/30 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity transform skew-x-12 translate-x-10 group-hover:translate-x-0 duration-700 pointer-events-none" />

      {/* Actions bar */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onEdit(client)}
          className="p-2 rounded-lg bg-(--surface-hover) border border-border/40 hover:text-primary transition-all duration-200"
          title="Edit Client"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={() => onDelete(client)}
          className="p-2 rounded-lg bg-(--surface-hover) border border-border/40 hover:text-destructive transition-all duration-200"
          title="Delete Client"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <Avatar name={client.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground tracking-tight truncate pr-16">{client.name}</h3>
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            {client.phone && <p className="font-semibold text-sm text-foreground/80">{client.phone}</p>}
            
            {/* Displaying Social Accounts Badges */}
            {socialEntries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {socialEntries.map(([platform, handle]) => (
                  <span
                    key={platform}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-light/40 text-primary font-bold text-[10px] uppercase tracking-wide border border-primary/10"
                  >
                    {platform === 'whatsapp' ? 'WA' : platform.slice(0, 4)}: {handle}
                  </span>
                ))}
              </div>
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
};

export const Clients = () => {
  const { clients, transactions, addClient, updateClient, deleteClient } = useData();
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    phone: '',
    notes: '',
  });

  // Dynamic social media selection/entry states
  const [socialPlatform, setSocialPlatform] = useState('snapchat'); // snaps as default
  const [socialValue, setSocialValue] = useState('');
  const [socialsMap, setSocialsMap] = useState({
    snapchat: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
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
    setModalForm({ name: '', phone: '', notes: '' });
    setSocialsMap({ snapchat: '', instagram: '', tiktok: '', whatsapp: '' });
    setSocialPlatform('snapchat');
    setSocialValue('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setModalForm({
      name: client.name || '',
      phone: client.phone || '',
      notes: client.notes || '',
    });
    setSocialsMap({
      snapchat: client.socialMedia?.snapchat || '',
      instagram: client.socialMedia?.instagram || client.instagram || '',
      tiktok: client.socialMedia?.tiktok || '',
      whatsapp: client.socialMedia?.whatsapp || '',
    });
    setSocialPlatform('snapchat');
    setSocialValue('');
    setIsModalOpen(true);
  };

  const handleDelete = (client) => {
    if (window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      deleteClient(client.id);
    }
  };

  const handleAddSocial = (e) => {
    e.preventDefault();
    if (!socialValue.trim()) return;
    setSocialsMap(prev => ({
      ...prev,
      [socialPlatform]: socialValue.trim(),
    }));
    setSocialValue('');
  };

  const handleRemoveSocial = (platform) => {
    setSocialsMap(prev => ({
      ...prev,
      [platform]: '',
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!modalForm.name.trim()) return;

    // Apply any unsubmitted text field value
    const finalSocialsMap = { ...socialsMap };
    if (socialValue.trim()) {
      finalSocialsMap[socialPlatform] = socialValue.trim();
    }

    const payload = {
      name: modalForm.name.trim(),
      phone: modalForm.phone.trim(),
      socialMedia: finalSocialsMap,
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
    <div className="space-y-6 pb-10 min-h-[85vh] flex flex-col">
      <PageHeader
        title="Clients"
        subtitle="Manage your customer relationships"
        action={
          <div className="flex items-center gap-2">
            <div
              className={`relative transition-all duration-300 ease-in-out flex items-center overflow-hidden h-11 ${
                isSearchFocused || search ? 'w-[200px] sm:w-[250px] opacity-100' : 'w-11 opacity-70 hover:opacity-100'
              }`}
              onMouseEnter={() => setIsSearchFocused(true)}
              onMouseLeave={() => { if (!search) setIsSearchFocused(false) }}
            >
              <button 
                type="button" 
                className={`p-2.5 mr-0.5 text-muted-foreground hover:text-foreground transition-all duration-300 absolute left-0 z-10 h-11 w-11 flex items-center justify-center ${isSearchFocused || search ? 'pointer-events-none' : 'hover:text-foreground cursor-pointer glass-panel'}`}
                onClick={() => setIsSearchFocused(true)}
              >
                <Search size={18} />
              </button>
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => { if (!search) setIsSearchFocused(false) }}
                className={`glass-input h-full pl-10 pr-4 w-full transition-all duration-300 ${isSearchFocused || search ? 'opacity-100' : 'opacity-0 cursor-pointer bg-transparent border-transparent shadow-none'}`}
              />
            </div>
            
            <Button onClick={handleOpenAddModal} size="sm" icon={UserPlus} className="h-11 whitespace-nowrap px-4">
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      />

      {filteredClients.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 flex-1 content-start">
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
        <div className="flex-1 flex flex-col justify-center pb-20">
          <GlassCard className="p-4 mx-auto w-full max-w-lg">
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
        </div>
      )}

      {/* Glass Dialog Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="flex min-h-full items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-6 relative overflow-hidden animate-scale-in my-8" variant="heavy">
              <div className="h-1 absolute top-0 left-0 right-0 bg-linear-to-r from-primary to-accent-coral" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">
                {editingClient ? 'Edit Client Profile' : 'Add New Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-(--surface-hover) transition-colors"
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

              {/* Dynamic Social Accounts Block (Spacious & Clean Layout) */}
              <div className="space-y-3 p-4 rounded-2xl bg-secondary/10 dark:bg-muted/20 border border-border/30">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Social Account</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    className="glass-input h-11 w-full text-sm"
                    value={socialPlatform}
                    onChange={(e) => {
                      setSocialPlatform(e.target.value);
                      setSocialValue(socialsMap[e.target.value] || '');
                    }}
                  >
                    <option value="snapchat">Snapchat</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <input
                    type="text"
                    className="glass-input h-11 sm:col-span-2"
                    value={socialValue}
                    onChange={(e) => setSocialValue(e.target.value)}
                    placeholder={socialPlatform === 'whatsapp' ? 'e.g. 024XXXXXXX' : 'e.g. @handle'}
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="btn-secondary py-2 px-4 flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Plus size={14} /> Add Platform
                  </button>
                </div>
              </div>

                {/* Displaying Social Badges/Tags inside Modal */}
                {Object.entries(socialsMap).some(([, val]) => val) && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-slide-up">
                    {Object.entries(socialsMap)
                      .filter(([, val]) => val)
                      .map(([platform, handle]) => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold animate-scale-in"
                        >
                          <span className="capitalize">{platform}: {handle}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSocial(platform)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-0.5 rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

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
        </div>,
        document.body
      )}
    </div>
  );
};
