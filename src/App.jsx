import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Clients } from './pages/Clients';
import { Quotes } from './pages/Quotes';
import { Expenses } from './pages/Expenses';
import { Suppliers } from './pages/Suppliers';
import { HR } from './pages/HR';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Projects } from './pages/Projects';
import { Tickets } from './pages/Tickets';
import { Proposals } from './pages/Proposals';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('solno_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            boxShadow: '0 0 20px -5px rgba(204, 255, 0, 0.4)',
          },
          className: 'glass'
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="cotizaciones" element={<Quotes />} />
          <Route path="propuestas" element={<Proposals />} />
          <Route path="gastos" element={<Expenses />} />
          <Route path="proveedores" element={<Suppliers />} />
          <Route path="proyectos" element={<Projects />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="rh" element={<HR />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
