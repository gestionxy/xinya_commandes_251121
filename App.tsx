import React, { useState } from 'react';
import { StoreProvider, useStore } from './services/store';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientShop } from './components/ClientShop';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useStore();
  const [isGuest, setIsGuest] = useState(false);

  if (!currentUser && !isGuest) {
    return <Login onGuest={() => setIsGuest(true)} />;
  }

  if (currentUser?.role === UserRole.ADMIN) {
    return <AdminDashboard />;
  }

  // Render Client Shop for authenticated clients or guests
  return <ClientShop isGuest={isGuest} onExitGuest={() => setIsGuest(false)} />;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;