import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileHeader } from './components/MobileHeader';

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const NewIncome = lazy(() => import('./pages/NewIncome').then(m => ({ default: m.NewIncome })));
const NewExpense = lazy(() => import('./pages/NewExpense').then(m => ({ default: m.NewExpense })));
const Transactions = lazy(() => import('./pages/Transactions').then(m => ({ default: m.Transactions })));
const Clients = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// A simple premium-looking skeleton loader for page transitions
const PageLoader = () => (
  <div className="w-full space-y-6 py-6 animate-pulse">
    <div className="h-10 bg-(--surface-hover) rounded-xl w-1/3" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-(--surface-hover) rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-(--surface-hover) rounded-2xl" />
  </div>
);

import { useData } from './context/DataContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { loading } = useData();

  return (
    <div className="min-h-screen text-foreground pb-24 md:pb-0 md:flex relative overflow-hidden">
      {/* Animated background gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="bg-blob w-[500px] h-[500px] bg-primary/30 top-[-10%] right-[-5%] opacity-40"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="bg-blob w-[400px] h-[400px] bg-accent-lavender/30 bottom-[-5%] left-[-5%] opacity-35"
          style={{ animationDelay: '-7s' }}
        />
        <div
          className="bg-blob w-[350px] h-[350px] bg-accent-gold/25 top-[40%] left-[25%] opacity-30"
          style={{ animationDelay: '-13s' }}
        />
      </div>

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full z-10 relative min-h-screen">
        <MobileHeader />

        {/* Page content with fade-in animation */}
        <div key={location.pathname} className="animate-fade-in-up">
          {loading ? (
            <PageLoader />
          ) : (
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income/new" element={<NewIncome />} />
          <Route path="/expense/new" element={<NewExpense />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
