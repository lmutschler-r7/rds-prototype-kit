import React from 'react';
import { Box, Theme, Typography, useTheme } from '@rapid7/rds';

export const CommandHome: React.FC = () => {
  const theme = useTheme<Theme>();

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
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: '2px' }}>
          Welcome back. Select an administrative or cloud module from the sidebar to begin analyzing telemetry.
        </Typography>
      </Box>
      
      <Box
        sx={{
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: '8px',
          p: '40px',
          textAlign: 'center',
          bgcolor: theme.palette.background.paper
        }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
          [Dashboard Widgets Canvas Area]
        </Typography>
      </Box>
    </Box>
  );
};