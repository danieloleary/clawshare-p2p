# CLAUDE.md - C2C P2P

This file provides guidance for Claude Code when working with this codebase.

## Project Overview

**C2C P2P** is a peer-to-peer file sharing platform built on GitHub. Files live in users' GitHub Gists — transparent, auditable, controllable. GitHub handles identity and storage; C2C provides the sharing interface.

### Core Philosophy: Crabs First, Humans Second

**The Truth:**
- This is NOT another file-sharing app
- GitHub is the backbone: OAuth for identity, Gist for storage
- Files stay in users' GitHub accounts — transparent and auditable
- The UI is scaffolding for humans—crab-to-crab transfer is the product

**The Mantra:**
> Make the crab-to-crab transfer unbreakable and invisible.  
> Make the human UI tolerable, not distracting.  
> If a feature makes P2P slower, flakier, or more complex → delete it.

### Visual Vibe
- 🦀 or 🦞 emoji sparingly but deliberately
- Claw-red (#FF3D00) accents on key actions
- Dark mode default (shells are dark)
- Mobile-first (most transfers: phone ↔ laptop)

### Tagline
> "Claw to claw. Shell to shell. Direct. Encrypted. No servers touched."

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
2. **Drop a file** — Stored in user's private GitHub Gist
3. **Share link** — Recipient gets read access
4. **Download** — Recipient fetches from sender's Gist
5. **User controls everything** — Delete from GitHub anytime

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js (GitHub OAuth)
- **Storage:** GitHub Gist API
- **Design:** Material Design 3 + Claw branding

---

## Design System

### Colors
```css
--claw-primary: #FF3D00;  /* Claw Red */
--claw-dark: #1A1A1A;
--claw-surface: #FFFFFF;
```

### Typography
- **Font:** Inter (body), Fredoka (headings/logo)
- **Scale:** Material 3 type scale

---

## Code Patterns

### NextAuth.js GitHub Login
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add GitHub username to session
      session.user.name = token.sub;
      return session;
    }
  }
})
```

### GitHub Gist Integration
```typescript
// Create gist for user's file
const gist = await fetch('https://api.github.com/gists', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  },
  body: JSON.stringify({
    description: 'clawshare:filename:userId',
    public: false,
    files: {
      [filename]: {
        content: fileContent  // Base64 encoded
      }
    }
  })
});
```

### Fetch User's Gists
```typescript
// List user's Gists for dashboard
const response = await fetch('https://api.github.com/gists', {
  headers: {
    Authorization: `Bearer ${token}`,
  }
});
```

---

## File Structure

```
c2c/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Upload UI (minimal)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Claw branding
│   │   ├── api/
│   │   │   ├── auth/             # NextAuth.js endpoints
│   │   │   │   └── [...nextauth]/
│   │   │   └── gist/             # Gist API routes
│   │   │       ├── route.ts      # Create/fetch Gists
│   │   │       └── user/         # User's files
│   │   ├── dashboard/            # User dashboard (future)
│   │   └── s/[gistId]/
│   │       ├── page.tsx          # Transfer page
│   │       └── DownloadClient.tsx
│   ├── lib/
│   │   ├── github.ts             # GitHub API wrapper
│   │   ├── auth.ts               # NextAuth config
│   │   ├── p2p.ts                # WebRTC logic (future)
│   │   └── types.ts              # TypeScript types
│   └── components/               # Reusable components
├── .env.example
├── CLAUDE.md
├── PRD.md
└── README.md
```

---

## Priority Order

### Priority 1: GitHub OAuth + User Identity (Current)
1. ✅ NextAuth.js GitHub provider setup
2. ⏳ Session management
3. ⏳ User dashboard (list user's Gists)
4. ⏳ Rate limiting per GitHub user

### Priority 2: File Sharing
1. ✅ Upload to user's Gist
2. ✅ Generate shareable link
3. ⏳ Download from Gist (receiver)
4. ⏳ Revoke/expire share links

### Priority 3: Shell-to-Shell (Future)
1. ⏳ WebRTC for direct transfer (bypass Gist download)
2. ⏳ Fallback to Gist if WebRTC fails

---

## Rate Limits (Free Tier)

| Limit | Value |
|-------|-------|
| File size | 100MB |
| Transfers/day | 10 per GitHub user |
| Gist storage | GitHub limits |

Pro tier coming soon for higher limits.

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

## Ralph Wiggum Loop

Iterate until:
1. [ ] GitHub OAuth login works
2. [ ] File uploads to user's private Gist
3. [ ] Share link downloads from Gist
4. [ ] User can see their files (dashboard)
5. [ ] Rate limiting works per user

---

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Required in `.env.local`:
```bash
# GitHub OAuth (required)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# NextAuth (required)
NEXTAUTH_SECRET=generate_with_openssl
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics, etc.
```

---

## Notes

- GitHub OAuth = real identity, less abuse
- Files stored in user's Gist = transparent
- No server-side storage = GitHub handles everything
- Rate limiting per user via GitHub identity
- This is crabs-first, humans-second
