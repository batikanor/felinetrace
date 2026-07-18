export const dossier = {
  files: 35,
  records: 27190,
  citations: 14,
  schemes: 4,
  decoys: 7,
};

export const findings = [
  {id: 'F-01', title: 'User-controlled vendor chain', amount: '€295,120', net: '€248,000', category: 'FRAUD RISK'},
  {id: 'F-02', title: 'Repair costs capitalized', amount: '€150,800', net: '€150,800', category: 'CLASSIFICATION'},
  {id: 'F-03', title: 'December costs in January', amount: '€192,000', net: '€192,000', category: 'CUT-OFF'},
  {id: 'F-04', title: 'Payments split below approval', amount: '€39,040', net: '€39,040', category: 'CONTROL'},
];

export const ratioSources = [
  {number: '[1]', value: 'MV-U05 → MV-U05', file: 'Stammdatenaenderungen_2025.csv', location: 'row 8 · vendor 209101'},
  {number: '[2]', value: '3 conflicting rights', file: 'Berechtigungsauswertung_2025.xlsx', location: 'Berechtigungen · row 7'},
  {number: '[3]', value: '€295,120 paid', file: 'Sachkontobuchungen.txt', location: 'rows 20162–20186'},
  {number: '[4]', value: '0 receipts', file: 'Wareneingangsliste_2025.csv', location: '858 rows · vendor 209101'},
];

export const coverage = [
  {name: 'Vendor chain', inputs: 'Master · access · GL', rule: 'Owner + payment timing', counter: 'Receipt search: 0', trace: '[1–4]'},
  {name: 'Capex classification', inputs: 'Assets · postings · FS', rule: 'Repair terms → assets', counter: 'Recognition support', trace: '[5–7]'},
  {name: 'Cut-off', inputs: 'Receipts · Jan AP · GL', rule: '€192K − 2025 match', counter: 'Separate €86.5K accrual', trace: '[8–11]'},
  {name: 'Payment splitting', inputs: 'GL · JET plan · access', rule: 'Same day/ref · <€10K', counter: 'Second approval absent', trace: '[12–14]'},
];

export const detectors = [
  {name: 'Rules', detail: 'Joins, policies, thresholds', count: 4},
  {name: 'Graph', detail: 'Control paths, missing edges', count: 3},
  {name: 'Sequence', detail: 'Timing, grouping, cut-off', count: 3},
  {name: 'Skeptic', detail: 'Counterevidence and matches', count: 3},
];

export const detectorHits = [
  {id: 'F-01', hits: [1,1,1,1]},
  {id: 'F-02', hits: [1,1,0,1]},
  {id: 'F-03', hits: [1,0,1,1]},
  {id: 'F-04', hits: [1,1,1,0]},
];

export const splitPayments = [9780, 9820, 9750, 9690];
