import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileHeader } from './components/MobileHeader';

import { Dashboard } from './pages/Dashboard';
import { NewIncome } from './pages/NewIncome';
import { NewExpense } from './pages/NewExpense';
import { Transactions } from './pages/Transactions';
import { Clients } from './pages/Clients';
import { Reports } from './pages/Reports';

const Layout = ({ children }) => {
  const location = useLocation();

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
          {children}
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
