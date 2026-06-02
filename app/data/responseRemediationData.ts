export type RemediationEventType = 'Vulnerability' | 'Misconfiguration' | 'Threat';
export type CaseSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface RemediationItem {
  id: string;
  remediationAction: string;
  summary: string;
  eventType: RemediationEventType;
  findings: number;
  assets: number;
  images: number | null;
  campaign: number | null;
  actors: number | null;
  automation: number | null;
}

export interface CaseItem {
  id: string;
  caseId: string;
  title: string;
  created: string;
  type: 'Remediation';
  severity: CaseSeverity;
  status: 'Active' | 'Closed';
  assignee: string;
}

const REMEDIATION_TITLES = [
  'Upgrade pip to version 23.3',
  'Upgrade requests to version 2.32.4',
  'Upgrade golang.org/x/net to version 0.38.0',
  '2021-02 Cumulative Update for Windows 10 Version 1607',
  'Security Update for Microsoft Office Compatibility Pack',
  'Patch Apache Log4j to latest secure version',
  'Apply hardened Linux baseline profile',
  'Rotate compromised service account credentials',
  'Restrict exposed management ports',
  'Update IAM policy baseline package'
];

const REMEDIATION_SUMMARIES = [
  'Brief explanation and category for this remediation item',
  'Short remediation description and category label for this action',
  'Suitable short description / category for this remediation',
  'High-level remediation summary text for this action',
  'Potential risk reduction when applying top remediations',
  'Action recommended from prioritized risk analytics',
  'Operational remediation recommendation for impacted assets',
  'Security hardening step for this finding family'
];

const ASSIGNEES = ['Miles Dyson', 'Sarah Connor', 'Dana Scully', 'Fox Mulder', 'Ava Patel', 'Santiago Ortiz'];

const EVENTS: RemediationEventType[] = ['Vulnerability', 'Misconfiguration', 'Threat'];
const SEVERITIES: CaseSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

const REMEDIATION_TOTAL = 100;
const CASE_TOTAL = 10;

const deterministicValue = (index: number, min: number, max: number, step = 1): number => {
  const span = Math.floor((max - min) / step) + 1;
  return min + ((index * 19 + 7) % span) * step;
};

const deterministicNullable = (index: number, min: number, max: number, every = 4): number | null => {
  if ((index + 1) % every === 0) {
    return null;
  }

  return deterministicValue(index, min, max);
};

const createRemediation = (index: number): RemediationItem => ({
  id: `remediation-${String(index + 1).padStart(3, '0')}`,
  remediationAction: `${REMEDIATION_TITLES[index % REMEDIATION_TITLES.length]} (batch ${index + 1})`,
  summary: REMEDIATION_SUMMARIES[index % REMEDIATION_SUMMARIES.length],
  eventType: EVENTS[index % EVENTS.length],
  findings: deterministicValue(index, 120, 1250),
  assets: deterministicValue(index + 3, 12, 3200),
  images: deterministicNullable(index + 5, 1, 90, 3),
  campaign: deterministicNullable(index + 7, 1, 12, 4),
  actors: deterministicNullable(index + 11, 1, 5, 5),
  automation: deterministicNullable(index + 13, 1, 8, 6)
});

const createCase = (index: number): CaseItem => {
  const day = String((index % 27) + 1).padStart(2, '0');
  const hour = String((index * 3) % 24).padStart(2, '0');
  const minute = String((index * 7) % 60).padStart(2, '0');
  const second = String((index * 11) % 60).padStart(2, '0');

  return {
    id: `case-${String(index + 1).padStart(3, '0')}`,
    caseId: `INC-2025-${String(index + 1).padStart(4, '0')}`,
    title: `${REMEDIATION_TITLES[index % REMEDIATION_TITLES.length]} - case ${index + 1}`,
    created: `2025-02-${day} ${hour}:${minute}:${second}`,
    type: 'Remediation',
    severity: SEVERITIES[index % SEVERITIES.length],
    status: index % 4 === 0 ? 'Closed' : 'Active',
    assignee: ASSIGNEES[index % ASSIGNEES.length]
  };
};

export const mockRemediationsData: RemediationItem[] = Array.from(
  { length: REMEDIATION_TOTAL },
  (_unused, index) => createRemediation(index),
);

export const mockCasesData: CaseItem[] = Array.from({ length: CASE_TOTAL }, (_unused, index) => createCase(index));
