import React from 'react';
import { Spinner } from 'react-bootstrap';
import Login from './pages/Login';
import DashboardPortaria from './pages/DashboardPortaria';
import { useAuth } from './modules/auth/hooks/useAuth';

export default function App() {
  const { crachaAtivo, verificandoPortal, login, logout } = useAuth();

  const handleLogin = async (numeroCracha) => {
    await login(numeroCracha);
  };

  // Enquanto confere o login do Portal, não mostra o operador anterior nem a tela de crachá
  if (verificandoPortal) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-2">
        <Spinner animation="border" style={{ color: '#EB2737' }} />
        <span className="small text-muted">Entrando com o seu login do Portal...</span>
      </div>
    );
  }

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