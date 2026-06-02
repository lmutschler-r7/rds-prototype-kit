export type AlertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Open' | 'In Progress' | 'Closed' | 'Dismissed';
export type AlertDisposition = 'Malicious' | 'Benign' | 'Undecided' | 'Unknown';

export interface AlertItem {
  id: string;
  name: string;
  priority: AlertPriority;
  alertRiskScore: number;
  status: AlertStatus;
  source: string;
  disposition: AlertDisposition;
  relatedCampaigns: number;
  comments: number;
  lastUpdate: string;
}

const sources = ['MS Defender', 'MDE', 'Okta', 'CrowdStrike', 'Palo Alto', 'Wiz', 'Rapid7'];
const dispositions: AlertDisposition[] = ['Malicious', 'Benign', 'Undecided', 'Unknown'];
const statuses: AlertStatus[] = ['Open', 'In Progress', 'Closed', 'Dismissed'];
const priorities: AlertPriority[] = ['Critical', 'High', 'Medium', 'Low'];

const alertNames = [
  'Connection to a suspicious or malicious IP address',
  'Suspicious PowerShell Execution',
  'Unusual network traffic detected',
  'Failed authentication attempts',
  'Lateral movement detected',
  'Privilege escalation attempt',
  'Data exfiltration attempt',
  'Malware detected on endpoint',
  'Command and control communication',
  'Port scanning activity detected'
];

export const mockAlertsData: AlertItem[] = Array.from({ length: 999 }, (_, i) => {
  const priorityIndex = Math.floor(i / 250);
  const statusIndex = Math.floor((i % 250) / 63);

  return {
    id: `alert-${i + 1}`,
    name: alertNames[i % alertNames.length],
    priority: priorities[Math.min(priorityIndex, 3)] as AlertPriority,
    alertRiskScore: Math.floor(Math.random() * 100),
    status: statuses[statusIndex],
    source: sources[Math.floor(Math.random() * sources.length)],
    disposition: dispositions[Math.floor(Math.random() * dispositions.length)],
    relatedCampaigns: Math.floor(Math.random() * 5),
    comments: Math.floor(Math.random() * 10),
    lastUpdate: `07/${String(Math.floor(Math.random() * 16) + 1).padStart(2, '0')}/2025`
  };
});
