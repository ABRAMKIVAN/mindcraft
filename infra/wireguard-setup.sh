#!/usr/bin/env bash
set -euo pipefail

# WireGuard automated setup for Debian/Ubuntu
# - Installs WireGuard
# - Configures wg0 with NAT and forwarding
# - Idempotent and safe to re-run

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[FATAL] Please run as root (use sudo)" >&2
  exit 1
fi

WG_IFACE=${WG_IFACE:-wg0}
WG_PORT=${WG_PORT:-51820}
WG_CIDR_IPV4=${WG_CIDR_IPV4:-10.8.0.0/24}
WG_SERVER_IPV4=${WG_SERVER_IPV4:-10.8.0.1}
WG_DNS=${WG_DNS:-1.1.1.1, 1.0.0.1}
ENABLE_IPV6=${ENABLE_IPV6:-0}
WG_CIDR_IPV6=${WG_CIDR_IPV6:-fd86:ea04:1115::/64}
WG_SERVER_IPV6=${WG_SERVER_IPV6:-fd86:ea04:1115::1}

CLIENTS_DIR=/etc/wireguard/clients
WG_DIR=/etc/wireguard
PRIV_KEY_FILE="$WG_DIR/privatekey"
PUB_KEY_FILE="$WG_DIR/publickey"
CONF_FILE="$WG_DIR/${WG_IFACE}.conf"

export DEBIAN_FRONTEND=noninteractive

# Detect primary network interface
DEFAULT_IFACE=$(ip -4 route list default | awk '{print $5}' | head -n1)
if [[ -z "${DEFAULT_IFACE}" ]]; then
  echo "[FATAL] Could not detect default network interface" >&2
  exit 1
fi

# Detect public IPv4
PUBLIC_IPV4=${PUBLIC_IPV4:-$(curl -4s https://api.ipify.org || true)}

apt-get update -y
apt-get install -y --no-install-recommends wireguard iproute2 iptables qrencode ca-certificates resolvconf

mkdir -p "$WG_DIR" "$CLIENTS_DIR"
chmod 700 "$WG_DIR"

# Enable forwarding
sysctl -w net.ipv4.ip_forward=1 >/dev/null
if ! grep -q '^net.ipv4.ip_forward=1' /etc/sysctl.conf; then
  echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
fi

if [[ "$ENABLE_IPV6" == "1" ]]; then
  sysctl -w net.ipv6.conf.all.forwarding=1 >/dev/null || true
  if ! grep -q '^net.ipv6.conf.all.forwarding=1' /etc/sysctl.conf; then
    echo 'net.ipv6.conf.all.forwarding=1' >> /etc/sysctl.conf
  fi
fi

# Generate keys if missing
if [[ ! -f "$PRIV_KEY_FILE" ]]; then
  umask 077
  wg genkey | tee "$PRIV_KEY_FILE" | wg pubkey > "$PUB_KEY_FILE"
  echo "[OK] Generated server keypair"
fi

SERVER_PRIV_KEY=$(cat "$PRIV_KEY_FILE")
SERVER_PUB_KEY=$(cat "$PUB_KEY_FILE")

# Create config if missing
if [[ ! -f "$CONF_FILE" ]]; then
  cat > "$CONF_FILE" <<EOF
[Interface]
Address = ${WG_SERVER_IPV4}/24${ENABLE_IPV6:+, ${WG_SERVER_IPV6}/64}
ListenPort = ${WG_PORT}
SaveConfig = true
PrivateKey = ${SERVER_PRIV_KEY}

# NAT and forwarding rules
PostUp = iptables -t nat -A POSTROUTING -s ${WG_CIDR_IPV4} -o ${DEFAULT_IFACE} -j MASQUERADE
PostUp = iptables -A FORWARD -i %i -j ACCEPT
PostUp = iptables -A FORWARD -o %i -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -s ${WG_CIDR_IPV4} -o ${DEFAULT_IFACE} -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT
PostDown = iptables -D FORWARD -o %i -j ACCEPT
EOF
  chmod 600 "$CONF_FILE"
  echo "[OK] Created ${CONF_FILE}"
fi

# Bring up service
systemctl enable --now wg-quick@${WG_IFACE}
sleep 1
systemctl is-active --quiet wg-quick@${WG_IFACE} && echo "[OK] WireGuard ${WG_IFACE} is active" || (journalctl -u wg-quick@${WG_IFACE} | tail -n 200; exit 1)

# Persist current config
wg-quick save ${WG_IFACE} || true

cat <<INFO

[INFO] Server public key: ${SERVER_PUB_KEY}
[INFO] Listening UDP port: ${WG_PORT}
[INFO] VPN subnet (IPv4): ${WG_CIDR_IPV4}, server IP: ${WG_SERVER_IPV4}
[INFO] Outbound interface: ${DEFAULT_IFACE}
[INFO] Public IPv4: ${PUBLIC_IPV4:-unknown}

Clients directory: ${CLIENTS_DIR}
Use wg-add-peer.sh to add clients and print their configs/QR.
INFO