# GPU Cluster Utilization Dashboard

Real-time observability dashboard for Meta-scale AI GPU clusters (24K-129K GPUs). Built with React, TypeScript, D3.js, Three.js, and WebGL.

## Features

- **Cluster Overview** — Real-time health, utilization, and capacity across clusters
- **GPU Heatmap** — WebGL-rendered 100K+ GPU cells at 60fps with health/status encoding
- **Network Topology** — RoCE/InfiniBand link visualization with congestion detection
- **Straggler Detection** — ML-based straggler identification with timeline views
- **Checkpoint Tracker** — Distributed checkpoint/restart progress monitoring
- **Alert Panel** — Real-time alerting with acknowledgment workflows

## Tech Stack

- **Framework:** React 18 + TypeScript 5 + Vite 5
- **Visualization:** D3.js v7 (charts), Three.js r160 (WebGL heatmaps), Canvas API
- **Animation:** Framer Motion 11 + GSAP 3
- **State:** TanStack Query v5 + Zustand
- **Real-time:** Server-Sent Events (SSE)
- **Testing:** Vitest 2 + Playwright 1.45 + axe-core
- **Quality:** Biome, TypeScript strict, size-limit, Lighthouse CI

## Getting Started

```bash
# Install dependencies
npm install

# Generate mock data
npm run data:generate

# Start development server
npm run dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

## Quality Gates

```bash
# Fast checks (run on every edit)
npm run check:fast

# Task completion checks
npm run check:task

# Security scan
npm run check:security

# Accessibility audit (requires preview URL)
PREVIEW_URL=https://your-preview-url npm run check:a11y

# Performance audit (requires preview URL)
PREVIEW_URL=https://your-preview-url npm run check:perf

# Full CI pipeline
npm run check:full
```

## Project Structure

```
src/
├── app/                 # App root, routing, providers
├── components/
│   ├── ui/              # Design system primitives
│   ├── layout/          # Bento grid, responsive containers
│   ├── charts/          # D3 chart components
│   ├── dashboard/       # Dashboard-specific composed components
│   └── common/          # Shared: Loading, ErrorBoundary
├── features/
│   ├── cluster-overview/
│   ├── gpu-heatmap/
│   ├── network-topology/
│   ├── straggler-detection/
│   ├── checkpoint-tracker/
│   └── alert-panel/
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, API, helpers
├── styles/              # CSS variables, tokens, themes
└── types/               # TypeScript types
```

## Design System

Design tokens defined in `src/styles/tokens.css`:
- Colors (semantic + primitive)
- Spacing, typography, shadows, border radius
- Motion durations, easings
- Breakpoints, container queries

## Real-time Data

Dashboard expects SSE endpoint at `/api/stream` with events:
- `gpu-update` — Per-GPU metrics
- `network-update` — Link utilization changes
- `checkpoint-update` — Progress updates
- `alert` — New alerts

Mock data generator: `npm run data:generate` (configurable via `GPU_COUNT` env)

## Deployment

- **Preview:** Auto-deployed on PR via GitHub Actions
- **Production:** Auto-deployed on merge to main
- **Lighthouse CI:** Performance budgets enforced on preview

## Constraints

See `CONSTRAINTS.md` for enforced quality standards:
- Zero TypeScript errors
- Zero Biome lint errors
- Zero critical/serious accessibility violations
- Changed-lines coverage ≥ 80%
- Bundle size limits
- Lighthouse performance budgets

## License

MIT