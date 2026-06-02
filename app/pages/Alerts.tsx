import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  DetailsPageHeader,
  GridColDef,
  GridRenderCellParams,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Theme,
  Typography,
  useTheme
} from '@rapid7/rds';
import { DataGridTable, FilterBar, FilterModel, FilterSchema } from '@rapid7/rds-labs';
import * as Icons from '@rapid7/icons';
import { AlertItem, AlertPriority, AlertStatus, AlertDisposition, mockAlertsData } from '../data/alertsData';

type FilterModelItemLike = {
  id?: string;
  value?: unknown;
};

interface AlertFilters {
  priority: string | null;
  status: string | null;
  source: string | null;
}

const filterSchema: FilterSchema[] = [
  {
    id: 'priority',
    label: 'Priority',
    type: 'string'
  },
  {
    id: 'status',
    label: 'Status',
    type: 'string'
  },
  {
    id: 'source',
    label: 'Source',
    type: 'string'
  }
];

const getFiltersFromModel = (filterModel: FilterModel): AlertFilters => {
  const state: AlertFilters = {
    priority: null,
    status: null,
    source: null
  };

  filterModel.filterModel.items.forEach((item) => {
    const parsed = item as FilterModelItemLike;

    if (parsed.id === 'priority' && typeof parsed.value === 'string' && parsed.value.trim()) {
      state.priority = parsed.value.trim();
    } else if (parsed.id === 'status' && typeof parsed.value === 'string' && parsed.value.trim()) {
      state.status = parsed.value.trim();
    } else if (parsed.id === 'source' && typeof parsed.value === 'string' && parsed.value.trim()) {
      state.source = parsed.value.trim();
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

const getDispositionColor = (disposition: AlertDisposition): 'error' | 'warning' | 'success' | 'default' => {
  if (disposition === 'Malicious') return 'error';
  if (disposition === 'Benign') return 'success';
  if (disposition === 'Undecided') return 'warning';
  return 'default';
};

const createColumns = (theme: Theme): GridColDef<AlertItem>[] => [
  {
    field: 'name',
    headerName: 'Name',
    minWidth: 420,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, string>) => renderTextCell(params.value, theme, theme.palette.primary.main)
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 120,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<AlertItem, AlertPriority>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
        <Chip label={params.value} size="small" color={getPriorityColor(params.value)} />
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
    renderCell: (params: GridRenderCellParams<AlertItem, AlertStatus>) => renderTextCell(params.value, theme)
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
        <Chip label={params.value} size="small" color={getDispositionColor(params.value)} />
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<AlertFilters>({
    priority: null,
    status: null,
    source: null
  });

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

      if (filters.priority && row.priority !== filters.priority) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.source && row.source !== filters.source) return false;

      return true;
    });
  }, [filters, searchQuery]);

  const columns = useMemo<GridColDef<AlertItem>[]>(() => createColumns(theme), [theme]);

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