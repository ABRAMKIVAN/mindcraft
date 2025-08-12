# VPN Project Skeleton

This repository contains:

- `infra/` – scripts to provision WireGuard VPN on a VPS
  - `wireguard-setup.sh` – install and configure the server
  - `wg-add-peer.sh` – add a client and print config/QR
  - `wg-del-peer.sh` – remove a client
- `backend/` – FastAPI backend for entitlements and future admin API
  - `app/` – source code
  - `requirements.txt`, `Dockerfile`
- `android/` – placeholder for Android app (to be added)

## Next steps

1. Provision the VPS using `infra/wireguard-setup.sh`.
2. Add at least one client with `infra/wg-add-peer.sh <name>` and test connectivity with official WireGuard clients.
3. Run the backend locally (or via Docker) using instructions in `backend/README.md`.
4. Share Google Play Console access and service account JSON to connect live subscriptions verification.
5. Start Android client implementation.
