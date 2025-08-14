#!/bin/bash

# VPN Server Setup Script for Ubuntu 24.04
# Supports WireGuard, ShadowSocks, and VLESS+Reality protocols
# Author: VPN Shield Team
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_NAME=""
EMAIL=""
WIREGUARD_PORT=51820
SHADOWSOCKS_PORT=8388
VLESS_PORT=443
PIHOLE_PORT=53

# Logging
LOG_FILE="/var/log/vpn_setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Update system
update_system() {
    log "Updating system packages..."
    apt update && apt upgrade -y
    apt install -y curl wget git ufw fail2ban htop
}

# Install Docker and Docker Compose
install_docker() {
    log "Installing Docker and Docker Compose..."
    
    # Remove old versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER
    
    rm get-docker.sh
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow VPN ports
    ufw allow $WIREGUARD_PORT/udp
    ufw allow $SHADOWSOCKS_PORT/tcp
    ufw allow $VLESS_PORT/tcp
    ufw allow $PIHOLE_PORT/tcp
    ufw allow $PIHOLE_PORT/udp
    
    # Allow HTTP/HTTPS for web interface
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    ufw --force enable
}

# Install WireGuard
install_wireguard() {
    log "Installing WireGuard..."
    
    apt install -y wireguard wireguard-tools
    
    # Generate keys
    mkdir -p /etc/wireguard
    cd /etc/wireguard
    
    wg genkey | tee privatekey | wg pubkey > publickey
    chmod 600 privatekey
    chmod 600 publickey
    
    # Create WireGuard configuration
    cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = $(cat privatekey)
Address = 10.0.0.1/24
ListenPort = $WIREGUARD_PORT
SaveConfig = true
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Enable IP forwarding
net.ipv4.ip_forward = 1
EOF
    
    # Enable IP forwarding
    echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
    sysctl -p
    
    # Start WireGuard
    systemctl enable wg-quick@wg0
    systemctl start wg-quick@wg0
}

# Install ShadowSocks
install_shadowsocks() {
    log "Installing ShadowSocks..."
    
    # Create ShadowSocks configuration
    mkdir -p /etc/shadowsocks
    cat > /etc/shadowsocks/config.json << EOF
{
    "server": "0.0.0.0",
    "server_port": $SHADOWSOCKS_PORT,
    "password": "$(openssl rand -base64 32)",
    "timeout": 300,
    "method": "aes-256-gcm",
    "fast_open": false,
    "mode": "tcp_and_udp"
}
EOF
    
    # Create Docker Compose service for ShadowSocks
    cat > /opt/shadowsocks/docker-compose.yml << EOF
version: '3.8'
services:
  shadowsocks:
    image: shadowsocks/ssserver-rust:latest
    container_name: shadowsocks
    restart: unless-stopped
    ports:
      - "$SHADOWSOCKS_PORT:$SHADOWSOCKS_PORT"
      - "$SHADOWSOCKS_PORT:$SHADOWSOCKS_PORT/udp"
    volumes:
      - /etc/shadowsocks/config.json:/etc/shadowsocks/config.json
    command: ssserver -c /etc/shadowsocks/config.json
EOF
}

# Install VLESS+Reality
install_vless() {
    log "Installing VLESS+Reality..."
    
    mkdir -p /etc/xray
    cat > /etc/xray/config.json << EOF
{
    "log": {
        "loglevel": "warning"
    },
    "inbounds": [
        {
            "port": $VLESS_PORT,
            "protocol": "vless",
            "settings": {
                "clients": [
                    {
                        "id": "$(uuidgen)",
                        "flow": "xtls-rprx-vision"
                    }
                ],
                "decryption": "none"
            },
            "streamSettings": {
                "network": "tcp",
                "security": "reality",
                "realitySettings": {
                    "show": false,
                    "dest": "www.microsoft.com:443",
                    "xver": 0,
                    "serverNames": ["www.microsoft.com"],
                    "privateKey": "$(openssl genpkey -algorithm x25519 -outform PEM | base64 -w 0)",
                    "shortIds": ["$(openssl rand -hex 8)"]
                }
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom"
        }
    ]
}
EOF
    
    # Create Docker Compose service for VLESS
    cat > /opt/vless/docker-compose.yml << EOF
version: '3.8'
services:
  xray:
    image: teddysun/xray:latest
    container_name: xray
    restart: unless-stopped
    ports:
      - "$VLESS_PORT:$VLESS_PORT"
    volumes:
      - /etc/xray/config.json:/etc/xray/config.json
    command: xray run -c /etc/xray/config.json
EOF
}

# Install Pi-hole for DNS protection
install_pihole() {
    log "Installing Pi-hole..."
    
    mkdir -p /opt/pihole
    cat > /opt/pihole/docker-compose.yml << EOF
version: '3.8'
services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    ports:
      - "$PIHOLE_PORT:53/tcp"
      - "$PIHOLE_PORT:53/udp"
      - "8080:80"
    environment:
      TZ: 'UTC'
      WEBPASSWORD: '$(openssl rand -base64 32)'
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    restart: unless-stopped
    dns:
      - 1.1.1.1
      - 1.0.0.1
EOF
}

# Create management script
create_management_script() {
    log "Creating management script..."
    
    cat > /usr/local/bin/vpn-manager << 'EOF'
#!/bin/bash

# VPN Management Script
# Usage: vpn-manager [start|stop|restart|status|logs]

case "$1" in
    start)
        echo "Starting VPN services..."
        systemctl start wg-quick@wg0
        cd /opt/shadowsocks && docker-compose up -d
        cd /opt/vless && docker-compose up -d
        cd /opt/pihole && docker-compose up -d
        ;;
    stop)
        echo "Stopping VPN services..."
        systemctl stop wg-quick@wg0
        cd /opt/shadowsocks && docker-compose down
        cd /opt/vless && docker-compose down
        cd /opt/pihole && docker-compose down
        ;;
    restart)
        echo "Restarting VPN services..."
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        echo "=== WireGuard Status ==="
        systemctl status wg-quick@wg0 --no-pager -l
        echo -e "\n=== ShadowSocks Status ==="
        cd /opt/shadowsocks && docker-compose ps
        echo -e "\n=== VLESS Status ==="
        cd /opt/vless && docker-compose ps
        echo -e "\n=== Pi-hole Status ==="
        cd /opt/pihole && docker-compose ps
        ;;
    logs)
        echo "=== ShadowSocks Logs ==="
        cd /opt/shadowsocks && docker-compose logs --tail=50
        echo -e "\n=== VLESS Logs ==="
        cd /opt/vless && docker-compose logs --tail=50
        echo -e "\n=== Pi-hole Logs ==="
        cd /opt/pihole && docker-compose logs --tail=50
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/vpn-manager
}

# Create client configuration generator
create_client_config() {
    log "Creating client configuration generator..."
    
    cat > /usr/local/bin/generate-client-config << 'EOF'
#!/bin/bash

# Generate client configuration
# Usage: generate-client-config [wireguard|shadowsocks|vless] [client_name]

if [ $# -ne 2 ]; then
    echo "Usage: $0 [wireguard|shadowsocks|vless] [client_name]"
    exit 1
fi

PROTOCOL=$1
CLIENT_NAME=$2
SERVER_IP=$(curl -s ifconfig.me)

case $PROTOCOL in
    wireguard)
        # Generate WireGuard client config
        cd /etc/wireguard
        wg genkey | tee ${CLIENT_NAME}_privatekey | wg pubkey > ${CLIENT_NAME}_publickey
        
        cat > ${CLIENT_NAME}.conf << WGEOF
[Interface]
PrivateKey = $(cat ${CLIENT_NAME}_privatekey)
Address = 10.0.0.$(($(wg show wg0 peers | wc -l) + 2))/24
DNS = 10.0.0.1

[Peer]
PublicKey = $(cat publickey)
Endpoint = $SERVER_IP:$WIREGUARD_PORT
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
WGEOF
        
        echo "WireGuard configuration saved to /etc/wireguard/${CLIENT_NAME}.conf"
        ;;
    shadowsocks)
        # Generate ShadowSocks client config
        PASSWORD=$(openssl rand -base64 32)
        cat > /tmp/${CLIENT_NAME}_ss.json << SSEOF
{
    "server": "$SERVER_IP",
    "server_port": $SHADOWSOCKS_PORT,
    "password": "$PASSWORD",
    "method": "aes-256-gcm",
    "timeout": 300
}
SSEOF
        
        echo "ShadowSocks configuration saved to /tmp/${CLIENT_NAME}_ss.json"
        ;;
    vless)
        # Generate VLESS client config
        CLIENT_ID=$(uuidgen)
        cat > /tmp/${CLIENT_NAME}_vless.json << VLESSEOF
{
    "server": "$SERVER_IP",
    "server_port": $VLESS_PORT,
    "id": "$CLIENT_ID",
    "flow": "xtls-rprx-vision",
    "security": "reality",
    "sni": "www.microsoft.com"
}
VLESSEOF
        
        echo "VLESS configuration saved to /tmp/${CLIENT_NAME}_vless.json"
        ;;
    *)
        echo "Unknown protocol: $PROTOCOL"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/generate-client-config
}

# Setup monitoring and logging
setup_monitoring() {
    log "Setting up monitoring and logging..."
    
    # Install monitoring tools
    apt install -y prometheus node-exporter grafana
    
    # Create monitoring configuration
    mkdir -p /etc/prometheus
    cat > /etc/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vpn-server'
    static_configs:
      - targets: ['localhost:9100']
EOF
    
    # Start monitoring services
    systemctl enable prometheus
    systemctl start prometheus
    systemctl enable node-exporter
    systemctl start node-exporter
    systemctl enable grafana-server
    systemctl start grafana-server
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > /usr/local/bin/vpn-backup << 'EOF'
#!/bin/bash

# VPN Backup Script
BACKUP_DIR="/opt/vpn-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup WireGuard
tar -czf $BACKUP_DIR/wireguard_$DATE.tar.gz /etc/wireguard

# Backup ShadowSocks
tar -czf $BACKUP_DIR/shadowsocks_$DATE.tar.gz /etc/shadowsocks /opt/shadowsocks

# Backup VLESS
tar -czf $BACKUP_DIR/vless_$DATE.tar.gz /etc/xray /opt/vless

# Backup Pi-hole
tar -czf $BACKUP_DIR/pihole_$DATE.tar.gz /opt/pihole

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF
    
    chmod +x /usr/local/bin/vpn-backup
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/vpn-backup") | crontab -
}

# Main installation function
main() {
    log "Starting VPN server setup..."
    
    check_root
    update_system
    install_docker
    configure_firewall
    install_wireguard
    install_shadowsocks
    install_vless
    install_pihole
    create_management_script
    create_client_config
    setup_monitoring
    create_backup_script
    
    # Start all services
    log "Starting all VPN services..."
    /usr/local/bin/vpn-manager start
    
    log "Setup completed successfully!"
    log "Server IP: $SERVER_IP"
    log "WireGuard Port: $WIREGUARD_PORT"
    log "ShadowSocks Port: $SHADOWSOCKS_PORT"
    log "VLESS Port: $VLESS_PORT"
    log "Pi-hole Web Interface: http://$SERVER_IP:8080"
    log "Management commands:"
    log "  vpn-manager start|stop|restart|status|logs"
    log "  generate-client-config [protocol] [client_name]"
    log "  vpn-backup"
}

# Run main function
main "$@"