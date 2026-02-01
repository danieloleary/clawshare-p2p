# CLAUDE.md - ClawShare P2P

This file provides guidance for Claude Code when working with this codebase.

## Project Overview

ClawShare P2P is a peer-to-peer file sharing platform using GitHub as the signaling layer and WebRTC for direct browser-to-browser transfers.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with Material Design 3
- **Backend:** Next.js API Routes
- **Storage:** GitHub Gist (metadata only)
- **P2P:** WebRTC (future), GitHub Gist (MVP signaling)

## Design System

### Colors
```css
--md-sys-color-primary: #e53935;  /* Google Red */
--md-sys-color-surface: #ffffff;
--md-sys-color-on-surface: #1a1a1a;
--md-sys-color-error: #b00020;
```

### Typography
- Font: Inter (Google Sans alternative)
- Scale: Material 3 type scale

### Key Components
- Buttons: `.btn` with `.btn-filled`, `.btn-tonal`, `.btn-text` variants
- Cards: `.card` with 12px border radius
- FAB: `.fab` for primary actions
- Drop zone: `.drop-zone` with drag-and-drop

## Code Patterns

### Tailwind Classes
```tsx
// Buttons
<button className="btn btn-filled">Text</button>
<button className="btn btn-tonal">Text</button>
<button className="btn btn-text">Text</button>

// Cards
<div className="card">Content</div>

// Typography
<h1 className="text-headline">Title</h1>
<p className="text-body">Body</p>
<span className="text-label">Label</span>

// Icons (Material Symbols)
<span className="material-symbols-rounded">icon_name</span>
```

### API Routes
```typescript
// src/app/api/[route]/route.ts
export async function POST(request: NextRequest) {
  // Handle POST requests
}
export async function GET(request: NextRequest) {
  // Handle GET requests
}
```

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Upload page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Material 3 styles
│   ├── api/
│   │   └── gist/
│   │       └── route.ts      # GitHub Gist API
│   └── s/[gistId]/
│       ├── page.tsx          # Transfer page
│       └── ShareClient.tsx   # Transfer UI components
├── components/               # Reusable components
.env.example                 # Environment template
PRD.md                       # Product requirements
README.md                    # Documentation
tailwind.config.ts           # Design system config
```

## GitHub Integration

### Creating a Gist
```typescript
const response = await fetch('https://api.github.com/gists', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
  body: JSON.stringify({
    description: 'clawshare:filename',
    public: false,
    files: { 'filename.ext': { content: 'base64...' } }
  })
});
```

### Fetching a Gist
```typescript
const response = await fetch(`https://api.github.com/gists/${gistId}`, {
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }
});
```

## Ralph Wiggum Loop

The Ralph Wiggum loop is an iterative development process:

1. **Read** current state (git status, files)
2. **Plan** 1-3 concrete next steps
3. **Write** code changes
4. **Test** locally if possible
5. **Commit** with descriptive message
6. **Repeat** until completion criteria met

### Completion Criteria
- [ ] Web UI loads and displays upload page
- [ ] File uploads successfully to Gist
- [ ] Share link generates correctly
- [ ] Transfer status displays correctly
- [ ] Error handling works
- [ ] Claude Code can run end-to-end test

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

# Lint code
npm run lint
```

## Environment Variables

Required in `.env.local`:
- `GITHUB_TOKEN` - GitHub personal access token (scopes: gist)
- Optional: OAuth credentials for future user accounts

## Notes

- This is an MVP - P2P transfer is simulated with base64 encoding
- Real WebRTC would enable true browser-to-browser transfer
- GitHub only sees metadata, not file content
- Free tier: 100MB files, 10 transfers/day
