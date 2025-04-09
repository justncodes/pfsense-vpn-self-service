import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import VpnLockIcon from '@mui/icons-material/VpnLock';

const RequestVPN = ({ user, setVpnConfig }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestVPN = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/request_vpn', {
        username: user.username,
        realName: user.realName
      });

      if (response.data.success) {
        setVpnConfig(response.data.config);
        navigate('/vpn-config');
      } else {
        setError(response.data.message || 'Failed to request VPN');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          <VpnLockIcon sx={{ fontSize: 35, mr: 1, verticalAlign: 'middle' }} />
          Request WireGuard VPN Access
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" paragraph>
          When you request a new VPN connection, the system will:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Generate a secure key pair" 
              secondary="A unique public and private key will be created for your connection"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Allocate a unique IP address" 
              secondary="Your device will get a dedicated IP address on the VPN network"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Configure the VPN server" 
              secondary="The server will be updated to accept your connection"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Create a configuration file" 
              secondary="You'll receive a config file to load into your WireGuard client"
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3, mb: 1 }}>
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="body1" fontWeight="bold">
              Important:
            </Typography>
            <Typography variant="body2">
              Your private key will only be shown once. Make sure to save your configuration when prompted.
              For security reasons, we don't store your private key.
            </Typography>
          </Alert>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleRequestVPN}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 'Request VPN Access'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RequestVPN;
