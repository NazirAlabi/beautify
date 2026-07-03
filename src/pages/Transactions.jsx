import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

const FilterPills = ({ filter, setFilter }) => {
  const pills = [
    { key: 'all', label: 'All', activeClass: 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md' },
    { key: 'income', label: 'Income', activeClass: 'bg-gradient-to-r from-success to-emerald-500 text-white shadow-md' },
    { key: 'expense', label: 'Expenses', activeClass: 'bg-gradient-to-r from-destructive to-orange-500 text-white shadow-md' },
  ];

  return (
    <div className="flex gap-1 glass-panel p-1 w-fit">
      {pills.map(pill => (
        <button
          key={pill.key}
          onClick={() => setFilter(pill.key)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            filter === pill.key
              ? pill.activeClass
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
};

const TransactionRow = ({ transaction: t }) => (
  <tr className="hover:bg-[var(--surface-hover)] transition-colors group">
    <td className="px-5 py-4 whitespace-nowrap font-medium text-foreground text-sm">
      {new Date(t.date).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })}
    </td>
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <Badge variant={t.type}>{t.type}</Badge>
        <span className="font-semibold text-foreground text-sm">{t.category}</span>
      </div>
    </td>
    <td className="px-5 py-4 text-muted-foreground text-sm hidden md:table-cell">
      {t.type === 'income'
        ? (t.clientName ? `Client: ${t.clientName}` : 'No client')
        : (t.description || t.vendor || '—')}
    </td>
    <td className={`px-5 py-4 text-right font-bold whitespace-nowrap text-sm ${
      t.type === 'income' ? 'text-success' : 'text-foreground'
    }`}>
      {t.type === 'income' ? '+' : '-'}₵{t.amount.toFixed(2)}
    </td>
    <td className="px-5 py-4 text-center">
      <button className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 focus:opacity-100">
        Edit
      </button>
    </td>
  </tr>
);

export const Transactions = () => {
  const { transactions } = useData();
  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Transactions"
        subtitle="Your complete financial history"
        action={<FilterPills filter={filter} setFilter={setFilter} />}
      />

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/40">
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type / Category</th>
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Details</th>
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredTransactions.map(t => (
                <TransactionRow key={t.id} transaction={t} />
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon="📝"
                      title="No transactions found"
                      message={
                        filter === 'all'
                          ? "You haven't recorded any transactions yet. Record your first service to begin tracking your business."
                          : `You don't have any ${filter} transactions.`
                      }
                      action={
                        filter === 'all' && (
                          <>
                            <Link to="/income/new"><Button size="sm">Add Income</Button></Link>
                            <Link to="/expense/new"><Button variant="secondary" size="sm">Add Expense</Button></Link>
                          </>
                        )
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
