# Product Requirements Document: ClawShare P2P

**Version:** 1.0
**Date:** February 1, 2026
**Status:** MVP Development

---

## Overview

ClawShare P2P is a peer-to-peer file sharing platform that uses GitHub as a signaling layer and WebRTC for direct browser-to-browser file transfers. The product targets users who need fast, secure, free file sharing without relying on centralized servers.

## Problem Statement

Existing file sharing solutions have significant drawbacks:
- **Centralized storage** — Files go through third-party servers (privacy concerns)
- **File size limits** — Most free services cap at 100MB or less
- **Expiry issues** — Links expire unexpectedly
- **Paywalls** — Basic features locked behind subscriptions

## Solution

ClawShare P2P enables direct file transfer between devices using:
- **GitHub Gist API** — For metadata storage and peer discovery (signaling)
- **WebRTC Data Channels** — For encrypted direct browser-to-browser transfer
- **GitHub Pages** — For the web UI

## Core Features (MVP)

### 1. File Upload & Share
- Users select a file from their device
- File metadata uploaded to GitHub Gist
- Shareable link generated with Gist ID
- Link works for any recipient with the URL

### 2. P2P Transfer
- Recipient opens link → fetches metadata from Gist
- WebRTC connection established (simulated in MVP)
- File transfers directly between browsers
- Encrypted end-to-end

### 3. Transfer Status
- Real-time progress indicator
- Connection status (connecting/transferring/complete)
- Cancel transfer option

### 4. GitHub Integration
- OAuth for user identification (optional)
- Gist for metadata storage (free, unlimited)
- No file content stored on GitHub

## Design System

### Colors
- **Primary:** #E53935 (Google Red)
- **Surface:** #FFFFFF
- **On Surface:** #1A1A1A
- **Error:** #B00020

### Typography
- **Font:** Inter (Google Sans alternative)
- **Scale:** Material 3 type scale

### Components
- Material 3 buttons (filled, tonal, text)
- Elevated cards (12px border radius)
- FAB for primary actions
- Bottom navigation

### Layout
- Mobile-first, responsive
- 8pt grid system
- 12px default radius, 16px cards

## Technical Architecture

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Material Design 3

### Backend (Serverless)
- Next.js API Routes
- GitHub API integration

### P2P Layer
- WebRTC Data Channels (future)
- GitHub Gist for signaling (MVP simulation)

### Storage
- GitHub Gist for metadata (free)
- No file content storage (direct P2P)

## File Structure

```
clawshare-p2p/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Upload UI
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Material 3 styles
│   │   ├── api/
│   │   │   └── gist/
│   │   │       └── route.ts      # Gist API routes
│   │   └── s/[gistId]/
│   │       ├── page.tsx          # Transfer page
│   │       └── ShareClient.tsx   # Transfer UI
│   └── components/               # Reusable components
├── .env.example                  # Environment template
├── README.md                     # Quick start
├── tailwind.config.ts            # Design system
└── package.json
```

## Freemium Model

| Tier | File Size | Transfers | Price |
|------|-----------|-----------|-------|
| Free | 100MB | 10/day | $0 |
| Pro | 1GB | Unlimited | $5/mo |
| Team | 5GB | Unlimited | $15/mo |

## Success Metrics (MVP)

1. ✅ Upload page loads successfully
2. ✅ File uploads to Gist metadata
3. ✅ Share link generates correctly
4. ✅ Recipient fetches metadata from Gist
5. ✅ Transfer status displays correctly
6. ✅ File content transfers (simulated)
7. ✅ Error handling for network failures

## Future Enhancements (Post-MVP)

1. **Real WebRTC P2P**
   - Direct browser-to-browser transfer
   - No base64 encoding (true P2P)
   - Faster for large files

2. **WebSocket Signaling**
   - Real-time peer discovery
   - Faster connection setup

3. **Payment Integration**
   - Stripe for Pro/Team tiers
   - Usage analytics

4. **User Accounts**
   - GitHub OAuth
   - Transfer history
   - Link management

5. **QR Codes**
   - Quick transfer between devices
   - Offline sharing mode

## Constraints & Risks

### Technical
- GitHub API rate limits (60 requests/hour for unauthenticated)
- Base64 encoding adds 33% overhead
- Browser compatibility for WebRTC

### Legal
- Terms of service needed
- DMCA policy for copyrighted content
- Privacy policy for user data

## Implementation Plan

### Phase 1: MVP (Current)
- Upload UI with drag-and-drop
- Gist API integration
- Share link generation
- Transfer status display
- Basic error handling

### Phase 2: P2P (Future)
- WebRTC Data Channels
- Real P2P transfer
- Signaling server

### Phase 3: Monetization
- Stripe integration
- Pro/Team tiers
- Analytics dashboard
