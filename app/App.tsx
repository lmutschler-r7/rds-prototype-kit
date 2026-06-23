// app/App.tsx
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { CurrentNavShell } from '../lib/CurrentNavShell';
import { FutureNavShell } from '../lib/FutureNavShell';
import { Box, CssBaseline, RDSThemeProvider, Typography } from '@rapid7/rds';

// Add new page imports here
import { CommandHome } from './pages/CommandHome';
import { Alerts } from './pages/Alerts';
import { AlertDetail } from './pages/AlertDetail';
import { Findings } from './pages/Findings';
import { ResponseRemediation } from './pages/ResponseRemediation';
import { VulnerabilityDetail } from './pages/VulnerabilityDetail';

type ThemeMode = 'light' | 'dark';
type ShellVariant = 'current' | 'future';
type ThemeToggleOrigin = { x: number; y: number };
type ThemeModeChangeDetail = ThemeMode | { mode: ThemeMode; origin?: ThemeToggleOrigin };
type ShellVariantChangeDetail = ShellVariant | { variant: ShellVariant; origin?: ThemeToggleOrigin };

const getStoredShellVariant = (): ShellVariant => {
  const storedShellVariant = window.localStorage.getItem('shellVariant');
  return storedShellVariant === 'future' ? 'future' : 'current';
};

const getStoredThemeMode = (): ThemeMode => {
  const storedThemeMode = window.localStorage.getItem('themeMode');
  return storedThemeMode === 'dark' ? 'dark' : 'light';
};

export const App = () => {
  // App-level visual defaults
  // Change nav style default here via localStorage shellVariant: 'future' or 'current'
  const [shellVariant, setShellVariant] = useState<ShellVariant>(getStoredShellVariant);

  // Change theme default here: 'light' or 'dark'
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);

  // URL-driven routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const resolveThemeModeFromDetail = (detail: ThemeModeChangeDetail): ThemeMode => {
    if (typeof detail === 'string') {
      return detail === 'dark' ? 'dark' : 'light';
    }
    return detail.mode === 'dark' ? 'dark' : 'light';
  };

  const resolveThemeOriginFromDetail = (detail: ThemeModeChangeDetail): ThemeToggleOrigin => {
    if (typeof detail === 'string' || !detail.origin) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    return detail.origin;
  };

  const startThemeTransition = (nextThemeMode: ThemeMode, origin: ThemeToggleOrigin) => {
    const docWithTransition = document as Document & {
      startViewTransition?: (updateCallback: () => void) => { ready: Promise<void> };
    };

    if (!docWithTransition.startViewTransition) {
      setThemeMode(nextThemeMode);
      return;
    }

    const transition = docWithTransition.startViewTransition(() => {
      flushSync(() => {
        setThemeMode(nextThemeMode);
      });
    });

    transition.ready
      .then(() => {
        const maxHorizontalDistance = Math.max(origin.x, window.innerWidth - origin.x);
        const maxVerticalDistance = Math.max(origin.y, window.innerHeight - origin.y);
        const endRadius = Math.hypot(maxHorizontalDistance, maxVerticalDistance);

        (document.documentElement as any).animate(
          [
            {
              clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
              offset: 0,
            },
            {
              clipPath: `circle(${Math.max(8, endRadius * 0.08)}px at ${origin.x}px ${origin.y}px)`,
              offset: 0.16,
            },
            {
              clipPath: `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
              offset: 1,
            },
          ],
          {
            duration: 520,
            easing: 'cubic-bezier(0.32, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {
        // Keep fallback behavior silent if transition setup fails.
      });
  };

  const resolveShellVariantFromDetail = (detail?: ShellVariantChangeDetail): ShellVariant => {
    if (!detail) {
      return getStoredShellVariant();
    }

    if (typeof detail === 'string') {
      return detail === 'future' ? 'future' : 'current';
    }

    return detail.variant === 'future' ? 'future' : 'current';
  };

  const resolveShellOriginFromDetail = (detail?: ShellVariantChangeDetail): ThemeToggleOrigin => {
    if (!detail || typeof detail === 'string' || !detail.origin) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    return detail.origin;
  };

  const startShellTransition = (nextShellVariant: ShellVariant, origin: ThemeToggleOrigin) => {
    const docWithTransition = document as Document & {
      startViewTransition?: (updateCallback: () => void) => { ready: Promise<void> };
    };

    if (!docWithTransition.startViewTransition) {
      setShellVariant(nextShellVariant);
      return;
    }

    const transition = docWithTransition.startViewTransition(() => {
      flushSync(() => {
        setShellVariant(nextShellVariant);
      });
    });

    transition.ready
      .then(() => {
        const maxHorizontalDistance = Math.max(origin.x, window.innerWidth - origin.x);
        const maxVerticalDistance = Math.max(origin.y, window.innerHeight - origin.y);
        const endRadius = Math.hypot(maxHorizontalDistance, maxVerticalDistance);

        (document.documentElement as any).animate(
          [
            {
              clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
              offset: 0,
            },
            {
              clipPath: `circle(${Math.max(8, endRadius * 0.08)}px at ${origin.x}px ${origin.y}px)`,
              offset: 0.16,
            },
            {
              clipPath: `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
              offset: 1,
            },
          ],
          {
            duration: 520,
            easing: 'cubic-bezier(0.32, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {
        // Keep fallback behavior silent if transition setup fails.
      });
  };

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const handleThemeModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeModeChangeDetail>;
      const detail = customEvent.detail;
      const nextThemeMode = resolveThemeModeFromDetail(detail);
      const origin = resolveThemeOriginFromDetail(detail);
      startThemeTransition(nextThemeMode, origin);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'themeMode') {
        setThemeMode(getStoredThemeMode());
      }

      if (event.key === 'shellVariant') {
        setShellVariant(getStoredShellVariant());
      }
    };

    const handleShellVariantChange = (event: Event) => {
      const customEvent = event as CustomEvent<ShellVariantChangeDetail>;
      const detail = customEvent.detail;
      startShellTransition(resolveShellVariantFromDetail(detail), resolveShellOriginFromDetail(detail));
    };

    window.addEventListener('theme-mode-change', handleThemeModeChange as EventListener);
    window.addEventListener('shell-variant-change', handleShellVariantChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('theme-mode-change', handleThemeModeChange as EventListener);
      window.removeEventListener('shell-variant-change', handleShellVariantChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Route-to-page mapping
  // Add new routes/pages in this switch
  const renderPage = () => {
    switch (currentPath.toLowerCase().trim()) {
      case '/command-home':
        return <CommandHome />;
      case '/alerts':
        return <Alerts />;
      case '/alerts/detail':
        return <AlertDetail />;
      case '/findings':
        return <Findings />;
        case '/findings/detail':
          return <VulnerabilityDetail />;
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