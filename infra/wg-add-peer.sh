#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[FATAL] Please run as root (use sudo)" >&2
  exit 1
fi

WG_IFACE=${WG_IFACE:-wg0}
WG_DIR=/etc/wireguard
CLIENTS_DIR=$WG_DIR/clients
CONF_FILE=$WG_DIR/${WG_IFACE}.conf

PEER_NAME=${1:-}
REQUESTED_LAST_OCTET=${2:-}

if [[ -z "$PEER_NAME" ]]; then
  echo "Usage: $0 <peer_name> [client_last_octet]" >&2
  exit 1
fi

if [[ ! -f "$CONF_FILE" ]]; then
  echo "[FATAL] $CONF_FILE not found. Run wireguard-setup.sh first." >&2
  exit 1
fi

# Extract server settings
SERVER_PRIV=$(grep -m1 '^PrivateKey' "$CONF_FILE" | awk '{print $3}')
SERVER_PUB=$(echo "$SERVER_PRIV" | wg pubkey)
WG_PORT=$(grep -m1 '^ListenPort' "$CONF_FILE" | awk '{print $3}')
WG_IPV4=$(grep -m1 '^Address' "$CONF_FILE" | awk '{print $3}' | cut -d'/' -f1)
SERVER_IPV4=$(echo "$WG_IPV4")

mkdir -p "$CLIENTS_DIR"

# Determine client IPv4
SUBNET_PREFIX=$(echo "$SERVER_IPV4" | awk -F. '{print $1"."$2"."$3}')
ALLOC_FILE=$CLIENTS_DIR/allocations.txt

touch "$ALLOC_FILE"

function next_available() {
  for i in $(seq 2 254); do
    if ! grep -q "${SUBNET_PREFIX}\.${i}$" "$ALLOC_FILE"; then
      echo "$i"; return 0
    fi
  done
  return 1
}

LAST_OCTET=${REQUESTED_LAST_OCTET:-$(next_available)}
if [[ -z "$LAST_OCTET" ]]; then
  echo "[FATAL] No free IPs left in ${SUBNET_PREFIX}.2-254" >&2
  exit 1
fi
CLIENT_IPV4=${SUBNET_PREFIX}.${LAST_OCTET}

# Generate client keys
umask 077
CLIENT_PRIV=$(wg genkey)
CLIENT_PUB=$(echo "$CLIENT_PRIV" | wg pubkey)
PRESHARED=$(wg genpsk)

# Apply peer dynamically
wg set ${WG_IFACE} peer "$CLIENT_PUB" preshared-key <(echo "$PRESHARED") allowed-ips ${CLIENT_IPV4}/32
wg-quick save ${WG_IFACE}

# Persist allocation
echo -e "${PEER_NAME}\t${CLIENT_IPV4}\t${CLIENT_PUB}" >> "$ALLOC_FILE"

# Detect public IP and endpoint
PUBLIC_IPV4=${PUBLIC_IPV4:-$(curl -4s https://api.ipify.org || true)}
ENDPOINT=${ENDPOINT:-${PUBLIC_IPV4}:${WG_PORT}}
DNS=${DNS:-1.1.1.1}

CLIENT_CONF=$CLIENTS_DIR/${PEER_NAME}.conf
cat > "$CLIENT_CONF" <<EOF
[Interface]
PrivateKey = ${CLIENT_PRIV}
Address = ${CLIENT_IPV4}/32
DNS = ${DNS}

[Peer]
PublicKey = ${SERVER_PUB}
PresharedKey = ${PRESHARED}
Endpoint = ${ENDPOINT}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
EOF
chmod 600 "$CLIENT_CONF"

echo "[OK] Peer ${PEER_NAME} added with IP ${CLIENT_IPV4}"

if command -v qrencode >/dev/null 2>&1; then
  echo "\n=== QR (for mobile WireGuard) ==="
  qrencode -t ansiutf8 < "$CLIENT_CONF"
fi

echo "\n=== Client config path ===\n$CLIENT_CONF\n"