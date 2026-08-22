/**
 * Client-side security utilities + the compliance posture data that
 * drives /admin/security. Mirrors SECURITY.md for in-app display.
 *
 * IMPORTANT: client-side checks are sanity / UX, NOT compliance.
 * Real PCI / GDPR enforcement happens on the backend.
 */

export type ControlStatus = 'red' | 'amber' | 'green' | 'na'

export interface ControlRow {
  id: string
  title: string
  status: ControlStatus
  category: 'PCI-DSS' | 'OWASP' | 'Auth' | 'Privacy' | 'Infra' | 'Cryptography'
  owner: 'Engineering' | 'Operations' | 'Security' | 'Legal' | 'TBD'
  notes: string
}

/**
 * Source of truth for the in-app dashboard. Update this when a control
 * moves status. Mirror in SECURITY.md when material.
 */
export const SECURITY_CONTROLS: ControlRow[] = [
  // PCI-DSS
  { id:'pci-1',  category:'PCI-DSS', status:'red',   owner:'Engineering', title:'Network segmentation + WAF',                    notes:'Requires backend. Use Cloudflare or AWS WAF in front of API.' },
  { id:'pci-2',  category:'PCI-DSS', status:'green', owner:'Engineering', title:'Secure baseline configuration',                  notes:'CSP / HSTS / X-Frame-Options / Referrer-Policy / Permissions-Policy enforced as edge response headers via netlify.toml in addition to meta tags.' },
  { id:'pci-3',  category:'PCI-DSS', status:'green', owner:'Engineering', title:'No card data stored on Flow systems',            notes:'Stripe Elements iframe handles all PAN entry · server-side confirm now live via Netlify Function · card data never touches Flow code or Flow infra.' },
  { id:'pci-3b', category:'PCI-DSS', status:'amber', owner:'Engineering', title:'Backend bridge for Stripe `paymentIntents.confirm`', notes:'Live at /api/payment-intents (netlify/functions/payment-intents.ts) · creates + confirms intents server-side with STRIPE_SECRET_KEY · idempotency-key honoured · still needs caller auth (AUTH-TODO marker) before production traffic.' },
  { id:'pci-4',  category:'PCI-DSS', status:'green', owner:'Engineering', title:'TLS 1.2+ everywhere',                            notes:'Netlify auto-provisions TLS 1.3 · HSTS preload header set via netlify.toml.' },
  { id:'pci-5',  category:'PCI-DSS', status:'na',    owner:'Operations',  title:'Anti-malware',                                   notes:'N/A until infra exists.' },
  { id:'pci-6',  category:'PCI-DSS', status:'amber', owner:'Engineering', title:'Secure SDLC',                                    notes:'TypeScript strict + Vitest + React JSX escaping. Need SAST + Dependabot.' },
  { id:'pci-7',  category:'PCI-DSS', status:'red',   owner:'Engineering', title:'RBAC enforced server-side',                      notes:'Currently client-side only. localStorage tampering bypasses everything.' },
  { id:'pci-8',  category:'PCI-DSS', status:'red',   owner:'Engineering', title:'Real authentication',                            notes:'loginAs(role) is demo-only. Need password + MFA.' },
  { id:'pci-9',  category:'PCI-DSS', status:'na',    owner:'Operations',  title:'Physical access',                                notes:'N/A · cloud-only.' },
  { id:'pci-10', category:'PCI-DSS', status:'amber', owner:'Engineering', title:'Audit logging',                                  notes:'Rewards audit log live. Extend to every admin action with backend.' },
  { id:'pci-11', category:'PCI-DSS', status:'red',   owner:'Security',    title:'Quarterly ASV + annual pen-test',                notes:'Required for SAQ-A attestation.' },
  { id:'pci-12', category:'PCI-DSS', status:'red',   owner:'Legal',       title:'Written security policy + IR plan',              notes:'Draft alongside backend rollout.' },

  // OWASP Top 10 (highlights)
  { id:'owasp-a01', category:'OWASP', status:'red',   owner:'Engineering', title:'A01 · Access control (server-side)',           notes:'Tied to PCI-7. Backend must re-check every action.' },
  { id:'owasp-a02', category:'OWASP', status:'red',   owner:'Engineering', title:'A02 · Cryptographic failures',                 notes:'Tied to PCI-3 + PCI-4.' },
  { id:'owasp-a03', category:'OWASP', status:'green', owner:'Engineering', title:'A03 · Injection',                              notes:'React escapes JSX · no dangerouslySetInnerHTML · no DB yet.' },
  { id:'owasp-a05', category:'OWASP', status:'amber', owner:'Engineering', title:'A05 · Security misconfiguration',              notes:'CSP added · production needs real HTTP headers + WAF.' },
  { id:'owasp-a06', category:'OWASP', status:'green', owner:'Engineering', title:'A06 · Vulnerable / outdated components',       notes:'Deps pinned · run `npm audit` regularly. Wire Dependabot when private.' },
  { id:'owasp-a07', category:'OWASP', status:'red',   owner:'Engineering', title:'A07 · Identification & auth failures',         notes:'Tied to PCI-8.' },
  { id:'owasp-a08', category:'OWASP', status:'amber', owner:'Engineering', title:'A08 · Software & data integrity',              notes:'No CI/CD yet; sign all artifacts when built.' },
  { id:'owasp-a09', category:'OWASP', status:'amber', owner:'Engineering', title:'A09 · Logging & monitoring',                   notes:'Rewards audit only · extend to all actions.' },

  // Auth
  { id:'auth-mfa',    category:'Auth', status:'red',   owner:'Engineering', title:'Mandatory MFA for staff',                     notes:'TOTP or WebAuthn for all manager roles.' },
  { id:'auth-cookies',category:'Auth', status:'red',   owner:'Engineering', title:'HttpOnly + Secure + SameSite cookies',         notes:'Today: session is in localStorage · XSS-stealable. Move to cookies on the backend.' },
  { id:'auth-timeout',category:'Auth', status:'red',   owner:'Engineering', title:'Idle + absolute session timeout',              notes:'15m idle, 8h absolute. Tokens rotate on refresh.' },

  // Privacy / regional regs
  { id:'priv-ug',  category:'Privacy', status:'red',   owner:'Legal', title:'Québec PDPO registration',         notes:'Before processing any Québécois resident data.' },
  { id:'priv-cg',  category:'Privacy', status:'red',   owner:'Legal', title:'Québec ARPCE registration',          notes:'Required before commercial operations.' },
  { id:'priv-loi25', category:'Privacy', status:'red', owner:'Legal', title:'Loi 25 privacy officer (Québec)', notes:'Québec requires a named privacy officer and breach register; GDPR posture kept for EU guests.' },
  { id:'priv-gdpr', category:'Privacy', status:'red',  owner:'Legal', title:'GDPR for EU guests',                notes:'Even though we operate in Canada, any EU resident booking with us triggers GDPR.' },
  { id:'priv-dpia',  category:'Privacy', status:'red', owner:'Legal', title:'DPIA on booking + rewards flows',    notes:'Required before live processing.' },
  { id:'priv-cookie',category:'Privacy', status:'red', owner:'Engineering', title:'Cookie consent banner', notes:'Analytics off by default · granular per-category opt-in.' },
  { id:'priv-dpa',  category:'Privacy', status:'red',  owner:'Legal', title:'Data Processing Agreements with sub-processors', notes:'Stripe, hosting provider, email vendor, etc.' },

  // Infra
  { id:'infra-backup',  category:'Infra', status:'red',  owner:'Engineering', title:'Backups + DR drills',         notes:'Daily snapshots · restore drill quarterly.' },
  { id:'infra-waf',     category:'Infra', status:'red',  owner:'Engineering', title:'WAF + DDoS protection',       notes:'Cloudflare or AWS WAF.' },
  { id:'infra-sast',    category:'Infra', status:'red',  owner:'Engineering', title:'SAST in CI',                  notes:'CodeQL or Semgrep blocking on critical findings.' },
  { id:'infra-secrets', category:'Infra', status:'red',  owner:'Engineering', title:'Secret scanning',             notes:'Gitleaks pre-commit + GitHub secret scanning.' },
  { id:'infra-dmarc',   category:'Infra', status:'red',  owner:'Operations',  title:'DMARC / SPF / DKIM',          notes:'Minimum p=quarantine. Monitor reports.' },

  // Cryptography
  { id:'crypto-passwd', category:'Cryptography', status:'red', owner:'Engineering', title:'Password hashing (argon2)', notes:'On the backend when built.' },
  { id:'crypto-rest',   category:'Cryptography', status:'red', owner:'Engineering', title:'Encryption at rest',         notes:'DB-level encryption + KMS-managed keys.' },

  // Messaging
  { id:'msg-scope',   category:'Privacy', status:'amber', owner:'Engineering', title:'Server-side conversation scoping', notes:'Mocked today · re-check participant membership on every API call when backend exists.' },
  { id:'msg-tls',     category:'Cryptography', status:'red', owner:'Engineering', title:'TLS for messaging traffic',     notes:'Tied to pci-4 · all message endpoints must be TLS 1.3.' },
  { id:'msg-rest',    category:'Cryptography', status:'red', owner:'Engineering', title:'Column-level encryption for message body', notes:'KMS-managed key · rotated annually.' },
  { id:'msg-clamav',  category:'Infra', status:'red', owner:'Engineering', title:'ClamAV + PII scan on uploads',         notes:'Reject attachments containing PAN / passport patterns. Block known-malware hashes.' },
  { id:'msg-rate',    category:'Infra', status:'red', owner:'Engineering', title:'Message + upload rate limiting',       notes:'~30 sends/min per user. Burst protection on attachments.' },
  { id:'msg-audit',   category:'Privacy', status:'red', owner:'Engineering', title:'Message audit log',                  notes:'Every send + upload + read receipt → audit log with actor / IP / UA.' },
  { id:'msg-rtbf',    category:'Privacy', status:'red', owner:'Legal',       title:'Right to be forgotten (messages)',   notes:'Soft-delete + 30-day purge + audit retention of the deletion itself.' },
  { id:'msg-retain',  category:'Privacy', status:'red', owner:'Legal',       title:'Retention policy (messages)',         notes:'Default 7 years per Canadian tax windows · subject can request earlier deletion.' },
]

export function postureSummary() {
  const counts = SECURITY_CONTROLS.reduce((acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc },
    { red: 0, amber: 0, green: 0, na: 0 } as Record<ControlStatus, number>)
  return counts
}

/* ------------------------------------------------------------------ */
/* Validation utilities                                               */
/* ------------------------------------------------------------------ */

/**
 * Luhn check — verifies the integer pattern of a Primary Account Number (PAN).
 * Client-side sanity only. Does NOT validate that the PAN belongs to an issuer
 * or that it can be charged. Required server-side validation lives at Stripe.
 */
export function luhnValid(pan: string): boolean {
  const digits = pan.replace(/\D/g, '')
  if (digits.length < 12 || digits.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export function isEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

const PHONE_RE = /^\+[1-9]\d{6,14}$/

export function isE164Phone(phone: string): boolean {
  return PHONE_RE.test(phone.replace(/\s+/g, ''))
}

/**
 * Strict length cap. Use on free-text fields to block 10MB pastes from
 * eating browser memory before the server-side validator gets a turn.
 */
export function capLength(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max)
}

/**
 * Returns `value` if it passes max-length, otherwise the truncated value.
 * Use as an onChange transform on inputs:
 *   onChange={(e) => setX(safeInput(e.target.value, 200))}
 */
export const safeInput = capLength

/**
 * Standard maximum lengths for common input fields.
 */
export const MAX_LEN = {
  email: 254,         // RFC 5321
  name: 100,
  phone: 16,          // +countrycode + 15 digits
  passport: 32,
  pan: 19,            // longest known issuer length
  cvv: 4,
  expiry: 5,          // MM/YY
  notes: 2000,
  address: 200,
}
