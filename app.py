import os
import requests
import json
import ipaddress
import base64
import subprocess
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config import Config

app = Flask(__name__, static_folder='frontend/build')
CORS(app)  # Enable CORS for API endpoints
app.secret_key = Config.SECRET_KEY

# Load configuration
PFSENSE_IP = Config.PFSENSE_IP
PFSENSE_API_URL = Config.PFSENSE_API_URL
PFSENSE_API_KEY = Config.PFSENSE_API_KEY
PFSENSE_API_SECRET = Config.PFSENSE_API_SECRET
VPN_SUBNET = Config.VPN_SUBNET
ROUTE_NETWORK = Config.ROUTE_NETWORK
DNS_SERVERS = Config.DNS_SERVERS
SERVER_PUBLIC_KEY = Config.SERVER_PUBLIC_KEY
SERVER_ENDPOINT = Config.SERVER_ENDPOINT
DEMO_USER = Config.DEMO_USER
DEMO_PASSWORD = Config.DEMO_PASSWORD

# Storage for active peers (in memory for demo, use database in production)
active_peers = {}

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Endpoints
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    real_name = data.get('realName')
    
    if username == DEMO_USER and password == DEMO_PASSWORD:
        # In a real app, use JWT tokens or proper session management
        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'realName': real_name
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/request_vpn', methods=['POST'])
def request_vpn():
    data = request.json
    username = data.get('username')
    real_name = data.get('realName')
    
    # Generate WireGuard keys
    private_key, public_key = generate_wireguard_keys()
    
    # Allocate IP address
    client_ip = allocate_ip_address()
    if not client_ip:
        return jsonify({'success': False, 'message': 'Failed to allocate IP address'}), 500
    
    # Generate description from username and real name
    if real_name:
        names = real_name.split()
        if len(names) >= 2:
            first_name = names[0]
            last_name = names[-1]
            description = f"{username}-{first_name[0]}{last_name}"
        else:
            description = f"{username}-{real_name}"
    else:
        description = username
    
    # Create peer on pfSense
    peer_id = create_wireguard_peer(public_key, client_ip, description)
    if not peer_id:
        return jsonify({'success': False, 'message': 'Failed to create WireGuard peer on pfSense'}), 500
    
    # Generate client configuration
    client_config = generate_client_config(private_key, client_ip)
    
    # Store peer info for management
    active_peers[peer_id] = {
        'description': description,
        'public_key': public_key,
        'ip_address': client_ip
    }
    
    return jsonify({
        'success': True,
        'config': client_config,
        'peer_id': peer_id
    })

@app.route('/api/peers', methods=['GET'])
def get_peers():
    # In a real implementation, fetch the current peers from pfSense
    # For demo, we use the in-memory storage
    return jsonify({
        'success': True,
        'peers': [
            {
                'id': peer_id,
                'description': peer['description'],
                'ip_address': peer['ip_address']
            } for peer_id, peer in active_peers.items()
        ]
    })

@app.route('/api/revoke_vpn/<peer_id>', methods=['DELETE'])
def revoke_vpn(peer_id):
    if delete_wireguard_peer(peer_id):
        if peer_id in active_peers:
            del active_peers[peer_id]
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Failed to delete peer'}), 500

def generate_wireguard_keys():
    """Generate a WireGuard private and public key pair."""
    # Use wg command if available
    try:
        # Generate private key
        private_key = subprocess.check_output(['wg', 'genkey']).decode('utf-8').strip()
        # Generate public key from private key
        echo_process = subprocess.Popen(['echo', private_key], stdout=subprocess.PIPE)
        public_key = subprocess.check_output(['wg', 'pubkey'], 
                                            stdin=echo_process.stdout).decode('utf-8').strip()
        echo_process.stdout.close()
        return private_key, public_key
    except (subprocess.SubprocessError, FileNotFoundError):
        # Fallback: normally you'd implement native key generation here
        # For demo, we'll use placeholder values
        print("Warning: WireGuard tools not available, using placeholder keys")
        private_key = "placeholder_private_key_" + str(uuid.uuid4())
        public_key = "placeholder_public_key_" + str(uuid.uuid4())
        return private_key, public_key

def allocate_ip_address():
    """Allocate the next available IP from the VPN subnet."""
    # This is a simplified implementation
    # In production, you'd check existing allocations in pfSense
    
    # Parse the subnet
    network = ipaddress.IPv4Network(VPN_SUBNET)
    
    # Start from .100 (as specified in requirements)
    start_ip = int(network.network_address) + 100
    
    # Check which IPs are already allocated in our active_peers
    allocated_ips = [peer['ip_address'] for peer in active_peers.values()]
    
    # Find the next available IP
    for i in range(100, network.num_addresses - 1):  # Skip network and broadcast
        candidate_ip = str(ipaddress.IPv4Address(start_ip + i - 100))
        if candidate_ip not in allocated_ips:
            return candidate_ip
    
    return None  # No IPs available

def create_wireguard_peer(public_key, client_ip, description):
    """Create a WireGuard peer on pfSense using the API."""
    url = f"{PFSENSE_API_URL}/wireguard/client"
    
    # Format client IP with /32 for AllowedIPs
    client_ip_cidr = f"{client_ip}/32"
    
    payload = {
        "enabled": True,
        "publickey": public_key,
        "tunneladdress": client_ip_cidr,
        "description": description,
        "allowedips": client_ip_cidr
    }
    
    try:
        # Skip SSL verification due to self-signed certificate
        response = requests.post(
            url, 
            json=payload,
            verify=False,
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': PFSENSE_API_KEY
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get('data', {}).get('id', str(uuid.uuid4()))  # Fallback to random ID
        else:
            print(f"pfSense API error: {response.status_code}, {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

def delete_wireguard_peer(peer_id):
    """Delete a WireGuard peer from pfSense using the API."""
    url = f"{PFSENSE_API_URL}/wireguard/client/{peer_id}"
    
    try:
        # Skip SSL verification due to self-signed certificate
        response = requests.delete(
            url,
            verify=False,
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': PFSENSE_API_KEY
            }
        )

        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return False

def generate_client_config(private_key, client_ip):
    """Generate WireGuard client configuration."""
    config = f"""[Interface]
PrivateKey = {private_key}
Address = {client_ip}/24
DNS = {', '.join(DNS_SERVERS)}

[Peer]
PublicKey = {SERVER_PUBLIC_KEY}
Endpoint = {SERVER_ENDPOINT}
AllowedIPs = {ROUTE_NETWORK}
PersistentKeepalive = 25
"""
    return config

# Helper route to get server details (avoid hardcoding in React)
@app.route('/api/server_info', methods=['GET'])
def server_info():
    return jsonify({
        'success': True,
        'server_endpoint': SERVER_ENDPOINT,
        'route_network': ROUTE_NETWORK
    })

if __name__ == '__main__':
    # Disable SSL warnings (for development with self-signed certs)
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    app.run(debug=True, host='0.0.0.0', port=5000)