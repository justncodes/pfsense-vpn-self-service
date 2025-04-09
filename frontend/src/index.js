import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Handle self-signed certificate warning for pfSense API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
