# Spec: GPU Cluster Utilization Dashboard

## Objective
Build a production-grade, real-time observability dashboard for Meta-scale AI GPU clusters (24K-129K GPUs). Dashboard must visualize per-GPU health, network congestion, straggler detection, checkpoint/restart tracking, and cluster-wide utilization heatmaps. Target users: ML infra engineers, cluster operators, SREs. Success = sub-500ms data refresh, <2.5s LCP, zero critical accessibility violations, 80%+ coverage on changed lines.

## Tech Stack
- **Framework:** React 18 + TypeScript 5 + Vite 5
- **Styling:** CSS Modules + CSS Variables (design tokens) + CSS Grid/Subgrid
- **State:** TanStack Query v5 (server state) + Zustand (client state)
- **Charts/Viz:** D3.js v7 (custom SVG), Three.js r160 (WebGL heatmaps), Canvas API (procedural)
- **Animation:** Framer Motion 11 + GSAP 3 (ScrollTrigger, Flip)
- **Real-time:** Server-Sent Events (SSE) + WebSocket fallback
- **Testing:** Vitest 2 (unit), Playwright 1.45 (e2e), axe-core (a11y)
- **Lint/Format:** Biome 1.8 + TypeScript strict
- **CI/CD:** GitHub Actions + Lighthouse CI + size-limit
- **Deploy:** Vercel/Netlify preview + production

## Commands
```bash
# Development
npm run dev                 # Vite dev server + SSE mock
npm run dev:mock            # Dev with mock data generator

# Build & Typecheck
npm run build               # Production build (typecheck + minify)
npm run typecheck           # tsc --noEmit
npm run lint                # Biome check --apply

# Testing
npm run test                # Vitest run --coverage
npm run test:watch          # Vitest watch
npm run test:e2e            # Playwright test
npm run test:a11y           # axe-core against preview URL

# Quality Gates
npm run check:fast          # typecheck + lint + gitleaks (diff only)
npm run check:task          # check:fast + test (changed lines coverage)
npm run check:security      # semgrep + osv-scanner
npm run check:full          # check:task + check:security + lighthouse + axe
npm run check:perf          # lighthouse $PREVIEW_URL --budget=./.lighthouseci.json
npm run check:size          # size-limit

# Deploy
npm run preview             # Vite preview
npm run deploy:preview      # Deploy to preview environment
npm run deploy:prod         # Deploy to production
```

## Project Structure
```
gpu-cluster-dashboard/
├── .github/
│   └── workflows/
│       ├── ci.yml              # PR checks: fast, task, security
│       ├── deploy-preview.yml  # Preview deploy on PR
│       ├── deploy-prod.yml     # Production deploy on main
│       └── lighthouse.yml      # Lighthouse CI budgets
├── .vscode/
│   └── settings.json           # Editor config (format on save, etc.)
├── public/
│   ├── mock-data/              # Static mock JSON for offline dev
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root component, providers
│   │   ├── routes.tsx          # React Router v6 routes
│   │   └── providers/          # Context providers (Query, Zustand, Theme)
│   ├── components/
│   │   ├── ui/                 # Design system primitives (Button, Card, Tooltip, etc.)
│   │   ├── layout/             # Bento grid, Sidebar, Header, ResponsiveContainer
│   │   ├── charts/             # D3/Three.js/Canvas chart components
│   │   ├── dashboard/          # Dashboard-specific composed components
│   │   └── common/             # Shared: Loading, ErrorBoundary, EmptyState
│   ├── features/
│   │   ├── cluster-overview/   # Cluster-level utilization, health summary
│   │   ├── gpu-heatmap/        # WebGL/Three.js per-GPU heatmap
│   │   ├── network-topology/   # Network congestion, RoCE/IB visualization
│   │   ├── straggler-detection/# Straggler identification, timeline
│   │   ├── checkpoint-tracker/ # Checkpoint/restart tracking, progress
│   │   └── alert-panel/        # Real-time alerts, acknowledgment
│   ├── hooks/
│   │   ├── useClusterData.ts   # TanStack Query hooks for SSE/REST
│   │   ├── useWebGL.ts         # Three.js lifecycle management
│   │   ├── useAnimation.ts     # Framer Motion/GSAP helpers
│   │   └── useResponsive.ts    # Container queries, breakpoint hooks
│   ├── lib/
│   │   ├── api.ts              # API client, SSE connection manager
│   │   ├── mock.ts             # Mock data generator (dev only)
│   │   ├── d3-helpers.ts       # D3 scales, axes, transitions
│   │   ├── three-helpers.ts    # Three.js scene, camera, renderer utils
│   │   ├── canvas-helpers.ts   # Canvas procedural animation utils
│   │   ├── tokens.ts           # Design tokens (colors, spacing, motion)
│   │   └── utils.ts            # Pure utilities (debounce, format, etc.)
│   ├── styles/
│   │   ├── globals.css         # CSS variables, reset, base styles
│   │   ├── tokens.css          # Design token CSS custom properties
│   │   ├── layout.css          # Bento grid, container queries
│   │   └── themes.css          # Light/dark/high-contrast themes
│   └── types/
│       ├── api.ts              # API response types
│       ├── cluster.ts          # Cluster, GPU, Network types
│       └── ui.ts               # Component prop types
├── tests/
│   ├── unit/                   # Vitest unit tests (mirror src/)
│   ├── integration/            # Vitest integration tests
│   ├── e2e/                    # Playwright e2e tests
│   ├── a11y/                   # axe-core test configs
│   ├── visual/                 # Playwright visual regression
│   └── fixtures/               # Test data, mocks
├── scripts/
│   ├── quality-gate.mjs        # Threshold enforcement (from constraint-driven)
│   ├── generate-mocks.mjs      # Mock data generator
│   └── check-coverage.mjs      # Changed-lines coverage calculator
├── CONSTRAINTS.md              # Quality constraints (this project's bar)
├── SPEC.md                     # This file
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── biome.json
├── .lighthouseci.json
├── size-limit.config.js
├── .gitignore
├── .eslintignore
├── README.md
└── ARCHITECTURE.md             # Architecture decision records
```

## Code Style
```tsx
// Component pattern: compound components with Radix-style API
// File: src/components/ui/Card/Card.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        styles.card,
        styles[variant],
        styles[`p-${padding}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

// Usage:
// <Card variant="elevated" padding="lg">
//   <CardHeader>Cluster Health</CardHeader>
//   <CardContent>...</CardContent>
// </Card>
```

**Key Conventions:**
- **Components:** Compound components, forwardRef, displayName, CSS Modules + cn()
- **Hooks:** Prefix with `use`, return typed objects, single responsibility
- **Types:** Shared in `src/types/`, no `any`, prefer `interface` over `type` for objects
- **Imports:** `@/` alias for `src/`, relative for same-feature imports
- **Naming:** PascalCase components, camelCase hooks/utils, kebab-case CSS modules
- **State:** Server state → TanStack Query, Client state → Zustand, URL state → React Router
- **Animation:** Framer Motion for React, GSAP for complex sequences/ScrollTrigger
- **Error Handling:** ErrorBoundary per feature, Result type for async operations

## Testing Strategy
- **Unit (Vitest):** Pure functions, hooks, utils, token logic — 100% coverage target
- **Integration (Vitest):** Component + hook combinations, API client, SSE manager
- **E2E (Playwright):** Critical user flows: dashboard load, GPU drill-down, alert acknowledgment, theme toggle
- **Visual (Playwright):** Chart components, heatmap, layout at breakpoints
- **Accessibility (axe-core):** Zero critical/serious violations on all pages
- **Performance (Lighthouse CI):** LCP ≤ 2500ms, CLS ≤ 0.1, TBT ≤ 200ms
- **Bundle (size-limit):** Main chunk ≤ 150kB gzipped, chart chunk ≤ 80kB
- **Coverage Gate:** Changed lines ≥ 80% (via `scripts/check-coverage.mjs`)

## Boundaries
- **Always:**
  - Run `npm run check:fast` before commit
  - Follow component/hook patterns above
  - Validate all API inputs with Zod schemas
  - Write tests FIRST (TDD — see test-driven-development skill)
  - Zero `@ts-ignore`, `eslint-disable`, skipped tests without reason
  - No secrets in source (gitleaks --redact)
- **Ask First:**
  - Database schema changes (N/A — no DB)
  - Adding runtime dependencies (>50kB gzipped)
  - Changing CI config or quality thresholds
  - Modifying design tokens (affects entire system)
  - Architecture decisions (new state lib, routing, etc.)
- **Never:**
  - Commit directly to main (PR required)
  - Weaken CONSTRAINTS.md to pass
  - Remove failing tests without approval
  - Hardcode colors/spacing (use tokens)
  - Use `any` type
  - Mock what can be tested real

## Success Criteria
1. **Functional:**
   - Dashboard loads in <2.5s (LCP) on 4G throttle
   - Real-time updates ≤500ms latency (SSE)
   - GPU heatmap renders 100K+ cells at 60fps (WebGL)
   - All 6 feature areas accessible via navigation
   - Dark/light/high-contrast themes work

2. **Quality:**
   - `npm run check:full` passes on CI
   - Zero critical/serious axe violations
   - Lighthouse CI budgets met
   - Bundle size within limits
   - Changed-lines coverage ≥ 80%

3. **Developer Experience:**
   - `npm run dev` starts in <3s with mock data
   - Hot module replacement works for all files
   - TypeScript errors surfaced in editor
   - Component library documented in Storybook (optional)

## Open Questions
1. Real backend API spec? (Currently mock-only — need SSE endpoint contract)
2. Authentication strategy? (Assume header-based for now)
3. Cluster scale targets? (Design for 129K GPUs, test with 10K mock)
4. Historical data retention? (Current spec: real-time only, 24h rolling window)
5. Export/reporting features? (Not in v1 — defer to v2)