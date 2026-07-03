import React from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, TrendingDown, DollarSign, Award, Percent, Download, Calendar, Users } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

const ProgressBar = ({ label, value, total, delay = 0 }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-2" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between text-sm font-medium">
        <span className="text-foreground">{label}</span>
        <span className="font-bold text-foreground">
          ₵{value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-accent-coral progress-fill"
          style={{ width: `${pct}%`, animationDelay: `${delay + 200}ms` }}
        />
      </div>
    </div>
  );
};

const HighlightRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-(--surface-subtle) border border-border/30">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary-light text-primary">
        <Icon size={16} />
      </div>
      <span className="text-muted-foreground font-medium text-sm">{label}</span>
    </div>
    <span className="font-bold text-foreground text-sm">{value}</span>
  </div>
);

export const Reports = () => {
  const { transactions } = useData();

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const incomeByService = incomeTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const bestService = Object.entries(incomeByService).sort(([, a], [, b]) => b - a)[0];

  // Calculate average revenue per active month
  const getAvgMonthlyRevenue = () => {
    if (incomeTransactions.length === 0) return '—';
    const dates = incomeTransactions.map(t => new Date(t.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date();
    const diffMonths = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
    const months = Math.max(1, diffMonths);
    return `₵${(totalIncome / months).toFixed(2)}`;
  };

  // Calculate Client Lifetime Value (LTV)
  const getClientLTV = () => {
    const uniqueClients = [...new Set(incomeTransactions.map(t => t.clientName).filter(Boolean))];
    if (uniqueClients.length === 0) return '—';
    return `₵${(totalIncome / uniqueClients.length).toFixed(2)}`;
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Financial Reports"
        subtitle="Insights and summaries"
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        <StatCard
          title="Total Income"
          value={totalIncome}
          isCurrency
          icon={TrendingUp}
          accent="success"
          delay={0}
        />
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          isCurrency
          icon={TrendingDown}
          accent="destructive"
          delay={80}
        />
        <StatCard
          title="Net Profit"
          value={netProfit}
          isCurrency
          icon={DollarSign}
          accent={netProfit >= 0 ? 'success' : 'destructive'}
          valueClassName={netProfit >= 0 ? 'text-success' : 'text-destructive'}
          delay={160}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Income by Service */}
        <GlassCard hover className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold mb-6 text-foreground tracking-tight flex items-center gap-2">
            <div className="w-1 h-5 bg-linear-to-b from-primary to-accent-coral rounded-full" />
            Income by Service
          </h3>
          <div className="space-y-5">
            {Object.entries(incomeByService).map(([service, amount], i) => (
              <ProgressBar
                key={service}
                label={service}
                value={amount}
                total={totalIncome}
                delay={i * 100}
              />
            ))}
            {Object.keys(incomeByService).length === 0 && (
              <EmptyState
                icon="📊"
                title="No service data yet"
                message="Record income transactions to see your service breakdown."
              />
            )}
          </div>
        </GlassCard>

        {/* Highlights */}
        <GlassCard hover className="p-6 sm:p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground tracking-tight mb-6 flex items-center gap-2">
            <div className="w-1 h-5 bg-linear-to-b from-accent-lavender to-info rounded-full" />
            Highlights
          </h3>

          <div className="space-y-3 flex-1">
            <HighlightRow
              icon={Award}
              label="Best Earning Service"
              value={bestService ? `${bestService[0]} (₵${bestService[1]})` : '—'}
            />
            <HighlightRow
              icon={Percent}
              label="Profit Margin"
              value={totalIncome > 0 ? `${((netProfit / totalIncome) * 100).toFixed(1)}%` : '0%'}
            />
            <HighlightRow
              icon={DollarSign}
              label="Avg. Transaction"
              value={
                incomeTransactions.length > 0
                  ? `₵${(totalIncome / incomeTransactions.length).toFixed(2)}`
                  : '—'
              }
            />
            <HighlightRow
              icon={Calendar}
              label="Avg. Monthly Revenue"
              value={getAvgMonthlyRevenue()}
            />
            <HighlightRow
              icon={Users}
              label="Client Lifetime Value (LTV)"
              value={getClientLTV()}
            />
          </div>

          <div className="pt-6 mt-auto">
            <Button variant="secondary" icon={Download} className="w-full h-12">
              Export to CSV
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
