# ClawShare Skill

*Share files peer-to-peer via GitHub + WebRTC*

---

## Description

Upload and share files using ClawShare P2P. Files transfer directly between devices using GitHub as the signaling layer. Free tier: 100MB files, 10 transfers/day.

## Usage

### Upload and Share

```bash
# Upload a file and create a share link
teddy: "Upload report.pdf to ClawShare"

# With custom expiry (1h, 24h, 7d - MVP uses GitHub Gist)
teddy: "Upload data.xlsx to ClawShare, share for 3 days"

# View-only mode
teddy: "Upload file.png, view-only link"
```

### Download

```bash
# Download from share link
teddy: "Download clawshare.xyz/s/abc123"

# Save to specific location
teddy: "Download clawshare.xyz/s/xyz789 and save to downloads/"
```

### List & Manage

```bash
# List your transfers (requires GitHub auth)
teddy: "List my ClawShare transfers"

# Get transfer status
teddy: "Check transfer status for abc123"
```

### CLI

```bash
# Upload file
python3 skills/clawshare/upload.py report.pdf

# Download file
python3 skills/clawshare/download.py abc123 --output ./
```

## Requirements

- GitHub account (for Gist storage)
- GitHub personal access token (for API access)
- Generate token: https://github.com/settings/tokens (scopes: gist)

## Configuration

Set GitHub token:
```bash
export GITHUB_TOKEN="ghp_your_token_here"
export CLAWSHARE_URL="https://clawshare.xyz"
```

## Features

- **P2P Transfer** — Direct device-to-device (future WebRTC)
- **GitHub Gist** — Metadata storage, free and unlimited
- **Encrypted** — Files encrypted in transit
- **No Server** — No centralized file storage
- **Free Tier** — 100MB files, 10 transfers/day

## File Types (MVP)

- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Images: JPG, PNG, GIF, WebP
- Text: TXT, CSV, JSON, MD

## How It Works

1. **Upload:** File metadata stored in GitHub Gist
2. **Share:** Link generated with Gist ID
3. **Recipient:** Opens link, fetches metadata
4. **Transfer:** File content transfers (base64 in MVP, WebRTC in future)
5. **Complete:** Both parties notified

## See Also

- Web UI: https://clawshare.xyz
- Source: https://github.com/danieloleary/clawshare-p2p

## License

MIT
