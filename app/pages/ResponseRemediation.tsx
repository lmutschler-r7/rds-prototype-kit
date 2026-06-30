import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  DetailsPageHeader,
  GridColDef,
  GridRenderCellParams,
  IconButton,
  Kpi,
  KpiContainer,
  Stack,
  Tab,
  Tabs,
  Theme,
  Typography,
  useTheme
} from '@rapid7/rds';
import { DataGridTable, FilterBar, FilterModel, FilterSchema } from '@rapid7/rds-labs';
import * as Icons from '@rapid7/icons';
import { CriticalAlert, Risk } from '@rapid7/icons';
import {
  CaseItem,
  CaseSeverity,
  mockCasesData,
  mockRemediationsData,
  RemediationEventType,
  RemediationItem
} from '../data/responseRemediationData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => {
  return value === index ? <Box>{children}</Box> : null;
};

type ResponseTab = 'remediations' | 'cases';

type FilterModelItemLike = {
  id?: string;
  value?: unknown;
};

interface RemediationFilters {
  eventType: string | null;
  campaign: number | null;
}

interface CaseFilters {
  assignee: string | null;
  severity: string | null;
}

const remediationFilterSchema: FilterSchema[] = [
  {
    id: 'eventType',
    label: 'Event Type',
    type: 'string'
  },
  {
    id: 'campaign',
    label: 'Campaign',
    type: 'number'
  }
];

const caseFilterSchema: FilterSchema[] = [
  {
    id: 'assignee',
    label: 'Tasks Assigned To',
    type: 'string'
  },
  {
    id: 'severity',
    label: 'Severity',
    type: 'string'
  }
];

const remediationKpis = [
  {
    value: 956,
    label: 'Total Risk',
    icon: <Risk />
  },
  {
    value: 19,
    label: 'Risk Reduction',
    icon: <Risk />
  },
  {
    value: 2340,
    label: 'Vulnerability Findings',
    icon: <CriticalAlert />
  },
  {
    value: 413,
    label: 'Assets Updated',
    icon: <Risk />
  }
];

const getRemediationFiltersFromModel = (filterModel: FilterModel): RemediationFilters => {
  const state: RemediationFilters = {
    eventType: null,
    campaign: null
  };

  filterModel.filterModel.items.forEach((item) => {
    const parsed = item as FilterModelItemLike;

    if (parsed.id === 'eventType' && typeof parsed.value === 'string' && parsed.value.trim()) {
      state.eventType = parsed.value.trim();
    }

    if (parsed.id === 'campaign' && typeof parsed.value === 'number') {
      state.campaign = parsed.value;
    }
  });

  return state;
};

const getCaseFiltersFromModel = (filterModel: FilterModel): CaseFilters => {
  const state: CaseFilters = {
    assignee: null,
    severity: null
  };

  filterModel.filterModel.items.forEach((item) => {
    const parsed = item as FilterModelItemLike;

    if (parsed.id === 'assignee' && typeof parsed.value === 'string' && parsed.value.trim()) {
      state.assignee = parsed.value.trim();
    }

    if (parsed.id === 'severity' && typeof parsed.value === 'string' && parsed.value.trim()) {
      state.severity = parsed.value.trim();
    }
  });

  return state;
};

const renderNumericCell = (value: number | null | undefined, theme: Theme) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
    <Typography sx={{ color: theme.palette.text.primary, fontSize: '13px' }}>
      {value === null || value === undefined ? '-' : value}
    </Typography>
  </Box>
);

const renderTextCell = (value: React.ReactNode, theme: Theme) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
    <Typography sx={{ color: theme.palette.text.primary, fontSize: '13px' }}>{value}</Typography>
  </Box>
);

const createRemediationColumns = (theme: Theme): GridColDef<RemediationItem>[] => [
  {
    field: 'remediationAction',
    headerName: 'Remediation Action',
    minWidth: 420,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<RemediationItem, string>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
        <Stack spacing={0.5} sx={{ py: '4px' }}>
          <Typography sx={{ color: theme.palette.primary.main, fontSize: '13px' }}>{params.value}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '12px' }}>{params.row.summary}</Typography>
        </Stack>
      </Box>
    )
  },
  {
    field: 'eventType',
    headerName: 'Event Type',
    width: 140,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<RemediationItem, RemediationEventType>) => renderTextCell(params.value, theme)
  },
  {
    field: 'findings',
    headerName: 'Findings',
    width: 92,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<RemediationItem, number>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'assets',
    headerName: 'Assets',
    width: 84,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<RemediationItem, number>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'images',
    headerName: 'Images',
    width: 84,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<RemediationItem, number | null>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'campaign',
    headerName: 'Campaign',
    width: 100,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<RemediationItem, number | null>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'actors',
    headerName: 'Actors',
    width: 84,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<RemediationItem, number | null>) => renderNumericCell(params.value, theme)
  },
  {
    field: 'automation',
    headerName: 'Automation',
    width: 110,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<RemediationItem, number | null>) => renderNumericCell(params.value, theme)
  }
];

const createCasesColumns = (theme: Theme): GridColDef<CaseItem>[] => [
  {
    field: 'caseId',
    headerName: 'Case ID',
    width: 130,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, string>) => renderTextCell(params.value, theme)
  },
  {
    field: 'title',
    headerName: 'Title',
    minWidth: 420,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, string>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
        <Typography sx={{ color: theme.palette.primary.main, fontSize: '13px' }}>{params.value}</Typography>
      </Box>
    )
  },
  {
    field: 'created',
    headerName: 'Created',
    width: 160,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, string>) => renderTextCell(params.value, theme)
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, string>) => renderTextCell(params.value, theme)
  },
  {
    field: 'severity',
    headerName: 'Severity',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, CaseSeverity>) => {
      const value = params.value ?? 'Low';
      const chipColor = value === 'Critical' || value === 'High' ? 'error' : value === 'Medium' ? 'warning' : 'success';
      const impactIcon =
        value === 'Critical'
          ? <Icons.ImpactCritical fontSize="small" />
          : value === 'High'
          ? <Icons.ImpactHigh fontSize="small" />
          : value === 'Medium'
          ? <Icons.ImpactMedium fontSize="small" />
          : <Icons.ImpactLow fontSize="small" />;

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
          <Chip label={value} size="small" color={chipColor as 'error' | 'warning' | 'success'} icon={impactIcon} />
        </Box>
      );
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, string>) => {
      const value = params.value ?? 'Active';
      const chipColor = value === 'Active' ? 'warning' : 'success';
      const impactIcon = value === 'Active' ? <Icons.ImpactMedium fontSize="small" /> : <Icons.ImpactLow fontSize="small" />;

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
          <Chip label={value} size="small" color={chipColor} icon={impactIcon} />
        </Box>
      );
    }
  },
  {
    field: 'assignee',
    headerName: 'Assignee',
    width: 160,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<CaseItem, string>) => renderTextCell(params.value, theme)
  }
];

export const ResponseRemediation: React.FC = () => {
  const theme = useTheme<Theme>();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [remediationFilters, setRemediationFilters] = useState<RemediationFilters>({
    eventType: null,
    campaign: null
  });
  const [casePendingFilters, setCasePendingFilters] = useState<CaseFilters>({
    assignee: null,
    severity: null
  });
  const [caseAppliedFilters, setCaseAppliedFilters] = useState<CaseFilters>({
    assignee: null,
    severity: null
  });
  const [remediationSearch, setRemediationSearch] = useState('');
  const [caseSearch, setCaseSearch] = useState('');
  const [casesFilterBarKey, setCasesFilterBarKey] = useState(0);

  const activeTab: ResponseTab = currentTabIndex === 0 ? 'remediations' : 'cases';

  const remediationColumns = useMemo(() => createRemediationColumns(theme), [theme]);
  const caseColumns = useMemo(() => createCasesColumns(theme), [theme]);

  const remediationRows = useMemo(() => {
    const normalizedQuery = remediationSearch.toLowerCase().trim();

    return mockRemediationsData.filter((row) => {
      if (normalizedQuery) {
        const matchesSearch =
          row.remediationAction.toLowerCase().includes(normalizedQuery) ||
          row.summary.toLowerCase().includes(normalizedQuery) ||
          row.eventType.toLowerCase().includes(normalizedQuery);

        if (!matchesSearch) {
          return false;
        }
      }

      if (remediationFilters.eventType && row.eventType.toLowerCase() !== remediationFilters.eventType.toLowerCase()) {
        return false;
      }

      if (remediationFilters.campaign !== null && row.campaign !== remediationFilters.campaign) {
        return false;
      }

      return true;
    });
  }, [remediationFilters, remediationSearch]);

  const caseRows = useMemo(() => {
    const normalizedQuery = caseSearch.toLowerCase().trim();

    return mockCasesData.filter((row) => {
      if (normalizedQuery) {
        const matchesSearch =
          row.caseId.toLowerCase().includes(normalizedQuery) ||
          row.title.toLowerCase().includes(normalizedQuery) ||
          row.assignee.toLowerCase().includes(normalizedQuery);

        if (!matchesSearch) {
          return false;
        }
      }

      if (caseAppliedFilters.assignee && !row.assignee.toLowerCase().includes(caseAppliedFilters.assignee.toLowerCase())) {
        return false;
      }

      if (caseAppliedFilters.severity && row.severity.toLowerCase() !== caseAppliedFilters.severity.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [caseAppliedFilters, caseSearch]);

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
        pageTitle="Response & Remediation"
        isSticky
        slots={{
          actions: [
            <Button
              key="create"
              size="medium"
              variant="contained"
              startIcon={activeTab === 'remediations' ? <Icons.Reporting fontSize="small" /> : <Icons.AddPlusUnbound fontSize="small" />}
              onClick={() => {}}
            >
              {activeTab === 'remediations' ? 'Create Report' : 'Create Case'}
            </Button>,
            <Button key="actions" size="medium" variant="outlined" startIcon={<Icons.MoreMenuElipsis fontSize="small" />}>
              Actions
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
            pb: '8px'
          }
        }}
      />

      <Tabs value={currentTabIndex} onChange={(_event, value) => setCurrentTabIndex(value)} sx={{ mb: '16px' }}>
        <Tab label="Remediations" />
        <Tab label="Cases" />
      </Tabs>

      <TabPanel index={0} value={currentTabIndex}>
        <Stack spacing={2}>
          <KpiContainer variant="CARD">
            {remediationKpis.map((item) => (
              <Kpi key={item.label} value={item.value} Icon={item.icon} label={item.label} />
            ))}
          </KpiContainer>

          <FilterBar
            filters={remediationFilterSchema}
            logicalOperatorMode="BOTH"
            onFilterModelChange={(model) => {
              setRemediationFilters(getRemediationFiltersFromModel(model));
            }}
          />

          <DataGridTable
            columns={remediationColumns}
            rows={remediationRows}
            totalCount={remediationRows.length}
            isClientSide
            isLoading={false}
            onSearchChange={(value) => setRemediationSearch(value)}
            getRowId={(row) => row.id}
            slots={{
              tableActions: TableActions
            }}
          />
        </Stack>
      </TabPanel>

      <TabPanel index={1} value={currentTabIndex}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <FilterBar
                key={casesFilterBarKey}
                filters={caseFilterSchema}
                logicalOperatorMode="BOTH"
                onFilterModelChange={(model) => {
                  setCasePendingFilters(getCaseFiltersFromModel(model));
                }}
              />
            </Box>
            <Button
              onClick={() => {
                setCaseAppliedFilters(casePendingFilters);
              }}
            >
              Run
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setCasePendingFilters({ assignee: null, severity: null });
                setCaseAppliedFilters({ assignee: null, severity: null });
                setCasesFilterBarKey((previous) => previous + 1);
              }}
            >
              Clear
            </Button>
          </Stack>

          {(caseAppliedFilters.assignee || caseAppliedFilters.severity) && (
            <Stack direction="row" spacing={1}>
              {caseAppliedFilters.assignee && <Chip label={`Tasks Assigned to = ${caseAppliedFilters.assignee}`} size="small" />}
              {caseAppliedFilters.severity && <Chip label={`Severity = ${caseAppliedFilters.severity}`} size="small" />}
            </Stack>
          )}

          <DataGridTable
            columns={caseColumns}
            rows={caseRows}
            totalCount={caseRows.length}
            isClientSide
            isLoading={false}
            onSearchChange={(value) => setCaseSearch(value)}
            getRowId={(row) => row.id}
            slots={{
              tableActions: TableActions
            }}
          />
        </Stack>
      </TabPanel>
    </Box>
  );
};
