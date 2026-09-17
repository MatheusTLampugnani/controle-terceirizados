import React, { useState } from 'react';
import Login from './pages/Login';
import DashboardPortaria from './pages/DashboardPortaria';

export default function App() {
  const [crachaAtivo, setCrachaAtivo] = useState(localStorage.getItem('cracha_ativo'));

  const handleLogin = (numeroCracha) => {
    localStorage.setItem('cracha_ativo', numeroCracha);
    setCrachaAtivo(numeroCracha);
  };

  const handleLogout = () => {
    localStorage.removeItem('cracha_ativo');
    setCrachaAtivo(null);
  };

  return (
    <div>
      {!crachaAtivo ? (
        <Login onLogin={handleLogin} />
      ) : (
        <DashboardPortaria crachaAtivo={crachaAtivo} onLogout={handleLogout} />
      )}
    </div>
  );
}