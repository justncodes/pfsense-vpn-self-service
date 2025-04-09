# WireGuard VPN Self-Service Portal

A modern web application that allows users to request and manage their WireGuard VPN access, integrated with pfSense API.

## Features

- User authentication
- WireGuard key generation
- Automatic IP allocation
- Integration with pfSense API
- Modern React UI with Material Design
- Configuration management

## Prerequisites

- Python 3.7+
- Node.js 14+ and npm
- pfSense with WireGuard and API configured

## Installation

### 1. Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd vpn-self-service-portal
```

2. Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create a virtual environment
- Install all dependencies
- Set up a default `.env` file with configuration placeholders
- Create a `.gitignore` entry for sensitive files
- Build the React frontend

3. Edit the `.env` file with your actual configuration:
```
# pfSense Configuration
PFSENSE_IP=172.31.1.1
PFSENSE_API_KEY=your-api-key
PFSENSE_API_SECRET=your-api-secret

# WireGuard Configuration
SERVER_PUBLIC_KEY=your-server-public-key
SERVER_ENDPOINT=sovpfsense.yourdomain.com:51820
# ...and other settings
```

### 2. Run the Application

1. Activate the virtual environment:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Start the Flask server:
```bash
python app.py
```

3. Access the application at http://localhost:5000

## Docker Deployment

You can also use Docker for deployment:

1. Edit the `.env` file with your configuration (as described above)

2. Build and start the container:
```bash
docker-compose up -d
```

The application will be available at http://localhost:5000.

You can also set environment variables directly in the docker-compose.yml file:
```yaml
services:
  vpn-portal:
    # ...
    environment:
      - FLASK_APP=app.py
      - FLASK_ENV=production
      - PFSENSE_IP=172.31.1.1
      - PFSENSE_API_KEY=your-api-key
      - PFSENSE_API_SECRET=your-api-secret
      - SERVER_PUBLIC_KEY=your-server-public-key
      - SERVER_ENDPOINT=sovpfsense.yourdomain.com:51820
      - DEMO_USER=demo
      - DEMO_PASSWORD=password
      - FLASK_SECRET_KEY=your-secure-secret-key
```

## Security Considerations

- The application uses a self-signed certificate for development. In production, use a valid SSL certificate.
- Consider integrating with a proper authentication system (LDAP, Active Directory).
- Store credentials securely in environment variables or a secure vault.
- Implement proper session management and JWT tokens for API access.

## Production Deployment

For production deployment:

1. Configure a reverse proxy (Nginx, Apache) with SSL
2. Use a process manager like Gunicorn, uWSGI, or Supervisor
3. Set `debug=False` in the Flask application
4. Use proper session handling and CSRF protection
5. Consider using Docker for containerization

## License

[MIT License](LICENSE)