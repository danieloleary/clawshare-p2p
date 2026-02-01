# Product Requirements Document: C2C P2P

**Version:** 3.0 - GitHub-First Architecture
**Date:** February 1, 2026
**Status:** Development - Phase 1: GitHub OAuth + Storage

---

## Core Philosophy: Crabs First, Humans Second

**The Truth:**
- C2C is NOT a file-sharing app for humans
- GitHub is the backbone: OAuth for identity, Gist for storage
- Files stay in users' GitHub accounts — transparent and auditable
- The UI is scaffolding for humans—crab-to-crab transfer is the product

**The Mantra:**
> Make the crab-to-crab transfer unbreakable and invisible.  
> Make the human UI tolerable, not distracting.  
> If a feature makes P2P slower, flakier, or more complex → delete it.

**Tagline:**
> "Claw to claw. Shell to shell. Direct. Encrypted. No servers touched."

---

## Overview

C2C P2P is a peer-to-peer file sharing platform built on GitHub. Users login with GitHub, files stored in their Gists, and share via links. GitHub handles identity, storage, and security — C2C provides the sharing interface.

### Why GitHub?

- ✅ **Real identity** — OAuth login prevents anonymous abuse
- ✅ **Transparent storage** — Files live in user's GitHub account
- ✅ **GitHub-grade security** — GitHub's infrastructure = your security
- ✅ **User control** — Delete/modify files directly on GitHub
- ✅ **Auditable** — Users can see exactly what C2C accesses

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

1. **Login with GitHub** — Click "Sign in with GitHub"
2. **Drop a file** — Stored in your private GitHub Gist
3. **Share link** — Recipient gets read access
4. **Download** — Recipient fetches from your Gist
5. **You control everything** — Delete from GitHub anytime

---

## Problem Statement

Existing solutions:
- **Centralized storage** — Files go through servers (privacy concerns)
- **Anonymous uploads** — Abuse, malware, illegal content
- **Black box** — Users can't see/delete their data
- **No identity** — No accountability for uploaders

### C2C Solution
- **GitHub as backbone** — Real identity, transparent storage
- **Files in user's Gist** — User controls their data
- **GitHub-grade security** — GitHub's infrastructure
- **Rate limiting per user** — Prevents abuse

---

## User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| User | Login with GitHub | My identity is verified |
| User | Drop a file | It gets stored in my Gist |
| User | Copy share link | Send to friend/colleague |
| Recipient | Click link and download | Get the file from sender's Gist |
| User | See my files | Manage/delete transfers |
| User | Revoke share link | Stop others from downloading |
| Admin | Rate limit users | Prevent abuse |

---

## Core Features

### 1. Authentication (GitHub OAuth)
- **Login** — "Sign in with GitHub" button
- **Session** — JWT token stored in cookie
- **User info** — Username, avatar from GitHub API
- **Logout** — Clear session

### 2. File Upload
- **Drag & drop** — Drop zone for files
- **File select** — Click to browse
- **Size check** — Enforce 100MB limit
- **Store in Gist** — Private gist with metadata
- **Rate limit** — Check user's transfer count

### 3. Share Links
- **Generate link** — `/s/{gistId}` format
- **Copy button** — One-click copy
- **QR code** — Scan to download (future)
- **Expiry** — Configurable timeout (future)

### 4. Download
- **Fetch from Gist** — Get file content
- **Progress** — Show download progress
- **Save** — Browser download dialog

### 5. User Dashboard (Future)
- **List files** — Show user's Gists
- **View details** — Filename, size, date, downloads
- **Revoke** — Delete Gist or make private
- **Stats** — Transfer history

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js

### Backend (Serverless)
- **Next.js API Routes** — `/api/*`
- **GitHub API** — Gist CRUD, user info
- **Rate limiting** — Per-user quotas

### Storage
- **GitHub Gist** — File storage (user's private Gists)
- **No database** — GitHub is the source of truth
- **No file storage** — Files stay on GitHub

### Rate Limiting
- **Per user** — GitHub user ID as key
- **Free tier** — 10 transfers/day
- **Pro tier** — Unlimited (coming soon)

---

## Design System

### Colors
- **Claw Red:** #FF3D00 (primary accent)
- **Dark Shell:** #1A1A1A (background)
- **Surface:** #FFFFFF (cards)
- **Success Green:** #00C853

### Typography
- **Headings/Logo:** Fredoka (crab energy)
- **Body:** Inter (clean, readable)

### Visual Elements
- 🦀 sparingly but deliberately
- Minimal animations (only for feedback)
- Dark mode default (shells are dark)

---

## API Endpoints

### Authentication
```
GET  /api/auth/signin        # Sign in page
GET  /api/auth/signout       # Sign out
GET  /api/auth/callback/github  # OAuth callback
GET  /api/auth/session       # Get session
```

### Files
```
POST /api/gist               # Create gist with file
GET  /api/gist?id={gistId}   # Get gist content
GET  /api/gist/list          # List user's gists
DELETE /api/gist?id={gistId} # Delete gist
```

### Rate Limiting
```
GET  /api/limits             # Get user's remaining transfers
```

---

## Rate Limits (Free Tier)

| Limit | Value |
|-------|-------|
| File size | 100MB |
| Transfers/day | 10 per GitHub user |
| Gist storage | GitHub limits (1GB per gist) |

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

## Success Metrics

| Metric | Target |
|--------|--------|
| Login success rate | > 99% |
| Upload success rate | > 98% |
| Download success rate | > 98% |
| Lighthouse performance | > 90 |
| Auth errors | < 1% |

---

## Future Enhancements (Post-MVP)

1. **WebRTC P2P** — Direct transfer, bypass Gist download
2. **QR Codes** — Scan to share between devices
3. **Pro Tier** — Higher limits, custom branding
4. **Team Accounts** — Shared Gist organization
5. **Webhooks** — Notify on download

---

## Constraints

- ✅ GitHub OAuth required (real identity)
- ✅ Files stored in user's Gist (transparent)
- ✅ No server-side file storage
- ✅ No analytics/tracking (privacy-first)
- ✅ Open source, auditable
- ✅ No bloat features

---

## Open Source

**Repository:** https://github.com/danieloleary/c2c

**License:** MIT

**Contributing:** PRs welcome! See CONTRIBUTING.md
