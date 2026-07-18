import { findings } from './caseData'
import type { Source } from './caseData'

export type ReviewStatus = 'queued' | 'running' | 'complete' | 'accepted' | 'rejected'

export type ReviewResult = {
  verdict: 'supported' | 'needs_follow_up' | 'control_exception' | 'draft_ready'
  amountEur: number
  summary: string
  patchText: string
  target: string
  commands: string[]
  trace: string[]
}

export type ReviewTask = {
  id: string
  title: string
  scope: string
  status: ReviewStatus
  sources: Source[]
  result: ReviewResult
}

export const initialReviewTasks: ReviewTask[] = [
  {
    id: 'T-01',
    title: 'Challenge amount',
    scope: 'F-03 · Cut-off · €192,000',
    status: 'complete',
    sources: findings[2].sources,
    result: {
      verdict: 'supported',
      amountEur: 192000,
      summary: '8 December receipts tie to 8 January invoices; no matching 2025 posting.',
      patchText: 'Eight December receipts and their January invoices total €192,000. No matching 2025 posting was found. The €86,500 accrual uses different references and does not offset the cut-off error.',
      target: 'report.section[3]',
      commands: [
        'rg -n "ER901427|ER901434" evidence/Sachkontobuchungen.txt',
        'rg -n "WE400840|WE400847" evidence/Wareneingangsliste_2025.csv',
      ],
      trace: ['Evidence manifest sealed', 'Read-only sandbox started', '2 searches inspected', 'Output schema validated'],
    },
  },
  {
    id: 'T-02',
    title: 'Search counterevidence',
    scope: 'F-01 · Ratio Consulting',
    status: 'queued',
    sources: findings[0].sources,
    result: {
      verdict: 'needs_follow_up',
      amountEur: 295120,
      summary: 'No contract, goods receipt, or delivery record supports the Ratio payments.',
      patchText: 'No contract, receipt, or delivery record in the dossier supports the €295,120 paid to Ratio Consulting. Bank ownership and service delivery remain open.',
      target: 'report.section[1]',
      commands: [
        'rg -n "209101|Ratio Consulting" evidence/',
        'rg -n "MV-U05" evidence/Berechtigungsauswertung_2025.csv',
      ],
      trace: ['Evidence manifest sealed', 'Read-only sandbox started', '4 sources searched', 'Counterevidence check complete'],
    },
  },
  {
    id: 'T-03',
    title: 'Inspect linkage',
    scope: 'F-04 · SAMMEL-200007',
    status: 'queued',
    sources: findings[3].sources,
    result: {
      verdict: 'control_exception',
      amountEur: 39040,
      summary: '4 same-day payments share one reference and each falls below €10,000.',
      patchText: 'Four same-day Castor Papier payments share SAMMEL-200007 and total €39,040. Each falls below the €10,000 second-approval threshold.',
      target: 'report.section[4]',
      commands: [
        'rg -n "SAMMEL-200007" evidence/Sachkontobuchungen.txt',
        'rg -n "10.000|10,000" evidence/Pruefungsplanung_JET_2025.txt',
      ],
      trace: ['Evidence manifest sealed', 'Read-only sandbox started', 'Payment group reconstructed', 'Threshold rule linked'],
    },
  },
  {
    id: 'T-04',
    title: 'Draft cited paragraph',
    scope: 'F-02 · Repairs capitalized',
    status: 'queued',
    sources: findings[1].sources,
    result: {
      verdict: 'draft_ready',
      amountEur: 150800,
      summary: '6 repair-like additions were recorded as asset acquisitions.',
      patchText: 'Six additions totaling €150,800 are described as repairs, overhauls, or replacement parts but were recorded as asset acquisitions. Recognition support is required invoice by invoice.',
      target: 'report.section[2]',
      commands: [
        'rg -n "Reparatur|Überholung|Austausch" evidence/Anlagen.txt',
        'rg -n "AN-2025-" evidence/Anlagenbuchungen.txt',
      ],
      trace: ['Evidence manifest sealed', 'Read-only sandbox started', '6 additions classified', 'Cited paragraph drafted'],
    },
  },
]

export const outputSchema = {
  type: 'object',
  required: ['task_id', 'verdict', 'amount_eur', 'source_ids', 'patch', 'approval'],
  properties: {
    task_id: { type: 'string' },
    verdict: { type: 'string' },
    amount_eur: { type: 'number' },
    source_ids: { type: 'array', items: { type: 'string' } },
    patch: {
      type: 'object',
      required: ['target', 'text'],
      properties: { target: { type: 'string' }, text: { type: 'string' } },
    },
    approval: { const: 'required' },
  },
  additionalProperties: false,
}

export function resultPayload(task: ReviewTask) {
  return {
    task_id: task.id,
    verdict: task.result.verdict,
    amount_eur: task.result.amountEur,
    source_ids: task.sources.map((source) => source.id),
    patch: {
      target: task.result.target,
      text: task.result.patchText,
    },
    approval: 'required',
  }
}
