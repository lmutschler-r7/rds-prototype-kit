export type FindingType = 'vulnerabilities' | 'iocs' | 'misconfigurations';

export interface FindingItem {
  id: string;
  identifier: string;
  title: string;
  riskScore: number;
  cvss: number;
  cisaKev: boolean;
  epss: string;
  affectedAssets: number;
  findingsCount: number;
  type: FindingType;
}

const FINDING_TITLES = [
  'Server path traversal arbitrary file exposure',
  'PHP CGI argument injection',
  'XZ Utils liblzma backdoor execution',
  'PAN-OS GlobalProtect command injection',
  'libwebp heap buffer overflow',
  'Authentication bypass vulnerability',
  'SQL injection in user input',
  'Cross-site scripting vulnerability',
  'Privilege escalation flaw',
  'Buffer overflow in network protocol',
  'Weak cryptographic implementation',
  'Unsafe deserialization issue',
  'Directory traversal vulnerability',
  'Missing input validation',
  'Insecure random number generation',
  'Unvalidated redirects',
  'Missing security headers',
  'Insecure direct object references',
  'Sensitive data exposure',
  'Broken authentication mechanism'
];

const FINDING_TYPES: FindingType[] = ['vulnerabilities', 'iocs', 'misconfigurations'];

const FINDING_TOTAL = 208;

const IDENTIFIER_PREFIX: Record<FindingType, string> = {
  vulnerabilities: 'CVE-2024',
  iocs: 'IOC',
  misconfigurations: 'MISC'
};

const deterministicValue = (index: number, min: number, max: number, step = 1): number => {
  const span = Math.floor((max - min) / step) + 1;
  return min + ((index * 17 + 11) % span) * step;
};

const getFindingIdentifier = (type: FindingType, index: number): string => {
  const serial = String(index + 1).padStart(3, '0');

  if (type === 'vulnerabilities') {
    return `${IDENTIFIER_PREFIX[type]}-${String(41000 + index * 37).padStart(5, '0')}`;
  }

  return `${IDENTIFIER_PREFIX[type]}-${serial}`;
};

const createFinding = (index: number): FindingItem => {
  const type = FINDING_TYPES[index % FINDING_TYPES.length];
  const title = FINDING_TITLES[index % FINDING_TITLES.length];
  const cvss = deterministicValue(index, 2.0, 9.9, 0.1);
  const riskScore = deterministicValue(index + 3, 120, 975, 1);

  return {
    id: `finding-${String(index + 1).padStart(3, '0')}`,
    identifier: getFindingIdentifier(type, index),
    title: `${title} variant ${index + 1}`,
    riskScore,
    cvss: Number(cvss.toFixed(1)),
    cisaKev: (index + 1) % 4 === 0,
    epss: `${deterministicValue(index + 5, 4, 97)}%`,
    affectedAssets: deterministicValue(index + 7, 1, 250),
    findingsCount: deterministicValue(index + 9, 1, 200),
    type
  };
};

const generateMockFindings = (): FindingItem[] => Array.from({ length: FINDING_TOTAL }, (_value, index) => createFinding(index));

export const mockFindingsData: FindingItem[] = generateMockFindings();