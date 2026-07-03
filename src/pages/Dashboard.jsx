import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { isSameDay, isSameWeek, isSameMonth, parseISO, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Sparkles, ArrowRight } from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';

export const Dashboard = () => {
  const { transactions } = useData();

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const todaysEarnings = incomeTransactions
    .filter(t => isSameDay(parseISO(t.date), today))
    .reduce((sum, t) => sum + t.amount, 0);

  const thisWeeksEarnings = incomeTransactions
    .filter(t => isSameWeek(parseISO(t.date), today))
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthsEarnings = incomeTransactions
    .filter(t => isSameMonth(parseISO(t.date), today))
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthsExpenses = expenseTransactions
    .filter(t => isSameMonth(parseISO(t.date), today))
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = thisMonthsEarnings - thisMonthsExpenses;

  // Calculate dynamic 3-week intervals
  const weeksIntervals = [
    {
      name: '2 Weeks Ago',
      start: startOfWeek(subWeeks(today, 2)),
      end: endOfWeek(subWeeks(today, 2)),
    },
    {
      name: 'Last Week',
      start: startOfWeek(subWeeks(today, 1)),
      end: endOfWeek(subWeeks(today, 1)),
    },
    {
      name: 'This Week',
      start: startOfWeek(today),
      end: endOfWeek(today),
    },
  ];

  const chartData = weeksIntervals.map(w => {
    const amount = incomeTransactions
      .filter(t => {
        try {
          const d = parseISO(t.date);
          return isWithinInterval(d, { start: w.start, end: w.end });
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return { name: w.name, amount };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting} ✨`}
        subtitle="Here's what's happening with your business today."
      />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Earnings"
          value={todaysEarnings}
          isCurrency
          icon={DollarSign}
          accent="primary"
          delay={0}
        />
        <StatCard
          title="This Week"
          value={thisWeeksEarnings}
          isCurrency
          icon={TrendingUp}
          accent="info"
          delay={80}
        />
        <StatCard
          title="This Month"
          value={thisMonthsEarnings}
          isCurrency
          icon={Calendar}
          accent="lavender"
          delay={160}
        />
        <StatCard
          title="Est. Profit"
          value={profit}
          isCurrency
          icon={Sparkles}
          accent={profit >= 0 ? 'success' : 'destructive'}
          valueClassName={profit >= 0 ? 'text-success' : 'text-destructive'}
          delay={240}
        />
      </div>

      {/* Charts & Recent */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Earnings Chart */}
        <GlassCard hover className="p-6">
          <h3 className="font-semibold mb-6 text-foreground tracking-tight flex items-center gap-2">
            <div className="w-1 h-5 bg-linear-to-b from-primary to-accent-coral rounded-full" />
           Recent Earnings
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(340, 65%, 58%)" />
                    <stop offset="100%" stopColor="hsl(340, 65%, 72%)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-fg)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-fg)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₵${v}`}
                />
                <Tooltip
                  cursor={{ fill: 'var(--surface-subtle)', radius: 8 }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    background: 'var(--input-focus-bg)',
                    backdropFilter: 'blur(12px)',
                    color: 'var(--fg)',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill="url(#barGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard hover className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
              <div className="w-1 h-5 bg-linear-to-b from-accent-lavender to-info rounded-full" />
              Recent Transactions
            </h3>
            {transactions.length > 0 && (
              <Link
                to="/transactions"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 5).map(t => (
              <div
                key={t.id}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-(--surface-hover) transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-success' : 'bg-destructive'}`} />
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${t.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                  {t.type === 'income' ? '+' : '-'}₵{t.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <EmptyState
                icon="📝"
                title="No transactions yet"
                message="Record your first service to begin tracking your business."
              />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
