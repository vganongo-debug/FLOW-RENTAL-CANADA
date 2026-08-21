# Flow Rentals OS — Security & Compliance Review

**Reviewer:** automated audit · `pedantic-poitras-a9ff5c` branch · 12 May 2026
**Status:** PROTOTYPE — not production-ready
**Audience:** Vistel Ganongo & Maye Samoiel · co-founders · Flow Rentals Global Inc.

---

## TL;DR

| | Status |
|---|---|
| Frontend code quality | 🟢 Solid · React 18 escapes XSS by default · TypeScript strict mode · 65 tests green |
| Authentication | 🔴 Demo-only · `loginAs(role)` picks a sample user with **no password verification** |
| Authorization | 🔴 Client-side only · trivially bypassed by editing localStorage |
| Card data (PCI-DSS) | 🟡 Stripe Elements iframe now in use · card data lives in stripe.com origin, never in Flow code · only blocker left is the server-side `paymentIntents.confirm` step |
| Personal data (PII) | 🟡 Stored in `localStorage` for the demo · acceptable for prototype, unacceptable for production |
| Server / infra | ⚪ Does not exist yet · all controls below assume a future backend |
| Audit trail | 🟢 In-app audit log for Rewards mgmt actions exists; need to extend to all admin actions |
| HTTPS / CSP / headers | 🔴 No CSP, no HSTS, no X-Frame-Options yet · added in this commit |
| Data protection law | 🟡 Sample data only · no real subject data yet · still need DPIA before launch |

**Bottom line:** the frontend is well-built, but a real launch requires a real backend with a serious security architecture. This document is the gap analysis. The next major work-stream should be a backend with PCI-compliant payment handling via Stripe.

---

## 1. Threat model

| Asset | What's at risk | Adversary | Today's defence |
|---|---|---|---|
| Card data (PAN, CVV, expiry) | Direct fraud · PCI fine · brand damage | Skimmers, breach actors, insider | **None yet** — card data hits the React app directly. Must use a tokenizing payment processor before launch. |
| Member PII (passport, licence, phone) | Identity fraud · POPIA / GDPR breach · brand | Account takeover, breach actor | Browser-level localStorage only. No encryption, no access control on the demo. |
| Flow Rewards points balance | Fraudulent redemption · cost of goods | Fraudster, complicit staff | Members can be frozen; every adjustment is audit-logged. **No backend integrity check** — a tampered localStorage could fake any balance. |
| Booking / inventory data | Operational disruption · revenue loss | Insider, ransomware | Backed by localStorage in demo. Real backend needs daily backups + RBAC. |
| Partner payouts | Money lost via fake invoices / fraudulent partners | External impersonator | Multi-step approval flow exists in UI. Needs backend-side rules + dual approval + bank-account verification before any real payout. |
| Authentication credentials | Account takeover → all of the above | Phisher, brute-force | **None — there are no credentials yet.** |

---

## 2. PCI-DSS 4.0 gap analysis

The 12 requirements, mapped to where we stand. Anything marked 🔴 BLOCKS taking real card payments.

### 1. Install & maintain network security controls
- 🔴 No backend, so no network. **Future work:** segment the cardholder data environment (CDE) from everything else; use a web application firewall (WAF) in front of any API.

### 2. Apply secure configurations
- 🔴 No infrastructure yet.
- 🟢 The codebase is reasonable (no hard-coded secrets in source, no `eval`, no `dangerouslySetInnerHTML`).
- ✅ This commit adds CSP / X-Frame-Options / X-Content-Type-Options meta tags as a minimum baseline.

### 3. Protect stored account data
- 🟡 **Stripe Elements is integrated.** Card data is collected inside a Stripe-served iframe (origin `js.stripe.com`) and never touches Flow code. `createPaymentMethod()` returns only a `pm_xxx` token. This is the design that achieves PCI-DSS SAQ-A — the lowest, cheapest scope.
- 🔴 Final blocker: the server-side `stripe.paymentIntents.confirm()` call needs the secret key (`sk_live_*`) which MUST live on a backend. The example Express handler is documented in `src/lib/api.ts` (`payments.charge` JSDoc). Until the backend exists, charges cannot actually settle.
- 🟢 Removed all literal test PANs from JSX. Old plain `<input>` fields replaced with `<FlowStripeCard>` (the Stripe iframe component).

### 4. Protect cardholder data with strong cryptography during transmission
- 🟡 Demo runs over `http://localhost:5173`. Production MUST be HTTPS-only with HSTS preload, TLS 1.2 minimum (TLS 1.3 preferred), HTTP redirected to HTTPS at the edge.

### 5. Protect all systems against malware
- ⚪ N/A while there's no infrastructure.
- 🟢 npm dependencies are pinned via `package-lock.json`. Run `npm audit` regularly. Pin dependabot/renovate updates on the backend repo when it exists.

### 6. Develop and maintain secure systems
- 🟢 TypeScript strict mode catches a large class of bugs.
- 🟢 React 18 auto-escapes content; we do not use `dangerouslySetInnerHTML` anywhere.
- 🟢 Vitest tests prevent regressions on core logic (65 tests today).
- 🔴 No SAST (CodeQL / Semgrep) wired into CI yet. Add this on the backend repo.
- 🔴 No dependency-vulnerability scanning beyond `npm audit`. Add Snyk or Dependabot on both repos.

### 7. Restrict access to cardholder data by business need to know
- 🔴 Authorization is currently client-side only. **A user can change their role in localStorage and access any screen.** Real RBAC must live on the API server, enforced on every request.
- 🟢 The codebase does have a clean role model (`Role` type, `ROLE_HOMES`, sidebar filtering by role) that maps directly to backend-side RBAC.

### 8. Identify users and authenticate access
- 🔴 No real authentication. `loginAs(role)` is the demo's "auth". Required:
  - Email + password with bcrypt / argon2 server-side
  - Mandatory MFA (TOTP or WebAuthn) for SuperAdmin and Country Manager
  - Session tokens that are HttpOnly + Secure + SameSite=Strict cookies, NOT localStorage
  - Token rotation, idle timeout (15m), absolute timeout (8h)
  - Password complexity + breach checking via HaveIBeenPwned API
  - Account lockout after N failed attempts (rate-limited)

### 9. Restrict physical access to cardholder data
- ⚪ N/A — no physical systems involved.

### 10. Log and monitor all access to network resources and cardholder data
- 🟢 In-app audit log exists for the Rewards Manager (`/rewards/audit`). Same pattern should be applied to every admin action.
- 🔴 No backend logging exists. When the API is built, every request should log: timestamp, actor (user ID + IP + UA), action, target resource, success/failure. Logs go to a SIEM (Datadog, ELK, etc.) with 1-year retention.

### 11. Test security of systems regularly
- 🔴 No external pen-test yet. Required quarterly once production exists.
- 🔴 No ASV (Approved Scanning Vendor) quarterly scans yet — required for PCI quarterly cycle.

### 12. Support information security with organizational policies
- 🔴 No written security policy, incident response plan, or vendor management programme yet. Draft these alongside the backend rollout.

### Recommended PCI scope strategy

Use **SAQ-A** by ensuring Flow never touches cardholder data:
- All payment forms render via Stripe Elements (iframe).
- The iframe POSTs the card data directly to Stripe.
- Flow's server only sees a Stripe `payment_method` token (e.g., `pm_xxx`) and a charge result.
- Result: Flow's CDE shrinks to "we relay tokens to Stripe and store transaction IDs". This is the cheapest, lowest-risk PCI level.

---

## 3. OWASP Top 10 (2021) gap analysis

| # | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken access control | 🔴 | Role checks are entirely client-side; backend MUST enforce. |
| A02 | Cryptographic failures | 🔴 | No HTTPS in dev (fine); production MUST be HTTPS-only with HSTS. Card data passes through the React app (will be fixed by Stripe Elements). |
| A03 | Injection | 🟢 | React JSX prevents most XSS by default. We don't use `dangerouslySetInnerHTML`. No SQL because there's no DB yet. **Future:** parameterize every query, validate every input server-side. |
| A04 | Insecure design | 🟡 | The current design is a UI prototype — backend hardening is the entire next phase. Stripe Elements / RBAC server-side / WAF are all standard. |
| A05 | Security misconfiguration | 🟡 | Added CSP meta + frame-ancestors / X-Content-Type-Options in `index.html` this commit. Production deployment must add these as real HTTP headers. |
| A06 | Vulnerable & outdated components | 🟢 | All deps pinned in `package-lock.json`. Run `npm audit` regularly. Wire Dependabot when the repo is private. |
| A07 | Identification & auth failures | 🔴 | No real auth — see PCI §8 above. |
| A08 | Software & data integrity failures | 🟡 | No CI/CD yet; once built, sign all artifacts and verify provenance. SRI hashes for any CDN-loaded asset (we have none today). |
| A09 | Security logging & monitoring failures | 🟡 | Rewards audit exists in app. Need server-side logging on every endpoint. |
| A10 | SSRF | ⚪ | N/A in client-only build; check on every backend HTTP fetch. |

---

## 4. Regional data protection

### Uganda · Data Protection and Privacy Act 2019
- Register with the **Personal Data Protection Office (PDPO)** before processing any Ugandan resident's data.
- Appoint a Data Protection Officer (DPO).
- Cross-border transfers (e.g., guest data leaving Uganda to a Frankfurt cloud region) require either consent or DPO authorization.

### Congo-Brazzaville · Loi No. 29-2019 (data protection)
- Register processing with **ARPCE** (Agence de Régulation des Postes et Communications Électroniques) before commercial operations.
- Sensitive data (passport, biometrics) requires explicit written consent.

### Ethiopia · draft data law in progress
- Treat data subject rights as if GDPR applies — same posture is forward-compatible.

### South Africa (future market) · POPIA
- POPIA is broadly equivalent to GDPR. Appoint an Information Officer. Honour subject access requests within 30 days.

### GDPR (EU guests staying in our hotels)
- Even though we operate in Africa, any EU resident booking with us triggers GDPR. Specifically:
  - Right to access, right to be forgotten, right to data portability
  - 72-hour breach notification to supervisory authority
  - DPIA (Data Protection Impact Assessment) required for guest profiling
  - Standard Contractual Clauses for any data flowing through US-based services (e.g., Stripe US, Mapbox US, Datadog US)

### Practical checklist before launch
- [ ] Draft privacy notice (EN + FR) covering data collected, purposes, retention, subject rights
- [ ] Cookie consent banner with granular opt-in (analytics off by default)
- [ ] DPIA document on file for the booking flow + guest profile + Flow Rewards
- [ ] Data Processing Agreements with: Stripe, the hosting provider, the email vendor, any other sub-processor
- [ ] Subject access request workflow (who handles it, in how many days, how)
- [ ] Breach response runbook + named on-call owner

---

## 5a. Stripe integration — what's done and what's left

### Done
- `@stripe/stripe-js` and `@stripe/react-stripe-js` for the frontend; `stripe` (server SDK) for the function.
- `src/lib/stripe.ts` — lazy singleton that loads Stripe.js with the publishable key. Resolves from `VITE_STRIPE_PUBLISHABLE_KEY`; falls back to Stripe's public demo key with a visible banner.
- `src/components/flow/FlowStripeCard.tsx` — the Stripe `CardElement` iframe in Flow's brand styling. Submits via `stripe.createPaymentMethod()` and surfaces the `pm_xxx` token. Card data NEVER enters the Flow React app — it lives in the Stripe-served iframe at `js.stripe.com`.
- `Checkout.tsx` (guest flow) and `FlowPaymentModal.tsx` (staff flow) both render the iframe when method = "Visa / Mastercard".
- **`netlify/functions/payment-intents.ts`** — server-side Stripe bridge. Reads `STRIPE_SECRET_KEY` from env, validates input (amount bounds, `pm_xxx` format), creates and confirms the PaymentIntent, honours `Idempotency-Key`, distinguishes card declines (402) from server errors (500). Reached at `/api/payment-intents` via the rewrite in `netlify.toml`.
- `payments.charge()` calls the function via `fetch(PAYMENT_INTENTS_URL)` and falls back to the deterministic mock when `fetch` is unavailable (vitest) or the network fails (so the demo always completes end-to-end).
- Posture: PCI-3 now 🟢. PCI-3b 🟡 (live but missing caller auth). PCI-2 + PCI-4 🟢 thanks to edge-enforced CSP / HSTS via `netlify.toml`.

### Required before going live with real customer money
1. Set `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…` and `STRIPE_SECRET_KEY=sk_live_…` in Netlify → Site settings → Environment variables.
2. **Implement caller authentication on the function** — search for `AUTH-TODO` in `netlify/functions/payment-intents.ts`. Without this, anyone who can reach the URL can attempt a charge. Recommend a session cookie validated against your auth store, with the verified `userId` written into the Stripe `metadata`.
3. Build the Stripe webhook receiver at `POST /.netlify/functions/stripe-webhook` to handle `payment_intent.succeeded`, `payment_intent.payment_failed`, refunds, and disputes.
4. Verify webhook signatures with `stripe.webhooks.constructEvent()` and a `STRIPE_WEBHOOK_SECRET` env var.
5. Submit SAQ-A annually (Stripe makes this very lightweight when Elements is used correctly).

### Test cards (Stripe-provided, safe to use)
- `4242 4242 4242 4242` — always succeeds
- `4000 0027 6000 3184` — triggers 3-D Secure / SCA flow
- `5555 5555 5555 4444` — Mastercard success
- `4000 0000 0000 9995` — declined (insufficient funds)
- Any future expiry (e.g. 12/34), any 3-digit CVC, any postcode

---

## 5. What's been hardened in this commit

The frontend changes shipped today:

1. **CSP meta tag** added to `index.html` with a conservative `default-src 'self'` policy. Allows inline styles (Tailwind injection requires it) and inline scripts only via specific `'unsafe-inline'` for the tailwind script tag in dev. Production should serve CSP via HTTP header instead.

2. **Removed literal test card numbers from JSX**. `FlowPaymentModal` and `Checkout.tsx` no longer hard-code `4242 4242 4242 4242` as `defaultValue`. Replaced with masked placeholders + a runtime warning when the input is rendered in non-test environments.

3. **Input length limits** added to PAN, CVV, expiry, phone, passport — preventing pathological 10MB strings from being entered.

4. **`autoComplete="off"` / `inputMode="numeric"`** set on card inputs so browser password managers don't store the PAN.

5. **`/admin/security` dashboard** added — a SuperAdmin-visible status page summarizing this document at a glance, with checkboxes for the remediation roadmap and the audit-log links to existing controls.

6. **Validation utilities** in `src/lib/security.ts`:
   - Luhn check on PANs (client-side sanity, NOT compliance)
   - Email regex (RFC-5322 simplified)
   - Phone E.164 sanity
   - Strict-length guard for free-text fields

7. **Documentation** — this file. Track every gap, blocker, and owner here.

These don't make the app PCI-compliant. They reduce the attack surface and produce a clear paper trail of where compliance work begins.

---

## 5b. Messaging + document sharing — security considerations

A direct-messaging surface introduces real attack vectors. Today's
implementation is a frontend prototype with a mock backend, so most of
the items below are unmitigated. Track each before live deployment.

### What's already shipped (frontend hygiene)
- Server-side scoping (mocked): `listConversations({ participantId })`
  filters threads to ones the participant is a member of. SuperAdmin
  gets full visibility for compliance.
- `send()` rejects messages from non-participants — even via the API.
- Message body capped at 4 000 chars; attachment size capped at 10 MB.
- React JSX auto-escapes message bodies → no stored XSS via message
  content. `whitespace-pre-wrap` preserves line breaks without
  `dangerouslySetInnerHTML`.
- `readBy` array is server-managed (in the mock); clients can't forge
  a read receipt for someone else.
- Attachment metadata only — no bytes round-trip through Flow today.

### What must be added before live launch

| | |
|---|---|
| **Server-side authorization** | Re-check participant membership on every `GET /api/conversations/:id` and `POST /messages`. Trusting the client list is unsafe. |
| **End-to-end TLS** | All `connect-src` to the messaging endpoint must be TLS 1.3 with HSTS. |
| **At-rest encryption** | DB column-level encryption for `messages.body`. KMS-managed keys rotated annually. |
| **PII scanning on uploads** | When `documents.upload` hits real S3, scan with ClamAV (malware) + a PII pattern scanner (PANs / passport numbers). Reject when found. |
| **Webhook signature verification** | If we integrate with WhatsApp Business, Twilio, etc., validate every webhook with HMAC. |
| **Rate limiting** | `POST /messages` capped to ~30/min per user. Rapid send → throttle → captcha. |
| **Audit log** | Every message send + attachment upload + read receipt → audit log with actor, IP, UA. |
| **Right to be forgotten** | GDPR / POPIA require deletable-by-subject. Soft-delete + 30-day purge + audit retention of the deletion itself. |
| **Retention policy** | Default 7 years (tax window). Older messages tier-down to cheaper storage; subject can request earlier deletion. |
| **Reporting / abuse** | "Report this conversation" button → moderation queue. Required for guest-facing channels. |
| **Push notifications** | Server-side templating; never include PAN / token / password in the notification body. |

### Compliance posture impact

The messaging surface adds three concerns:

- **PII in transit** — messages frequently contain passport numbers, booking refs, and other identifiers. They MUST be TLS 1.3 + at-rest encrypted.
- **Subject Access Requests** — must include message history when a guest invokes their GDPR / POPIA right of access.
- **Cross-border data flows** — a partner in Senegal messaging a Flow staff member in Uganda is a cross-border transfer. DPAs with each partner cover this.

These are tracked in `src/lib/security.ts` as new controls `msg-*`
which appear in `/admin/security`.

---

## 6. Remediation roadmap

Ordered by what blocks live traffic. Each item should be a separate ticket once the backend repo exists.

### P0 — Blocks any real money or guest data

1. **Build the backend service** — Node / Python / Go API behind a WAF, deployed on a managed cloud region in or near Africa. Datadog or equivalent for logs/metrics.
2. **Replace `loginAs` with real auth** — email/password (argon2), mandatory TOTP for staff, HttpOnly cookies, idle + absolute timeouts.
3. ✅ **Wire Stripe Elements** — DONE. Card data is collected via the Stripe-served iframe; `pm_xxx` tokens are the only card-related identifier in Flow code.
4. ✅ **Implement the Stripe backend bridge** — DONE as a Netlify Function at `netlify/functions/payment-intents.ts`. Validates input, confirms intents server-side with `STRIPE_SECRET_KEY`, honours `Idempotency-Key`. Remaining sub-item: add caller auth (see `AUTH-TODO` markers in the function) before exposing to real customers.
5. **Server-side RBAC** — re-enforce every action server-side. Client role is a hint, not a gate.
6. ✅ **HTTPS + HSTS** — DONE. Netlify auto-provisions TLS 1.3 and `Strict-Transport-Security` is set via `netlify.toml`.
7. **Set the publishable key via env var** — `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…` in production; the public demo key in this commit must not ship to live traffic.

### P1 — Required for compliance attestation

6. **Audit logging on every endpoint** — actor, action, target, success/failure, IP, UA. 1-year retention.
7. **Quarterly ASV scans** — pick a PCI ASV (Trustwave, Qualys, etc.).
8. **Annual SAQ-A submission** (assuming Stripe-only payment path).
9. **External pen-test** — annual + after any major release.
10. **Vulnerability management** — Snyk or Dependabot on both repos.
11. **Backup + DR** — daily DB snapshots, restore drills quarterly.

### P2 — Standard hygiene

12. **WAF + DDoS** — Cloudflare or AWS WAF.
13. **SAST in CI** — CodeQL or Semgrep blocking merges on critical findings.
14. **Secret scanning** — Gitleaks pre-commit hook + GitHub secret scanning.
15. **Email/domain hardening** — DMARC `p=quarantine` minimum, SPF, DKIM.
16. **Subdomain takeover protection** — point-of-CNAME inventory + monitoring.

### P3 — Privacy compliance

17. **Privacy notice + cookie banner**.
18. **DPIA for booking + rewards**.
19. **DPAs signed with every sub-processor**.
20. **Subject access request runbook**.
21. **Country-specific registrations** — UG PDPO, CG ARPCE, etc.

---

## 7. How to use the in-app `/admin/security` dashboard

SuperAdmin can navigate to **Settings → Security** (also available at `/admin/security`).

The dashboard shows:
- Overall posture summary (🔴 / 🟡 / 🟢 by category)
- The full PCI-DSS / OWASP / regional-regs checklist with current status
- Recent audit activity (from the Rewards audit log; will expand to all admin actions in a follow-up)
- A short-circuit "Open SECURITY.md" link for the full text

The dashboard's data is sourced from `src/lib/security.ts` so future updates to the posture only require touching that single file. Each control row has a documented status, owner, due date, and remediation link.

---

## 8. Reporting a vulnerability

There is no live deployment yet. When one exists, the recommended disclosure path is:
- Public: a `SECURITY.md` and `security.txt` (RFC 9116) on the production domain
- Private: `security@flowrentals.com` (PGP key published on the website)
- Bug bounty: HackerOne or Intigriti once the surface area justifies it

For this repo specifically: open a private issue and tag the co-founders.

---

*This document is a living artefact. Update it after every architectural change. Last updated: 12 May 2026.*
