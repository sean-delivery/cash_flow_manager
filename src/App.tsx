import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import App1 from './pages/App1';
import App2 from './pages/App2';
import App3 from './pages/App3';
import App4 from './pages/App4';
import Settings from './pages/Settings';
import Support from './pages/Support';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('user'));

  const handleAuth = (name: string) => {
    setUser(name);
    localStorage.setItem('user', name);
  };

  const routesUnauthenticated = (
    <>
      <Route path="/login" element={<Login onLogin={handleAuth} />} />
      <Route path="/register" element={<Register onRegister={handleAuth} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  );

  const routesAuthenticated = (
    <>
      <Route path="/dashboard" element={<Dashboard user={user!} />} />
      <Route path="/app1" element={<App1 />} />
      <Route path="/app2" element={<App2 />} />
      <Route path="/app3" element={<App3 />} />
      <Route path="/app4" element={<App4 />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/support" element={<Support />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </>
  );

  return <Routes>{user ? routesAuthenticated : routesUnauthenticated}</Routes>;
};

export default App;
