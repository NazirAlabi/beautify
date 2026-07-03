import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';

const ClientCard = ({ client, stats }) => (
  <GlassCard hover className="p-6 flex flex-col justify-between group">
    {/* Subtle glass shimmer on hover */}
    <div className="absolute top-0 right-0 w-24 h-full bg-linear-to-b from-white/30 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity transform skew-x-12 translate-x-10 group-hover:translate-x-0 duration-700 pointer-events-none" />

    <div className="flex items-start gap-4">
      <Avatar name={client.name} size="lg" />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-foreground tracking-tight truncate">{client.name}</h3>
        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
          {client.phone && <p>{client.phone}</p>}
          {client.instagram && (
            <p className="text-primary hover:underline cursor-pointer text-sm">{client.instagram}</p>
          )}
        </div>
      </div>
    </div>

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
  const { clients, transactions } = useData();
  const [search, setSearch] = useState('');

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

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Clients"
        subtitle="Manage your customer relationships"
        action={
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input h-11 pl-10 pr-4"
            />
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
                : "You haven't saved any clients yet. Clients are automatically saved when you record an income with a new name."
            }
            action={
              search && (
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              )
            }
          />
        </GlassCard>
      )}
    </div>
  );
};
