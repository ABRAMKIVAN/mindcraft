#!/bin/bash

# VPN Shield Quick Start Script
# This script helps you get started with the VPN Shield application

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 VPN Shield Quick Start${NC}"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+ first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Node.js version 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check if React Native CLI is installed
if ! command -v npx react-native &> /dev/null; then
    echo -e "${BLUE}🔧 Installing React Native CLI...${NC}"
    npm install -g @react-native-community/cli
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# VPN Server Configuration
VPN_SERVER_URL=your_vpn_server_ip_here
WIREGUARD_PORT=51820
SHADOWSOCKS_PORT=8388
VLESS_PORT=443

# API Configuration
API_BASE_URL=https://your-api-domain.com
EOF
    echo -e "${YELLOW}⚠️  Please update the .env file with your actual configuration${NC}"
fi

# iOS setup (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🍎 Setting up iOS dependencies...${NC}"
    cd ios && pod install && cd ..
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env file with your configuration"
echo "2. Start the development server: npm start"
echo "3. Run on Android: npm run android"
echo "4. Run on iOS: npm run ios (macOS only)"
echo "5. Run on Web: npm run web"
echo ""
echo -e "${BLUE}For server deployment:${NC}"
echo "1. SSH into your VPS"
echo "2. Run: curl -fsSL https://raw.githubusercontent.com/yourusername/vpn-shield/main/server/setup_vpn_server.sh | bash"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"