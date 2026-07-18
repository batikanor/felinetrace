export type HypothesisId = 'F-01' | 'F-02' | 'F-03' | 'F-04' | 'X-05'
export type CoverageState = 'supports' | 'contradicts' | 'pending' | 'rejected'
export type ActionKind = 'core' | 'cognee' | 'tavily' | 'codex'

export type CoverageRow = {
  claim: string
  evidence: string
  state: CoverageState
  sourceIds: string[]
}

export type InvestigationAction = {
  id: string
  kind: ActionKind
  label: string
  minutes: number
  cost: number
  costLabel: string
  privacy: string
  voi: number
  coverageGain: number
  uncertaintyDrop: number
  why: string
  sourceIds: string[]
}

export type InvestigationHypothesis = {
  id: HypothesisId
  category: string
  title: string
  amount: string
  baseCoverage: number
  baseUncertainty: number
  evidenceRows: CoverageRow[]
  actions: InvestigationAction[]
  holdReason?: string
}

export const investigationHypotheses: InvestigationHypothesis[] = [
  {
    id: 'F-01',
    category: 'FRAUD RISK',
    title: 'Ratio payment chain',
    amount: '€295,120',
    baseCoverage: 69,
    baseUncertainty: 31,
    evidenceRows: [
      { claim: 'Vendor ownership', evidence: 'Created + approved by MV-U05', state: 'supports', sourceIds: ['master-data'] },
      { claim: 'Segregation', evidence: 'Create · post · pay rights', state: 'supports', sourceIds: ['permissions-u05'] },
      { claim: 'Cash chain', evidence: '5 invoices + 5 payments', state: 'supports', sourceIds: ['ratio-ledger'] },
      { claim: 'Service delivery', evidence: '0 receipt records', state: 'contradicts', sourceIds: ['ratio-receipt-search'] },
      { claim: 'Bank owner + contract', evidence: 'Not in dossier', state: 'pending', sourceIds: ['master-data', 'ratio-ledger'] },
    ],
    actions: [
      {
        id: 'F01-A1', kind: 'core', label: 'Confirm bank owner + contract', minutes: 8, cost: 0, costLabel: 'local', privacy: 'Local dossier', voi: 92,
        coverageGain: 18, uncertaintyDrop: 20, why: 'Closes the only identity and service-support gap with direct evidence.',
        sourceIds: ['master-data', 'ratio-ledger', 'ratio-receipt-search'],
      },
      {
        id: 'F01-A2', kind: 'cognee', label: 'Recall vendor ↔ user relationships', minutes: 2, cost: 1, costLabel: '1 recall', privacy: 'Names + IDs', voi: 67,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Finds repeated entity/user links across prior local workpapers.',
        sourceIds: ['master-data', 'permissions-u05'],
      },
      {
        id: 'F01-A3', kind: 'tavily', label: 'Check official company record', minutes: 3, cost: 1, costLabel: '1 basic search', privacy: 'Legal name', voi: 55,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Corroborates legal identity; it cannot prove services were delivered.',
        sourceIds: ['master-data'],
      },
      {
        id: 'F01-A4', kind: 'codex', label: 'Run local skeptic pass', minutes: 1, cost: 1, costLabel: '1 review run', privacy: 'Dossier excerpts', voi: 42,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Challenges the inference and proposes missing counterevidence.',
        sourceIds: ['ratio-ledger', 'ratio-receipt-search'],
      },
    ],
  },
  {
    id: 'F-02',
    category: 'CLASSIFICATION',
    title: 'Repair-like capex',
    amount: '€150,800',
    baseCoverage: 76,
    baseUncertainty: 24,
    evidenceRows: [
      { claim: 'Repair wording', evidence: '6 repair/overhaul assets', state: 'supports', sourceIds: ['asset-register'] },
      { claim: 'Accounting treatment', evidence: '6 acquisitions · €150.8K', state: 'supports', sourceIds: ['asset-bookings'] },
      { claim: 'Financial impact', evidence: 'Sachanlagen €19.73M', state: 'supports', sourceIds: ['annual-statement'] },
      { claim: 'Recognition criteria', evidence: 'Work orders missing', state: 'pending', sourceIds: ['asset-register', 'asset-bookings'] },
    ],
    actions: [
      {
        id: 'F02-A1', kind: 'core', label: 'Inspect six invoices + work orders', minutes: 10, cost: 0, costLabel: 'local', privacy: 'Local dossier', voi: 88,
        coverageGain: 15, uncertaintyDrop: 17, why: 'Directly distinguishes repair expense from future-benefit enhancement.',
        sourceIds: ['asset-register', 'asset-bookings', 'annual-statement'],
      },
      {
        id: 'F02-A2', kind: 'cognee', label: 'Recall asset ↔ vendor patterns', minutes: 2, cost: 1, costLabel: '1 recall', privacy: 'Asset + vendor IDs', voi: 58,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Surfaces repeated capitalization patterns for the same equipment or vendor.',
        sourceIds: ['asset-register', 'asset-bookings'],
      },
      {
        id: 'F02-A3', kind: 'codex', label: 'Run recognition skeptic', minutes: 1, cost: 1, costLabel: '1 review run', privacy: 'Dossier excerpts', voi: 40,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Checks whether the wording alone supports the accounting conclusion.',
        sourceIds: ['asset-register', 'asset-bookings'],
      },
    ],
  },
  {
    id: 'F-03',
    category: 'CUT-OFF',
    title: 'December costs in January',
    amount: '€192,000',
    baseCoverage: 82,
    baseUncertainty: 18,
    evidenceRows: [
      { claim: 'December receipt', evidence: '8 open receipts · €192K', state: 'supports', sourceIds: ['open-receipts'] },
      { claim: 'January invoice', evidence: '8 exact service-date matches', state: 'supports', sourceIds: ['january-invoices'] },
      { claim: '2025 posting', evidence: '0 matching invoice references', state: 'contradicts', sourceIds: ['cutoff-ledger-search'] },
      { claim: 'Accrual offset', evidence: '€86.5K has none of the refs', state: 'rejected', sourceIds: ['december-accrual'] },
      { claim: 'Remaining January AP', evidence: 'Not yet extended', state: 'pending', sourceIds: ['january-invoices'] },
    ],
    actions: [
      {
        id: 'F03-A1', kind: 'core', label: 'Extend reference match across January AP', minutes: 6, cost: 0, costLabel: 'local', privacy: 'Local dossier', voi: 95,
        coverageGain: 12, uncertaintyDrop: 13, why: 'Measures whether the exact eight-item exception extends beyond the known sample.',
        sourceIds: ['open-receipts', 'january-invoices', 'cutoff-ledger-search', 'december-accrual'],
      },
      {
        id: 'F03-A2', kind: 'codex', label: 'Challenge the cut-off logic', minutes: 1, cost: 1, costLabel: '1 review run', privacy: 'Dossier excerpts', voi: 36,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Looks for alternative matching keys without overriding the exact-reference test.',
        sourceIds: ['january-invoices', 'cutoff-ledger-search', 'december-accrual'],
      },
    ],
  },
  {
    id: 'F-04',
    category: 'CONTROL',
    title: 'Approval threshold split',
    amount: '€39,040',
    baseCoverage: 88,
    baseUncertainty: 12,
    evidenceRows: [
      { claim: 'Payment grouping', evidence: 'Same date + reference · 4 items', state: 'supports', sourceIds: ['split-payments'] },
      { claim: 'Approval threshold', evidence: 'Second approval at €10K', state: 'supports', sourceIds: ['audit-plan'] },
      { claim: 'User capability', evidence: 'MV-U11 can post + pay', state: 'supports', sourceIds: ['permissions-u11'] },
      { claim: 'Batch approval trail', evidence: 'Not in dossier', state: 'pending', sourceIds: ['split-payments', 'audit-plan'] },
    ],
    actions: [
      {
        id: 'F04-A1', kind: 'core', label: 'Retrieve grouped approval trail', minutes: 5, cost: 0, costLabel: 'local', privacy: 'Local dossier', voi: 81,
        coverageGain: 8, uncertaintyDrop: 9, why: 'Tests the only remaining possibility: a second approval outside the journal rows.',
        sourceIds: ['split-payments', 'audit-plan', 'permissions-u11'],
      },
      {
        id: 'F04-A2', kind: 'cognee', label: 'Recall same-reference payment groups', minutes: 2, cost: 1, costLabel: '1 recall', privacy: 'Payment metadata', voi: 49,
        coverageGain: 0, uncertaintyDrop: 0, why: 'Checks whether the pattern repeats across locally indexed workpapers.',
        sourceIds: ['split-payments'],
      },
    ],
  },
  {
    id: 'X-05',
    category: 'DECOY · HOLD',
    title: '€86.5K accrual offsets December invoices',
    amount: 'Rejected',
    baseCoverage: 100,
    baseUncertainty: 0,
    evidenceRows: [
      { claim: 'Invoices to offset', evidence: 'ER901427–ER901434', state: 'supports', sourceIds: ['january-invoices'] },
      { claim: '2025 reference match', evidence: 'No matching posting or accrual', state: 'contradicts', sourceIds: ['cutoff-ledger-search'] },
      { claim: '€86.5K accrual link', evidence: 'No invoice or receipt references', state: 'contradicts', sourceIds: ['december-accrual'] },
      { claim: 'Offset hypothesis', evidence: 'Exact-reference mismatch', state: 'rejected', sourceIds: ['cutoff-ledger-search', 'december-accrual'] },
    ],
    actions: [],
    holdReason: 'Hold / reject. Sources [10–11] contain none of ER901427–434 or WE400840–847; no further test has positive value.',
  },
]

export const actionKindLabels: Record<ActionKind, string> = {
  core: 'Dossier',
  cognee: 'Cognee',
  tavily: 'Official records',
  codex: 'Codex skeptic',
}
