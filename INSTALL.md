# One-Command Installation

You can install the WireGuard VPN Self-Service Portal with a single command:

## Linux / macOS

```bash
curl -s https://raw.githubusercontent.com/justncodes/pfsense-vpn-self-service/main/bootstrap.sh | bash
```

Or if you prefer to download the script first:

```bash
curl -s https://raw.githubusercontent.com/justncodes/pfsense-vpn-self-service/main/bootstrap.sh -o bootstrap.sh && chmod +x bootstrap.sh && ./bootstrap.sh
```

## Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/justncodes/pfsense-vpn-self-service/main/bootstrap.sh -OutFile bootstrap.sh
bash bootstrap.sh
```

Note: This requires Git Bash or WSL to be installed on Windows.

## After Installation

After installing, you'll need to:

1. Edit the `.env` file with your actual configuration:
```
PFSENSE_IP=your-pfsense-ip
PFSENSE_API_KEY=your-api-key
PFSENSE_API_SECRET=your-api-secret
SERVER_PUBLIC_KEY=your-server-public-key
SERVER_ENDPOINT=your-server-endpoint:port
```

2. Run the application in development mode:
```bash
# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the backend
python app.py

# In a separate terminal, start the frontend dev server
cd frontend
npm start
```

3. Access the application:
   - Development UI: http://localhost:3000
   - Production build: http://localhost:5000