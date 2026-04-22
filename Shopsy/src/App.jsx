import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import { validateToken, logoutUser } from './Service.js/AuthService';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CustomerPage from './components/CustomerPage';
import DivisionPage from './components/DivisionPage';
import ProductPage from './components/ProductPage';
import OrdersPage from './components/OrdersPage';
import StocksPage from './components/StocksPage';
import UserPage from './components/UserPage';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import ReceiptPage from './components/ReceiptPage';
import Layout from './components/Layout';
import PremiumLoader from './components/PremiumLoader';
import ResetPasswordPage from './components/ResetPasswordPage';
import './App.css';

const AppContent = () => {
  const { setAuthToken, clearData, token } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [validating, setValidating] = useState(true);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#1b2559');
  const [zoomLevel, setZoomLevel] = useState(() => parseInt(localStorage.getItem('zoomLevel') || '100', 10));

  const handleSettingsChange = ({ accentColor: c, zoomLevel: z }) => {
    if (c !== undefined) setAccentColor(c);
    if (z !== undefined) setZoomLevel(z);
  };

  // Validate stored token on mount
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const isValid = await validateToken(storedToken);
        if (!isValid) {
          // Token expired — force logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setAuthToken(null);
          setCurrentUser(null);
        } else {
          setAuthToken(storedToken);
        }
      }
      setValidating(false);
    };
    checkToken();
  }, []);

  const handleLogin = (apiResponse) => {
    const data = apiResponse?.data;
    const token = data?.token;
    const user = {
      id: data?.id || '',
      name: data?.username || '',
      email: data?.email || '',
      role: data?.role || 'user',
    };
    if (token) setAuthToken(token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logoutUser(token);
    setAuthToken(null);
    clearData();
    setCurrentUser(null);
    navigate('/dashboard');
  };

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.slice(1); // Remove leading slash
    return path || 'dashboard';
  };

  const isAdmin = currentUser?.name?.toLowerCase() === 'meera' || currentUser?.role?.toLowerCase() === 'admin';

  // Show premium loader during token validation (skip for receipt pages)
  if (validating && !location.pathname.startsWith('/receipt/')) {
    return <PremiumLoader variant="fullpage" accentColor={accentColor} />;
  }

  return (
    <Routes>
      <Route path="/receipt/:orderCode" element={
        <ReceiptPage />
      } />
      <Route path="/*" element={
        !currentUser ? (
          <Routes>
            <Route index element={<LoginPage onLogin={handleLogin} />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <div className="App">
            <Layout
              currentUser={currentUser}
              activePage={getCurrentPage()}
              navigate={navigate}
              onLogout={handleLogout}
              accentColor={accentColor}
              zoomLevel={zoomLevel}
            >
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="customer" element={<CustomerPage />} />
                <Route path="division" element={isAdmin ? <DivisionPage /> : <Navigate to="dashboard" replace />} />
                <Route path="products" element={<ProductPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="stocks" element={<StocksPage />} />
                <Route path="user" element={isAdmin ? <UserPage /> : <Navigate to="dashboard" replace />} />
                <Route path="calendar" element={isAdmin ? <CalendarPage /> : <Navigate to="dashboard" replace />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="settings" element={isAdmin ? <SettingsPage currentUser={currentUser} onSettingsChange={handleSettingsChange} /> : <Navigate to="dashboard" replace />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </Layout>
          </div>
        )
      } />
    </Routes>
  );
};

function App() {
  return (
    <DataProvider>
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
}

export default App;
