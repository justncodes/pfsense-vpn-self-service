#!/bin/bash

# Exit on error
set -e

echo "WireGuard VPN Self-Service Portal - Bootstrap Installation"
echo "========================================================"
echo "This script will install all dependencies, clone the repository,"
echo "and set up the application with a single command."
echo ""

# Detect OS and package manager
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    PKG_MANAGER="apt"
    echo "Detected Debian/Ubuntu-based system"
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
            sudo apt install -y python3 python3-pip python3-venv
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
    else
        echo "Skipping clone, using existing directory."
        cd "$INSTALL_DIR"
        # Skip to setup script
        if [ -f "setup.sh" ]; then
            echo "Running setup script..."
            chmod +x setup.sh
            ./setup.sh
            echo "Bootstrap completed successfully!"
            exit 0
        else
            echo "setup.sh not found in the existing directory. Please check the repository."
            exit 1
        fi
    fi
fi

echo "Cloning repository from $REPO_URL..."
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Run the setup script
if [ -f "setup.sh" ]; then
    echo "Running setup script..."
    chmod +x setup.sh
    ./setup.sh
else
    echo "setup.sh not found in the repository. Please check the repository structure."
    exit 1
fi

echo ""
echo "Bootstrap completed successfully!"
echo ""
echo "To run the application, follow these steps:"
echo ""
echo "1. Edit the .env file with your actual configuration:"
echo "   nano .env"
echo ""
echo "2. To run in development mode (with hot-reloading):"
echo "   a. Start the Flask backend:"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    echo "      venv\\Scripts\\activate"
else
    echo "      source venv/bin/activate"
fi
echo "      python app.py"
echo ""
echo "   b. In a separate terminal, start the React development server:"
echo "      cd frontend"
echo "      npm start"
echo ""
echo "   c. Access the application:"
echo "      - Frontend: http://localhost:3000"
echo "      - Backend API: http://localhost:5000/api/..."
echo ""
echo "3. To run in production mode:"
echo "   a. Build the frontend (if not already built):"
echo "      cd frontend"
echo "      npm run build"
echo "      cd .."
echo ""
echo "   b. Run the Flask server:"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    echo "      venv\\Scripts\\activate"
else
    echo "      source venv/bin/activate"
fi
echo "      python app.py"
echo ""
echo "   c. Access the application at http://localhost:5000"