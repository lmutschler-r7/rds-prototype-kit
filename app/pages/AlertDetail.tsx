import React from 'react';
import { Box, Card, CardContent, CardHeader, DetailsPageHeader, Stack, Theme, Typography, useTheme } from '@rapid7/rds';

const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const AlertDetail: React.FC = () => {
  const theme = useTheme<Theme>();
  const selectedAlertId = window.localStorage.getItem('selectedAlertId') || 'Unknown Alert';

  return (
    <Box>
      <DetailsPageHeader
        pageTitle={`Alert Details: ${selectedAlertId}`}
        isSticky
        breadcrumbs={{
          links: [
            {
              label: 'Alerts',
              onClick: () => navigateTo('/alerts')
            }
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
        <Card>
          <CardHeader title="Details Placeholder" subheader="This page is intentionally blank so you can fill it in later." />
          <CardContent>
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Start building the alert detail experience here. Suggested sections: summary, timeline, related entities,
              evidence, and response actions.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
