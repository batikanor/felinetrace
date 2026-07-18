import type { Value } from 'platejs'

export type Source = {
  id: string
  name: string
  location: string
  passage: string
  value: string
  type: 'pdf' | 'sheet'
}

export type Finding = {
  id: string
  category: 'FRAUD RISK' | 'CUT-OFF' | 'CLASSIFICATION' | 'CONTROL'
  severity: 'Critical' | 'High'
  title: string
  amount: string
  explanation: string
  calculation: string
  sources: Source[]
}

export type ClearedCheck = {
  label: string
  detail: string
  source: Source
}

export const sources: Record<string, Source> = {
  masterData: {
    id: 'master-data',
    name: 'Stammdatenaenderungen_2025.csv',
    location: 'Row 8',
    passage: '12.05.2025 · Kreditor 209101 · Ratio Consulting GmbH · Neuanlage inkl. Bankverbindung · bearbeitet MV-U05 · genehmigt MV-U05',
    value: 'MV-U05 → MV-U05',
    type: 'sheet',
  },
  permissionsU05: {
    id: 'permissions-u05',
    name: 'Berechtigungsauswertung_2025.xlsx',
    location: 'Berechtigungen · row 7',
    passage: 'MV-U05 · Einkauf · Buchen X · Zahlungslauf X · Stammdaten/Kreditor anlegen X',
    value: '3 conflicting rights',
    type: 'sheet',
  },
  ratioLedger: {
    id: 'ratio-ledger',
    name: 'Sachkontobuchungen.txt',
    location: 'Rows 20162–20186',
    passage: 'ER901416–ER901420 · Ratio Consulting GmbH · €248,000 fees + €47,120 VAT · all booked and paid by MV-U05 within two days',
    value: '€295,120 paid',
    type: 'sheet',
  },
  openReceipts: {
    id: 'open-receipts',
    name: 'Wareneingangsliste_2025.csv',
    location: 'Rows 842–849',
    passage: 'Eight December receipts · invoice field blank · “Dez-Lieferung, Rechnung offen” · total €192,000',
    value: '€192,000 received',
    type: 'sheet',
  },
  januaryInvoices: {
    id: 'january-invoices',
    name: 'Fakturajournal_Januar_2026_Kreditoren.csv',
    location: 'Rows 2–9',
    passage: 'ER901427–ER901434 · service dates 19–26 December 2025 · invoice total €192,000',
    value: '€192,000',
    type: 'sheet',
  },
  decemberAccrual: {
    id: 'december-accrual',
    name: 'Sachkontobuchungen.txt',
    location: 'Rows 20205–20206',
    passage: 'GJ6602864 · captured 15.01.2026 07:43:43 · Rückstellung unfakturierte Leistungen Dez 2025 · €86,500',
    value: '€86,500 accrued',
    type: 'sheet',
  },
  approvalLog: {
    id: 'approval-log',
    name: 'Freigabe-Log_Journale_2025.csv',
    location: 'Row 91',
    passage: 'GJ6602864 / event 7708372 · log date 31.12.2025 07:43:43 · MV-U02 → MV-U10 · Freigegeben',
    value: '31 Dec in log',
    type: 'sheet',
  },
  finalLock: {
    id: 'final-lock',
    name: 'IT-Bestaetigung_Vollstaendigkeit_2025.pdf',
    location: 'Page 1',
    passage: 'Final close: 20.01.2026',
    value: 'Final close · 20 Jan',
    type: 'pdf',
  },
  assetRegister: {
    id: 'asset-register',
    name: 'Anlagen.txt',
    location: 'Rows 191–196',
    passage: 'Six additions described as repair, overhaul, replacement hydraulic unit, conveyor, cooling system and drive control',
    value: '6 repair assets',
    type: 'sheet',
  },
  assetBookings: {
    id: 'asset-bookings',
    name: 'Anlagenbuchungen.txt',
    location: 'Rows 49–54',
    passage: '€28,000 + €34,000 + €15,500 + €41,000 + €12,800 + €19,500 capitalized as acquisitions',
    value: '€150,800',
    type: 'sheet',
  },
  annualStatement: {
    id: 'annual-statement',
    name: 'JA-Entwurf_2025_Auszug_Bilanz_GuV.pdf',
    location: 'Page 1 · Balance sheet',
    passage: 'Sachanlagen €19,729,014.76 · Jahresüberschuss €2,599,841.80',
    value: '€19.73M assets',
    type: 'pdf',
  },
  splitPayments: {
    id: 'split-payments',
    name: 'Sachkontobuchungen.txt',
    location: 'Rows 20207–20214',
    passage: '14.10.2025 · Castor Papier · SAMMEL-200007 · €9,780 + €9,820 + €9,750 + €9,690 · MV-U11',
    value: '4 × below €10K',
    type: 'sheet',
  },
  auditPlan: {
    id: 'audit-plan',
    name: 'Pruefungsplanung_JET_2025.docx',
    location: 'Page 1 · §3',
    passage: 'Payments of €10,000 or more require a second approval.',
    value: '€10K threshold',
    type: 'pdf',
  },
  permissionsU11: {
    id: 'permissions-u11',
    name: 'Berechtigungsauswertung_2025.xlsx',
    location: 'Berechtigungen · row 10',
    passage: 'MV-U11 · Buchen X · Zahlungslauf X',
    value: 'MV-U11',
    type: 'sheet',
  },
  cleanCapex: {
    id: 'clean-capex',
    name: 'Sachkontobuchungen.txt',
    location: 'Rows 20215–20217',
    passage: 'Produktionslinie Verpackung X500 · €480,000 · Investitionsantrag IA-2025-04',
    value: '€480K supported',
    type: 'sheet',
  },
  salesJournal: {
    id: 'sales-journal',
    name: 'Fakturajournal_2025.csv',
    location: 'Rows 2–2042',
    passage: '2,040 customer invoices reconcile to 2,040 dispatches; SG502041 is a €22,015 credit note.',
    value: 'Sales matched',
    type: 'sheet',
  },
  relatedParties: {
    id: 'related-parties',
    name: 'Gesellschafterliste_Beteiligungen.csv',
    location: 'Related-party register',
    passage: 'Muster Beteiligungs GmbH is explicitly recorded as a related party.',
    value: 'Disclosed',
    type: 'sheet',
  },
  exportHashes: {
    id: 'export-hashes',
    name: 'Exportprotokoll_GDPdU_2025.pdf',
    location: 'Page 1 · Prüfsummen',
    passage: 'All eight GDPdU export hashes match the supplied source files.',
    value: '8 / 8 hashes',
    type: 'pdf',
  },
  reconciliation: {
    id: 'reconciliation',
    name: 'Abstimmung_Nebenbuecher_HB_2025.xlsx',
    location: 'Abstimmung · B4:B11',
    passage: 'Debtor and creditor subledgers reconcile to the general ledger with €0 difference.',
    value: '€0 difference',
    type: 'sheet',
  },
  customers: {
    id: 'customers',
    name: 'Kunden.txt',
    location: '160 rows',
    passage: '160 customer master records · 148 domestic · 12 EU',
    value: '160 customers',
    type: 'sheet',
  },
  customerLedger: {
    id: 'customer-ledger',
    name: 'Kundenbuchungen.txt',
    location: '3,749 rows',
    passage: 'Customer subledger closing balance €13,412,543.05',
    value: '€13.41M AR',
    type: 'sheet',
  },
  vendors: {
    id: 'vendors',
    name: 'Lieferanten.txt',
    location: '143 rows',
    passage: '143 vendor master records, including vendor 209101 Ratio Consulting GmbH',
    value: '143 vendors',
    type: 'sheet',
  },
  vendorLedger: {
    id: 'vendor-ledger',
    name: 'Lieferantenbuchungen.txt',
    location: '2,584 rows',
    passage: 'Vendor subledger closing balance −€13,208,855.00',
    value: '€13.21M AP',
    type: 'sheet',
  },
  accounts: {
    id: 'accounts',
    name: 'Sachkonten.txt',
    location: '43 rows',
    passage: '43 general-ledger account master records',
    value: '43 accounts',
    type: 'sheet',
  },
  subsequentReceipts: {
    id: 'subsequent-receipts',
    name: 'Buchungen_Folgeperiode_2026.csv',
    location: '60 rows',
    passage: '60 January receipts match 2025 debtor open items · €1,558,836.02',
    value: '60 / 60 matched',
    type: 'sheet',
  },
  relatedRegister: {
    id: 'related-register',
    name: 'Gesellschafterliste_Beteiligungen.csv',
    location: '2 records',
    passage: 'Parent and sister entities recorded; creditor 209113 requires identity clarification.',
    value: '2 related parties',
    type: 'sheet',
  },
  creditLimits: {
    id: 'credit-limits',
    name: 'Kreditlimitliste_Debitoren_2025.csv',
    location: '160 rows',
    passage: '160 customer limits tested · no limit breaches',
    value: '0 breaches',
    type: 'sheet',
  },
  openDebtors: {
    id: 'open-debtors',
    name: 'OP-Liste_Debitoren_2025.xlsx',
    location: '153 balances',
    passage: '153 non-zero customer balances · €13,412,543.05',
    value: '€13.41M AR',
    type: 'sheet',
  },
  openCreditors: {
    id: 'open-creditors',
    name: 'OP-Liste_Kreditoren_2025.xlsx',
    location: '122 balances',
    passage: '122 non-zero vendor balances · −€13,208,855.00',
    value: '€13.21M AP',
    type: 'sheet',
  },
  priorTrialBalance: {
    id: 'prior-trial-balance',
    name: 'Saldenliste_2024_Vorjahr.xlsx',
    location: 'A1:D3',
    passage: 'Prior-year workbook contains headers only; no account rows supplied.',
    value: 'Dossier limit',
    type: 'sheet',
  },
  currentTrialBalance: {
    id: 'current-trial-balance',
    name: 'Saldenliste_2025.xlsx',
    location: '43 accounts',
    passage: '2025 trial balance bridges to profit of €2,599,841.80',
    value: '€2.60M profit',
    type: 'sheet',
  },
  dispatches: {
    id: 'dispatches',
    name: 'Warenausgangsliste_2025.csv',
    location: '2,040 rows',
    passage: '2,040 goods dispatches · €55,441,422.00',
    value: '2,040 dispatches',
    type: 'sheet',
  },
}

export const findings: Finding[] = [
  {
    id: 'F-01',
    category: 'FRAUD RISK',
    severity: 'Critical',
    title: 'One user controlled Ratio’s full payment chain',
    amount: '€295,120',
    explanation: 'MV-U05 created and approved Ratio Consulting, then booked five invoices and their payments. Every invoice was paid within two days; the dossier contains no contract or service evidence.',
    calculation: '€248,000 fees + €47,120 VAT = €295,120 paid',
    sources: [sources.masterData, sources.permissionsU05, sources.ratioLedger],
  },
  {
    id: 'F-02',
    category: 'CUT-OFF',
    severity: 'High',
    title: 'December accrual is short',
    amount: '€105,500',
    explanation: 'Eight December receipts with open invoices total €192,000. The year-end accrual covers €86,500. Its GL capture date is 15 January, while the approval log says 31 December for the same event.',
    calculation: '€192,000 received − €86,500 accrued = €105,500 gap',
    sources: [sources.openReceipts, sources.januaryInvoices, sources.decemberAccrual, sources.approvalLog, sources.finalLock],
  },
  {
    id: 'F-03',
    category: 'CLASSIFICATION',
    severity: 'High',
    title: 'Repair-like work was capitalized',
    amount: '€150,800',
    explanation: 'Six asset additions use repair, overhaul or replacement wording. Their capitalization may overstate assets and profit unless the company can support the recognition criteria.',
    calculation: '6 additions = €150,800 at risk',
    sources: [sources.assetRegister, sources.assetBookings, sources.annualStatement],
  },
  {
    id: 'F-04',
    category: 'CONTROL',
    severity: 'High',
    title: 'Four payments sit just below approval',
    amount: '€39,040',
    explanation: 'Four same-day payments to Castor Papier share one reference. Each is below the €10,000 second-approval threshold and the same user could book and run payments.',
    calculation: '€9,780 + €9,820 + €9,750 + €9,690 = €39,040',
    sources: [sources.splitPayments, sources.auditPlan, sources.permissionsU11],
  },
]

export const sourceDocuments = findings
  .flatMap((finding) => finding.sources)
  .filter((source, index, all) => all.findIndex((item) => item.name === source.name) === index)

export const dossierDocuments = [
  ...sourceDocuments,
  sources.customers,
  sources.customerLedger,
  sources.vendors,
  sources.vendorLedger,
  sources.accounts,
  sources.reconciliation,
  sources.subsequentReceipts,
  sources.exportHashes,
  sources.salesJournal,
  sources.relatedRegister,
  sources.creditLimits,
  sources.openDebtors,
  sources.openCreditors,
  sources.priorTrialBalance,
  sources.currentTrialBalance,
  sources.dispatches,
]

export const clearedChecks: ClearedCheck[] = [
  {
    label: 'GDPdU export',
    detail: '8 / 8',
    source: sources.exportHashes,
  },
  {
    label: 'Subledgers ↔ GL',
    detail: '€0 gap',
    source: sources.reconciliation,
  },
  {
    label: 'Invoices ↔ dispatches',
    detail: '2,040 / 2,040',
    source: sources.salesJournal,
  },
]

export const reportValue: Value = [
  { type: 'p', children: [{ text: 'MUSTER VERPACKUNGEN GMBH  ·  FY 2025', bold: true }] },
  { type: 'p', children: [{ text: 'Audit findings', bold: true }] },
  { type: 'p', children: [{ text: 'Working paper  ·  18 July 2026' }] },
  { type: 'p', children: [{ text: '' }] },
  { type: 'p', children: [{ text: 'Executive summary', bold: true }] },
  {
    type: 'p',
    children: [
      { text: 'The numbers nearly cancel. ' },
      { text: '€248,000 of Ratio fees reduce profit; €150,800 of repair capitalization and a €105,500 cut-off gap lift it by up to €256,300.', bold: true },
      { text: ' Together, these entries move reported profit by only €8,300 while €295,120 leaves cash.' },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
  { type: 'p', children: [{ text: '1. Ratio Consulting payment chain', bold: true }] },
  {
    type: 'p',
    children: [
      { text: 'Fraud risk. ', bold: true },
      { text: 'MV-U05 created and approved vendor 209101, then booked five invoices and all five payments. €248,000 in fees plus €47,120 VAT was paid within two days of each posting. No contract or service record is in the dossier.' },
    ],
  },
  { type: 'p', children: [{ text: 'Next: Freeze the vendor, verify bank ownership and obtain the contract and deliverables.', italic: true }] },
  { type: 'p', children: [{ text: '' }] },
  { type: 'p', children: [{ text: '2. December accrual gap', bold: true }] },
  {
    type: 'p',
    children: [
      { text: 'Cut-off. ', bold: true },
      { text: 'Eight December receipts with open invoices total €192,000. January invoices confirm the amount, but the year-end accrual covers only €86,500. Its ledger capture date is 15 January; the approval log says 31 December for the same event.' },
    ],
  },
  { type: 'p', children: [{ text: 'Next: Post the cut-off adjustment and test the remaining January population.', italic: true }] },
  { type: 'p', children: [{ text: '' }] },
  { type: 'p', children: [{ text: '3. Repair costs capitalized', bold: true }] },
  {
    type: 'p',
    children: [
      { text: 'Classification. ', bold: true },
      { text: 'Six additions totaling €150,800 are described as repairs, overhauls or replacement parts. Assets and profit are overstated if capitalization criteria are not met.' },
    ],
  },
  { type: 'p', children: [{ text: 'Next: Inspect the work orders and expense items that do not create future benefit.', italic: true }] },
  { type: 'p', children: [{ text: '' }] },
  { type: 'p', children: [{ text: '4. Approval threshold split', bold: true }] },
  {
    type: 'p',
    children: [
      { text: 'Control. ', bold: true },
      { text: 'Four Castor Papier payments—€9,780, €9,820, €9,750 and €9,690—were posted on 14 October under SAMMEL-200007. Together they are €39,040; individually each avoids the €10,000 second approval.' },
    ],
  },
  { type: 'p', children: [{ text: 'Next: Review the underlying invoices and enforce the threshold on same-day payment groups.', italic: true }] },
]
