import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  DetailsPageHeader,
  GridColDef,
  GridRenderCellParams,
  IconButton,
  Link,
  Stack,
  Tab,
  Tabs,
  Theme,
  Typography,
  useTheme
} from '@rapid7/rds';
import { DataGridTable, FilterBar, FilterModel, FilterSchema } from '@rapid7/rds-labs';
import { getValue } from '@rapid7/rds/lib/esm/tokens';
import * as Icons from '@rapid7/icons';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { AlertItem, AlertPriority, AlertStatus, AlertDisposition, mockAlertsData } from '../data/alertsData';

echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);

type FilterModelItemLike = {
  id?: string;
  field?: string;
  operator?: string;
  value?: unknown;
};

interface DateFilterValue {
  from?: number;
  timeFrame?: string;
  to?: number;
}

interface AlertFilters {
  name: string | null;
  nameOperator: 'contains' | 'doesNotContain' | 'startsWith' | 'endsWith' | '=' | '!=' | 'like';
  priority: string[];
  priorityOperator: 'includes' | 'excludes';
  alertRiskScore: number | [number, number] | null;
  alertRiskScoreOperator: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'between';
  status: string[];
  statusOperator: 'includes' | 'excludes';
  source: string[];
  sourceOperator: 'includes' | 'excludes';
  disposition: string[];
  dispositionOperator: 'includes' | 'excludes';
  relatedCampaigns: number | [number, number] | null;
  relatedCampaignsOperator: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'between';
  comments: number | [number, number] | null;
  commentsOperator: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'between';
  lastUpdate: DateFilterValue | null;
  lastUpdateOperator: 'between' | 'before' | 'onOrBefore' | 'after' | 'onOrAfter' | 'on';
}

const parseStringFilterValue = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const parseSelectFilterValues = (value: unknown) =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0) : [];

const parseNumberFilterValue = (value: unknown): number | [number, number] | null => {
  if (typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value) && value.length === 2 && value.every((entry) => typeof entry === 'number')) {
    return [value[0], value[1]];
  }

  return null;
};

const parseDateFilterValue = (value: unknown): DateFilterValue | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as DateFilterValue;

  if (typeof candidate.from === 'number' || typeof candidate.to === 'number' || typeof candidate.timeFrame === 'string') {
    return candidate;
  }

  return null;
};

const matchesStringFilter = (
  rowValue: string,
  filterValue: string,
  operator: AlertFilters['nameOperator']
) => {
  const normalizedRowValue = rowValue.toLowerCase();
  const normalizedFilterValue = filterValue.toLowerCase();

  if (operator === 'doesNotContain') return !normalizedRowValue.includes(normalizedFilterValue);
  if (operator === 'startsWith') return normalizedRowValue.startsWith(normalizedFilterValue);
  if (operator === 'endsWith') return normalizedRowValue.endsWith(normalizedFilterValue);
  if (operator === '=') return normalizedRowValue === normalizedFilterValue;
  if (operator === '!=') return normalizedRowValue !== normalizedFilterValue;

  return normalizedRowValue.includes(normalizedFilterValue);
};

const matchesNumberFilter = (
  rowValue: number,
  filterValue: number | [number, number],
  operator: AlertFilters['alertRiskScoreOperator']
) => {
  if (operator === 'between' && Array.isArray(filterValue)) {
    return rowValue >= filterValue[0] && rowValue <= filterValue[1];
  }

  if (Array.isArray(filterValue)) {
    return true;
  }

  if (operator === '=') return rowValue === filterValue;
  if (operator === '>') return rowValue > filterValue;
  if (operator === '<') return rowValue < filterValue;
  if (operator === '>=') return rowValue >= filterValue;
  if (operator === '<=') return rowValue <= filterValue;
  if (operator === '!=') return rowValue !== filterValue;

  return true;
};

const matchesDateFilter = (
  rowValue: string,
  filterValue: DateFilterValue,
  operator: AlertFilters['lastUpdateOperator']
) => {
  const rowTimestamp = parseAlertDate(rowValue).setHours(0, 0, 0, 0);
  const fromTimestamp = typeof filterValue.from === 'number' ? new Date(filterValue.from).setHours(0, 0, 0, 0) : null;
  const toTimestamp = typeof filterValue.to === 'number' ? new Date(filterValue.to).setHours(0, 0, 0, 0) : null;

  if (operator === 'between' && fromTimestamp !== null && toTimestamp !== null) {
    return rowTimestamp >= fromTimestamp && rowTimestamp <= toTimestamp;
  }

  if (operator === 'before' && fromTimestamp !== null) return rowTimestamp < fromTimestamp;
  if (operator === 'onOrBefore' && fromTimestamp !== null) return rowTimestamp <= fromTimestamp;
  if (operator === 'after' && fromTimestamp !== null) return rowTimestamp > fromTimestamp;
  if (operator === 'onOrAfter' && fromTimestamp !== null) return rowTimestamp >= fromTimestamp;

  if (operator === 'on') {
    if (fromTimestamp !== null) return rowTimestamp === fromTimestamp;
    if (toTimestamp !== null) return rowTimestamp === toTimestamp;
  }

  return true;
};

const getFiltersFromModel = (filterModel: FilterModel): AlertFilters => {
  const state: AlertFilters = {
    name: null,
    nameOperator: 'contains',
    priority: [],
    priorityOperator: 'includes',
    alertRiskScore: null,
    alertRiskScoreOperator: '=',
    status: [],
    statusOperator: 'includes',
    source: [],
    sourceOperator: 'includes',
    disposition: [],
    dispositionOperator: 'includes',
    relatedCampaigns: null,
    relatedCampaignsOperator: '=',
    comments: null,
    commentsOperator: '=',
    lastUpdate: null,
    lastUpdateOperator: 'between'
  };

  filterModel.filterModel.items.forEach((item) => {
    const parsed = item as FilterModelItemLike;
    const key = parsed.field ?? parsed.id;

    if (key === 'name') {
      const normalizedValue = parseStringFilterValue(parsed.value);

      if (normalizedValue) {
        state.name = normalizedValue;
        state.nameOperator = (parsed.operator as AlertFilters['nameOperator']) ?? 'contains';
      }
    } else if (key === 'priority') {
      const normalizedValues = parseSelectFilterValues(parsed.value);

      if (normalizedValues.length > 0) {
        state.priority = normalizedValues;
        state.priorityOperator = parsed.operator === 'excludes' ? 'excludes' : 'includes';
      }
    } else if (key === 'alertRiskScore') {
      const normalizedValue = parseNumberFilterValue(parsed.value);

      if (normalizedValue !== null) {
        state.alertRiskScore = normalizedValue;
        state.alertRiskScoreOperator = (parsed.operator as AlertFilters['alertRiskScoreOperator']) ?? '=';
      }
    } else if (key === 'status') {
      const normalizedValues = parseSelectFilterValues(parsed.value);

      if (normalizedValues.length > 0) {
        state.status = normalizedValues;
        state.statusOperator = parsed.operator === 'excludes' ? 'excludes' : 'includes';
      }
    } else if (key === 'source') {
      const normalizedValues = parseSelectFilterValues(parsed.value);

      if (normalizedValues.length > 0) {
        state.source = normalizedValues;
        state.sourceOperator = parsed.operator === 'excludes' ? 'excludes' : 'includes';
      }
    } else if (key === 'disposition') {
      const normalizedValues = parseSelectFilterValues(parsed.value);

      if (normalizedValues.length > 0) {
        state.disposition = normalizedValues;
        state.dispositionOperator = parsed.operator === 'excludes' ? 'excludes' : 'includes';
      }
    } else if (key === 'relatedCampaigns') {
      const normalizedValue = parseNumberFilterValue(parsed.value);

      if (normalizedValue !== null) {
        state.relatedCampaigns = normalizedValue;
        state.relatedCampaignsOperator = (parsed.operator as AlertFilters['relatedCampaignsOperator']) ?? '=';
      }
    } else if (key === 'comments') {
      const normalizedValue = parseNumberFilterValue(parsed.value);

      if (normalizedValue !== null) {
        state.comments = normalizedValue;
        state.commentsOperator = (parsed.operator as AlertFilters['commentsOperator']) ?? '=';
      }
    } else if (key === 'lastUpdate') {
      const normalizedValue = parseDateFilterValue(parsed.value);

      if (normalizedValue) {
        state.lastUpdate = normalizedValue;
        state.lastUpdateOperator = (parsed.operator as AlertFilters['lastUpdateOperator']) ?? 'between';
      }
    }
  });

  return state;
};

const renderTextCell = (value: React.ReactNode, theme: Theme, color?: string) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
    <Typography sx={{ color: color || theme.palette.text.primary, fontSize: '13px' }}>{value}</Typography>
  </Box>
);

const renderNumericCell = (value: number | null | undefined, theme: Theme) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
    <Typography sx={{ color: theme.palette.text.primary, fontSize: '13px' }}>
      {value === null || value === undefined ? '-' : value}
    </Typography>
  </Box>
);

const getPriorityColor = (priority: AlertPriority): 'error' | 'warning' | 'info' | 'success' => {
  if (priority === 'Critical') return 'error';
  if (priority === 'High') return 'warning';
  if (priority === 'Medium') return 'info';
  return 'success';
};

const getPriorityImpactIcon = (priority: AlertPriority): React.ReactElement => {
  if (priority === 'Critical') return <Icons.ImpactCritical fontSize="small" />;
  if (priority === 'High') return <Icons.ImpactHigh fontSize="small" />;
  if (priority === 'Medium') return <Icons.ImpactMedium fontSize="small" />;
  return <Icons.ImpactLow fontSize="small" />;
};

const getStatusColor = (status: AlertStatus): 'error' | 'warning' | 'success' | 'info' => {
  if (status === 'Open') return 'error';
  if (status === 'In Progress') return 'warning';
  if (status === 'Closed') return 'success';
  return 'info';
};

const getStatusImpactIcon = (status: AlertStatus): React.ReactElement => {
  if (status === 'Open') return <Icons.ImpactHigh fontSize="small" />;
  if (status === 'In Progress') return <Icons.ImpactMedium fontSize="small" />;
  if (status === 'Closed') return <Icons.ImpactLow fontSize="small" />;
  return <Icons.ImpactVeryLow fontSize="small" />;
};

const getDispositionColor = (disposition: AlertDisposition): 'error' | 'warning' | 'success' | 'default' => {
  if (disposition === 'Malicious') return 'error';
  if (disposition === 'Benign') return 'success';
  if (disposition === 'Undecided') return 'warning';
  return 'default';
};

const parseAlertDate = (value: string) => {
  const [month, day, year] = value.split('/').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const formatAlertDateLabel = (value: string) => {
  const parsedDate = parseAlertDate(value);
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const createColumns = (theme: Theme, onAlertNameClick: (alertId: string) => void): GridColDef<AlertItem>[] => [
  {
    field: 'name',
    headerName: 'Name',
    minWidth: 420,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, string>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%', cursor: 'pointer' }}>
        <Link
          href="#"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onAlertNameClick(params.row.id);
          }}
        >
          {params.value}
        </Link>
      </Box>
    )
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, AlertPriority>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
        <Chip
          label={params.value ?? 'Low'}
          size="small"
          color={getPriorityColor(params.value ?? 'Low')}
          icon={getPriorityImpactIcon(params.value ?? 'Low')}
        />
      </Box>
    )
  },
  {
    field: 'alertRiskScore',
    headerName: 'Alert Risk Score',
    width: 140,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<AlertItem, number>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, AlertStatus>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
        <Chip
          label={params.value ?? 'Open'}
          size="small"
          color={getStatusColor(params.value ?? 'Open')}
          icon={getStatusImpactIcon(params.value ?? 'Open')}
        />
      </Box>
    )
  },
  {
    field: 'source',
    headerName: 'Source',
    width: 130,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, string>) => renderTextCell(params.value, theme)
  },
  {
    field: 'disposition',
    headerName: 'Disposition',
    width: 140,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, AlertDisposition>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
        <Chip label={params.value ?? 'Unknown'} size="small" color={getDispositionColor(params.value ?? 'Unknown')} />
      </Box>
    )
  },
  {
    field: 'relatedCampaigns',
    headerName: 'Related Campaigns',
    width: 130,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<AlertItem, number>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'comments',
    headerName: 'Comments',
    width: 100,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<AlertItem, number>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'lastUpdate',
    headerName: 'Last Update',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, string>) => renderTextCell(params.value, theme)
  }
];

export const Alerts: React.FC = () => {
  const theme = useTheme<Theme>();
  const tokenTheme = theme.palette as Theme['palette'] & { brand: 'Original' | 'Callisto'; mode: 'light' | 'dark' };
  const dataVizTokens = getValue('dataViz', tokenTheme.brand, tokenTheme.mode);
  const categoricalTokens = dataVizTokens.categorical;
  const priorityOptions = useMemo(
    () => ['Critical', 'High', 'Medium', 'Low'].map((value) => ({ label: value, value })),
    []
  );
  const statusOptions = useMemo(
    () => ['Open', 'In Progress', 'Closed', 'Dismissed'].map((value) => ({ label: value, value })),
    []
  );
  const sourceOptions = useMemo(
    () =>
      Array.from(new Set(mockAlertsData.map((row) => row.source)))
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ label: value, value })),
    []
  );
  const dispositionOptions = useMemo(
    () => ['Malicious', 'Benign', 'Undecided', 'Unknown'].map((value) => ({ label: value, value })),
    []
  );
  const filterSchema = useMemo<FilterSchema[]>(
    () => [
      {
        id: 'name',
        label: 'Name',
        type: 'string'
      },
      {
        id: 'priority',
        label: 'Priority',
        type: 'select',
        options: priorityOptions
      },
      {
        id: 'alertRiskScore',
        label: 'Alert Risk Score',
        type: 'number'
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: statusOptions
      },
      {
        id: 'source',
        label: 'Source',
        type: 'select',
        options: sourceOptions
      },
      {
        id: 'disposition',
        label: 'Disposition',
        type: 'select',
        options: dispositionOptions
      },
      {
        id: 'relatedCampaigns',
        label: 'Related Campaigns',
        type: 'number'
      },
      {
        id: 'comments',
        label: 'Comments',
        type: 'number'
      },
      {
        id: 'lastUpdate',
        label: 'Last Update',
        type: 'date'
      }
    ],
    [dispositionOptions, priorityOptions, sourceOptions, statusOptions]
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<AlertFilters>({
    name: null,
    nameOperator: 'contains',
    priority: [],
    priorityOperator: 'includes',
    alertRiskScore: null,
    alertRiskScoreOperator: '=',
    status: [],
    statusOperator: 'includes',
    source: [],
    sourceOperator: 'includes',
    disposition: [],
    dispositionOperator: 'includes',
    relatedCampaigns: null,
    relatedCampaignsOperator: '=',
    comments: null,
    commentsOperator: '=',
    lastUpdate: null,
    lastUpdateOperator: 'between'
  });

  const handleNavigateToAlertDetail = (alertId: string) => {
    window.localStorage.setItem('selectedAlertId', alertId);
    window.history.pushState({}, '', '/alerts/detail');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return mockAlertsData.filter((row) => {
      if (normalizedQuery) {
        const matches =
          row.name.toLowerCase().includes(normalizedQuery) ||
          row.source.toLowerCase().includes(normalizedQuery) ||
          row.alertRiskScore.toString().includes(normalizedQuery);
        if (!matches) return false;
      }

      if (filters.name && !matchesStringFilter(row.name, filters.name, filters.nameOperator)) {
        return false;
      }

      if (filters.priority.length > 0) {
        const matchesPriority = filters.priority.includes(row.priority);
        if (filters.priorityOperator === 'includes' ? !matchesPriority : matchesPriority) {
          return false;
        }
      }

      if (filters.alertRiskScore !== null && !matchesNumberFilter(row.alertRiskScore, filters.alertRiskScore, filters.alertRiskScoreOperator)) {
        return false;
      }

      if (filters.status.length > 0) {
        const matchesStatus = filters.status.includes(row.status);
        if (filters.statusOperator === 'includes' ? !matchesStatus : matchesStatus) {
          return false;
        }
      }

      if (filters.source.length > 0) {
        const matchesSource = filters.source.includes(row.source);
        if (filters.sourceOperator === 'includes' ? !matchesSource : matchesSource) {
          return false;
        }
      }

      if (filters.disposition.length > 0) {
        const matchesDisposition = filters.disposition.includes(row.disposition);
        if (filters.dispositionOperator === 'includes' ? !matchesDisposition : matchesDisposition) {
          return false;
        }
      }

      if (filters.relatedCampaigns !== null && !matchesNumberFilter(row.relatedCampaigns, filters.relatedCampaigns, filters.relatedCampaignsOperator)) {
        return false;
      }

      if (filters.comments !== null && !matchesNumberFilter(row.comments, filters.comments, filters.commentsOperator)) {
        return false;
      }

      if (filters.lastUpdate && !matchesDateFilter(row.lastUpdate, filters.lastUpdate, filters.lastUpdateOperator)) {
        return false;
      }

      return true;
    });
  }, [filters, searchQuery]);

  const sourceChartData = useMemo(() => {
    const sourceCounts = filteredRows.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.source] = (accumulator[row.source] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(sourceCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: `${name} ${value}`, value }));
  }, [filteredRows]);

  const triageChartData = useMemo(() => {
    const closedRows = filteredRows.filter((row) => row.status === 'Closed' || row.status === 'Dismissed');
    const outcomeCounts = closedRows.reduce(
      (accumulator, row) => {
        if (row.disposition === 'Benign') {
          accumulator.benign += 1;
        } else if (row.disposition === 'Undecided') {
          accumulator.falsePositive += 1;
        } else {
          accumulator.disregard += 1;
        }

        return accumulator;
      },
      { benign: 0, disregard: 0, falsePositive: 0 }
    );

    const totalClosed = closedRows.length;

    const getPercent = (value: number) => (totalClosed > 0 ? Math.round((value / totalClosed) * 100) : 0);

    return {
      totalClosed,
      segments: [
        { name: `${getPercent(outcomeCounts.benign)}% Benign`, value: outcomeCounts.benign },
        { name: `${getPercent(outcomeCounts.falsePositive)}% False Positive`, value: outcomeCounts.falsePositive },
        { name: `${getPercent(outcomeCounts.disregard)}% Disregard`, value: outcomeCounts.disregard }
      ]
    };
  }, [filteredRows]);

  const riskTimelineData = useMemo(() => {
    const dateCounts = filteredRows.reduce<Record<string, { count: number; riskTotal: number }>>((accumulator, row) => {
      const current = accumulator[row.lastUpdate] ?? { count: 0, riskTotal: 0 };

      accumulator[row.lastUpdate] = {
        count: current.count + 1,
        riskTotal: current.riskTotal + row.alertRiskScore
      };

      return accumulator;
    }, {});

    const rawDates = Object.keys(dateCounts)
      .sort((left, right) => parseAlertDate(left).getTime() - parseAlertDate(right).getTime())
      .slice(-5);

    return {
      alerts: rawDates.map((rawDate) => dateCounts[rawDate]?.count ?? 0),
      exposure: rawDates.map((rawDate) => {
        const entry = dateCounts[rawDate];
        if (!entry || entry.count === 0) {
          return 0;
        }

        return Math.min(40, Number((entry.riskTotal / entry.count / 3).toFixed(1)));
      }),
      labels: rawDates.map((rawDate) => formatAlertDateLabel(rawDate))
    };
  }, [filteredRows]);

  const columns = useMemo<GridColDef<AlertItem>[]>(() => createColumns(theme, handleNavigateToAlertDetail), [theme]);

  const newAlertsBySourceOption = useMemo(
    () => ({
      animation: false,
      tooltip: { trigger: 'item' as const },
      color: [
        categoricalTokens['10'],
        categoricalTokens['20'],
        categoricalTokens['30'],
        categoricalTokens['40'],
        categoricalTokens['50'],
        categoricalTokens['60']
      ],
      legend: {
        orient: 'vertical' as const,
        right: 0,
        top: 'center',
        itemHeight: 10,
        itemWidth: 10,
        textStyle: {
          color: theme.palette.text.secondary,
          fontSize: 12
        }
      },
      series: [
        {
          type: 'pie' as const,
          radius: ['62%', '82%'],
          center: ['28%', '50%'],
          label: { show: false },
          labelLine: { show: false },
          data: sourceChartData
        }
      ],
      graphic: [
        {
          type: 'text' as const,
          left: '28%',
          top: '46%',
          style: {
            text: filteredRows.length.toString(),
            fill: theme.palette.text.primary,
            fontSize: 32,
            fontWeight: 700,
            textAlign: 'center'
          }
        },
        {
          type: 'text' as const,
          left: '28%',
          top: '58%',
          style: {
            text: 'New Alerts',
            fill: theme.palette.text.secondary,
            fontSize: 12,
            textAlign: 'center'
          }
        }
      ]
    }),
    [categoricalTokens, filteredRows.length, sourceChartData, theme.palette.text.primary, theme.palette.text.secondary]
  );

  const triageClosureOption = useMemo(
    () => ({
      animation: false,
      tooltip: { trigger: 'item' as const },
      color: [dataVizTokens.sentiment.positive.main, dataVizTokens.sentiment.negative.main, categoricalTokens['70']],
      legend: {
        orient: 'vertical' as const,
        right: 0,
        top: 'center',
        itemHeight: 10,
        itemWidth: 10,
        textStyle: {
          color: theme.palette.text.secondary,
          fontSize: 12
        }
      },
      series: [
        {
          type: 'pie' as const,
          radius: ['62%', '82%'],
          center: ['30%', '50%'],
          label: { show: false },
          labelLine: { show: false },
          data: triageChartData.segments
        }
      ],
      graphic: [
        {
          type: 'text' as const,
          left: '30%',
          top: '46%',
          style: {
            text: triageChartData.totalClosed.toLocaleString(),
            fill: theme.palette.text.primary,
            fontSize: 32,
            fontWeight: 700,
            textAlign: 'center'
          }
        },
        {
          type: 'text' as const,
          left: '30%',
          top: '58%',
          style: {
            text: 'Alerts Closed',
            fill: theme.palette.text.secondary,
            fontSize: 12,
            textAlign: 'center'
          }
        }
      ]
    }),
    [categoricalTokens, dataVizTokens.sentiment.negative.main, dataVizTokens.sentiment.positive.main, theme.palette.text.primary, theme.palette.text.secondary, triageChartData]
  );

  const riskAwareDetectionOption = useMemo(
    () => ({
      animation: false,
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'line' as const }
      },
      legend: {
        bottom: 0,
        itemHeight: 10,
        itemWidth: 10,
        textStyle: {
          color: theme.palette.text.secondary,
          fontSize: 12
        }
      },
      grid: {
        top: 16,
        left: 42,
        right: 16,
        bottom: 36
      },
      xAxis: {
        type: 'category' as const,
        data: riskTimelineData.labels,
        axisLine: {
          lineStyle: { color: theme.palette.divider }
        },
        axisLabel: { color: theme.palette.text.secondary }
      },
      yAxis: {
        type: 'value' as const,
        max: 40,
        axisLabel: {
          color: theme.palette.text.secondary,
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: { color: theme.palette.divider }
        }
      },
      series: [
        {
          name: 'Alerts',
          type: 'bar' as const,
          barWidth: 38,
          data: riskTimelineData.alerts,
          itemStyle: {
            color: categoricalTokens['10'],
            opacity: 0.7,
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Exposure Correlation',
          type: 'line' as const,
          data: riskTimelineData.exposure,
          symbol: 'circle' as const,
          symbolSize: 7,
          lineStyle: {
            color: categoricalTokens['20'],
            width: 2
          },
          itemStyle: {
            color: categoricalTokens['20'],
            borderColor: categoricalTokens['20']
          }
        }
      ]
    }),
    [categoricalTokens, riskTimelineData, theme.palette.divider, theme.palette.text.secondary]
  );

  const TableActions = () => (
    <Stack direction="row" spacing={1}>
      <IconButton onClick={() => {}}>
        <Icons.Expand />
      </IconButton>
      <IconButton onClick={() => {}}>
        <Icons.Settings />
      </IconButton>
    </Stack>
  );

  return (
    <Box>
      <DetailsPageHeader
        pageTitle="Alerts"
        isSticky
        slots={{
          actions: [
            <Button
              key="create"
              size="medium"
              variant="contained"
              startIcon={<Icons.AddPlusUnbound fontSize="small" />}
            >
              Create Alert
            </Button>
          ]
        }}
        DetailsPageHeaderRootProps={{
          sx: {
            position: 'sticky',
            top: 0,
            zIndex: 1500,
            bgcolor: theme.palette.background.default,
            pt: '16px',
            pb: '16px'
          }
        }}
      />

      <Stack spacing={2}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2
          }}
        >
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="New Alerts by Source"
              subheader="Last 8 hours"
              sx={{ px: 2, pt: 2, pb: 0 }}
            />
            <CardContent sx={{ pt: 1.5 }}>
              <ReactEChartsCore
                echarts={echarts}
                option={newAlertsBySourceOption}
                notMerge
                opts={{ renderer: 'svg' }}
                style={{ height: 180, width: '100%' }}
              />
            </CardContent>
          </Card>

          <Card variant="ai" sx={{ height: '100%' }}>
            <CardHeader
              title="AI-Triage Alert Closure"
              subheader="Last 24 hours"
              sx={{ px: 2, pt: 2, pb: 0 }}
            />
            <CardContent sx={{ pt: 1.5 }}>
              <ReactEChartsCore
                echarts={echarts}
                option={triageClosureOption}
                notMerge
                opts={{ renderer: 'svg' }}
                style={{ height: 180, width: '100%' }}
              />
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Risk-Aware Detection Over time"
              subheader="Last Month"
              sx={{ px: 2, pt: 2, pb: 0 }}
            />
            <CardContent sx={{ pt: 1.5 }}>
              <ReactEChartsCore
                echarts={echarts}
                option={riskAwareDetectionOption}
                notMerge
                opts={{ renderer: 'svg' }}
                style={{ height: 180, width: '100%' }}
              />
            </CardContent>
          </Card>
        </Box>

        <FilterBar
          filters={filterSchema}
          logicalOperatorMode="BOTH"
          onFilterModelChange={(model) => {
            setFilters(getFiltersFromModel(model));
          }}
        />

        <DataGridTable
          columns={columns}
          rows={filteredRows}
          totalCount={filteredRows.length}
          isClientSide
          isLoading={false}
          disableRowSelectionOnClick
          searchValue={searchQuery}
          onSearchChange={(value) => setSearchQuery(value)}
          getRowId={(row) => row.id}
          slots={{
            tableActions: TableActions
          }}
        />
      </Stack>
    </Box>
  );
};