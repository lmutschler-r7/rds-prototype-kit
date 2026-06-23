import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  GridColDef,
  GridRenderCellParams,
  IconButton,
  Kpi,
  KpiContainer,
  LinearProgress,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@rapid7/rds';
import { DataGridTable } from '@rapid7/rds-labs';
import { getValue } from '@rapid7/rds/lib/esm/tokens';
import {
  SubtleIcons,
  BrandSecurityAlert,
  CancelClose,
  CheckSuccessHealthy,
  Clear,
  CriticalAlert,
  CyberGRC,
  HelpInformation,
  ImpactCritical,
  ImpactHigh,
  ImpactLow,
  ImpactMedium,
  InformationHint,
  NextChevronRightArrow,
  Risk,
  SecurityShield,
  SensitiveData,
  Settings,
  Verified,
  Threat,
  Target,
  ThreatCommand,
  Workflow,
} from '@rapid7/icons';
import * as echarts from 'echarts/core';
import { BarChart, FunnelChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, PolarComponent, RadarComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';

echarts.use([BarChart, FunnelChart, LineChart, PieChart, RadarChart, GridComponent, LegendComponent, PolarComponent, RadarComponent, TooltipComponent, SVGRenderer]);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DashboardCardHeaderProps {
  title: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  subheader?: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => {
  return value === index ? <Box>{children}</Box> : null;
};

const DashboardCardHeader: React.FC<DashboardCardHeaderProps> = ({ title, action, avatar, subheader }) => (
  <CardHeader
    title={title}
    subheader={subheader}
    avatar={avatar}
    action={action}
    sx={{ px: 0, pt: 0, pb: '8px' }}
  />
);

const trendLabels = ['Feb 23', 'Mar 1', 'Mar 8', 'Mar 15'];
const vulnerabilityAgingLabels = ['0-7', '8-30', '31-60', '61-90', '90+'];
const remediatedLabels = ['Critical', 'High', 'Medium', 'Low', 'Very Low'];
const incidentTrendLabels = ['Jul 2', '9 - 15', '16 - 22', '23 - 29', '30 - 31'];
const alertsAgeLabels = ['0-7', '8-30', '31-60', '61-90', '90+'];
const investigationAgeLabels = ['<1', '1 - 3', '4 - 7', '8 - 30', '31+'];
const mitreLabels = [
  'Reconnaissance',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Command & Control',
];

const buildChartBase = (theme: Theme) => ({
  animation: true,
  grid: {
    bottom: 40,
    left: 40,
    right: 24,
    top: 16,
  },
  textStyle: {
    color: theme.palette.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: theme.palette.divider,
      },
      type: 'line' as const,
    },
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    borderWidth: 1,
    textStyle: {
      color: theme.palette.text.primary,
    },
    trigger: 'axis' as const,
  },
  xAxis: {
    axisLabel: {
      color: theme.palette.text.secondary,
    },
    axisLine: {
      lineStyle: {
        color: theme.palette.divider,
      },
    },
    splitLine: {
      lineStyle: {
        color: theme.palette.divider,
      },
      show: false,
    },
  },
  yAxis: {
    axisLabel: {
      color: theme.palette.text.secondary,
    },
    axisLine: {
      lineStyle: {
        color: theme.palette.divider,
      },
    },
    splitLine: {
      lineStyle: {
        color: theme.palette.divider,
      },
      show: true,
    },
  },
});

const incidentKpis = [
  {
    detailSections: [
      {
        label: 'Compared to last period',
        previousValue: 71,
        value: 86,
        variant: 'PERCENTAGE_CHANGE' as const,
      },
    ],
    icon: <ThreatCommand />,
    label: 'Alerts Triaged',
    value: 86,
  },
  {
    detailSections: [
      {
        label: 'Compared to last period',
        previousValue: 21,
        value: 18,
        variant: 'PERCENTAGE_CHANGE' as const,
      },
    ],
    icon: <CriticalAlert />,
    label: 'Alerts Escalated',
    value: 18,
  },
  {
    detailSections: [
      {
        label: 'Compared to last period',
        previousValue: 12,
        value: 10,
        variant: 'PERCENTAGE_CHANGE' as const,
      },
    ],
    icon: <Risk />,
    label: 'Malicious Investigations',
    value: 10,
  },
  {
    detailSections: [
      {
        label: 'Compared to last period',
        previousValue: 62,
        value: 66,
        variant: 'PERCENTAGE_CHANGE' as const,
      },
    ],
    icon: <Workflow />,
    label: 'Coverage',
    value: 66,
  },
];

const incidentSummaryKpis = [
  { value: 567, label: 'Generated', icon: <ThreatCommand /> },
  { value: 150, label: 'Escalated', icon: <CriticalAlert /> },
  { value: 88, label: 'Open Investigations', icon: <Risk /> },
  { value: 7, label: 'Avg. Daily Investigations', icon: <Workflow /> },
];

const incidentFooterKpis = [
  { value: 34, label: 'Open Alerts', sublabel: '20% with no assignee', icon: <CriticalAlert /> },
  { value: 22, label: 'Avg. Daily Alerts', sublabel: '20% in last 30 days', icon: <ThreatCommand /> },
  { value: 123, label: 'Open Investigations', sublabel: '12.5% with no assignee', icon: <Risk /> },
  { value: 7, label: 'Avg. Daily Investigations', sublabel: '12.5% in last 30 days', icon: <Workflow /> },
];

const vulnerabilityContextFunnel = [
  { label: 'Vulnerabilities', value: 100 },
  { label: 'Exploitable', value: 74 },
  { label: 'Exploited in the Wild', value: 58 },
  { label: 'CISA KEV', value: 42 },
  { label: 'R7 Emergent Threat', value: 26 },
];

const threatPipelineFunnel = [
  { label: 'Vulnerabilities', value: 3564 },
  { label: 'Exploitable', value: 877 },
  { label: 'Exploited in the Wild', value: 60 },
  { label: 'CISA KEV', value: 15 },
  { label: 'R7 Emergent Threat', value: 10 },
];

const complianceKpis = [
  {
    value: 123,
    label: 'Misconfigurations',
    detailSections: [{ label: 'In last 30 days', value: 13, variant: 'PERCENTAGE_CHANGE' as const }],
    icon: <Risk />,
  },
  {
    value: 123,
    label: 'Critical and High Misconfigurations',
    detailSections: [{ label: 'In last 30 days', value: 3, variant: 'PERCENTAGE_CHANGE' as const }],
    icon: <CriticalAlert />,
  },
  {
    value: 40,
    label: 'Days to audit',
    icon: <Workflow />,
  },
];

const complianceFrameworkLabels = ['CIS', 'DISA STIG', 'GDPR', 'HIPPA'];

// ─── Coverage Matrix ────────────────────────────────────────────────────────

type ProductName =
  | 'Surface Command'
  | 'Vulnerability Management'
  | 'Cloud Security'
  | 'SIEM'
  | 'Application Security'
  | 'Automation'
  | 'Digital Risk Protection'
  | 'Managed Services'
  | 'Cyber GRC'
  | 'DSPM';

type NistFunction = 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';
type AssetType = 'DEVICES' | 'SOFTWARE' | 'NETWORK' | 'USERS' | 'DATA' | 'DOCUMENTATION';

const NIST_FUNCTIONS: NistFunction[] = ['GOVERN', 'IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER'];
const ASSET_TYPES: AssetType[] = ['DEVICES', 'SOFTWARE', 'NETWORK', 'USERS', 'DATA', 'DOCUMENTATION'];

interface CoverageProduct {
  name: ProductName;
  defaultLicensed: boolean;
}

type CoverageWeights = Partial<Record<ProductName, number>>;

const coverageProducts: CoverageProduct[] = [
  { name: 'Surface Command', defaultLicensed: true },
  { name: 'Vulnerability Management', defaultLicensed: true },
  { name: 'Cloud Security', defaultLicensed: false },
  { name: 'SIEM', defaultLicensed: true },
  { name: 'Application Security', defaultLicensed: false },
  { name: 'Automation', defaultLicensed: true },
  { name: 'Digital Risk Protection', defaultLicensed: true },
  { name: 'Managed Services', defaultLicensed: false },
  { name: 'Cyber GRC', defaultLicensed: false },
  { name: 'DSPM', defaultLicensed: false },
];

const productIcons: Record<ProductName, React.ElementType> = {
  'Surface Command': SubtleIcons.AttackSurfaceManagementSubtle,
  'Vulnerability Management': SubtleIcons.VulnerabilityManagementSubtle,
  'Cloud Security': SubtleIcons.CloudSecuritySubtle,
  SIEM: SubtleIcons.SIEMSubtle,
  'Application Security': SubtleIcons.ApplicationSecuritySubtle,
  Automation: SubtleIcons.AutomationSubtle,
  'Digital Risk Protection': SubtleIcons.DigitalRiskProtectionSubtle,
  'Managed Services': SubtleIcons.ManagedServicesSubtle,
  'Cyber GRC': CyberGRC,
  DSPM: HelpInformation,
};

const productDescriptions: Record<ProductName, string> = {
  'Surface Command': 'Maps external attack surface to discover and prioritize exposed assets.',
  'Vulnerability Management': 'Finds vulnerabilities across assets and prioritizes remediation by risk.',
  'Cloud Security': 'Continuously assesses cloud configurations and runtime posture for drift and risk.',
  SIEM: 'Correlates telemetry to detect threats and accelerate investigation workflows.',
  'Application Security': 'Identifies weaknesses in application code and dependencies before exploitation.',
  Automation: 'Automates enrichment and response workflows to reduce manual analyst effort.',
  'Digital Risk Protection': 'Monitors external digital channels for impersonation, leaks, and abuse.',
  'Managed Services': 'Extends team capacity with expert-led monitoring, detection, and response operations.',
  'Cyber GRC': 'Aligns controls to frameworks and tracks governance, risk, and compliance maturity.',
  DSPM: 'Discovers and classifies sensitive data to improve protection and policy enforcement.',
};

// null = N/A (no product covers this combination)
const coverageMap: Record<AssetType, Record<NistFunction, CoverageWeights | null>> = {
  DEVICES: {
    GOVERN: { 'Cyber GRC': 100 },
    IDENTIFY: { 'Vulnerability Management': 50, 'Surface Command': 25, SIEM: 25 },
    PROTECT: { 'Vulnerability Management': 25, SIEM: 25, Automation: 25, 'Cloud Security': 25 },
    DETECT: { SIEM: 60, Automation: 40 },
    RESPOND: { SIEM: 35, Automation: 30, 'Digital Risk Protection': 20, 'Managed Services': 15 },
    RECOVER: null,
  },
  SOFTWARE: {
    GOVERN: { 'Cyber GRC': 100 },
    IDENTIFY: { 'Vulnerability Management': 50, 'Surface Command': 25, SIEM: 25 },
    PROTECT: { 'Vulnerability Management': 40, SIEM: 30, Automation: 30 },
    DETECT: { SIEM: 60, Automation: 40 },
    RESPOND: { SIEM: 35, Automation: 30, 'Digital Risk Protection': 20, 'Managed Services': 15 },
    RECOVER: null,
  },
  NETWORK: {
    GOVERN: { 'Cyber GRC': 100 },
    IDENTIFY: { 'Vulnerability Management': 50, 'Surface Command': 25, SIEM: 25 },
    PROTECT: { 'Vulnerability Management': 25, SIEM: 25, Automation: 25, 'Cloud Security': 25 },
    DETECT: { SIEM: 60, Automation: 40 },
    RESPOND: { SIEM: 35, Automation: 30, 'Digital Risk Protection': 20, 'Managed Services': 15 },
    RECOVER: null,
  },
  USERS: {
    GOVERN: { 'Cyber GRC': 100 },
    IDENTIFY: { 'Vulnerability Management': 50, 'Surface Command': 25, SIEM: 25 },
    PROTECT: { SIEM: 50, Automation: 50 },
    DETECT: { SIEM: 60, Automation: 40 },
    RESPOND: { SIEM: 35, Automation: 30, 'Digital Risk Protection': 20, 'Managed Services': 15 },
    RECOVER: null,
  },
  DATA: {
    GOVERN: { 'Cyber GRC': 100 },
    IDENTIFY: { 'Cloud Security': 50, DSPM: 50 },
    PROTECT: { 'Cloud Security': 50, DSPM: 50 },
    DETECT: { SIEM: 60, Automation: 40 },
    RESPOND: { SIEM: 45, Automation: 25, 'Digital Risk Protection': 15, 'Managed Services': 15 },
    RECOVER: null,
  },
  DOCUMENTATION: {
    GOVERN: { 'Cyber GRC': 100 },
    IDENTIFY: null,
    PROTECT: { DSPM: 50, 'Cyber GRC': 50 },
    DETECT: { DSPM: 100 },
    RESPOND: { SIEM: 40, Automation: 30, 'Managed Services': 30 },
    RECOVER: null,
  },
};

// ─── End Coverage Matrix static data ────────────────────────────────────────

interface DetectionRuleRow {
  id: string;
  rule: string;
  alerts: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface MeanTimeRow {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  meanTime: string;
  trend: string;
  alertsGenerated: number;
}

type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

interface PolicyFailingRow {
  id: string;
  policy: string;
  failingAssetsPercent: number;
  monthly: string;
  monthlyDirection: 'up' | 'down';
}

interface LeastCompliantTagRow {
  id: string;
  tag: string;
  scorePercent: number;
  monthly: string;
  monthlyDirection: 'up' | 'down';
}

const incidentCardSurface = (theme: Theme) => ({
  bgcolor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',
  height: '100%',
});

const getPriorityChipColor = (value: PriorityLevel): 'error' | 'warning' | 'success' => {
  if (value === 'Critical' || value === 'High') {
    return 'error';
  }
  if (value === 'Medium') {
    return 'warning';
  }
  return 'success';
};

const getPriorityChipIcon = (value: PriorityLevel): React.ReactElement => {
  if (value === 'Critical') {
    return <ImpactCritical fontSize="small" />;
  }
  if (value === 'High') {
    return <ImpactHigh fontSize="small" />;
  }
  if (value === 'Medium') {
    return <ImpactMedium fontSize="small" />;
  }
  return <ImpactLow fontSize="small" />;
};

export const CommandHome: React.FC = () => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = useState(0);
  const [licensedProducts, setLicensedProducts] = useState<Set<ProductName>>(
    () => new Set(coverageProducts.filter((p) => p.defaultLicensed).map((p) => p.name)),
  );
  const [isCoverageDialogOpen, setIsCoverageDialogOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const [showProductAvatars, setShowProductAvatars] = useState(true);
  const [showCoverageState, setShowCoverageState] = useState(true);
  const [showPercentageCoverage, setShowPercentageCoverage] = useState(true);

  const toggleProduct = (name: ProductName) => {
    setLicensedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const closeSettingsMenu = () => {
    setSettingsAnchorEl(null);
  };
  const tokenTheme = theme.palette as Theme['palette'] & { brand: 'Original' | 'Callisto'; mode: 'light' | 'dark' };
  const semanticTokens = getValue('semantic', tokenTheme.brand, tokenTheme.mode);
  const dataVizTokens = getValue('dataViz', tokenTheme.brand, tokenTheme.mode);
  const statusTokens = semanticTokens.status;
  const categoricalTokens = dataVizTokens.categorical;
  const sentimentTokens = dataVizTokens.sentiment;
  const categoricalRamp = [
    categoricalTokens['10'],
    categoricalTokens['20'],
    categoricalTokens['30'],
    categoricalTokens['40'],
    categoricalTokens['50'],
  ];
  const metricTone = {
    critical: statusTokens.critical.main,
    high: statusTokens.high.main,
    medium: statusTokens.medium.main,
    low: statusTokens.low.main,
    veryLow: statusTokens.veryLow.main,
    healthy: statusTokens.healthy.main,
  };

  const cardSurface = {
    bgcolor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '10px',
    height: '100%',
  };

  const dashboardDataGridInCardSx = {
    '& > .MuiCard-root': {
      bgcolor: 'transparent',
      border: 'none',
      boxShadow: 'none',
    },
    '& .MuiDataGrid-root': {
      border: 'none',
    },
  };

  const detectionRuleRows: DetectionRuleRow[] = [
    { id: 'r1', rule: 'Amazon GuardDuty - High', alerts: 561, priority: 'Critical' },
    { id: 'r2', rule: 'Suspicious Process - Nets', alerts: 547, priority: 'High' },
    { id: 'r3', rule: 'User Behavior - A User', alerts: 489, priority: 'Medium' },
    { id: 'r4', rule: 'Critical Rule for File M...', alerts: 300, priority: 'Low' },
    { id: 'r5', rule: 'User Behavior - A 10m', alerts: 100, priority: 'Low' },
  ];

  const meanTimeRows: MeanTimeRow[] = [
    { id: 'm1', priority: 'Critical', meanTime: '2 mins', trend: '7% (4 - 50 secs)', alertsGenerated: 561 },
    { id: 'm2', priority: 'High', meanTime: '54 mins', trend: '15% (1 - 1 min)', alertsGenerated: 547 },
    { id: 'm3', priority: 'Medium', meanTime: '1 hr 56 mins', trend: '15% (1 - 1 min)', alertsGenerated: 480 },
    { id: 'm4', priority: 'Low', meanTime: '7 days 6 hrs 5 mins', trend: '10% (1 - 1 day)', alertsGenerated: 900 },
  ];

  const topFailingPolicyRows: PolicyFailingRow[] = [
    { id: 'p1', policy: 'CIS Microsoft Win...', failingAssetsPercent: 45, monthly: '15% (+1 min)', monthlyDirection: 'up' },
    { id: 'p2', policy: 'CIS Ubuntu Linux', failingAssetsPercent: 39, monthly: '15% (+1 min)', monthlyDirection: 'up' },
    { id: 'p3', policy: 'CIS AWS 1.3.0', failingAssetsPercent: 35, monthly: '15% (-1 min)', monthlyDirection: 'down' },
    { id: 'p4', policy: 'PCI - DSS', failingAssetsPercent: 33, monthly: '15% (+1 min)', monthlyDirection: 'up' },
    { id: 'p5', policy: 'GDPR', failingAssetsPercent: 27, monthly: '15% (-1 min)', monthlyDirection: 'down' },
  ];

  const leastCompliantTagRows: LeastCompliantTagRow[] = [
    { id: 't1', tag: 'EU', scorePercent: 2, monthly: '2%', monthlyDirection: 'up' },
    { id: 't2', tag: 'Jennifer.K', scorePercent: 12, monthly: '2.9%', monthlyDirection: 'up' },
    { id: 't3', tag: 'us-east-1', scorePercent: 15, monthly: '15% (-1 min)', monthlyDirection: 'down' },
    { id: 't4', tag: 'us-west-2', scorePercent: 33, monthly: '15% (+1 min)', monthlyDirection: 'up' },
    { id: 't5', tag: 'gpac-2', scorePercent: 45, monthly: '15% (-1 min)', monthlyDirection: 'down' },
  ];

  const detectionRuleColumns = useMemo<GridColDef<DetectionRuleRow>[]>(
    () => [
      { field: 'rule', headerName: 'Rule', flex: 1.4 },
      { field: 'alerts', headerName: 'Alerts', width: 110, align: 'right', headerAlign: 'right' },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 120,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<DetectionRuleRow, DetectionRuleRow['priority']>) => (
          <Chip
            size="small"
            variant="filled"
            color={getPriorityChipColor(params.value ?? 'Low')}
            icon={getPriorityChipIcon(params.value ?? 'Low')}
            label={params.value}
          />
        ),
      },
    ],
    [],
  );

  const meanTimeColumns = useMemo<GridColDef<MeanTimeRow>[]>(
    () => [
      {
        field: 'priority',
        headerName: 'Priority',
        width: 120,
        renderCell: (params: GridRenderCellParams<MeanTimeRow, MeanTimeRow['priority']>) => (
          <Chip
            size="small"
            variant="filled"
            color={getPriorityChipColor(params.value ?? 'Low')}
            icon={getPriorityChipIcon(params.value ?? 'Low')}
            label={params.value}
          />
        ),
      },
      { field: 'meanTime', headerName: 'Mean Time', flex: 1 },
      {
        field: 'trend',
        headerName: 'Trend',
        flex: 1,
        renderCell: (params: GridRenderCellParams<MeanTimeRow, string>) => (
          <Typography variant="body2" sx={{ color: sentimentTokens.positive.main }}>
            {params.value}
          </Typography>
        ),
      },
      { field: 'alertsGenerated', headerName: 'Alerts Generated', width: 140, align: 'right', headerAlign: 'right' },
    ],
    [
      sentimentTokens.positive.main,
    ],
  );

  const topFailingPolicyColumns = useMemo<GridColDef<PolicyFailingRow>[]>(
    () => [
      { field: 'policy', headerName: 'Policy', flex: 1.2 },
      {
        field: 'failingAssetsPercent',
        headerName: '% Failing Assets',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (value) => `${value}%`,
      },
      {
        field: 'monthly',
        headerName: '% Monthly',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<PolicyFailingRow, string>) => (
          <Typography
            variant="body2"
            sx={{ color: params.row.monthlyDirection === 'down' ? sentimentTokens.positive.main : sentimentTokens.negative.main }}
          >
            {params.value}
          </Typography>
        ),
      },
    ],
    [sentimentTokens.negative.main, sentimentTokens.positive.main],
  );

  const leastCompliantTagColumns = useMemo<GridColDef<LeastCompliantTagRow>[]>(
    () => [
      { field: 'tag', headerName: 'Tag', flex: 1.2 },
      {
        field: 'scorePercent',
        headerName: 'Score',
        width: 110,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (value) => `${value}%`,
      },
      {
        field: 'monthly',
        headerName: '% Monthly',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<LeastCompliantTagRow, string>) => (
          <Typography
            variant="body2"
            sx={{ color: params.row.monthlyDirection === 'down' ? sentimentTokens.negative.main : sentimentTokens.positive.main }}
          >
            {params.value}
          </Typography>
        ),
      },
    ],
    [sentimentTokens.negative.main, sentimentTokens.positive.main],
  );

  const riskOverTimeOptions = {
    ...buildChartBase(theme),
    legend: {
      show: false,
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      boundaryGap: false,
      data: trendLabels,
      type: 'category' as const,
    },
    yAxis: [
      {
        ...buildChartBase(theme).yAxis,
        name: 'Risk',
        type: 'value' as const,
      },
      {
        ...buildChartBase(theme).yAxis,
        name: 'Assets',
        position: 'right' as const,
        splitLine: { show: false },
        type: 'value' as const,
      },
    ],
    series: [
      {
        data: [890, 875, 895, 810],
        itemStyle: { color: categoricalTokens['10'] },
        lineStyle: { color: categoricalTokens['10'], width: 2 },
        name: 'Risk',
        showSymbol: true,
        smooth: true,
        symbolSize: 6,
        type: 'line' as const,
        yAxisIndex: 0,
      },
      {
        data: [3960, 3880, 3810, 3520],
        itemStyle: { color: categoricalTokens['20'] },
        lineStyle: { color: categoricalTokens['20'], width: 2 },
        name: 'Assets',
        showSymbol: true,
        smooth: true,
        symbolSize: 6,
        type: 'line' as const,
        yAxisIndex: 1,
      },
    ],
  };

  const funnelOptions = {
    animation: true,
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
      data: vulnerabilityContextFunnel.map((item) => item.label),
    },
    textStyle: {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      formatter: '{b}: {c}%',
      textStyle: { color: theme.palette.text.primary },
      trigger: 'item' as const,
    },
    series: [
      {
        type: 'funnel' as const,
        left: '8%',
        top: 8,
        bottom: 44,
        width: '84%',
        min: 0,
        max: 100,
        minSize: '16%',
        maxSize: '100%',
        sort: 'descending' as const,
        gap: 2,
        label: {
          color: theme.palette.text.secondary,
          formatter: '{b}',
          position: 'right' as const,
          show: true,
        },
        labelLine: {
          length: 14,
          lineStyle: { color: theme.palette.divider },
          show: true,
        },
        itemStyle: {
          borderColor: theme.palette.action.hover,
          borderWidth: 1,
          color: 'transparent',
        },
        data: vulnerabilityContextFunnel.map((item) => ({ value: item.value, name: item.label })),
        z: 1,
      },
      {
        type: 'funnel' as const,
        left: '8%',
        top: 8,
        bottom: 44,
        width: '84%',
        min: 0,
        max: 100,
        minSize: '16%',
        maxSize: '100%',
        sort: 'descending' as const,
        gap: 2,
        label: {
          color: theme.palette.common.white,
          formatter: '{c}%',
          position: 'inside' as const,
          show: true,
        },
        labelLine: { show: false },
        itemStyle: {
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
          color: (params: { dataIndex: number }) => categoricalRamp[params.dataIndex],
        },
        data: vulnerabilityContextFunnel.map((item) => ({ value: item.value, name: item.label })),
        z: 2,
      },
    ],
  };

  const newVsRemediatedOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: trendLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      {
        barMaxWidth: 28,
        data: [24, 62, 165, 48],
        itemStyle: { color: metricTone.critical },
        name: 'New',
        type: 'bar' as const,
      },
      {
        barMaxWidth: 28,
        data: [136, 52, 172, 194],
        itemStyle: { color: metricTone.healthy },
        name: 'Remediated',
        type: 'bar' as const,
      },
      {
        data: [95, 82, 94, 70],
        lineStyle: { color: categoricalTokens['10'], width: 2 },
        itemStyle: { color: categoricalTokens['10'] },
        name: 'Risk Score',
        smooth: true,
        symbolSize: 6,
        type: 'line' as const,
      },
    ],
    tooltip: {
      ...buildChartBase(theme).tooltip,
      trigger: 'axis' as const,
    },
  };

  const agingOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: vulnerabilityAgingLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      { data: [24, 33, 7, 22, 19], itemStyle: { color: statusTokens.critical.dark }, name: 'Critical', stack: 'aging', type: 'bar' as const },
      { data: [28, 41, 11, 30, 23], itemStyle: { color: statusTokens.critical.main }, name: 'High', stack: 'aging', type: 'bar' as const },
      { data: [22, 29, 9, 18, 17], itemStyle: { color: statusTokens.medium.main }, name: 'Medium', stack: 'aging', type: 'bar' as const },
      { data: [18, 20, 6, 13, 11], itemStyle: { color: statusTokens.low.main }, name: 'Low', stack: 'aging', type: 'bar' as const },
      { data: [8, 11, 4, 9, 7], itemStyle: { color: statusTokens.veryLow.main }, name: 'None', stack: 'aging', type: 'bar' as const },
    ],
  };

  const remediatedByCriticalityOptions = {
    ...buildChartBase(theme),
    legend: { show: false },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      type: 'value' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      data: remediatedLabels,
      inverse: true,
      type: 'category' as const,
    },
    series: [
      {
        data: [297, 157, 358, 176, 110],
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: (params: { dataIndex: number }) => [
            statusTokens.critical.dark,
            statusTokens.critical.main,
            statusTokens.medium.main,
            statusTokens.low.main,
            statusTokens.veryLow.main,
          ][params.dataIndex],
        },
        label: {
          color: theme.palette.text.primary,
          position: 'right' as const,
          show: true,
        },
        type: 'bar' as const,
      },
    ],
  };

  const estimatedAgentCoverageOptions = {
    ...buildChartBase(theme),
    legend: { show: false },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      boundaryGap: false,
      data: trendLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      {
        data: [180, 620, 560, 940, 1500, 980, 1040],
        lineStyle: { color: categoricalTokens['10'], width: 3 },
        areaStyle: { color: categoricalTokens['10'], opacity: 0.24 },
        itemStyle: { color: categoricalTokens['10'] },
        smooth: true,
        symbolSize: 7,
        type: 'line' as const,
      },
    ],
  };

  const threatPipelineOptions = {
    animation: true,
    textStyle: {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
      data: threatPipelineFunnel.map((item) => item.label),
    },
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      formatter: '{b}: {c}',
      textStyle: { color: theme.palette.text.primary },
      trigger: 'item' as const,
    },
    series: [
      {
        type: 'funnel' as const,
        left: '8%',
        top: 8,
        bottom: 44,
        width: '84%',
        min: 0,
        max: 3564,
        sort: 'descending' as const,
        minSize: '16%',
        maxSize: '100%',
        gap: 2,
        label: {
          show: true,
          position: 'right' as const,
          formatter: '{b}',
          color: theme.palette.text.secondary,
        },
        labelLine: { length: 14, lineStyle: { color: theme.palette.divider }, show: true },
        itemStyle: {
          borderColor: theme.palette.action.hover,
          borderWidth: 1,
          color: 'transparent',
        },
        data: threatPipelineFunnel.map((item) => ({ value: item.value, name: item.label })),
        z: 1,
      },
      {
        type: 'funnel' as const,
        left: '8%',
        top: 8,
        bottom: 44,
        width: '84%',
        min: 0,
        max: 3564,
        minSize: '16%',
        maxSize: '100%',
        sort: 'descending' as const,
        gap: 2,
        label: {
          show: true,
          position: 'inside' as const,
          formatter: (params: { value: number }) => `${Math.round((params.value / threatPipelineFunnel[0].value) * 100)}%`,
          color: theme.palette.common.white,
        },
        labelLine: { show: false },
        itemStyle: {
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
          color: (params: { dataIndex: number }) => categoricalRamp[params.dataIndex],
        },
        data: threatPipelineFunnel.map((item) => ({ value: item.value, name: item.label })),
        z: 2,
      },
    ],
  };

  const complianceScoreOptions = {
    animation: true,
    textStyle: {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    graphic: [
      {
        type: 'text',
        left: '34%',
        top: '46%',
        style: {
          text: '65%',
          fill: theme.palette.text.primary,
          font: `700 30px ${theme.typography.fontFamily}`,
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        left: '34%',
        top: '57%',
        style: {
          text: 'Compliant',
          fill: theme.palette.text.secondary,
          font: `500 13px ${theme.typography.fontFamily}`,
          textAlign: 'center',
        },
      },
    ],
    legend: {
      orient: 'vertical' as const,
      right: 4,
      top: 'center',
      textStyle: { color: theme.palette.text.secondary },
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['58%', '78%'],
        center: ['34%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: theme.palette.background.paper, borderWidth: 2 },
        data: [
          { name: 'Passed', value: 4760, itemStyle: { color: sentimentTokens.positive.main } },
          { name: 'Failed', value: 3112, itemStyle: { color: sentimentTokens.negative.main } },
        ],
      },
    ],
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      textStyle: { color: theme.palette.text.primary },
      trigger: 'item' as const,
    },
  };

  const complianceTrendOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: ['Jan 1', 'Feb 1', 'Mar 1', 'Apr 1'],
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      min: 60,
      max: 100,
      type: 'value' as const,
    },
    series: [
      {
        data: [63, 73, 89, 80],
        name: 'Compliant Assets',
        type: 'line' as const,
        smooth: true,
        symbolSize: 7,
        lineStyle: { color: categoricalTokens['10'], width: 3 },
        itemStyle: { color: categoricalTokens['10'] },
        areaStyle: { color: categoricalTokens['10'], opacity: 0.22 },
      },
    ],
  };

  const complianceByFrameworkOptions = {
    ...buildChartBase(theme),
    legend: { show: false },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: complianceFrameworkLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      min: 60,
      max: 100,
      type: 'value' as const,
      name: 'Compliance Score',
    },
    series: [
      {
        type: 'bar' as const,
        barMaxWidth: 140,
        data: [88, 86, 77, 79],
        itemStyle: { color: categoricalTokens['10'], borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top' as const,
          color: theme.palette.text.primary,
          formatter: (params: { value: number }) => `${params.value}% Compliant`,
        },
      },
    ],
  };

  const alertsByMitreOptions = {
    animation: true,
    textStyle: {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    radar: {
      center: ['50%', '46%'],
      radius: '74%',
      axisName: {
        color: theme.palette.text.secondary,
      },
      indicator: mitreLabels.map((label) => ({ name: label, max: 100 })),
      splitArea: {
        areaStyle: {
          color: [theme.palette.background.paper, theme.palette.action.hover],
        },
      },
      splitLine: {
        lineStyle: {
          color: theme.palette.divider,
        },
      },
      splitNumber: 4,
    },
    series: [
      {
        type: 'radar' as const,
        data: [
          {
            value: [42, 88, 73, 58, 39, 62, 47, 35, 26, 77],
            name: 'Your Organization',
            areaStyle: {
              color: categoricalTokens['10'],
              opacity: 0.2,
            },
            lineStyle: {
              color: categoricalTokens['10'],
              width: 2,
            },
          },
          {
            value: [31, 65, 57, 48, 33, 55, 38, 28, 22, 61],
            name: 'Rapid7 Customer Average',
            areaStyle: {
              color: categoricalTokens['20'],
              opacity: 0.16,
            },
            lineStyle: {
              color: categoricalTokens['20'],
              width: 2,
            },
          },
        ],
        emphasis: {
          focus: 'series',
        },
        symbolSize: 5,
      },
    ],
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      textStyle: {
        color: theme.palette.text.primary,
      },
      trigger: 'item' as const,
    },
  };

  const originOfAlertsOptions = {
    animation: true,
    textStyle: {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['32%', '72%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          color: theme.palette.text.secondary,
        },
        labelLine: {
          lineStyle: { color: theme.palette.divider },
        },
        itemStyle: { borderColor: theme.palette.background.paper, borderWidth: 2 },
        data: [
          { value: 31, name: 'Endpoint', itemStyle: { color: categoricalTokens['10'] } },
          { value: 22, name: 'Network', itemStyle: { color: categoricalTokens['20'] } },
          { value: 19, name: 'Identity', itemStyle: { color: categoricalTokens['30'] } },
          { value: 17, name: 'Cloud', itemStyle: { color: categoricalTokens['40'] } },
          { value: 11, name: 'Applications', itemStyle: { color: categoricalTokens['50'] } },
        ],
      },
    ],
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      textStyle: {
        color: theme.palette.text.primary,
      },
      trigger: 'item' as const,
    },
  };

  const socWorkflowOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: incidentTrendLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      { name: 'Generated', type: 'bar' as const, stack: 'workflow', data: [132, 128, 95, 104, 22], itemStyle: { color: categoricalTokens['10'] } },
      { name: 'Triaged', type: 'bar' as const, stack: 'workflow', data: [0, 0, 72, 31, 11], itemStyle: { color: categoricalTokens['20'] } },
      { name: 'Closed', type: 'bar' as const, stack: 'workflow', data: [0, 0, 0, 88, 17], itemStyle: { color: categoricalTokens['30'] } },
      { name: 'Escalated', type: 'bar' as const, stack: 'workflow', data: [0, 0, 0, 12, 4], itemStyle: { color: categoricalTokens['40'] } },
    ],
  };

  const investigationsClosedOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: incidentTrendLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      { name: 'Active', type: 'bar' as const, data: [74, 28, 81, 60, 11], itemStyle: { color: categoricalTokens['10'] } },
      { name: 'Marked as Closed', type: 'bar' as const, data: [41, 29, 51, 62, 7], itemStyle: { color: statusTokens.healthy.main } },
      { name: 'Marked as Malicious', type: 'bar' as const, data: [47, 26, 70, 59, 8], itemStyle: { color: statusTokens.critical.main } },
    ],
  };

  const activeAlertsAgeOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: alertsAgeLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      { name: 'Critical', type: 'bar' as const, stack: 'alerts', data: [10, 16, 4, 10, 7], itemStyle: { color: statusTokens.critical.main } },
      { name: 'High', type: 'bar' as const, stack: 'alerts', data: [24, 38, 10, 32, 25], itemStyle: { color: statusTokens.high.main } },
      { name: 'Medium', type: 'bar' as const, stack: 'alerts', data: [36, 44, 10, 28, 31], itemStyle: { color: statusTokens.medium.main } },
      { name: 'Low', type: 'bar' as const, stack: 'alerts', data: [17, 24, 5, 20, 18], itemStyle: { color: statusTokens.low.main } },
    ],
  };

  const activeInvestigationsAgeOptions = {
    ...buildChartBase(theme),
    legend: {
      bottom: 0,
      itemHeight: 8,
      itemWidth: 10,
      textStyle: { color: theme.palette.text.secondary },
    },
    xAxis: {
      ...buildChartBase(theme).xAxis,
      data: investigationAgeLabels,
      type: 'category' as const,
    },
    yAxis: {
      ...buildChartBase(theme).yAxis,
      type: 'value' as const,
    },
    series: [
      { name: 'Critical', type: 'bar' as const, stack: 'investigations', data: [0, 1, 0, 1, 0], itemStyle: { color: statusTokens.critical.main } },
      { name: 'High', type: 'bar' as const, stack: 'investigations', data: [0, 2, 0, 2, 0], itemStyle: { color: statusTokens.high.main } },
      { name: 'Medium', type: 'bar' as const, stack: 'investigations', data: [0, 0, 0, 1, 0], itemStyle: { color: statusTokens.medium.main } },
      { name: 'Low', type: 'bar' as const, stack: 'investigations', data: [1, 0, 1, 0, 0], itemStyle: { color: statusTokens.low.main } },
    ],
  };

  // ─── AI Command Center ─────────────────────────────────────────────────────

  const renderExposureManagement = () => (
    <Box
      sx={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: {
          xs: '1fr',
          lg: '1fr 1.35fr',
        },
      }}
    >
      <Card sx={cardSurface}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DashboardCardHeader
            title="Your Organization&apos;s Risk"
            subheader="A normalized score based on all known vulnerabilities and assets."
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', flex: 1 }}>
            <Typography
              variant="display1"
              sx={{
                color: theme.palette.text.primary,
                fontSize: '64px',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              677
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '32px',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              /1000
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={cardSurface}>
        <CardContent sx={{ height: '100%' }}>
          <DashboardCardHeader title="Risk Over Time" subheader="Assess the effectiveness of your risk management efforts." />
          <Box sx={{ display: 'flex', gap: '12px', mb: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Risk
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              677
            </Typography>
            <Chip label="12.1% (-102)" color="success" size="small" variant="filled" />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: '8px' }}>
              Assets
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              21268
            </Typography>
            <Chip label="8.2% (-303)" color="error" size="small" variant="filled" />
          </Box>
          <Box sx={{ display: 'flex', gap: '12px', mb: '12px', alignItems: 'center' }}>
            <Box sx={{ width: '10px', height: '10px', borderRadius: '999px', bgcolor: categoricalTokens['10'] }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Risk
            </Typography>
            <Box sx={{ width: '10px', height: '10px', borderRadius: '999px', bgcolor: categoricalTokens['20'], ml: '8px' }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Assets
            </Typography>
          </Box>
          <Box sx={{ height: '240px' }}>
            <ReactEChartsCore
              echarts={echarts}
              notMerge
              option={riskOverTimeOptions}
              opts={{ renderer: 'svg' }}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={cardSurface}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DashboardCardHeader
            title="Vulnerability Context"
            subheader="Follow the contraction from total vulnerabilities to highest-priority exploit paths."
          />
          <Box sx={{ flex: 1, minHeight: '240px', mt: '12px' }}>
            <ReactEChartsCore
              echarts={echarts}
              notMerge
              option={funnelOptions}
              opts={{ renderer: 'svg' }}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={cardSurface}>
        <CardContent>
          <DashboardCardHeader
            title="New vs Remediated Vulnerabilities"
            subheader="This balance is crucial to gauging if security efforts are outpaced by new discoveries."
          />
          <Box sx={{ height: '220px' }}>
            <ReactEChartsCore
              echarts={echarts}
              notMerge
              option={newVsRemediatedOptions}
              opts={{ renderer: 'svg' }}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={cardSurface}>
        <CardContent>
          <DashboardCardHeader
            title="Aging of Vulnerabilities"
            subheader="Understand if SLAs are achieved and highlight potential inefficiencies in remediation."
          />
          <Box sx={{ height: '220px' }}>
            <ReactEChartsCore
              echarts={echarts}
              notMerge
              option={agingOptions}
              opts={{ renderer: 'svg' }}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={cardSurface}>
        <CardContent>
          <DashboardCardHeader
            title="Remediated Vulnerabilities by Criticality"
            subheader="Highlights if elevation is taking place and progress in remediation."
          />
          <Box sx={{ height: '220px' }}>
            <ReactEChartsCore
              echarts={echarts}
              notMerge
              option={remediatedByCriticalityOptions}
              opts={{ renderer: 'svg' }}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderIncidentCommand = () => (
    <Box sx={{ display: 'grid', gap: '16px' }}>
      <KpiContainer variant="CARD">
        {incidentKpis.map((item) => (
          <Kpi key={item.label} value={item.value} Icon={item.icon} label={item.label} />
        ))}
      </KpiContainer>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.1fr 0.9fr',
          },
        }}
      >
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Estimated Agent Coverage" subheader="Assets with an Insight Agent: 86%" />
            <Box sx={{ height: '230px', mt: '12px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={estimatedAgentCoverageOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
            <Button variant="outlined" size="small" sx={{ mt: '8px' }} endIcon={<NextChevronRightArrow fontSize="small" />}>
              Go to Insight Agent Coverage Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <DashboardCardHeader title="Threat Pipeline" subheader="View logs as they narrow from collection to threats." />
            <Box sx={{ flex: 1, minHeight: '240px', mt: '12px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={threatPipelineOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {incidentSummaryKpis.map((item) => (
          <Card key={item.label} sx={incidentCardSurface(theme)}>
            <CardContent sx={{ height: '100%' }}>
              <Kpi value={item.value} Icon={item.icon} label={item.label} />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader
              title="Alerts by MITRE Tactic"
              subheader="Pivot what alerts originate by priority across operational domains."
            />
            <Box sx={{ height: '260px', mt: '8px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={alertsByMitreOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Origin of Alerts" subheader="Pivot alerts by operational domain." />
            <Box sx={{ height: '260px', mt: '8px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={originOfAlertsOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader
              title="Top 5 Alert-Generating Detection Rules"
              subheader="Identify the detections that most frequently generate alerts."
            />
            <Box sx={dashboardDataGridInCardSx}>
              <DataGridTable
                columns={detectionRuleColumns}
                rows={detectionRuleRows}
                totalCount={detectionRuleRows.length}
                isClientSide
                isLoading={false}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
              />
            </Box>
            <Button variant="outlined" size="small" sx={{ mt: '12px' }} endIcon={<NextChevronRightArrow fontSize="small" />}>
              Go to Detection Rules
            </Button>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader
              title="Mean Time to Begin Investigating"
              subheader="Track initial alert responses to identify delays and ensure SLA compliance."
            />
            <Box sx={dashboardDataGridInCardSx}>
              <DataGridTable
                columns={meanTimeColumns}
                rows={meanTimeRows}
                totalCount={meanTimeRows.length}
                isClientSide
                isLoading={false}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="SOC Alert Workflow" subheader="Track the flow of alerts through triage, escalation, and closure." />
            <Box sx={{ height: '240px', mt: '12px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={socWorkflowOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader
              title="Active Investigations vs. Closed and Malicious Dispositions"
              subheader="Track the progress of investigations through key resolutions."
            />
            <Box sx={{ height: '240px', mt: '12px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={investigationsClosedOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Age of Active Alerts" subheader="Identify inefficiencies and alerts at risk of missing SLA." />
            <Box sx={{ height: '220px', mt: '12px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={activeAlertsAgeOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader
              title="Age of Active Investigations"
              subheader="Identify aging investigations that may require follow-up or escalation."
            />
            <Box sx={{ height: '220px', mt: '12px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={activeInvestigationsAgeOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {incidentFooterKpis.map((metric) => (
          <Card key={metric.label} sx={incidentCardSurface(theme)}>
            <CardContent>
              <Kpi value={metric.value} Icon={metric.icon} label={metric.label} />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {metric.sublabel}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const renderCompliance = () => (
    <Box sx={{ display: 'grid', gap: '16px' }}>
      <Box sx={{ display: 'grid', gap: '12px' }}>
        <KpiContainer variant="CARD">
          {complianceKpis.map((item) => (
            <Kpi key={item.label} value={item.value} Icon={item.icon} label={item.label} detailSections={item.detailSections} />
          ))}
        </KpiContainer>
      </Box>

      <Box sx={{ display: 'grid', gap: '16px', gridTemplateColumns: { xs: '1fr', xl: '1fr 2fr' } }}>
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Compliance Score" />
            <Chip size="small" color="success" variant="filled" label="15% (+134 assets)" sx={{ mt: '8px' }} />
            <Box sx={{ height: '250px', mt: '10px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={complianceScoreOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Compliance Score Trend Over Time" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '8px' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Assets Compliant</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>89%</Typography>
              <Chip size="small" color="success" variant="filled" label="2% (+67)" />
            </Box>
            <Box sx={{ height: '250px', mt: '10px' }}>
              <ReactEChartsCore echarts={echarts} notMerge option={complianceTrendOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card sx={incidentCardSurface(theme)}>
        <CardContent>
          <DashboardCardHeader title="Compliance Score By Framework or Standard" />
          <Box sx={{ height: '260px', mt: '10px' }}>
            <ReactEChartsCore echarts={echarts} notMerge option={complianceByFrameworkOptions} opts={{ renderer: 'svg' }} style={{ height: '100%', width: '100%' }} />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gap: '16px', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' } }}>
        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Top Failing Policies" />
            <Box sx={dashboardDataGridInCardSx}>
              <DataGridTable
                columns={topFailingPolicyColumns}
                rows={topFailingPolicyRows}
                totalCount={topFailingPolicyRows.length}
                isClientSide
                isLoading={false}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
              />
            </Box>
            <Button variant="outlined" size="small" sx={{ mt: '12px' }} endIcon={<NextChevronRightArrow fontSize="small" />}>Go to Policies</Button>
          </CardContent>
        </Card>

        <Card sx={incidentCardSurface(theme)}>
          <CardContent>
            <DashboardCardHeader title="Least Compliant Tags" />
            <Box sx={dashboardDataGridInCardSx}>
              <DataGridTable
                columns={leastCompliantTagColumns}
                rows={leastCompliantTagRows}
                totalCount={leastCompliantTagRows.length}
                isClientSide
                isLoading={false}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
              />
            </Box>
            <Button variant="outlined" size="small" sx={{ mt: '12px' }} endIcon={<NextChevronRightArrow fontSize="small" />}>Go to Tags</Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderCoverageMatrix = () => {
    const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

    const getCoverage = (asset: AssetType, nist: NistFunction): number | null => {
      const cellWeights = coverageMap[asset][nist];
      if (cellWeights === null) return null;

      let total = 0;
      Object.entries(cellWeights).forEach(([productName, weight]) => {
        if (licensedProducts.has(productName as ProductName)) {
          total += weight ?? 0;
        }
      });

      return clampPercentage(total);
    };

    const getCoverageGainForProduct = (product: ProductName, asset: AssetType, nist: NistFunction): number => {
      const cellWeights = coverageMap[asset][nist];
      if (cellWeights === null) return 0;

      const currentCoverage = getCoverage(asset, nist) ?? 0;
      const nextCoverage = clampPercentage(currentCoverage + (cellWeights[product] ?? 0));
      return nextCoverage - currentCoverage;
    };

    let applicableCells = 0;
    let cellsWithCoverage = 0;
    let coverageSum = 0;

    ASSET_TYPES.forEach((asset) => {
      NIST_FUNCTIONS.forEach((nist) => {
        const cov = getCoverage(asset, nist);
        if (cov !== null) {
          applicableCells++;
          coverageSum += cov;
          if (cov > 0) cellsWithCoverage++;
        }
      });
    });

    const avgCoverage = applicableCells > 0 ? Math.round(coverageSum / applicableCells) : 0;

    const recommendations = coverageProducts
      .filter((p) => !licensedProducts.has(p.name))
      .map((p) => {
        let newCellsGained = 0;
        let improvedCells = 0;
        let pointsGained = 0;

        ASSET_TYPES.forEach((asset) => {
          NIST_FUNCTIONS.forEach((nist) => {
            const gain = getCoverageGainForProduct(p.name, asset, nist);
            const currentCoverage = getCoverage(asset, nist);

            if (currentCoverage !== null && gain > 0) {
              improvedCells++;
              pointsGained += gain;

              if (currentCoverage === 0) {
                newCellsGained++;
              }
            }
          });
        });

        return { ...p, improvedCells, newCellsGained, pointsGained };
      })
      .filter((p) => p.improvedCells > 0)
      .sort((a, b) => b.pointsGained - a.pointsGained || b.newCellsGained - a.newCellsGained || b.improvedCells - a.improvedCells);

    const getCellStyle = (coverage: number | null) => {
      if (coverage === null) {
        return {
          bgcolor: `${statusTokens.veryLow.main}1a`,
          borderColor: `${statusTokens.veryLow.main}66`,
          textColor: theme.palette.text.primary,
          barColor: 'transparent',
        };
      }
      if (coverage === 0) {
        return {
          bgcolor: `${statusTokens.critical.main}1a`,
          borderColor: `${statusTokens.critical.main}66`,
          textColor: theme.palette.text.primary,
          barColor: statusTokens.critical.main,
        };
      }
      if (coverage === 100) {
        return {
          bgcolor: `${statusTokens.healthy.main}1a`,
          borderColor: `${statusTokens.healthy.main}66`,
          textColor: theme.palette.text.primary,
          barColor: statusTokens.healthy.main,
        };
      }
      return {
        bgcolor: `${statusTokens.medium.main}1a`,
        borderColor: `${statusTokens.medium.main}66`,
        textColor: theme.palette.text.primary,
        barColor: statusTokens.medium.main,
      };
    };

    return (
      <Box sx={{ display: 'grid', gap: '16px' }}>
        <Box
          sx={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: { xs: '1fr', xl: '1fr 3fr' },
            alignItems: 'start',
          }}
        >
          {/* Licensed Products panel */}
          <Card sx={incidentCardSurface(theme)}>
            <CardHeader
              title="Licensed Products"
              subheader="Toggle products to simulate licensing scenarios and see how your coverage score changes."
            />
            <CardContent sx={{ pt: 0, pb: '16px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {coverageProducts.map((product) => {
                  const ProductIcon = productIcons[product.name];
                  return (
                    <Box
                      key={product.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: '6px',
                      }}
                    >
                    <Checkbox
                      size="small"
                      checked={licensedProducts.has(product.name)}
                      onChange={() => toggleProduct(product.name)}
                      sx={{ p: '2px', mr: '8px' }}
                    />
                    <ProductIcon
                      fontSize="small"
                      sx={{
                        mr: '4px',
                        flexShrink: 0,
                        color: theme.palette.text.primary,
                        '& *[fill]:not([fill="none"])': { fill: `${theme.palette.text.primary} !important` },
                        '& *[stroke]:not([stroke="none"])': { stroke: `${theme.palette.text.primary} !important` },
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1, color: theme.palette.text.primary }}>
                      {product.name}
                    </Typography>
                    {product.defaultLicensed && (
                      <Chip icon={<Verified fontSize="small" />} label="Licensed" size="nano" />
                    )}
                  </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gap: '16px' }}>
            <KpiContainer variant="CARD">
              <Kpi value={licensedProducts.size} Icon={<ThreatCommand />} label="Products Licensed" />
              <Kpi value={avgCoverage} Icon={<Workflow />} label="Coverage Score" />
              <Kpi value={cellsWithCoverage} Icon={<CheckSuccessHealthy />} label="Applicable Cells Covered" />
              <Kpi value={avgCoverage} Icon={<Workflow />} label="Avg Coverage Weight" />
            </KpiContainer>

            {/* Matrix card */}
            <Card sx={incidentCardSurface(theme)}>
              <CardContent>
                <DashboardCardHeader
                  title="Coverage Matrix"
                  subheader="Defender coverage across the six NIST Cybersecurity Framework functions and the CIS Controls v8 asset types, scored against the Rapid7 products you’re licensed for."
                  action={(
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tooltip title="Info" placement="top" arrow>
                        <IconButton aria-label="matrix info" onClick={() => setIsCoverageDialogOpen(true)} size="small">
                          <InformationHint fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Settings" placement="top" arrow>
                        <IconButton
                          aria-controls={settingsAnchorEl ? 'coverage-matrix-settings' : undefined}
                          aria-expanded={settingsAnchorEl ? 'true' : undefined}
                          aria-haspopup="true"
                          aria-label="matrix settings"
                          onClick={toggleSettingsMenu}
                          size="small"
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                />
                <Menu
                  anchorEl={settingsAnchorEl}
                  id="coverage-matrix-settings"
                  MenuListProps={{ dense: true }}
                  onClose={closeSettingsMenu}
                  open={Boolean(settingsAnchorEl)}
                >
                  <MenuItem onClick={() => setShowProductAvatars((prev) => !prev)} sx={{ justifyContent: 'flex-start' }}>
                    <Checkbox checked={showProductAvatars} size="small" />
                    <Typography variant="body2" sx={{ textAlign: 'left' }}>Show products</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => setShowCoverageState((prev) => !prev)} sx={{ justifyContent: 'flex-start' }}>
                    <Checkbox checked={showCoverageState} size="small" />
                    <Typography variant="body2" sx={{ textAlign: 'left' }}>Show coverage</Typography>
                  </MenuItem>
                </Menu>
                <Box sx={{ overflowX: 'visible', mt: '8px' }}>
                  <Box sx={{ minWidth: '600px' }}>
                    {/* Column headers */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '130px repeat(6, 1fr)',
                        gap: '6px',
                        mb: '6px',
                        alignItems: 'center',
                      }}
                    >
                      <Box />
                      {NIST_FUNCTIONS.map((fn) => (
                        <Typography
                          key={fn}
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            textAlign: 'center',
                            letterSpacing: '0.06em',
                            display: 'block',
                          }}
                        >
                          {`${fn.charAt(0)}${fn.slice(1).toLowerCase()}`}
                        </Typography>
                      ))}
                    </Box>

                    {/* Asset type rows */}
                    {ASSET_TYPES.map((asset) => (
                      <Box
                        key={asset}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '130px repeat(6, 1fr)',
                          gap: '6px',
                          mb: '6px',
                          alignItems: 'stretch',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              letterSpacing: '0.06em',
                              textAlign: 'right',
                              pr: '16px',
                            }}
                          >
                            {`${asset.charAt(0)}${asset.slice(1).toLowerCase()}`}
                          </Typography>
                        </Box>
                        {NIST_FUNCTIONS.map((nist) => {
                          const coverage = getCoverage(asset, nist);
                          const style = getCellStyle(coverage);
                          const mappedProducts = coverageMap[asset][nist] ? (Object.keys(coverageMap[asset][nist] as CoverageWeights) as ProductName[]) : [];
                          const isCovered = (coverage ?? 0) > 0;

                          return coverage === null ? (
                            <Card
                              key={nist}
                              variant="outlined"
                              sx={{
                                bgcolor: style.bgcolor,
                                borderColor: style.borderColor,
                                borderRadius: '8px',
                                boxShadow: theme.shadows[1],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 'auto',
                                px: '10px',
                                py: '8px',
                                overflow: 'visible',
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '16px', textAlign: 'center' }}
                              >
                                N/A
                              </Typography>
                            </Card>
                          ) : (
                            <Box
                              key={nist}
                              sx={{
                                bgcolor: style.bgcolor,
                                border: `1px solid ${style.borderColor}`,
                                borderRadius: '8px',
                                boxShadow: theme.shadows[1],
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'stretch',
                                height: 'auto',
                                px: '10px',
                                pt: '8px',
                                pb: '8px',
                                position: 'relative',
                                overflow: 'visible',
                              }}
                            >
                                  {/* Status icon — absolute top-right */}
                                  {showCoverageState && (
                                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                      {isCovered ? (
                                        <Tooltip title="Covered" placement="top" arrow>
                                          <Box component="span" sx={{ display: 'inline-flex' }}>
                                            <CheckSuccessHealthy fontSize="small" sx={{ color: theme.palette.text.primary, display: 'block' }} />
                                          </Box>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="No Coverage" placement="top" arrow>
                                          <Box component="span" sx={{ display: 'inline-flex' }}>
                                            <Clear fontSize="small" sx={{ color: theme.palette.text.primary, display: 'block' }} />
                                          </Box>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  )}

                                  {/* Percentage */}
                                  {showPercentageCoverage && (
                                    <Typography
                                      variant="code1"
                                      sx={{
                                        color: style.textColor,
                                        fontSize: '18px',
                                        mb: '6px',
                                      }}
                                    >
                                      {`${coverage}%`}
                                    </Typography>
                                  )}

                                  {/* Progress bar */}
                                  {showPercentageCoverage && (
                                    <LinearProgress
                                      value={coverage}
                                      variant="determinate"
                                      sx={{
                                        height: 6,
                                        borderRadius: '999px',
                                        bgcolor: theme.palette.action.hover,
                                        mb: '12px',
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: style.barColor,
                                        },
                                      }}
                                    />
                                  )}

                                  {showProductAvatars ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                      {mappedProducts.map((productName) => {
                                        const ProductIcon = productIcons[productName];
                                        const active = licensedProducts.has(productName);
                                        return (
                                          <Tooltip key={`${asset}-${nist}-${productName}`} title={productName} placement="top" arrow>
                                            <Box
                                              component="span"
                                              sx={{
                                                display: 'inline-flex',
                                                flexShrink: 0,
                                                opacity: active ? 1 : 0.45,
                                              }}
                                            >
                                              <ProductIcon
                                                fontSize="small"
                                                sx={{
                                                  color: theme.palette.text.primary,
                                                  '& *[fill]:not([fill="none"])': { fill: `${theme.palette.text.primary} !important` },
                                                  '& *[stroke]:not([stroke="none"])': { stroke: `${theme.palette.text.primary} !important` },
                                                }}
                                              />
                                            </Box>
                                          </Tooltip>
                                        );
                                      })}
                                    </Box>
                                  ) : null}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recommendations */}
        <Card sx={{ ...incidentCardSurface(theme), width: '100%' }}>
          <CardContent>
            <DashboardCardHeader
              title="Recommendations"
              subheader="Add these Rapid7 products to expand your coverage score."
            />
            {recommendations.length === 0 ? (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: '12px' }}>
                You&apos;re fully covered &mdash; no additional products would improve the score.
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: '8px', mt: '8px' }}>
                {recommendations.map((rec) => {
                  const ProductIcon = productIcons[rec.name];
                  const description = productDescriptions[rec.name];
                  return (
                    <Card
                      key={rec.name}
                      variant="outlined"
                      sx={{
                        boxShadow: theme.shadows[1],
                        pointerEvents: 'none',
                        '& *': { pointerEvents: 'auto' },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: '12px !important' }}>
                        <ProductIcon
                          fontSize="small"
                          sx={{
                            flexShrink: 0,
                            color: theme.palette.text.primary,
                            '& *[fill]:not([fill="none"])': { fill: `${theme.palette.text.primary} !important` },
                            '& *[stroke]:not([stroke="none"])': { stroke: `${theme.palette.text.primary} !important` },
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {rec.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <Chip label={`+${rec.pointsGained} pts`} size="nano" />
                          <Button size="small" variant="outlined" endIcon={<NextChevronRightArrow />}>
                            Learn More
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={isCoverageDialogOpen}
          onClose={() => setIsCoverageDialogOpen(false)}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: '48px' }}>
            <Typography variant="h5">Scoring information</Typography>
            <IconButton aria-label="close" onClick={() => setIsCoverageDialogOpen(false)} size="small" sx={{ position: 'absolute', right: 16, top: 16 }}>
              <CancelClose fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box>

              {/* Coverage Adjustments */}
              <Card sx={{ boxShadow: theme.shadows[1] }}>
                <CardHeader title="Coverage Adjustments" subheader="Reductions when infrastructure is incomplete." />
                <CardContent>
                  <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', bgcolor: theme.palette.background.paper }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 1.3fr', px: '16px', py: '8px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      {['COMPONENT', 'PRODUCT AFFECTED', 'SCOPE', 'REDUCTION'].map((h) => (
                        <Typography key={h} variant="overline" sx={{ color: theme.palette.text.secondary }}>{h}</Typography>
                      ))}
                    </Box>
                    {[
                      { component: 'Scan engines', product: 'insightVM', scope: 'All cells', reduction: '-25%' },
                      { component: 'Collectors', product: 'insightIDR', scope: 'All cells', reduction: '-50%' },
                      { component: 'Network sensors', product: 'insightIDR', scope: 'All cells', reduction: '-25%' },
                      { component: 'Honeypots', product: 'insightIDR', scope: 'All cells', reduction: '-10%' },
                      { component: 'Orchestrator', product: 'insightIDR', scope: 'DETECT only', reduction: '-10%' },
                      { component: 'SC connectors < 5', product: 'Surface Command', scope: 'All cells', reduction: '-50%' },
                      { component: 'No event sources', product: 'insightIDR', scope: 'All cells', reduction: '-75%' },
                      { component: '< 5 event sources', product: 'insightIDR', scope: 'All cells', reduction: '-50%' },
                      { component: 'Stale / offline agents', product: 'insightIDR', scope: 'All cells', reduction: '-10% per 10% unhealthy' },
                      { component: 'No ICON workflows', product: 'insightIDR', scope: 'DETECT only', reduction: '-10%' },
                    ].map((row) => (
                      <Box key={row.component} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 1.3fr', px: '16px', py: '10px', borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
                        <Typography variant="body2">{row.component}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{row.product}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{row.scope}</Typography>
                        <Typography variant="body2" sx={{ color: statusTokens.critical.main, fontWeight: 600 }}>{row.reduction}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  const renderAICommandCenter = () => {
    const sectionLabelSx = {
      color: theme.palette.text.secondary,
      pt: '18px',
      fontSize: '13px',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    };

    const aiFeatureCard = (
      Icon: React.ElementType,
      title: string,
      category: string,
      body: string,
      primaryCta: { label: string; href?: string },
      secondaryCta?: { label: string; href?: string },
    ) => (
      <Card sx={incidentCardSurface(theme)}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
          <CardHeader
            title={title}
            subheader={category}
            avatar={
              <Box
                sx={{
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon />
              </Box>
            }
          />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, flex: 1, mb: '8px' }}>
            {body}
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="contained" size="medium" endIcon={<NextChevronRightArrow fontSize="small" />}>
              {primaryCta.label}
            </Button>
            {secondaryCta && (
              <Button variant="outlined" size="medium">
                {secondaryCta.label}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );

    return (
      <Box sx={{ display: 'grid', gap: '32px' }}>

        {/* Hero AI Card */}
        <Card
          variant="ai"
          sx={{
            color: 'rgb(0, 0, 0)',
            boxShadow: 'rgba(31, 44, 54, 0.03) 0px 0.6px 0.8px 0px, rgba(31, 44, 54, 0.04) 0px 2.01px 2.68px 0px, rgba(31, 44, 54, 0.07) 0px 3px 12px 0px',
            transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '8px',
            border: '1px solid rgba(36, 43, 46, 0.12)',
            padding: '24px',
            background: 'radial-gradient(121.29% 63.97% at 95.87% 105.11%, rgba(140, 127, 207, 0.15) 0%, rgba(140, 127, 207, 0) 100%), radial-gradient(112.73% 128.25% at -4.31% 3.64%, rgba(237, 124, 79, 0.15) 0%, rgba(237, 124, 79, 0) 100%)',
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h1" sx={{ fontWeight: 700, mb: '12px', color: theme.palette.text.primary }}>
                Securing your organization with AI, never exposing it
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: '20px', maxWidth: 560 }}>
                At Rapid7, we recognize AI&apos;s potential to strengthen your security posture, but we&apos;re equally aware of the risks it can introduce. We commit to advancing AI features in a responsible way, ensuring each capability delivers clear value. We rely exclusively on trusted, tested LLMs, and our TRiSM framework promises that your data will never be used to train our models or be shared with third parties.
              </Typography>
              <Button variant="contained" size="medium">Learn More about TRISM</Button>
            </Box>
            <Box
              component="img"
              src="/ai-brain.png"
              alt="AI Security Illustration"
              sx={{ width: 200, height: 'auto', flexShrink: 0, display: { xs: 'none', md: 'block' } }}
            />
          </CardContent>
        </Card>

        {/* Cloud Security section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '140px 1fr' }, gap: '16px', alignItems: 'start' }}>
          <Typography variant="body2" sx={sectionLabelSx}>Manage AI Risk</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: '16px' }}>
            {aiFeatureCard(
              SubtleIcons.CloudSecuritySubtle,
              'Strengthen AI/ML compliance in the cloud',
              'Cloud Security • Manage AI Risk',
              "Rapid7's proprietary AI/ML Security Best Practices compliance pack empowers organizations to confidently innovate in the cloud, delivering security-first compliance aligned with emerging AI governance standards.",
              { label: 'Configure Settings' },
              { label: 'View Pack Details' },
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '140px 1fr' }, gap: '16px', alignItems: 'start' }}>
          <Typography variant="body2" sx={sectionLabelSx}>Defend with AI</Typography>
          <Box sx={{ display: 'grid', gap: '16px' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: '16px' }}>
              {aiFeatureCard(
                SubtleIcons.VulnerabilityManagementSubtle,
                'Fill CVSS scoring gaps with AI-powered predictions',
                'Exposure Management',
                'Apply an AI predicted CVSS score to vulnerabilities that don’t currently have them.',
                { label: 'Read the Docs' },
                { label: 'Read the Blog' },
              )}
              {aiFeatureCard(
                SubtleIcons.VulnerabilityManagementSubtle,
                'AI-Generated Risk Intelligence',
                'Exposure Management',
                'Turn complex remediation data into clear, actionable insights. AI-Generated Risk Intelligence combines exploit signals, business context, and vulnerability data to provide remediation summaries with clear guidance.',
                { label: 'Go to Remediation Hub' },
                { label: 'Read the Blog' },
              )}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: '16px' }}>
              {aiFeatureCard(
                SubtleIcons.CloudSecuritySubtle,
                'AI Analysis for Container Runtime Findings',
                'Cloud Security',
                'Understand container runtime detection findings faster with AI-generated analysis and guided remediation. Get clear summaries of attack behavior, impacted resources, and recommended actions so you can investigate and respond with confidence.',
                { label: 'Go to Detection Findings' },
                { label: 'Read the Blog' },
              )}
            </Box>
          </Box>
        </Box>

        {/* AI-Powered SOC */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>AI-Powered SOC</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '140px 1fr' }, gap: '16px', alignItems: 'start' }}>
          <Typography variant="body2" sx={sectionLabelSx}>Manage AI Risk</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: '16px' }}>
            {aiFeatureCard(
              SubtleIcons.SIEMSubtle,
              'D&R Shadow AI Dashboard',
              'Detection & Response',
              'Monitor and detect unapproved AI domains within your network.',
              { label: 'Read the Blog' },
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '140px 1fr' }, gap: '16px', alignItems: 'start' }}>
          <Typography variant="body2" sx={sectionLabelSx}>Defend with AI</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: '16px' }}>
            {aiFeatureCard(
              SubtleIcons.SIEMSubtle,
              'Agentic AI Alert Enrichment',
              'Detection & Response',
              "Gain additional context on alerts, leveraging Agentic AI to collect data from logs and other sources. Our Agentic AI uses the OSCAR framework to enrich alerts, enabling you to triage with confidence.",
              { label: 'Read the Blog' },
            )}
            {aiFeatureCard(
              SubtleIcons.SIEMSubtle,
              'AI Alert Triage',
              'Detection & Response',
              'Reduce the alert queue with AI-suggested dispositions for alerts, based on IOCs and other alert data.',
              { label: 'Go to Alerts' },
              { label: 'Read the Blog' },
            )}
          </Box>
        </Box>

      </Box>
    );
  };

  return (
    <Box>
      <Box mb="24px">
        <Typography
          variant="h4"
          sx={{
            fontSize: '20px',
            color: theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          Command Home
        </Typography>
      </Box>

      <Tabs sx={{ mb: '16px' }} value={activeTab} onChange={(_event: React.SyntheticEvent, value: number) => setActiveTab(value)}>
        <Tab label="Exposure Management" />
        <Tab label="Incident Command" />
        <Tab label="Compliance" />
        <Tab label="Coverage Matrix" />
        <Tab label="AI Command Center" />
      </Tabs>

      <TabPanel index={0} value={activeTab}>{renderExposureManagement()}</TabPanel>
      <TabPanel index={1} value={activeTab}>{renderIncidentCommand()}</TabPanel>
      <TabPanel index={2} value={activeTab}>{renderCompliance()}</TabPanel>
      <TabPanel index={3} value={activeTab}>{renderCoverageMatrix()}</TabPanel>
      <TabPanel index={4} value={activeTab}>{renderAICommandCenter()}</TabPanel>
    </Box>
  );
};