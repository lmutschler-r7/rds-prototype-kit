// app/App.tsx
import React, { useState, useEffect } from 'react';
import { CurrentNavShell } from '../lib/CurrentNavShell';
import { FutureNavShell } from '../lib/FutureNavShell';
import { Box, CssBaseline, RDSThemeProvider, Typography } from '@rapid7/rds';
import navConfig from './nav-future.json';

// Page Component Imports
import { CommandHome } from './pages/CommandHome';
import { Alerts } from './pages/Alerts';
import { Findings } from './pages/Findings';
import { ResponseRemediation } from './pages/ResponseRemediation';

export const App = () => {
  const shellVariant: 'current' | 'future' = 'current';
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const renderPage = () => {
    switch (currentPath.toLowerCase().trim()) {
      case '/command-home':
        return <CommandHome />;
      case '/alerts':
        return <Alerts />;
      case '/findings':
        return <Findings />;
      case '/response':
        return <ResponseRemediation />;
      default:
        return (
          <Box sx={{ py: '40px', textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ color: (theme) => theme.palette.text.primary, fontSize: '16px', mb: '4px' }}
            >
              View Under Construction
            </Typography>
            <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
              The pathway <code>{currentPath}</code> is mapped in the nav json but has not been scaffolded in <code>App.tsx</code> yet.
            </Typography>
          </Box>
        );
    }
  };

 // Change themeMode to 'light' or 'dark' or toggle shellVariant to current/future 
  const ShellComponent = shellVariant === 'future' ? CurrentNavShell : FutureNavShell;
  const themeMode = navConfig.themeMode === 'light' ? 'light' : 'dark';

  return (
    <RDSThemeProvider themeMode={themeMode} brandName="Callisto">
      <CssBaseline />
      <ShellComponent>{renderPage()}</ShellComponent>
    </RDSThemeProvider>
  );
};