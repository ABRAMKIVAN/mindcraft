# VPN Shield - Cross-Platform VPN Application

A complete VPN solution with multi-protocol support, featuring a beautiful neomorphic UI, world map visualization, and enterprise-grade security.

## 🌟 Features

### Core VPN Features
- **Multi-Protocol Support**: WireGuard, ShadowSocks, VLESS+Reality
- **One-Click Connect**: Simple connection with status indicators
- **Kill Switch**: Automatic internet blocking if VPN drops
- **DNS Protection**: Pi-hole integration for ad-blocking and privacy
- **Auto-Protocol Selection**: Smart protocol switching based on location

### User Interface
- **Neomorphic Design**: Soft shadows and rounded elements like Proton VPN
- **Dark Mode Toggle**: Complete theme switching
- **Interactive World Map**: Grayscale map with server locations and connection lines
- **Real-time Stats**: Speed, ping, and IP address monitoring
- **Server Sorting**: Sort by ping, load, or country

### Security & Privacy
- **No-Logs Policy**: GDPR compliant with anonymized data
- **Military-Grade Encryption**: ChaCha20 for WireGuard, TLS for VLESS
- **Threat Detection**: Basic malware scanning in traffic
- **Anonymous Login**: No email required for free tier

### Premium Features
- **Unlimited Bandwidth**: No data caps
- **Ad-Blocker**: Built-in ad and tracker blocking
- **Priority Support**: Dedicated customer service
- **Multi-Device Sync**: Settings across all devices

## 🚀 Quick Start

### Prerequisites
- **PC**: Ubuntu 20.04+ or Windows 10+
- **VPS**: Ubuntu 24.04 server (Hetzner, DigitalOcean, etc.)
- **Node.js**: Version 18+ installed
- **Docker**: For server deployment

### 1. Local Development Setup

#### Install Dependencies
```bash
# Clone the repository
git clone https://github.com/yourusername/vpn-shield.git
cd vpn-shield

# Install Node.js dependencies
npm install

# Install React Native CLI (if not installed)
npm install -g @react-native-community/cli

# For iOS development (macOS only)
cd ios && pod install && cd ..
```

#### Run the Application
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web
npm run web
```

### 2. Server Deployment

#### Option A: One-Click Setup (Recommended)
```bash
# SSH into your VPS
ssh root@your-server-ip

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/vpn-shield/main/server/setup_vpn_server.sh | bash
```

#### Option B: Manual Docker Setup
```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone the repository
git clone https://github.com/yourusername/vpn-shield.git
cd vpn-shield/server

# Start all services
docker-compose up -d
```

### 3. Mobile App Build

#### Android APK
```bash
# Navigate to project root
cd vpn-shield

# Build release APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS App Store
```bash
# Open Xcode project
open ios/VPNApp.xcworkspace

# Configure signing and build for App Store
# Archive and upload through Xcode
```

### 4. Web Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

## 📱 App Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# VPN Server Configuration
VPN_SERVER_URL=your_vpn_server_ip
WIREGUARD_PORT=51820
SHADOWSOCKS_PORT=8388
VLESS_PORT=443

# API Configuration
API_BASE_URL=https://your-api-domain.com
```

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Authentication with email and anonymous sign-in
3. Create the following tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'inactive',
  plan_type TEXT DEFAULT 'free',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Server Management

### Management Commands
```bash
# Start all VPN services
vpn-manager start

# Stop all VPN services
vpn-manager stop

# Check service status
vpn-manager status

# View logs
vpn-manager logs

# Generate client configuration
generate-client-config wireguard client1
generate-client-config shadowsocks client1
generate-client-config vless client1

# Create backup
vpn-backup
```

### Web Interfaces
- **Pi-hole Dashboard**: `http://your-server-ip:8080`
- **Grafana Monitoring**: `http://your-server-ip:3000`
- **Prometheus Metrics**: `http://your-server-ip:9090`

### Port Configuration
| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| WireGuard | 51820 | UDP | VPN tunnel |
| ShadowSocks | 8388 | TCP/UDP | Proxy server |
| VLESS | 443 | TCP | Anti-detection proxy |
| Pi-hole | 53 | TCP/UDP | DNS server |
| Pi-hole Web | 8080 | TCP | Web interface |
| Grafana | 3000 | TCP | Monitoring dashboard |
| Prometheus | 9090 | TCP | Metrics collection |

## 🔧 Troubleshooting

### Common Issues

#### App Won't Start
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear React Native cache
npx react-native clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Server Connection Issues
```bash
# Check firewall status
ufw status

# Test port connectivity
telnet your-server-ip 51820

# Check service logs
vpn-manager logs

# Restart services
vpn-manager restart
```

#### Build Errors
```bash
# Android build issues
cd android
./gradlew clean
./gradlew assembleRelease

# iOS build issues
cd ios
pod deintegrate
pod install
```

### Performance Optimization

#### Server Optimization
```bash
# Enable BBR congestion control
echo 'net.core.default_qdisc=fq' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_congestion_control=bbr' >> /etc/sysctl.conf
sysctl -p

# Optimize network settings
echo 'net.core.rmem_max=134217728' >> /etc/sysctl.conf
echo 'net.core.wmem_max=134217728' >> /etc/sysctl.conf
sysctl -p
```

#### App Performance
- Enable Hermes engine for React Native
- Use production builds for testing
- Optimize images and assets
- Implement lazy loading for server lists

## 🔒 Security Considerations

### Server Security
- Change default passwords
- Use SSH key authentication
- Enable fail2ban protection
- Regular security updates
- Monitor access logs

### App Security
- Implement certificate pinning
- Use secure storage for sensitive data
- Validate all user inputs
- Implement rate limiting
- Regular dependency updates

## 📊 Monitoring & Analytics

### Metrics Collection
- Connection success rates
- Server performance metrics
- User behavior analytics
- Error tracking and reporting

### Alerts
- Server downtime notifications
- High load alerts
- Security incident notifications
- Performance degradation warnings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.vpnshield.com](https://docs.vpnshield.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/vpn-shield/issues)
- **Discord**: [VPN Shield Community](https://discord.gg/vpnshield)
- **Email**: support@vpnshield.com

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/) for the mobile framework
- [WireGuard](https://www.wireguard.com/) for the VPN protocol
- [Xray Core](https://github.com/XTLS/Xray-core) for VLESS implementation
- [Pi-hole](https://pi-hole.net/) for DNS protection
- [Supabase](https://supabase.com/) for backend services

---

**Made with ❤️ by the VPN Shield Team**
