import React, { useMemo, useState } from 'react';
import {
  Button,
  Box,
  Chip,
  DetailsPageHeader,
  GridColDef,
  GridRenderCellParams,
  IconButton,
  Kpi,
  KpiContainer,
  Link,
  Stack,
  Tab,
  Theme,
  Tabs,
  Typography,
  useTheme
} from '@rapid7/rds';
import { DataGridTable, FilterBar, FilterModel, FilterSchema } from '@rapid7/rds-labs';
import * as Icons from '@rapid7/icons';
import { CheckSuccessHealthy, Clear, CriticalAlert, Risk } from '@rapid7/icons';
import { FindingItem, FindingType, mockFindingsData } from '../data/findingsData';

const tabTypes: FindingType[] = ['vulnerabilities', 'iocs', 'misconfigurations'];

const filterSchema: FilterSchema[] = [
  {
    id: 'cvss',
    label: 'CVSS Score',
    type: 'number'
  },
  {
    id: 'riskScore',
    label: 'Risk Score',
    type: 'number'
  },
  {
    id: 'cisaKev',
    label: 'CISA KEV',
    type: 'boolean'
  }
];

const kpiItems = [
  {
    value: 732,
    label: 'Risk',
    icon: <Risk />
  },
  {
    value: 78,
    label: 'Critical or High Unique CVEs',
    icon: <CriticalAlert />
  },
  {
    value: 15000,
    label: 'Vulnerability Findings',
    icon: <CriticalAlert />
  }
];

type FilterModelItemLike = {
  id?: string;
  value?: unknown;
};

const getDisplayLabel = (type: FindingType): string => {
  if (type === 'vulnerabilities') return 'Vulnerability Findings';
  if (type === 'iocs') return 'IOC Findings';
  return 'Misconfiguration Findings';
};

interface FilterState {
  cvss: number | null;
  riskScore: number | null;
  cisaKev: boolean | null;
}

const renderCellBox = (justifyContent: 'flex-start' | 'center' | 'flex-end' = 'flex-start') => ({
  display: 'flex',
  justifyContent,
  alignItems: 'center',
  height: '100%',
  width: '100%'
});

const renderTextCell = (value: React.ReactNode, color: string, justifyContent: 'flex-start' | 'center' | 'flex-end' = 'flex-start', fontWeight?: number) => (
  <Box sx={renderCellBox(justifyContent)}>
    <Typography sx={{ color, fontSize: '13px', fontWeight }}>{value}</Typography>
  </Box>
);

const renderLinkCell = (value: React.ReactNode) => (
  <Box sx={renderCellBox('flex-end')}>
    <Link href="#" onClick={(event) => event.preventDefault()}>
      {value}
    </Link>
  </Box>
);

const renderBooleanIconCell = (value: boolean, iconMuted: string) => (
  <Box sx={renderCellBox('center')}>
    {value ? (
      <CheckSuccessHealthy color="error" sx={{ width: '18px', height: '18px' }} />
    ) : (
      <Clear sx={{ color: iconMuted, width: '18px', height: '18px' }} />
    )}
  </Box>
);

const createColumns = (theme: Theme): GridColDef<FindingItem>[] => [
  {
    field: 'identifier',
    headerName: 'Identifier',
    width: 170,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<FindingItem, string>) => renderTextCell(params.value, theme.palette.text.primary, 'flex-start', 500)
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 1,
    minWidth: 320,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<FindingItem, string>) => (
      <Box sx={renderCellBox('flex-start')}>
        <Typography
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '13px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {params.value}
        </Typography>
      </Box>
    )
  },
  {
    field: 'riskScore',
    headerName: 'Risk',
    width: 90,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<FindingItem, number>) => renderTextCell(params.value, theme.palette.text.secondary, 'flex-end')
  },
  {
    field: 'cvss',
    headerName: 'CVSS',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<FindingItem, number>) => {
      const value = params.value ?? 0;
      const color = value >= 7 ? 'error' : 'warning';

      return (
        <Box sx={renderCellBox('center')}>
          <Chip label={value.toFixed(1)} variant="filled" color={color as 'error' | 'warning'} size="small" />
        </Box>
      );
    }
  },
  {
    field: 'cisaKev',
    headerName: 'CISA KEV',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<FindingItem, boolean>) => renderBooleanIconCell(Boolean(params.value), theme.palette.action.disabled)
  },
  {
    field: 'epss',
    headerName: 'EPSS',
    width: 100,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<FindingItem, string>) => renderTextCell(params.value, theme.palette.text.secondary, 'flex-end')
  },
  {
    field: 'affectedAssets',
    headerName: 'Affected Assets',
    width: 150,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<FindingItem, number>) => renderLinkCell(params.value)
  },
  {
    field: 'findingsCount',
    headerName: 'Findings',
    width: 110,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<FindingItem, number>) => renderLinkCell(params.value)
  }
];

const getFiltersFromModel = (filterModel: FilterModel): FilterState => {
  const state: FilterState = {
    cvss: null,
    riskScore: null,
    cisaKev: null
  };

  filterModel.filterModel.items.forEach((item) => {
    const filterItem = item as FilterModelItemLike;
    const itemId = filterItem.id;
    const value = filterItem.value;

    if (itemId === 'cvss' && typeof value === 'number') {
      state.cvss = value;
    } else if (itemId === 'riskScore' && typeof value === 'number') {
      state.riskScore = value;
    } else if (itemId === 'cisaKev' && typeof value === 'boolean') {
      state.cisaKev = value;
    }
  });

  return state;
};

export const Findings: React.FC = () => {
  const theme = useTheme<Theme>();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    cvss: null,
    riskScore: null,
    cisaKev: null
  });

  const activeType = tabTypes[currentTab] ?? 'vulnerabilities';

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return mockFindingsData.filter((row) => {
      if (row.type !== activeType) return false;

      if (normalizedQuery) {
        const matches =
          row.identifier.toLowerCase().includes(normalizedQuery) ||
          row.title.toLowerCase().includes(normalizedQuery) ||
          row.riskScore.toString().includes(normalizedQuery);
        if (!matches) return false;
      }

      if (filters.cvss !== null && row.cvss < filters.cvss) return false;
      if (filters.riskScore !== null && row.riskScore < filters.riskScore) return false;
      if (filters.cisaKev !== null && row.cisaKev !== filters.cisaKev) return false;

      return true;
    });
  }, [activeType, filters, searchQuery]);

  const columns = useMemo<GridColDef<FindingItem>[]>(() => createColumns(theme), [theme]);

  const BatchButton = ({ selectedRows }: { selectedRows: string[] }) => (
    <Button
      size="small"
      variant="contained"
      onClick={() => {
        console.log('selected rows', selectedRows);
      }}
    >
      Batch
    </Button>
  );

  const TableActions = () => (
    <Stack direction="row" spacing={1}>
      <IconButton
        onClick={() => {
          console.log('clicked expand');
        }}
      >
        <Icons.Expand />
      </IconButton>
      <IconButton
        onClick={() => {
          console.log('clicked settings');
        }}
      >
        <Icons.Settings />
      </IconButton>
    </Stack>
  );

  return (
    <Box>
      {/* Header */}
      <DetailsPageHeader
        pageTitle="Findings"
        isSticky
        slots={{
          actions: [
            <Button
              key="create"
              size="medium"
              variant="contained"
              startIcon={<Icons.AddPlusUnbound fontSize="small" />}
            >
              Create Finding
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
            pb: '12px'
          }
        }}
      />

      {/* Summary KPIs */}
      <Box mt="16px" mb="24px">
        <KpiContainer variant="CARD">
          {kpiItems.map((item) => (
            <Kpi key={item.label} value={item.value} Icon={item.icon} label={item.label} />
          ))}
        </KpiContainer>
      </Box>

      {/* Tabs */}
      <Tabs sx={{ mb: '20px' }} value={currentTab} onChange={(_event: React.SyntheticEvent, value: number) => setCurrentTab(value)}>
        <Tab label="Vulnerabilities" />
        <Tab label="IOCs" />
        <Tab label="Misconfigurations" />
      </Tabs>

      {/* Filters */}
      <Box mb="20px">
        <FilterBar
          filters={filterSchema}
          logicalOperatorMode="BOTH"
          onFilterModelChange={(model) => {
            setFilters(getFiltersFromModel(model));
          }}
          sx={{ mb: '16px' }}
        />
      </Box>

      {/* Results table */}
      <DataGridTable
        columns={columns}
        rows={filteredRows}
        isClientSide
        isLoading={false}
        disableRowSelectionOnClick
        onSearchChange={(value) => setSearchQuery(value)}
        getRowId={(row) => row.id}
        slots={{
          batchActions: BatchButton,
          tableActions: TableActions
        }}
      />
    </Box>
  );
};
