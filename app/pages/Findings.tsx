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

interface FilterState {
  cvss: number | null;
  riskScore: number | null;
  cisaKev: boolean | null;
}

interface IocFindingRow {
  id: string;
  value: string;
  onAllowList: boolean;
  iocType: string;
  decayScore: number | null;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reportingFeed: string[];
  tags: string[];
}

const IOC_VALUE_VARIANTS = [
  '45.77.89.123',
  'maliciousdomain.biz',
  'http://badactor[.]org/login',
  'sha256:ab3f...9c7d8',
  'c2_payload.exe',
  'attacker_support@protonmail.com',
  '1BoatSLRHtKNngkdXEeobR76...',
  'http://abc123xyz[.]onion',
  'readme_for_unlock.txt',
  '.locked123',
  'AS13335'
];

const IOC_TYPE_VARIANTS = ['IP Address', 'Domain', 'URL', 'File Hash', 'File Name', 'Email Address', 'BTC Wallet', 'TOR Website', 'Ransom Note', 'Encryption Extension', 'ASN'];

const IOC_REPORTING_FEEDS = [
  ['OpenPhish', 'Rapid7 Labs'],
  ['Rapid7 Labs'],
  ['Rapid7 Lorelei Honeypots'],
  ['US-CERT'],
  ['Mandiant Intelligence'],
  ['Enriched_doc_pv'],
  ['IP range filter PV']
];

const IOC_TAG_VARIANTS = [
  ['Installation', 'Bot'],
  ['Phishing', 'Initial Access'],
  ['Credential Access'],
  ['Persistence'],
  ['Lateral Movement'],
  ['Exfiltration']
];

const getIocSeverity = (riskScore: number): IocFindingRow['severity'] => {
  if (riskScore >= 800) return 'Critical';
  if (riskScore >= 600) return 'High';
  if (riskScore >= 350) return 'Medium';
  return 'Low';
};

const mapFindingToIocRow = (row: FindingItem, index: number): IocFindingRow => ({
  id: row.id,
  value: IOC_VALUE_VARIANTS[index % IOC_VALUE_VARIANTS.length],
  onAllowList: index % 7 === 0,
  iocType: IOC_TYPE_VARIANTS[index % IOC_TYPE_VARIANTS.length],
  decayScore: index % 5 === 3 || index % 5 === 4 ? null : Math.max(35, Math.min(95, 100 - Math.floor(row.riskScore / 12))),
  severity: getIocSeverity(row.riskScore),
  reportingFeed: IOC_REPORTING_FEEDS[index % IOC_REPORTING_FEEDS.length],
  tags: IOC_TAG_VARIANTS[index % IOC_TAG_VARIANTS.length]
});

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
      <CheckSuccessHealthy color="success" sx={{ width: '18px', height: '18px' }} />
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
    renderCell: (params: GridRenderCellParams<FindingItem, string>) => {
      if (params.row.type === 'vulnerabilities') {
        return (
          <Box
            sx={{ ...renderCellBox('flex-start'), cursor: 'pointer' }}
          >
            <Link
              href="#"
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                localStorage.setItem('selectedFindingId', params.row.id);
                window.history.pushState({}, '', '/findings/detail');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              {params.value}
            </Link>
          </Box>
        );
      }
      return renderTextCell(params.value, theme.palette.text.primary, 'flex-start', 500);
    }
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

const createIocColumns = (theme: Theme): GridColDef<IocFindingRow>[] => [
  {
    field: 'value',
    headerName: 'Value',
    minWidth: 220,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<IocFindingRow, string>) => renderTextCell(params.value, theme.palette.text.primary)
  },
  {
    field: 'onAllowList',
    headerName: 'On Allow List',
    width: 140,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<IocFindingRow, boolean>) => renderBooleanIconCell(Boolean(params.value), theme.palette.error.main)
  },
  {
    field: 'iocType',
    headerName: 'Type',
    width: 140,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<IocFindingRow, string>) => renderTextCell(params.value, theme.palette.text.secondary)
  },
  {
    field: 'decayScore',
    headerName: 'Decay Score',
    width: 130,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams<IocFindingRow, number | null>) => renderTextCell(params.value ?? '-', theme.palette.text.primary, 'flex-end')
  },
  {
    field: 'severity',
    headerName: 'Severity',
    width: 130,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<IocFindingRow, IocFindingRow['severity']>) => {
      const severity = params.value ?? 'Low';
      const colorMap: Record<IocFindingRow['severity'], 'error' | 'warning' | 'info'> = {
        Critical: 'error',
        High: 'warning',
        Medium: 'warning',
        Low: 'info'
      };
      return (
        <Box sx={renderCellBox('flex-start')}>
          <Chip size="small" label={severity} color={colorMap[severity]} />
        </Box>
      );
    }
  },
  {
    field: 'reportingFeed',
    headerName: 'Reporting Feed',
    minWidth: 230,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<IocFindingRow, string[]>) => (
      <Box sx={renderCellBox('flex-start')}>
        <Stack direction="row" spacing={0.75}>
          {(params.value ?? []).slice(0, 2).map((feed) => (
            <Chip key={`${params.row.id}-${feed}`} size="small" label={feed} variant="filled" />
          ))}
        </Stack>
      </Box>
    )
  },
  {
    field: 'tags',
    headerName: 'Tags',
    minWidth: 220,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<IocFindingRow, string[]>) => (
      <Box sx={renderCellBox('flex-start')}>
        <Stack direction="row" spacing={0.75}>
          {(params.value ?? []).slice(0, 2).map((tag) => (
            <Chip key={`${params.row.id}-${tag}`} size="small" label={tag} variant="filled" />
          ))}
        </Stack>
      </Box>
    )
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 92,
    align: 'right',
    headerAlign: 'right',
    sortable: false,
    filterable: false,
    renderCell: () => (
      <Box sx={renderCellBox('flex-end')}>
        <IconButton size="small" aria-label="More actions">
          <Icons.MoreMenuElipsis />
        </IconButton>
      </Box>
    )
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

  const iocRows = useMemo(() => filteredRows.map(mapFindingToIocRow), [filteredRows]);

  const columns = useMemo<GridColDef<FindingItem>[]>(() => createColumns(theme), [theme]);
  const iocColumns = useMemo<GridColDef<IocFindingRow>[]>(() => createIocColumns(theme), [theme]);

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
      <Box mt="16px" mb="16px">
        <KpiContainer variant="CARD">
          {kpiItems.map((item) => (
            <Kpi key={item.label} value={item.value} Icon={item.icon} label={item.label} />
          ))}
        </KpiContainer>
      </Box>

      {/* Tabs */}
      <Tabs sx={{ mb: '16px' }} value={currentTab} onChange={(_event: React.SyntheticEvent, value: number) => setCurrentTab(value)}>
        <Tab label="Vulnerabilities" />
        <Tab label="IOCs" />
        <Tab label="Misconfigurations" />
      </Tabs>

      {/* Filters */}
      <Box mb="16px">
        <FilterBar
          filters={filterSchema}
          logicalOperatorMode="BOTH"
          onFilterModelChange={(model) => {
            setFilters(getFiltersFromModel(model));
          }}
        />
      </Box>

      {/* Results table */}
      <DataGridTable
        columns={activeType === 'iocs' ? iocColumns : columns}
        rows={activeType === 'iocs' ? iocRows : filteredRows}
        totalCount={filteredRows.length}
        isClientSide
        isLoading={false}
        disableRowSelectionOnClick
        onSearchChange={(value) => setSearchQuery(value)}
        getRowId={(row) => row.id}
        slots={{
          customCountText: activeType === 'iocs' ? () => 'IOC Findings displayed' : undefined,
          batchActions: BatchButton,
          tableActions: TableActions
        }}
      />
    </Box>
  );
};
