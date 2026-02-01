# C2C P2P 🦞📤

**Claw to claw. Shell to shell. Direct. Encrypted. No servers touched.**

A peer-to-peer file sharing platform built on GitHub. Files live in your GitHub Gist — transparent, auditable, yours.

---

## Core Philosophy: Crabs First, Humans Second

**The Truth:**
- This is NOT another file-sharing app
- It's a **P2P transfer protocol** where GitHub handles identity and storage
- Humans are clumsy facilitators who drop files or paste codes
- The UI is scaffolding, not the star

**The Mantra:**
> Make the crab-to-crab transfer unbreakable and invisible.  
> Make the human UI tolerable, not distracting.  
> If a feature makes P2P slower, flakier, or more complex → delete it.

---

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   User A    │  GitHub  │   GitHub    │  GitHub  │   User B    │
│  (GitHub)   │◄───────►│   Gist      │◄───────►│  (GitHub)   │
│   OAuth     │  OAuth   │   Storage   │  OAuth   │   OAuth     │
└─────────────┘         └─────────────┘         └─────────────┘
```

### How It Works

1. **Login with GitHub** — Real identity, less anonymous abuse
2. **Drop a file** — Stored in your private GitHub Gist
3. **Share link** — Recipient gets read access
4. **Download** — Recipient fetches from your Gist
5. **You control everything** — Delete from GitHub anytime

### What C2C Provides
- **Zero-friction sharing** — Just drop and share
- **GitHub-grade security** — GitHub's infrastructure = your security
- **Transparent storage** — Files live in your GitHub account
- **Rate limiting** — Per-user quotas via GitHub identity

---

## Features

- 🔐 **GitHub OAuth Login** — Real identity, not anonymous
- 📁 **Files in Your Gist** — Transparent, auditable, controllable
- 🔗 **Share Links** — One-click sharing with read access
- 🚫 **No Server Storage** — Files stay on GitHub
- 📊 **Rate Limiting** — Per-user quotas (10 transfers/day free)
- 🔒 **Encrypted Transfer** — GitHub HTTPS + optional P2P encryption

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Auth:** GitHub OAuth (NextAuth.js)
- **Storage:** GitHub Gist API
- **UI:** Material Design 3 + Claw branding

---

## Getting Started

### Prerequisites
- Node.js 18+
- GitHub OAuth App (see setup below)

### Setup

```bash
# Clone the repo
git clone https://github.com/danieloleary/c2c.git
cd c2c

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your GitHub OAuth credentials to .env.local:
# GITHUB_CLIENT_ID=your_client_id
# GITHUB_CLIENT_SECRET=your_client_secret
# NEXTAUTH_SECRET=your_secret
# NEXTAUTH_URL=http://localhost:3000

# Run development server
npm run dev
```

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - **Homepage URL:** `http://localhost:3000`
   - **Callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and create Client Secret
4. Add to `.env.local`

---

## Project Structure

```
c2c/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Upload UI (minimal)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Claw branding
│   │   ├── api/
│   │   │   ├── auth/             # NextAuth.js endpoints
│   │   │   └── gist/             # Gist API routes
│   │   └── s/[gistId]/           # Transfer/download page
│   ├── lib/
│   │   ├── github.ts             # GitHub API client
│   │   ├── p2p.ts                # WebRTC logic (future)
│   │   └── types.ts              # TypeScript types
│   └── components/               # Reusable UI components
├── .env.example
├── CLAUDE.md                     # Claude Code context
├── PRD.md                        # Product requirements
└── README.md                     # This file
```

---

## Usage

### For Users

1. **Login with GitHub** — Click "Sign in with GitHub"
2. **Drop a file** — Select file up to 100MB
3. **Share the link** — Copy and send to recipient
4. **Recipient downloads** — Opens link, downloads from your Gist

### For Developers

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Rate Limits (Free Tier)

| Limit | Value |
|-------|-------|
| File size | 100MB |
| Transfers/day | 10 |
| Gist storage | GitHub limits |

Upgrade to Pro for higher limits (coming soon).

---

## Non-Negotiables (Test These)

1. ✅ Login with GitHub works
2. ✅ File uploads to user's Gist
3. ✅ Share link creates valid download
4. ⏳ Rate limiting enforces quotas
5. ⏳ Mobile works on Safari/Chrome
6. ⏳ Lighthouse perf > 90

**After every change:** "Does this make shell-to-shell faster/more reliable? Or just prettier for humans?"

---

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m "Add amazing feature"`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## License

MIT — See LICENSE file.

---

## Tagline

> "Claw to claw. Shell to shell. Direct. Encrypted. No servers touched."

Built with ❤️ by [@danieloleary](https://github.com/danieloleary)
