import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ManageVPN = () => {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, peerId: null });

  useEffect(() => {
    fetchPeers();
  }, []);

  const fetchPeers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/peers');
      if (response.data.success) {
        setPeers(response.data.peers);
      } else {
        setError(response.data.message || 'Failed to load peers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (peerId) => {
    setDeleteDialog({ open: true, peerId });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, peerId: null });
  };

  const handleDeletePeer = async () => {
    const { peerId } = deleteDialog;
    
    try {
      const response = await axios.delete(`/api/revoke_vpn/${peerId}`);
      
      if (response.data.success) {
        setPeers(peers.filter(peer => peer.id !== peerId));
      } else {
        setError(response.data.message || 'Failed to revoke VPN access');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          <VpnKeyIcon sx={{ fontSize: 35, mr: 1, verticalAlign: 'middle' }} />
          Manage VPN Connections
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : peers.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peers.map((peer) => (
                  <TableRow key={peer.id}>
                    <TableCell>{peer.description}</TableCell>
                    <TableCell>{peer.ip_address}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        aria-label="delete" 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(peer.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ my: 3 }}>
            You don't have any active VPN connections. Request a new VPN connection to get started.
          </Alert>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/request-vpn"
          >
            Request New VPN Access
          </Button>
          
          <Button
            variant="outlined"
            component={RouterLink}
            to="/"
          >
            Return to Dashboard
          </Button>
        </Box>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Revoke VPN Access</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to revoke this VPN access? This action cannot be undone.
            You will no longer be able to connect using this configuration.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeletePeer} color="error" autoFocus>
            Revoke Access
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageVPN;
