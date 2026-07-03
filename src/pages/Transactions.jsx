import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useConfirm } from '../context/ConfirmContext';

import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

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

const TransactionRow = ({ transaction: t, deleteTransaction }) => {
  const [expanded, setExpanded] = useState(false);
  const { confirm } = useConfirm();

  const handleDelete = async (e) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    });
    
    if (isConfirmed) {
      deleteTransaction(t.id);
    }
  };

  return (
    <div className="group border-b border-border/30 last:border-0 hover:bg-(--surface-hover) transition-colors flex flex-col">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer sm:cursor-default sm:grid sm:grid-cols-[120px_1.5fr_2fr_100px_80px] sm:gap-4"
        onClick={() => {
          if (window.innerWidth < 640) setExpanded(!expanded);
        }}
      >
        {/* 1. Date (Desktop) */}
        <div className="hidden sm:block text-sm font-medium text-foreground">
          {new Date(t.date).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </div>

        {/* 2. Type/Category + Date (Mobile) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={t.type}>{t.type}</Badge>
            <span className="font-semibold text-foreground text-sm">{t.category}</span>
          </div>
          <span className="sm:hidden text-xs text-muted-foreground">
            {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* 3. Details (Desktop) */}
        <div className="hidden sm:block text-sm text-muted-foreground truncate">
          {t.type === 'income'
            ? (t.clientName ? `Client: ${t.clientName}` : 'No client info')
            : (t.description || t.vendor || '—')}
        </div>

        {/* 4. Amount */}
        <div className={`text-right font-bold text-sm ${
          t.type === 'income' ? 'text-success' : 'text-foreground'
        }`}>
          {t.type === 'income' ? '+' : '-'}₵{t.amount.toFixed(2)}
        </div>

        {/* 5. Actions (Desktop) / Expand Icon (Mobile) */}
        <div className="hidden sm:flex justify-end items-center gap-1">
          {/* <button className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/10" title="Edit">
             <Edit2 size={16} />
          </button> */}
          <button 
             onClick={handleDelete}
             className="text-destructive hover:text-destructive/80 transition-colors p-2 rounded-lg hover:bg-destructive/10" title="Delete">
             <Trash2 size={16} />
          </button>
        </div>
        <div className="sm:hidden flex justify-end text-muted-foreground">
           {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Content (Mobile Only) */}
      {expanded && (
        <div className="sm:hidden px-4 pb-4 pt-1 animate-fade-in-up">
          <div className="mb-4 text-sm text-muted-foreground bg-(--surface-subtle) p-3 rounded-lg">
            <span className="font-semibold text-foreground block mb-1">Details:</span>
            {t.type === 'income'
              ? (t.clientName ? `Client: ${t.clientName}` : 'No client info')
              : (t.description || t.vendor || '—')}
          </div>
          <div className="flex items-center justify-between">
            {/* <button className="text-primary hover:text-primary/80 transition-colors text-xs font-bold uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-lg flex items-center gap-2">
              <Edit2 size={14} /> Edit
            </button> */}
            <div className="flex-1"></div>
            <button 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive/80 transition-colors text-xs font-bold uppercase tracking-wider bg-destructive/10 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Transactions = () => {
  const { transactions, deleteTransaction } = useData();
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
        {/* Header Row (Desktop only) */}
        <div className="hidden sm:grid sm:grid-cols-[120px_1.5fr_2fr_100px_80px] sm:gap-4 px-4 py-3 bg-(--surface-subtle) border-b border-border/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Date</div>
          <div>Type / Category</div>
          <div>Details</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Actions</div>
        </div>
        
        {/* List Body */}
        <div className="flex flex-col">
          {filteredTransactions.map(t => (
            <TransactionRow key={t.id} transaction={t} deleteTransaction={deleteTransaction} />
          ))}

          {filteredTransactions.length === 0 && (
            <div className="p-8">
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
                    <div className="flex gap-3 mt-2">
                      <Link to="/income/new"><Button size="sm">Add Income</Button></Link>
                      <Link to="/expense/new"><Button variant="secondary" size="sm">Add Expense</Button></Link>
                    </div>
                  )
                }
              />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
