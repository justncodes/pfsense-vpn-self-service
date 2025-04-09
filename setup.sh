#!/bin/bash

# Exit on error
set -e

echo "Setting up WireGuard VPN Self-Service Portal"
echo "---------------------------------------"

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix-like
    source venv/bin/activate
fi

# Install backend dependencies
echo "Installing backend dependencies..."
pip install flask flask-cors requests python-dotenv

# Create .env file with configuration
echo "Creating .env file..."
cat > .env << EOL
# pfSense Configuration
PFSENSE_IP=172.31.1.1
PFSENSE_API_KEY=replace-with-your-api-key
PFSENSE_API_SECRET=replace-with-your-api-secret

# WireGuard Configuration
SERVER_PUBLIC_KEY=replace-with-server-public-key
SERVER_ENDPOINT=sovpfsense.yourdomain.com:51820
VPN_SUBNET=10.0.8.0/24
ROUTE_NETWORK=172.16.0.0/14
DNS_SERVERS=172.17.16.10,172.17.16.11

# Authentication
DEMO_USER=demo
DEMO_PASSWORD=password

# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production
FLASK_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(24))')
EOL

echo "Created .env file. Please edit it with your actual configuration."

# Create config.py file based on the example if it doesn't exist
if [ ! -f "config.py" ]; then
    echo "Creating config.py file from example..."
    cp config.py.example config.py
fi

# Create data directory for persistence
mkdir -p data

# Set up frontend
echo "Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Return to root directory
cd ..

echo ""
echo "Setup complete!"
echo "IMPORTANT: Edit the .env file with your actual configuration before running."
echo ""
echo "To start the application:"
echo ""
echo "1. Activate the virtual environment:"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    echo "   venv\\Scripts\\activate"
else
    echo "   source venv/bin/activate"
fi
echo ""
echo "2. Start the backend server:"
echo "   python app.py"
echo ""
echo "3. In a separate terminal, start the frontend development server:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Access the application:"
echo "   - Production build: http://localhost:5000"
echo "   - Development frontend: http://localhost:3000"