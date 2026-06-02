// app/App.tsx
import React, { useState, useEffect } from 'react';
import { CurrentNavShell } from '../lib/CurrentNavShell';
import { FutureNavShell } from '../lib/FutureNavShell';
import { Box, CssBaseline, RDSThemeProvider, Typography } from '@rapid7/rds';

// Add new page imports here
import { CommandHome } from './pages/CommandHome';
import { Alerts } from './pages/Alerts';
import { Findings } from './pages/Findings';
import { ResponseRemediation } from './pages/ResponseRemediation';

export const App = () => {
  // Runtime style overrides (falls back to defaults below)
  const storedShellVariant = window.localStorage.getItem('shellVariant');
  const storedThemeMode = window.localStorage.getItem('themeMode');

  // App-level visual defaults
  // Change nav style default here: 'future' or 'current'
  const shellVariant: 'current' | 'future' =
    storedShellVariant === 'current' || storedShellVariant === 'future' ? storedShellVariant : 'current';

  // Change theme default here: 'light' or 'dark'
  const themeMode: 'light' | 'dark' =
    storedThemeMode === 'light' || storedThemeMode === 'dark' ? storedThemeMode : 'light';

  // URL-driven routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Route-to-page mapping
  // Add new routes/pages in this switch
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

  // Nav shell variant selector
  const ShellComponent = shellVariant === 'future' ? FutureNavShell : CurrentNavShell;

  return (
    // Global theme + shell wrapper
    <RDSThemeProvider themeMode={themeMode} brandName="Callisto">
      <CssBaseline />
      <ShellComponent>{renderPage()}</ShellComponent>
    </RDSThemeProvider>
  );
};