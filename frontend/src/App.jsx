import React from 'react';
import Login from './pages/Login';
import DashboardPortaria from './pages/DashboardPortaria';
import { useAuth } from './modules/auth/hooks/useAuth';

export default function App() {
  const { crachaAtivo, login, logout } = useAuth();

  const handleLogin = async (numeroCracha) => {
    await login(numeroCracha);
  };

  return (
    <div>
      {!crachaAtivo ? (
        <Login onLogin={handleLogin} />
      ) : (
        <DashboardPortaria onLogout={logout} />
      )}
    </div>
  );
}