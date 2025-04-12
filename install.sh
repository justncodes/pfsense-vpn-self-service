#!/bin/bash

# Create error log function
log_error() {
    echo "ERROR: $1" >&2
    echo "Please check the error message above and try again."
    exit 1
}

# Check if bash is available
if [ -z "$BASH_VERSION" ]; then
    echo "This script requires bash to run. Please use bash to execute this script."
    exit 1
fi

# Exit on error
set -e

echo "WireGuard VPN Self-Service Portal - Installation"
echo "==============================================="
echo "This script will install all dependencies, clone the repository,"
echo "and set up the application with a single command."
echo ""

# Detect OS and package manager
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    PKG_MANAGER="apt"
    echo "Detected Debian/Ubuntu-based system"
    # Detect specific version for venv package name
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
    PYTHON_VENV_PKG="python3-venv"
    if [ -n "$PYTHON_VERSION" ]; then
        PYTHON_VENV_PKG="python${PYTHON_VERSION}-venv"
        echo "Detected Python version: ${PYTHON_VERSION}, will use package: ${PYTHON_VENV_PKG}"
    fi
elif [ -f /etc/redhat-release ]; then
    # RHEL/CentOS/Fedora
    PKG_MANAGER="yum"
    echo "Detected Red Hat/CentOS/Fedora-based system"
elif [ -f /etc/arch-release ]; then
    # Arch Linux
    PKG_MANAGER="pacman"
    echo "Detected Arch Linux-based system"
elif command -v brew &> /dev/null; then
    # macOS with Homebrew
    PKG_MANAGER="brew"
    echo "Detected macOS with Homebrew"
else
    PKG_MANAGER="unknown"
    echo "Unable to detect package manager. You may need to install dependencies manually."
fi

# Install git and other dependencies if possible
install_dependencies() {
    echo "Checking and installing dependencies..."
    
    if [ "$PKG_MANAGER" = "apt" ]; then
        echo "Updating package lists..."
        sudo apt update
        
        # Check for Git
        if ! command -v git &> /dev/null; then
            echo "Installing Git..."
            sudo apt install -y git
        fi
        
        # Check for Python3
        if ! command -v python3 &> /dev/null; then
            echo "Installing Python 3..."
            sudo apt install -y python3 python3-pip
        fi
        
        # Check for Python3 venv
        if ! dpkg -l | grep -q python3-venv; then
            echo "Installing Python 3 venv..."
            sudo apt install -y $PYTHON_VENV_PKG
            
            # If that fails, try the generic package
            if [ $? -ne 0 ]; then
                echo "Failed to install $PYTHON_VENV_PKG, trying python3-venv instead..."
                sudo apt install -y python3-venv
            fi
        fi
        
        # Check for Node.js
        if ! command -v node &> /dev/null; then
            echo "Installing Node.js and npm..."
            sudo apt install -y nodejs npm
        fi
        
    elif [ "$PKG_MANAGER" = "yum" ]; then
        # Check for Git
        if ! command -v git &> /dev/null; then
            echo "Installing Git..."
            sudo yum install -y git
        fi
        
        # Check for Python3
        if ! command -v python3 &> /dev/null; then
            echo "Installing Python 3..."
            sudo yum install -y python3 python3-pip
        fi
        
        # Check for Node.js
        if ! command -v node &> /dev/null; then
            echo "Installing Node.js and npm..."
            sudo yum install -y nodejs npm
        fi
        
    elif [ "$PKG_MANAGER" = "pacman" ]; then
        # Check for Git
        if ! command -v git &> /dev/null; then
            echo "Installing Git..."
            sudo pacman -S --noconfirm git
        fi
        
        # Check for Python3
        if ! command -v python3 &> /dev/null; then
            echo "Installing Python 3..."
            sudo pacman -S --noconfirm python python-pip
        fi
        
        # Check for Node.js
        if ! command -v node &> /dev/null; then
            echo "Installing Node.js and npm..."
            sudo pacman -S --noconfirm nodejs npm
        fi
        
    elif [ "$PKG_MANAGER" = "brew" ]; then
        # Check for Git
        if ! command -v git &> /dev/null; then
            echo "Installing Git..."
            brew install git
        fi
        
        # Check for Python3
        if ! command -v python3 &> /dev/null; then
            echo "Installing Python 3..."
            brew install python
        fi
        
        # Check for Node.js
        if ! command -v node &> /dev/null; then
            echo "Installing Node.js and npm..."
            brew install node
        fi
    else
        echo "Please install Git, Python 3, pip, Node.js, and npm manually before continuing."
        exit 1
    fi
}

# Skip dependency installation if running on Windows
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" && "$OSTYPE" != "cygwin" ]]; then
    install_dependencies
fi

# Check for Git
if ! command -v git &> /dev/null; then
    echo "Git is required but not installed. Please install Git and try again."
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
        echo "Download Git from https://git-scm.com/download/win"
    fi
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3 and try again."
    exit 1
fi

# Check for Node.js and npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Node.js and npm are required but not installed. Please install them and try again."
    exit 1
fi

# Clone the repository
REPO_URL="https://github.com/justncodes/pfsense-vpn-self-service.git"
INSTALL_DIR="pfsense-vpn-self-service"

if [ -d "$INSTALL_DIR" ]; then
    echo "Directory $INSTALL_DIR already exists."
    read -p "Do you want to remove it and clone a fresh copy? (y/n): " CONFIRM
    if [ "$CONFIRM" = "y" ]; then
        echo "Removing existing directory..."
        rm -rf "$INSTALL_DIR"
        
        echo "Cloning repository from $REPO_URL..."
        git clone "$REPO_URL" "$INSTALL_DIR" || log_error "Failed to clone the repository. Please check your internet connection and the repository URL."
    else
        echo "Using existing directory."
    fi
else
    echo "Cloning repository from $REPO_URL..."
    git clone "$REPO_URL" "$INSTALL_DIR" || log_error "Failed to clone the repository. Please check your internet connection and the repository URL."
fi

# Change to the repository directory
cd "$INSTALL_DIR" || log_error "Failed to change to the repository directory."

# Check for python3-venv
if ! python3 -m venv --help &> /dev/null; then
    echo "Python venv module not available."
    if [ -f /etc/debian_version ]; then
        echo "On Debian/Ubuntu, you need to install python3-venv package:"
        echo "sudo apt install python3-venv"
        
        # Try to detect Python version and suggest the right package
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
        if [ -n "$PYTHON_VERSION" ]; then
            echo "Or for your specific Python version:"
            echo "sudo apt install python${PYTHON_VERSION}-venv"
        fi
    fi
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv || log_error "Failed to create virtual environment."

# Activate virtual environment based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate || log_error "Failed to activate virtual environment on Windows."
else
    # Unix-like
    source venv/bin/activate || log_error "Failed to activate virtual environment."
fi

# Install backend dependencies
echo "Installing backend dependencies..."
pip install flask flask-cors requests python-dotenv || log_error "Failed to install backend dependencies."

# Create .env file from .env.example
echo "Creating .env file from .env.example..."
if [ -f ".env.example" ]; then
    # Copy .env.example to .env
    cp .env.example .env || log_error "Failed to create .env file from .env.example."
    
    # Generate a random secret key and replace the placeholder in .env
    FLASK_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(24))')
    sed -i.bak "s/FLASK_SECRET_KEY=generate-a-secure-random-key/FLASK_SECRET_KEY=$FLASK_SECRET_KEY/" .env
    rm -f .env.bak  # Remove backup file created by sed on some systems
    
    echo "Created .env file from the example template. Please edit it with your actual configuration."
else
    log_error ".env.example file not found. Configuration setup failed."
fi

# Create config.py file based on the example if it doesn't exist and if example exists
if [ ! -f "config.py" ] && [ -f "config.py.example" ]; then
    echo "Creating config.py file from example..."
    cp config.py.example config.py || log_error "Failed to create config.py file from example."
fi

# Create data directory for persistence
mkdir -p data || log_error "Failed to create data directory."

# Set up frontend
echo "Setting up frontend..."
cd frontend || log_error "Failed to navigate to frontend directory."

# Install dependencies
echo "Installing frontend dependencies..."
npm install || log_error "Failed to install frontend dependencies."

# Build frontend
echo "Building frontend..."
npm run build || log_error "Failed to build frontend."

# Return to root directory
cd ..

echo ""
echo "Installation completed successfully!"
echo ""
echo "IMPORTANT: Edit the .env file with your actual configuration before running at:"
echo "  $(pwd)/.env"
echo ""
echo "To start the application:"
echo ""
echo "1. Navigate to the project directory and activate the virtual environment:"
echo "   cd $(pwd)"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    echo "   venv\\Scripts\\activate"
else
    echo "   source venv/bin/activate"
fi
echo ""
echo "2. Start the application in production mode:"
echo "   python app.py"
echo "   Then access the application at http://localhost:5000"
echo ""
echo "3. For development only (optional):"
echo "   a. Start the Flask backend as described above"
echo "   b. In a separate terminal, start the React development server:"
echo "      cd $(pwd)/frontend"
echo "      npm start"
echo "   c. Access the development frontend at http://localhost:3000"