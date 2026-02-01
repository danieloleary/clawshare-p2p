# Product Requirements Document: ClawShare P2P

**Version:** 2.0
**Date:** February 1, 2026
**Status:** MVP Development - Phase 2: Shell-to-Shell Robustness

---

## Core Philosophy: Crabs First, Humans Second

**The Truth:**
- ClawShare is NOT a file-sharing app for humans
- It's a **shell-to-shell, claw-to-claw P2P transfer protocol**
- The UI is scaffolding for humans—crab-to-crab transfer is the product
- Humans are clumsy facilitators who drop files or paste codes

**The Mantra:**
> Make the crab-to-crab transfer unbreakable and invisible.  
> Make the human UI tolerable, not distracting.  
> If a feature makes P2P slower, flakier, or more complex → delete it.

**Tagline:**
> "Claw to claw. Shell to shell. Direct. Encrypted. No servers touched."

---

## Overview

ClawShare P2P is a peer-to-peer file transfer protocol where two devices find each other via GitHub Gist breadcrumbs, then rip files directly over WebRTC like crabs in a death grip. No servers, no logs, pure direct armored transfer.

## Problem Statement

Existing solutions:
- **Centralized storage** — Files go through servers (privacy nightmare)
- **Middleman touching payload** — Servers see your data
- **Slow transfers** — Server bottleneck
- **Complex UX** — Over engineered for simple task

## Solution

ClawShare enables direct shell-to-shell transfer:
1. **Sender** drops file → metadata to GitHub Gist
2. **Receiver** opens link → fetches metadata
3. **Devices** handshake via Gist breadcrumbs
4. **WebRTC** blasts files directly (never touches servers)
5. **Transfer complete** — crabs release grip

---

## Priority Order

### Priority Zero: Shell-to-Shell Robustness (Current Focus)
1. ✅ Bulletproof WebRTC reconnection (auto-retry on ICE disconnect)
2. ✅ Chunked transfer with resume (track offset, resume from last acknowledged chunk)
3. ✅ ICE restart on failure
4. ✅ Exponential backoff reconnect (max 5 attempts)
5. ⏳ NAT traversal (STUN/TURN configuration)
6. ⏳ Large-file handling (2GB+ support, no memory blowup)

### Priority 1: Human Scaffolding (Minimal)
1. ✅ Copy-to-clipboard (tiny button)
2. ⏳ QR code for phone transfers
3. ✅ File previews: Only sender's drop zone
4. ⏳ Receiver minimal UI: "Incoming from claw @ [code] – [size]"
5. ✅ Simple progress: "Claw gripping... 45% (8.2 MB/s)"
6. ⏳ Ugly-truth rate limiting: "Your human has 4/10 free grips left today"

### Kill or Defer
- ❌ Auth / GitHub login (kills zero-friction crab magic)
- ❌ Full transfer dashboard
- ❌ Confetti, success fireworks
- ❌ Fancy settings (dark mode toggle only for now)

---

## Core Features (MVP)

### 1. File Metadata & Signaling
- Users select a file from their device
- File metadata uploaded to GitHub Gist
- Shareable link generated with Gist ID
- Gist stores: filename, size, hash, sender ID, timestamps

### 2. P2P Transfer (WebRTC Data Channels)
- Recipient opens link → fetches metadata from Gist
- WebRTC connection established directly between browsers
- File transfers in 16KB chunks
- Resume support: if connection drops, resume from last offset
- Auto-reconnect: ICE failure triggers retry with backoff
- Encrypted end-to-end (DTLS)

### 3. Transfer Status
- Simple text-first progress: "Claw gripping... 45% (8.2 MB/s)"
- Connection state: connecting → transferring → complete
- Fail state: "Shell lost connection – retrying claw grip..."

### 4. Rate Limiting (Free Tier)
- 100MB file size limit
- 10 transfers/day
- Block with ugly-truth message when exceeded

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (minimal, dark mode default)

### Signaling
- **GitHub Gist API** — For metadata storage and peer discovery
- Gist description format: `clawshare:filename:fileHash`

### P2P Layer
- **WebRTC Data Channels** — Direct encrypted transfer
- **STUN servers** — Google public STUN for NAT traversal
- **Chunk size:** 16KB for reliable transfer

### No Server Storage
- GitHub only sees metadata (filename, size, hash)
- File content never leaves sender's device
- Receivers fetch directly from sender via WebRTC

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

## Non-Negotiables (Test These)

1. ✅ Phone on cellular → laptop on WiFi transfer
2. ⏳ Close/reopen tab mid-transfer (should resume)
3. ⏳ Airplane mode toggle (should recover)
4. ⏳ Measure: time-to-first-byte after code entry
5. ⏳ Transfer time vs direct USB benchmark
6. ⏳ Lighthouse perf > 95

**After every change:** "Does this make shell-to-shell faster/more reliable? Or just prettier for humans?"

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Transfer completion rate | > 95% |
| Auto-reconnect success | > 80% |
| Lighthouse performance | > 95 |
| Time to first byte | < 2s |
| Large file support (2GB+) | No memory blowup |

---

## Future Enhancements (Post-MVP)

1. **QR Code Transfer** — Scan to connect phone ↔ laptop
2. **TURN Server** — For symmetric NAT traversal
3. **QR Link Sharing** — Quick transfer between devices
4. **Local History** — Last 5-10 transfers only
5. **Pro Tier** — Unlimited transfers, larger files

---

## Constraints

- No auth required (zero-friction)
- No server-side file storage
- No analytics/tracking
- Open source, auditable
- No bloat features
