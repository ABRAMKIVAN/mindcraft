# WireGuard Infra Scripts

Scripts to provision a WireGuard VPN server on Debian/Ubuntu.

## 1) Provision server

SSH into your VPS as root and run:

```bash
curl -fsSL https://raw.githubusercontent.com/your-org/your-repo/main/infra/wireguard-setup.sh -o /root/wireguard-setup.sh
bash /root/wireguard-setup.sh
```

(Or copy this repo to the server and run `infra/wireguard-setup.sh`.)

Environment vars you can override:
- `WG_PORT` (default 51820)
- `WG_CIDR_IPV4` (default 10.8.0.0/24)
- `WG_SERVER_IPV4` (default 10.8.0.1)
- `ENABLE_IPV6=1` to enable IPv6

## 2) Add clients

```bash
# On the server
infra/wg-add-peer.sh alice         # auto-assigns next IP
infra/wg-add-peer.sh bob 23        # assigns 10.8.0.23
```

The client config is written to `/etc/wireguard/clients/<name>.conf` and QR is printed if `qrencode` is installed.

## 3) Remove clients

```bash
infra/wg-del-peer.sh alice
```