export type AuthorityTier = 'T1' | 'T2' | 'T3'
export type PublicCheckStatus = 'corroborates' | 'review' | 'no-sample-hit'
export type PublicRouterKey = 'register' | 'vies' | 'sanctions' | 'filings' | 'open-web'

export type PublicRouter = {
  key: PublicRouterKey
  label: string
  detail: string
  tier: string
}

export type PublicCheckResult = {
  id: string
  entityId: string
  entity: string
  router: PublicRouterKey
  title: string
  status: PublicCheckStatus
  tier: AuthorityTier
  authority: string
  query: string
  snippet: string
  dossierLink: string
  url: string
  retrievedAt: string
  score: number
}

export const publicRouters: PublicRouter[] = [
  { key: 'register', label: 'Company register', detail: 'Handelsregister', tier: 'T1' },
  { key: 'vies', label: 'VIES VAT', detail: 'EU validation', tier: 'T1' },
  { key: 'sanctions', label: 'EU sanctions', detail: 'Name screening', tier: 'T1' },
  { key: 'filings', label: 'Official filings', detail: 'Bundesanzeiger', tier: 'T1' },
  { key: 'open-web', label: 'Open web / domain', detail: 'Short allowlist', tier: 'T2–T3' },
]

export const publicEntities = [
  { id: 'ratio', label: 'Ratio Consulting GmbH' },
  { id: 'castor', label: 'Castor Papier' },
  { id: 'muster', label: 'Muster Verpackungen GmbH' },
]

export const publicCheckResults: PublicCheckResult[] = [
  {
    id: 'PC-01',
    entityId: 'ratio',
    entity: 'Ratio Consulting GmbH',
    router: 'register',
    title: 'Legal-name candidate',
    status: 'review',
    tier: 'T1',
    authority: 'Handelsregister',
    query: '"Ratio Consulting GmbH" Germany register',
    snippet: 'Replay fixture: a legal-name candidate is returned; a current register extract is still required.',
    dossierLink: 'Vendor 209101 · source [1]',
    url: 'https://www.handelsregister.de/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.92,
  },
  {
    id: 'PC-02',
    entityId: 'ratio',
    entity: 'Ratio Consulting GmbH',
    router: 'vies',
    title: 'VAT response shape',
    status: 'review',
    tier: 'T1',
    authority: 'European Commission · VIES',
    query: 'Validate configured DE VAT ID and legal-name response',
    snippet: 'Replay fixture: the VAT request is routed, but no current VIES response is bundled with this demo.',
    dossierLink: 'Vendor master · source [1]',
    url: 'https://ec.europa.eu/taxation_customs/vies/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.9,
  },
  {
    id: 'PC-03',
    entityId: 'ratio',
    entity: 'Ratio Consulting GmbH',
    router: 'sanctions',
    title: 'No fixture-name hit',
    status: 'no-sample-hit',
    tier: 'T1',
    authority: 'EU Sanctions Map',
    query: 'Exact and normalized legal name · Ratio Consulting GmbH',
    snippet: 'Replay fixture: no matching name is stored. This is not a live sanctions clearance.',
    dossierLink: 'Identity follow-up · finding F-01',
    url: 'https://www.sanctionsmap.eu/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.96,
  },
  {
    id: 'PC-04',
    entityId: 'ratio',
    entity: 'Ratio Consulting GmbH',
    router: 'open-web',
    title: 'Corporate domain unresolved',
    status: 'review',
    tier: 'T3',
    authority: 'Open web · allowlisted domains',
    query: '"Ratio Consulting GmbH" official website services',
    snippet: 'Replay fixture: low-score pages remain below the inclusion threshold; no corporate domain is asserted.',
    dossierLink: 'Missing service evidence · sources [3–4]',
    url: 'https://example.com/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.54,
  },
  {
    id: 'PC-05',
    entityId: 'castor',
    entity: 'Castor Papier',
    router: 'register',
    title: 'Entity spelling candidate',
    status: 'corroborates',
    tier: 'T1',
    authority: 'Handelsregister',
    query: '"Castor Papier" Germany register',
    snippet: 'Replay fixture: one normalized-name candidate supports the entity spelling used in the ledger.',
    dossierLink: 'Payment group · source [12]',
    url: 'https://www.handelsregister.de/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.88,
  },
  {
    id: 'PC-06',
    entityId: 'castor',
    entity: 'Castor Papier',
    router: 'open-web',
    title: 'Invoice context not established',
    status: 'review',
    tier: 'T2',
    authority: 'Publisher / owned-domain check',
    query: 'site:verified-domain.example "SAMMEL-200007"',
    snippet: 'Replay fixture: no source is promoted as invoice support; obtain the underlying invoice directly.',
    dossierLink: 'Split-payment test · sources [12–14]',
    url: 'https://example.com/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.72,
  },
  {
    id: 'PC-07',
    entityId: 'muster',
    entity: 'Muster Verpackungen GmbH',
    router: 'filings',
    title: 'Filing endpoint candidate',
    status: 'corroborates',
    tier: 'T1',
    authority: 'Unternehmensregister',
    query: 'Muster Verpackungen GmbH annual filing 2025',
    snippet: 'Replay fixture: the official filing route is retained; figures still come from the supplied dossier extract.',
    dossierLink: 'Annual statement · source [7]',
    url: 'https://www.unternehmensregister.de/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.94,
  },
  {
    id: 'PC-08',
    entityId: 'muster',
    entity: 'Muster Verpackungen GmbH',
    router: 'open-web',
    title: 'Owned-domain context',
    status: 'corroborates',
    tier: 'T2',
    authority: 'Company-owned domain fixture',
    query: 'site:verified-domain.example Muster Verpackungen',
    snippet: 'Replay fixture: an owned-domain result is retained only as context, never as audit evidence.',
    dossierLink: 'Company identity · working paper',
    url: 'https://example.com/',
    retrievedAt: 'Fixture · 2026-07-18T09:00:00Z',
    score: 0.84,
  },
]

export const publicStatusLabels: Record<PublicCheckStatus, string> = {
  corroborates: 'Corroborates',
  review: 'Review',
  'no-sample-hit': 'No sample hit',
}
