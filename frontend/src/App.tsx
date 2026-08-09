import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { SplashScreen } from './components/SplashScreen';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FindRide } from './pages/FindRide';
import { OfferRide } from './pages/OfferRide';
import { LiveTracking } from './pages/LiveTracking';
import { WalletPage } from './pages/WalletPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ImpactPage } from './pages/ImpactPage';
import { MyTrips } from './pages/MyTrips';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return localStorage.getItem('odoo_commute_active_tab') || 'dashboard';
  });
  
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(undefined);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('odoo_commute_active_tab', tab);
  };

  // If Admin persona logs in, ensure admin tab can be loaded cleanly
  useEffect(() => {
    if (user?.role === 'ADMINISTRATOR' && activeTab === 'admin') {
      setActiveTab('admin');
    }
  }, [user]);

  if (showSplash || loading) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} setSelectedTripId={setSelectedTripId} />
        )}

        {activeTab === 'find' && (
          <FindRide setActiveTab={setActiveTab} setSelectedTripId={setSelectedTripId} />
        )}

        {activeTab === 'offer' && (
          <OfferRide setActiveTab={setActiveTab} />
        )}

        {activeTab === 'live-tracking' && (
          <LiveTracking selectedTripId={selectedTripId} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'wallet' && (
          <WalletPage />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesPage />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'impact' && (
          <ImpactPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'my-trips' && (
          <MyTrips setActiveTab={setActiveTab} setSelectedTripId={setSelectedTripId} />
        )}
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
