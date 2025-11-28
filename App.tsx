
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FieldManager from './pages/FieldManager';
import FieldDetail from './pages/FieldDetail';
import AIAgronomist from './pages/AIAgronomist';
import Reports from './pages/Reports';
import AdminSettings from './pages/AdminSettings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { FarmProvider, useFarm } from './context/FarmContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useFarm();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <FarmProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="fields" element={<FieldManager />} />
              <Route path="fields/:id" element={<FieldDetail />} />
              <Route path="assistant" element={<AIAgronomist />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FarmProvider>
  );
}

export default App;
