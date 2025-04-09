import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import DevicesIcon from '@mui/icons-material/Devices';

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography component="h1" variant="h3" gutterBottom>
          Welcome to VPN Self-Service Portal
        </Typography>
        <Typography variant="h6" align="center">
          Secure, fast, and easy access to company resources
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Request VPN Access" />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography paragraph>
                Need secure access to company resources? Request your personal WireGuard VPN connection in just a few clicks.
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VpnKeyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Secure key generation" secondary="We'll create a unique secure key pair for your connection" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Fast connection" secondary="WireGuard provides excellent performance and low latency" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Multiple devices" secondary="Available for Windows, macOS, iOS, Android, and Linux" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/request-vpn"
                sx={{ ml: 2, mb: 2 }}
              >
                Request VPN Access
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Manage VPN Access" />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography paragraph>
                Need to manage your existing VPN connections? View and revoke access as needed.
              </Typography>
              <Typography paragraph>
                The management page allows you to:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="View your active VPN connections" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Revoke access for compromised or unused connections" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Monitor your VPN usage" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/manage-vpn"
                sx={{ ml: 2, mb: 2 }}
              >
                Manage VPN
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;