import type { Value } from 'platejs'

export type SourcePreview = {
  columns: string[]
  rows: Array<{ label: string; cells: string[] }>
} | null

export type Source = {
  id: string
  name: string
  path: string
  location: string
  passage: string
  value: string
  type: 'pdf' | 'sheet'
  preview: SourcePreview
}

export type ProofAtom = {
  type: string
  label: string
  value: string
  status: 'proved' | 'excluded' | 'held'
  sourceId?: string | null
}

export type ProofGate = {
  id: 'facts' | 'joins' | 'counter' | 'resolver' | 'certificate'
  label: string
  status: 'pass' | 'hold'
  summary: string
  atoms: ProofAtom[]
}

export type Finding = {
  id: string
  scheme: string
  category: 'FRAUD RISK' | 'CUT-OFF' | 'CLASSIFICATION' | 'CONTROL'
  severity: 'Critical' | 'High'
  title: string
  amount: string
  explanation: string
  calculation: string
  decision: 'REPORT' | 'HOLD'
  sourceIds: string[]
  certificate: string
  gates: ProofGate[]
  methods: string[]
  entity?: string
}

export type SpecialistResult = {
  phase: 'idle' | 'pass' | 'fail' | 'skip' | 'running'
  detail?: string
  results?: Array<{ title: string; url: string; content: string; score: number }>
  review?: unknown
}

export type Analysis = {
  service: 'audit-engine'
  ok: true
  dataset: {
    id: string
    name: string
    company: string
    files: number
    rows: number
    analyzedAt: string
  }
  sources: Source[]
  findings: Finding[]
  holds: Finding[]
  summary: { report: number; hold: number; citations: number }
  specialists: Record<'cognee' | 'tavily' | 'codex', SpecialistResult>
}

const ENGINE = 'http://127.0.0.1:43421'

async function readResponse(response: Response) {
  const payload = await response.json() as Analysis | { error?: string }
  if (!response.ok || !('ok' in payload) || !payload.ok) {
    throw new Error('error' in payload ? payload.error || 'Audit engine request failed' : 'Audit engine request failed')
  }
  return payload
}

export async function loadAnalysis() {
  return readResponse(await fetch(`${ENGINE}/api/analysis`, { cache: 'no-store' }))
}

export async function rerunAnalysis() {
  return readResponse(await fetch(`${ENGINE}/api/rerun`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }))
}

export async function loadSample() {
  return readResponse(await fetch(`${ENGINE}/api/load-sample`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }))
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.onload = () => {
      const result = String(reader.result ?? '')
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.readAsDataURL(file)
  })
}

export async function analyzeFiles(files: File[], name: string) {
  const encoded = await Promise.all(files.map(async (file) => ({
    name: file.name,
    path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
    data: await fileToBase64(file),
  })))
  return readResponse(await fetch(`${ENGINE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, files: encoded }),
  }))
}

export async function runSpecialists(enabled: Record<'cognee' | 'tavily' | 'codex', boolean>) {
  return readResponse(await fetch(`${ENGINE}/api/specialists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  }))
}

type TextNode = { text: string; bold?: boolean; italic?: boolean }
type CitationNode = { type: 'citation'; number: number; sourceId: string; children: [{ text: '' }] }

function paragraph(children: Array<TextNode | CitationNode>, type = 'p') {
  return { type, children }
}

export function buildReportValue(analysis: Analysis): Value {
  const numberById = Object.fromEntries(analysis.sources.map((source, index) => [source.id, index + 1]))
  const nodes: unknown[] = [
    paragraph([{ text: `${analysis.dataset.company} · ${analysis.dataset.name}`, bold: true }]),
    paragraph([{ text: 'Audit findings', bold: true }], 'h1'),
    paragraph([{ text: `Working paper · ${new Date(analysis.dataset.analyzedAt).toLocaleDateString()}` }]),
    paragraph([{ text: 'Executive summary', bold: true }], 'h2'),
    paragraph([{ text: `${analysis.findings.length} reportable findings and ${analysis.holds.length} held alternative${analysis.holds.length === 1 ? '' : 's'} were produced from ${analysis.dataset.files} source files.` }]),
  ]
  analysis.findings.forEach((finding, index) => {
    const citations = finding.sourceIds.flatMap((sourceId) => {
      const number = numberById[sourceId]
      return number ? [{ text: ' ' }, { type: 'citation', number, sourceId, children: [{ text: '' }] } as CitationNode] : []
    })
    nodes.push(
      paragraph([{ text: `${index + 1}. ${finding.title}`, bold: true }], 'h2'),
      paragraph([{ text: `${finding.category}. `, bold: true }, { text: finding.explanation }, ...citations]),
      paragraph([{ text: `Calculation: ${finding.calculation}`, italic: true }]),
    )
  })
  return nodes as Value
}
