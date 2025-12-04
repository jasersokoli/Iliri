import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { useEffect } from 'react';
import React from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Apply theme
    if (user?.theme) {
      document.documentElement.setAttribute('data-theme', user.theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [user?.theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="sales" element={<Sales />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

