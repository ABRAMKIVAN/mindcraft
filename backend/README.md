# VPN Backend (FastAPI)

## Quickstart (local)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/health

## Configuration

Environment variables (or `.env`):

- `GOOGLE_APPLICATION_CREDENTIALS`: path to service account JSON with Android Publisher API access
- `GOOGLE_PLAY_PACKAGE_NAME`: your app package (e.g. `com.example.vpn`)

When Google credentials are not set, `/entitlements/verify` will return inactive with reason `google_play_not_configured`.

## Docker

```bash
docker build -t vpn-backend:dev ./
docker run --rm -p 8000:8000 --env-file .env vpn-backend:dev
```