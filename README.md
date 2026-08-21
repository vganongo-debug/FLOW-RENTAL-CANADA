# Flow Rentals OS

Integrated hotel and car rental operating system for Flow Rentals Global Inc.
(subsidiary of VBMS Holdings Inc., Canada).

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom Flow brand tokens)
- React Router v6
- Recharts · Lucide icons

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — pick a demo role on the login screen.

## Demo roles

The login screen lets you enter as any role; each redirects to its
role-specific home.

| Role | Lands on |
|---|---|
| SuperAdmin (Co-Founder) | `/admin/portfolio` |
| Country Manager | `/hotels/dashboard` |
| Hotel Manager | `/hotels/dashboard` |
| Car Rental Agent | `/fleet/dashboard` |
| Fleet Partner | `/fleet/partner-portal` |
| Guest | `/booking/search` |

## Phase 1 build (this drop)

- Full design system: tokens, typography, dark mode, responsive
- 17+ `<Flow*>` reusable components in `src/components/flow/`
- Six anchor screens that prove out the app's surfaces:
  - Login + role selection
  - SuperAdmin Global Portfolio Dashboard
  - Hotel Manager Dashboard + Reservations Manager
  - Fleet Dashboard + Fleet Partner Portal (the differentiator)
  - Guest Booking Search + Search Results
- Router wired for **all** spec routes — unbuilt screens render an
  on-brand `Placeholder` with a description of what's coming.

## Project layout

```
src/
  components/
    flow/                Reusable Flow* component library
    layout/              AppLayout (back-office) + PublicLayout (guest)
  context/               Auth, Theme, Locale providers
  lib/                   utils, types, sampleData
  pages/                 Route pages
```

## Brand tokens

All brand colors live in `tailwind.config.js` and `src/index.css` as
both Tailwind utilities (`bg-teal`, `text-copper`, `bg-panel-mid`) and
CSS variables (`--color-teal`, etc).

Typography:
- Display / Headings: Palatino Linotype
- Body / UI: Calibri / Segoe UI
- Labels / Caps: Trebuchet MS, uppercase, 0.08em letter-spacing
