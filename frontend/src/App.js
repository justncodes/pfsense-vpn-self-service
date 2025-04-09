import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestVPN from './pages/RequestVPN';
import VPNConfig from './pages/VPNConfig';
import ManageVPN from './pages/ManageVPN';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e6da4',
    },
    secondary: {
      main: '#5cb85c',
    },
    background: {
      default: '#f8f9fa',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vpnConfig, setVpnConfig] = useState(null);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      setVpnConfig(null);
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/request-vpn" element={
            <ProtectedRoute>
              <RequestVPN user={user} setVpnConfig={setVpnConfig} />
            </ProtectedRoute>
          } />
          
          <Route path="/vpn-config" element={
            <ProtectedRoute>
              {vpnConfig ? <VPNConfig config={vpnConfig} /> : <Navigate to="/request-vpn" />}
            </ProtectedRoute>
          } />
          
          <Route path="/manage-vpn" element={
            <ProtectedRoute>
              <ManageVPN user={user} />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;