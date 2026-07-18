import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from 'react'
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Link2,
  Move,
  X,
} from 'lucide-react'
import type { Source } from './caseData'

export type OpenSourceWindow = {
  source: Source
  x: number
  y: number
  z: number
}

type PreviewRow = {
  label: string
  cells: string[]
}

type SheetPreviewConfig = {
  columns: string[]
  rows: PreviewRow[]
}

const sheetPreviews: Record<string, SheetPreviewConfig> = {
  'master-data': {
    columns: ['DATUM', 'ART', 'KONTO', 'NAME', 'FELD', 'GEÄNDERT', 'GENEHMIGT'],
    rows: [
      { label: '8', cells: ['12.05.2025', 'Kreditor', '209101', 'Ratio Consulting GmbH', 'Neuanlage Kreditor', 'MV-U05', 'MV-U05'] },
    ],
  },
  'permissions-u05': {
    columns: ['Benutzer', 'Abteilung', 'Buchen', 'Journal freigeben', 'Zahlungslauf', 'Kreditor anlegen'],
    rows: [
      { label: '7', cells: ['MV-U05', 'Einkauf', 'X', '—', 'X', 'X'] },
    ],
  },
  'ratio-ledger': {
    columns: ['Zeilen', 'Beleg', 'Netto', 'Vorsteuer', 'Zahlung', 'Benutzer'],
    rows: [
      { label: '20162–66', cells: ['20162–66', 'ER901416', '€45,000', '€8,550', '€53,550', 'MV-U05'] },
      { label: '20167–71', cells: ['20167–71', 'ER901417', '€60,000', '€11,400', '€71,400', 'MV-U05'] },
      { label: '20172–76', cells: ['20172–76', 'ER901418', '€38,000', '€7,220', '€45,220', 'MV-U05'] },
      { label: '20177–81', cells: ['20177–81', 'ER901419', '€52,000', '€9,880', '€61,880', 'MV-U05'] },
      { label: '20182–86', cells: ['20182–86', 'ER901420', '€53,000', '€10,070', '€63,070', 'MV-U05'] },
    ],
  },
  'open-receipts': {
    columns: ['WE', 'Datum', 'Kreditor', 'Name', 'Betrag', 'Rechnung'],
    rows: [
      { label: '842', cells: ['WE400840', '21.12.2025', '209130', 'Nord Transport', '€22,000', 'offen'] },
      { label: '843', cells: ['WE400841', '26.12.2025', '209131', 'Delta Energie', '€38,000', 'offen'] },
      { label: '844', cells: ['WE400842', '22.12.2025', '209132', 'Atlas Werkstoffe', '€41,000', 'offen'] },
      { label: '845', cells: ['WE400843', '22.12.2025', '209133', 'Vega Technik', '€17,000', 'offen'] },
      { label: '846', cells: ['WE400844', '25.12.2025', '209134', 'Orion Logistik', '€26,000', 'offen'] },
      { label: '847', cells: ['WE400845', '19.12.2025', '209135', 'Kronos Druck', '€14,500', 'offen'] },
      { label: '848', cells: ['WE400846', '20.12.2025', '209136', 'Prisma Chemie', '€20,500', 'offen'] },
      { label: '849', cells: ['WE400847', '20.12.2025', '209137', 'Helios Systeme', '€13,000', 'offen'] },
    ],
  },
  'january-invoices': {
    columns: ['Rechnung', 'Kreditor', 'Rechnungsdatum', 'Leistung', 'Betrag'],
    rows: [
      { label: '2', cells: ['ER901427', '209130', '15.01.2026', '21.12.2025', '€22,000'] },
      { label: '3', cells: ['ER901428', '209131', '03.01.2026', '26.12.2025', '€38,000'] },
      { label: '4', cells: ['ER901429', '209132', '15.01.2026', '22.12.2025', '€41,000'] },
      { label: '5', cells: ['ER901430', '209133', '11.01.2026', '22.12.2025', '€17,000'] },
      { label: '6', cells: ['ER901431', '209134', '13.01.2026', '25.12.2025', '€26,000'] },
      { label: '7', cells: ['ER901432', '209135', '13.01.2026', '19.12.2025', '€14,500'] },
      { label: '8', cells: ['ER901433', '209136', '14.01.2026', '20.12.2025', '€20,500'] },
      { label: '9', cells: ['ER901434', '209137', '06.01.2026', '20.12.2025', '€13,000'] },
    ],
  },
  'december-accrual': {
    columns: ['Konto', 'Beleg', 'Betrag', 'Text', 'Erfassung', 'Benutzer'],
    rows: [
      { label: '20205', cells: ['677000', 'GJ6602864', '€86,500', 'Rückstellung unfakturierte Leistungen Dez 2025', '15.01.2026 07:43', 'MV-U02'] },
      { label: '20206', cells: ['302000', 'GJ6602864', '−€86,500', 'Rückstellung unfakturierte Leistungen Dez 2025', '15.01.2026 07:43', 'MV-U02'] },
    ],
  },
  'approval-log': {
    columns: ['ID', 'Journal', 'Ersteller', 'Erfasst am', 'Freigeber', 'Freigabe'],
    rows: [
      { label: '91', cells: ['7708372', 'GJ6602864', 'MV-U02', '31.12.2025 07:43', 'MV-U10', '31.12.2025'] },
    ],
  },
  'asset-register': {
    columns: ['Anlage', 'Bezeichnung', 'Gruppe', 'Status'],
    rows: [
      { label: '191', cells: ['040000-000191', 'Reparatur Konfektioniermaschine Linie 2', '040000', 'Aktiv'] },
      { label: '192', cells: ['040000-000192', 'Austausch Hydraulikaggregat Presse 3', '040000', 'Aktiv'] },
      { label: '193', cells: ['060000-000193', 'Instandsetzung Förderband Halle II', '060000', 'Aktiv'] },
      { label: '194', cells: ['040000-000194', 'Generalüberholung Stanzautomat', '040000', 'Aktiv'] },
      { label: '195', cells: ['060000-000195', 'Reparatur Kälteanlage Lager', '060000', 'Aktiv'] },
      { label: '196', cells: ['040000-000196', 'Austausch Antriebssteuerung Palettierer', '040000', 'Aktiv'] },
    ],
  },
  'asset-bookings': {
    columns: ['Anlage', 'Datum', 'Beleg', 'Betrag', 'Art'],
    rows: [
      { label: '49', cells: ['040000-000191', '20.11.2025', 'ER901421', '€28,000', 'Acquisition'] },
      { label: '50', cells: ['040000-000192', '04.03.2025', 'ER901422', '€34,000', 'Acquisition'] },
      { label: '51', cells: ['060000-000193', '13.03.2025', 'ER901423', '€15,500', 'Acquisition'] },
      { label: '52', cells: ['040000-000194', '26.11.2025', 'ER901424', '€41,000', 'Acquisition'] },
      { label: '53', cells: ['060000-000195', '23.05.2025', 'ER901425', '€12,800', 'Acquisition'] },
      { label: '54', cells: ['040000-000196', '20.11.2025', 'ER901426', '€19,500', 'Acquisition'] },
    ],
  },
  'split-payments': {
    columns: ['Datum', 'Beleg', 'Referenz', 'Betrag', 'Benutzer'],
    rows: [
      { label: '20207–08', cells: ['14.10.2025', 'AZ6602865', 'SAMMEL-200007', '€9,780', 'MV-U11'] },
      { label: '20209–10', cells: ['14.10.2025', 'AZ6602866', 'SAMMEL-200007', '€9,820', 'MV-U11'] },
      { label: '20211–12', cells: ['14.10.2025', 'AZ6602867', 'SAMMEL-200007', '€9,750', 'MV-U11'] },
      { label: '20213–14', cells: ['14.10.2025', 'AZ6602868', 'SAMMEL-200007', '€9,690', 'MV-U11'] },
    ],
  },
  'permissions-u11': {
    columns: ['Benutzer', 'Abteilung', 'Buchen', 'Journal freigeben', 'Zahlungslauf'],
    rows: [
      { label: '10', cells: ['MV-U11', 'Zahlungsverkehr', 'X', '—', 'X'] },
    ],
  },
  reconciliation: {
    columns: ['Position', 'Nebenbuch', 'Hauptbuch', 'Differenz'],
    rows: [
      { label: 'B4:B6', cells: ['Debitoren', '€13,412,543.05', '€13,412,543.05', '€0'] },
      { label: 'B9:B11', cells: ['Kreditoren', '−€13,208,855', '−€13,208,855', '€0'] },
    ],
  },
  'sales-journal': {
    columns: ['Prüfung', 'Fakturajournal', 'Warenausgang', 'Differenz'],
    rows: [
      { label: '2–2042', cells: ['Rechnungen', '2,040', '2,040', '0'] },
    ],
  },
}

const documentTitles: Record<string, string> = {
  'final-lock': 'Bestätigung der IT zur Vollständigkeit und Unveränderbarkeit der Journaldaten 2025',
  'annual-statement': 'Jahresabschluss zum 31.12.2025 · Entwurf',
  'audit-plan': 'Arbeitspapier 4.2 · Journal Entry Testing',
  'export-hashes': 'Exportprotokoll Datenträgerüberlassung',
}

type SourceWindowProps = {
  item: OpenSourceWindow
  onClose: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
  onCopied: () => void
}

export function SourceWindow({ item, onClose, onFocus, onMove, onCopied }: SourceWindowProps) {
  const { source } = item
  const fileIsDocument = /\.(pdf|docx)$/i.test(source.name)

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    event.preventDefault()
    onFocus()
    const startPointerX = event.clientX
    const startPointerY = event.clientY
    const startWindowX = item.x
    const startWindowY = item.y
    const windowRect = (event.currentTarget.closest('.source-window') as HTMLElement | null)?.getBoundingClientRect()
    const maxX = Math.max(4, window.innerWidth - (windowRect?.width ?? 420) - 4)
    const maxY = Math.max(58, window.innerHeight - (windowRect?.height ?? 520) - 4)

    const handleMove = (moveEvent: PointerEvent) => {
      const nextX = Math.max(4, Math.min(maxX, startWindowX + moveEvent.clientX - startPointerX))
      const nextY = Math.max(58, Math.min(maxY, startWindowY + moveEvent.clientY - startPointerY))
      onMove(nextX, nextY)
    }
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const copyPassage = async () => {
    await navigator.clipboard?.writeText(`${source.name} · ${source.location}\n${source.passage}`)
    onCopied()
  }

  return (
    <section
      className="source-window"
      style={{ left: item.x, top: item.y, zIndex: item.z }}
      onMouseDown={onFocus}
      aria-label={`Source: ${source.name}`}
    >
      <header onPointerDown={startDrag}>
        <Move size={14} className="drag-handle" />
        <span className="source-modal-icon">
          {fileIsDocument ? <FileText size={17} /> : <FileSpreadsheet size={17} />}
        </span>
        <div>
          <strong>{source.name}</strong>
          <small>{source.location}</small>
        </div>
        <button type="button" onClick={onClose} aria-label="Close source"><X size={17} /></button>
      </header>

      <div className="source-preview">
        {fileIsDocument ? <DocumentPreview source={source} /> : <SheetPreview source={source} />}
      </div>

      <footer>
        <span><CheckCircle2 size={14} /> Exact passage</span>
        <blockquote>{source.passage}</blockquote>
        <button type="button" onClick={copyPassage}><Link2 size={13} /> Copy citation</button>
      </footer>
    </section>
  )
}

function SheetPreview({ source }: { source: Source }) {
  const config = sheetPreviews[source.id] ?? {
    columns: ['Location', 'Evidence'],
    rows: [{ label: source.location, cells: [source.location, source.passage] }],
  }

  return (
    <div className="sheet-page">
      <div className="sheet-toolbar">
        <span className="sheet-tab">{source.name}</span>
        <span className="formula-location">{source.location}</span>
      </div>
      <div className="sheet-grid" style={{ '--sheet-columns': config.columns.length } as CSSProperties}>
        <div className="sheet-corner" />
        {config.columns.map((column) => <div className="sheet-column" key={column}>{column}</div>)}
        {config.rows.map((row) => (
          <div className="sheet-row" key={row.label}>
            <div className="sheet-row-number">{row.label}</div>
            {row.cells.map((cell, index) => <div className="sheet-cell evidence-cell" key={`${row.label}-${index}`}>{cell}</div>)}
          </div>
        ))}
      </div>
      <div className="sheet-status"><span>Bereit</span><span>{source.value}</span></div>
    </div>
  )
}

function DocumentPreview({ source }: { source: Source }) {
  const title = documentTitles[source.id] ?? source.name.replace(/\.(pdf|docx)$/i, '')

  return (
    <div className="document-page-preview">
      <div className="document-preview-kicker">Muster Verpackungen GmbH</div>
      <h2>{title}</h2>
      {source.id === 'audit-plan' && (
        <p><strong>2. Wesentlichkeit.</strong> Gesamtwesentlichkeit 400.000 EUR; Toleranzwesentlichkeit 300.000 EUR; Nichtaufgriffsgrenze JET 25.000 EUR.</p>
      )}
      {source.id === 'final-lock' && (
        <p><strong>2. Buchungslogik.</strong> Jede Buchung ist zeilenweise ausgeglichen; die Summe aller Buchungsbeträge beträgt 0,00 EUR.</p>
      )}
      <div className="document-highlight">
        <small>{source.location}</small>
        <p>{source.passage}</p>
        <strong>{source.value}</strong>
      </div>
      {source.id === 'audit-plan' && (
        <p><strong>4. Risikoorientierte Selektionskriterien.</strong> Neue Kreditoren, fehlender Vertragsbezug, reparaturtypische Anlagenzugänge, Cut-off und Teilzahlungen unter der Freigabegrenze.</p>
      )}
      {source.id === 'final-lock' && (
        <p><strong>4. Erfassungsmetadaten.</strong> Für jede Zeile sind Erfassungsdatum, -uhrzeit und Benutzerkennung enthalten.</p>
      )}
      <span className="document-preview-page">1</span>
    </div>
  )
}
