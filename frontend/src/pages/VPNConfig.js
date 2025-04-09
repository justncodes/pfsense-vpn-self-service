import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';

const VPNConfig = ({ config }) => {
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    setCopiedAlert(true);
  };

  // Handle download configuration
  const handleDownload = () => {
    // Create a blob with the configuration text
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create and click a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wireguard.conf';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCloseAlert = () => {
    setCopiedAlert(false);
  };

  const steps = [
    'Install WireGuard Client',
    'Import Configuration',
    'Connect to VPN'
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" gutterBottom>
            VPN Access Configured Successfully
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ my: 3 }}>
          <Typography fontWeight="bold">
            IMPORTANT: Save Your Configuration Now!
          </Typography>
          <Typography variant="body2">
            For security reasons, your private key is only shown once and is not stored on our servers.
            Copy or download this configuration file before leaving this page.
          </Typography>
        </Alert>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 4, 
            p: 2, 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap',
            maxHeight: '300px',
            overflow: 'auto',
            bgcolor: '#f8f9fa'
          }}
        >
          {config}
        </Paper>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            startIcon={<ContentCopyIcon />} 
            onClick={handleCopy}
          >
            Copy to Clipboard
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<GetAppIcon />} 
            onClick={handleDownload}
          >
            Download Configuration
          </Button>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" gutterBottom>
          Next Steps:
        </Typography>
        
        <Stepper activeStep={-1} orientation="vertical" sx={{ mt: 2 }}>
          <Step>
            <StepLabel>Install WireGuard Client</StepLabel>
            <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
              <Typography>
                Download and install the WireGuard client for your device:
              </Typography>
              <Button
                variant="text"
                startIcon={<OpenInNewIcon />}
                href="https://www.wireguard.com/install/"
                target="_blank"
                sx={{ mt: 1 }}
              >
                Download WireGuard
              </Button>
            </Box>
          </Step>
          <Step>
            <StepLabel>Import Configuration</StepLabel>
            <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
              <Typography paragraph>
                Import the configuration into your WireGuard client:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ ml: 2 }}>
                <li>Windows/macOS: Click "Add Tunnel" and select the saved .conf file</li>
                <li>iOS/Android: Scan the QR code or import from files</li>
                <li>Linux: Save as /etc/wireguard/wg0.conf and use wg-quick</li>
              </Typography>
            </Box>
          </Step>
          <Step>
            <StepLabel>Connect to VPN</StepLabel>
            <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
              <Typography>
                Activate the tunnel in your WireGuard client to connect to the VPN.
              </Typography>
            </Box>
          </Step>
        </Stepper>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            component={RouterLink}
            to="/manage-vpn"
          >
            Manage VPN Connections
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
      
      <Snackbar
        open={copiedAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        message="Configuration copied to clipboard"
      />
    </Container>
  );
};

export default VPNConfig;
