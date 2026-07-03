import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, UserPlus, X, Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { FormField } from '../components/FormField';
import { SelectField } from '../components/SelectField';
import { Button } from '../components/Button';

export const NewIncome = () => {
  const { services, clients, addTransaction } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    serviceDropdown: '', // temporary dropdown selector
    amount: '',
    client: '',  // client ID or 'NEW_CLIENT'
    paymentMethod: 'Cash',
    notes: '',

    // Inline Service Creation fields
    newServiceName: '',
    newServicePrice: '',

    // Inline Client Creation fields
    newClientName: '',
    newClientPhone: '',
  });

  // Services selected for this transaction
  const [selectedServices, setSelectedServices] = useState([]);
  // Newly created services to register on submission
  const [newServicesToRegister, setNewServicesToRegister] = useState([]);

  // Inline Client Creation socials
  const [inlineSocialPlatform, setInlineSocialPlatform] = useState('snapchat'); // default to snapchat
  const [inlineSocialValue, setInlineSocialValue] = useState('');
  const [inlineSocialsMap, setInlineSocialsMap] = useState({
    snapchat: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
  });

  const isCreatingNewService = formData.serviceDropdown === 'NEW_SERVICE';
  const isCreatingNewClient = formData.client === 'NEW_CLIENT';

  // Automatically recalculate sum of selected services
  useEffect(() => {
    const total = selectedServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    setFormData(prev => ({
      ...prev,
      amount: total > 0 ? total.toString() : '',
    }));
  }, [selectedServices]);

  const handleServiceSelect = (e) => {
    const value = e.target.value;
    if (value === 'NEW_SERVICE') {
      setFormData(prev => ({ ...prev, serviceDropdown: value }));
    } else if (value) {
      const selected = services.find(s => s.id === value);
      if (selected && !selectedServices.some(s => s.id === selected.id)) {
        setSelectedServices(prev => [
          ...prev,
          { id: selected.id, name: selected.name, price: selected.defaultPrice }
        ]);
      }
      // Reset dropdown select back to blank so user can choose again
      setFormData(prev => ({ ...prev, serviceDropdown: '' }));
    }
  };

  const handleAddCustomService = (e) => {
    e.preventDefault();
    if (!formData.newServiceName.trim() || !formData.newServicePrice) return;

    const tempId = 'temp-' + Date.now();
    const newSrv = {
      id: tempId,
      name: formData.newServiceName.trim(),
      price: parseFloat(formData.newServicePrice) || 0
    };

    setSelectedServices(prev => [...prev, newSrv]);
    setNewServicesToRegister(prev => [...prev, { name: newSrv.name, defaultPrice: newSrv.price }]);

    // Reset inline service creation fields
    setFormData(prev => ({
      ...prev,
      serviceDropdown: '',
      newServiceName: '',
      newServicePrice: '',
    }));
  };

  const handleRemoveService = (idToRemove) => {
    setSelectedServices(prev => prev.filter(s => s.id !== idToRemove));
    const nameToRemove = selectedServices.find(s => s.id === idToRemove)?.name;
    if (nameToRemove) {
      setNewServicesToRegister(prev => prev.filter(ns => ns.name !== nameToRemove));
    }
  };

  const handleClientSelect = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, client: value }));
  };

  const handleAddInlineSocial = (e) => {
    e.preventDefault();
    if (!inlineSocialValue.trim()) return;
    setInlineSocialsMap(prev => ({
      ...prev,
      [inlineSocialPlatform]: inlineSocialValue.trim()
    }));
    setInlineSocialValue('');
  };

  const handleRemoveInlineSocial = (platform) => {
    setInlineSocialsMap(prev => ({
      ...prev,
      [platform]: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }

    const transactionCategory = selectedServices.map(s => s.name).join(', ');

    let transactionClientName = '';
    let newClientPayload = null;

    // Handle Client Profile
    if (isCreatingNewClient) {
      transactionClientName = formData.newClientName.trim();

      // Incorporate any unsubmitted social input value
      const finalSocials = { ...inlineSocialsMap };
      if (inlineSocialValue.trim()) {
        finalSocials[inlineSocialPlatform] = inlineSocialValue.trim();
      }

      newClientPayload = {
        name: formData.newClientName.trim(),
        phone: formData.newClientPhone.trim(),
        socialMedia: finalSocials,
      };
    } else if (formData.client && formData.client !== 'NONE') {
      const selectedClient = clients.find(c => c.id === formData.client);
      transactionClientName = selectedClient ? selectedClient.name : '';
    }

    addTransaction({
      type: 'income',
      category: transactionCategory,
      amount: parseFloat(formData.amount) || 0,
      date: new Date(formData.date).toISOString(),
      clientName: transactionClientName || undefined,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      newClient: newClientPayload || undefined,
      newServices: newServicesToRegister.length > 0 ? newServicesToRegister : undefined,
    });
    
    toast.success('Income recorded successfully!');

    if (e.nativeEvent.submitter.name === 'saveAndAdd') {
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        serviceDropdown: '',
        amount: '',
        client: '',
        paymentMethod: 'Cash',
        notes: '',
        newServiceName: '',
        newServicePrice: '',
        newClientName: '',
        newClientPhone: '',
      });
      setSelectedServices([]);
      setNewServicesToRegister([]);
      setInlineSocialsMap({ snapchat: '', instagram: '', tiktok: '', whatsapp: '' });
      setInlineSocialValue('');
      setInlineSocialPlatform('snapchat');
    } else {
      navigate('/transactions');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <PageHeader title="Record Income" subtitle="Add a new earning" />

      <GlassCard className="overflow-hidden">
        <div className="h-1 bg-linear-to-r from-primary via-accent-coral to-accent-gold" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Date"
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            {/* Service selector */}
            <div className="space-y-2">
              <SelectField
                label="Add Services"
                required={selectedServices.length === 0}
                value={formData.serviceDropdown}
                onChange={handleServiceSelect}
                placeholder="Select service..."
                options={[
                  ...services.map(s => ({ value: s.id, label: s.name })),
                  { value: 'NEW_SERVICE', label: '✨ + Create New Service...' }
                ]}
              />

              {/* Display Selected Services List */}
              {selectedServices.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1.5 animate-slide-up">
                  {selectedServices.map(srv => (
                    <div
                      key={srv.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-primary/10 to-accent-coral/10 border border-primary/20 text-xs font-semibold text-foreground shadow-sm animate-scale-in"
                    >
                      <span>{srv.name} (₵{srv.price})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv.id)}
                        className="text-muted-foreground hover:text-destructive p-0.5 rounded-full hover:bg-destructive/10 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client selector */}
            <SelectField
              label="Client"
              value={formData.client}
              onChange={handleClientSelect}
              placeholder="Select client..."
              options={[
                { value: 'NONE', label: 'None' },
                ...clients.map(c => ({ value: c.id, label: c.name })),
                { value: 'NEW_CLIENT', label: '👤 + Create New Client...' }
              ]}
            />

            <SelectField
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'Momo', label: 'Mobile Money' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
              ]}
            />
          </div>

          {/* Dynamic Service Creation Fields */}
          {isCreatingNewService && (
            <GlassCard className="p-5 border-dashed border-primary/40 bg-primary-light/5 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles size={16} />
                  <span>Create Custom Service</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, serviceDropdown: '' }))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Service Name"
                  type="text"
                  value={formData.newServiceName}
                  onChange={(e) => setFormData({ ...formData, newServiceName: e.target.value })}
                  placeholder="e.g. Volume Lash Set"
                />
                <FormField
                  label="Default Price"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="₵"
                  value={formData.newServicePrice}
                  onChange={(e) => setFormData({ ...formData, newServicePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleAddCustomService}
                  size="sm"
                  disabled={!formData.newServiceName.trim() || !formData.newServicePrice}
                >
                  + Add to Transaction
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Dynamic Client Creation Fields */}
          {isCreatingNewClient && (
            <GlassCard className="p-5 border-dashed border-accent-lavender/40 bg-purple-50/5 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent-lavender font-bold text-sm">
                  <UserPlus size={16} />
                  <span>New Client Profile</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, client: '' }))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <FormField
                  label="Full Name"
                  required
                  type="text"
                  value={formData.newClientName}
                  onChange={(e) => setFormData({ ...formData, newClientName: e.target.value })}
                  placeholder="e.g. Abena Mansa"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Phone Number (Optional)"
                    type="tel"
                    value={formData.newClientPhone}
                    onChange={(e) => setFormData({ ...formData, newClientPhone: e.target.value })}
                    placeholder="e.g. 024XXXXXXX"
                  />
                  
                  {/* Dynamic Social Accounts Block (Spacious & Clean Layout) */}
                  <div className="space-y-3 p-4 rounded-2xl bg-secondary/10 dark:bg-muted/20 border border-border/30">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Social Account</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        className="glass-input h-11 w-full text-sm"
                        value={inlineSocialPlatform}
                        onChange={(e) => {
                          setInlineSocialPlatform(e.target.value);
                          setInlineSocialValue(inlineSocialsMap[e.target.value] || '');
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
                        value={inlineSocialValue}
                        onChange={(e) => setInlineSocialValue(e.target.value)}
                        placeholder={inlineSocialPlatform === 'whatsapp' ? 'e.g. 024XXXXXXX' : 'e.g. @handle'}
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddInlineSocial}
                        className="btn-secondary py-2 px-4 flex items-center justify-center gap-1.5 text-xs font-bold"
                      >
                        <Plus size={14} /> Add Platform
                      </button>
                    </div>
                  </div>

                    {/* Displaying Social Badges/Tags inside Inline Form */}
                    {Object.entries(inlineSocialsMap).some(([, val]) => val) && (
                      <div className="flex flex-wrap gap-1.5 pt-1 animate-slide-up">
                        {Object.entries(inlineSocialsMap)
                          .filter(([, val]) => val)
                          .map(([platform, handle]) => (
                            <span
                              key={platform}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold animate-scale-in"
                            >
                              <span className="capitalize">{platform}: {handle}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveInlineSocial(platform)}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-0.5 rounded-full"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Form Price/Amount (displays sum of selected, editable by user) */}
          <FormField
            label="Total Amount"
            required
            type="number"
            min="0"
            step="0.01"
            prefix="₵"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />

          <FormField label="Notes (Optional)">
            <textarea
              rows={1}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              className="glass-input py-3 resize-none overflow-y-auto max-h-[120px] min-h-[48px]"
              placeholder="Any details about the appointment..."
            />
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" name="save" icon={PlusCircle} className="flex-1 h-12">
              Save Transaction
            </Button>
            <Button type="submit" name="saveAndAdd" variant="secondary" className="flex-1 h-12">
              Save & Add Another
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
