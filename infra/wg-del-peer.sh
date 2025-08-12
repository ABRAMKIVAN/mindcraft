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
ALLOC_FILE=$CLIENTS_DIR/allocations.txt

NAME=${1:-}
if [[ -z "$NAME" ]]; then
  echo "Usage: $0 <peer_name>" >&2
  exit 1
fi

if [[ ! -f "$ALLOC_FILE" ]]; then
  echo "[WARN] No allocations file found: $ALLOC_FILE" >&2
  exit 0
fi

LINE=$(grep -m1 -P "^${NAME}\t" "$ALLOC_FILE" || true)
if [[ -z "$LINE" ]]; then
  echo "[WARN] Peer $NAME not found in allocations" >&2
  exit 0
fi

CLIENT_PUB=$(echo "$LINE" | awk '{print $3}')
CLIENT_CONF="$CLIENTS_DIR/${NAME}.conf"

# Remove from running config
wg set ${WG_IFACE} peer "$CLIENT_PUB" remove || true
wg-quick save ${WG_IFACE}

# Clean up files and allocations
sed -i "/^${NAME}\t/d" "$ALLOC_FILE"
rm -f "$CLIENT_CONF"

echo "[OK] Removed peer $NAME"