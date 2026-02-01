# ClawShare P2P 🦞📤

Peer-to-peer file sharing via GitHub + WebRTC. Fast, free, encrypted.

## Features

- 🔗 **Share Links** — Generate shareable links via GitHub Gist
- 🌐 **P2P Transfer** — Direct browser-to-browser (WebRTC)
- 🔒 **Encrypted** — Files never touch our servers
- 🎨 **Material Design 3** — Clean Google-inspired UI
- 🆓 **Free Tier** — 100MB files, 10 transfers/day

## Quick Start

### 1. Setup Environment

```bash
cd clawshare-p2p
cp .env.example .env.local
# Add your GitHub token to .env.local
export GITHUB_TOKEN="ghp_your_token_here"
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Deploy to Vercel

```bash
# Push to GitHub, then import in Vercel
# Add GITHUB_TOKEN in Vercel dashboard
# Deploy!
```

## Architecture

```
clawshare-p2p/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Upload UI
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css           # Material Design 3 styles
│   │   ├── api/
│   │   │   └── gist/
│   │   │       └── route.ts      # GitHub Gist API
│   │   └── s/[gistId]/           # Transfer page
│   │       ├── page.tsx
│   │       └── ShareClient.tsx
│   ├── lib/
│   │   ├── p2p.ts              # WebRTC P2P logic
│   │   ├── github.ts            # GitHub API wrapper
│   │   └── types.ts             # TypeScript types
│   └── components/
│       ├── Upload.tsx           # Upload components
│       └── Transfer.tsx         # Transfer components
├── skills/
│   └── clawshare/
│       └── SKILL.md            # OpenClaw skill
├── .env.example
├── PRD.md                       # Product requirements
├── CLAUDE.md                    # Claude Code context
└── tailwind.config.ts           # Design system config
```

## Design System

### Colors
- **Primary:** `#E53935` (Google Red)
- **Surface:** `#FFFFFF`
- **On Surface:** `#1A1A1A`
- **Error:** `#B00020`

### Components
- Material 3 buttons (filled, tonal, text)
- Elevated cards (12px radius)
- FAB for primary actions
- Bottom navigation

## How It Works

### Upload Flow
1. User selects file → file metadata uploaded to GitHub Gist
2. Gist ID returned → shareable link generated
3. Link includes Gist ID for recipient

### Transfer Flow
1. Recipient opens link → fetches metadata from Gist
2. WebRTC P2P connection establishes
3. File transfers directly between browsers
4. Encrypted end-to-end

### GitHub Integration
- **Gist** — Stores file metadata (free, unlimited)
- **OAuth** — User identification (future)
- **No file content** — Only metadata, never file data

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token (scopes: gist) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID (future) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret (future) |
| `CLAWSHARE_URL` | Base URL for share links |

## Freemium Model

| Tier | Files | Transfers | Price |
|------|-------|-----------|-------|
| Free | 100MB | 10/day | $0 |
| Pro | 1GB | Unlimited | $5/mo |
| Team | 5GB | Unlimited | $15/mo |

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Storage:** GitHub Gist (metadata only)
- **P2P:** WebRTC Data Channels
- **Design:** Material Design 3

## License

MIT

---

Built for clawshare.xyz 🚀
