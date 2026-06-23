import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack, Theme, Typography, useTheme } from '@rapid7/rds';
import * as Icons from '@rapid7/icons';
import { AccessRequest, Extensions, FeaturePreview, HelpInformation } from '@rapid7/icons';
import { PreviousChevronLeftArrow } from '@rapid7/icons';
import navConfig from '../app/nav-future.json';

interface ShellProps {
  children: React.ReactNode;
}

type NavChild = {
  id: string;
  type: 'leaf' | 'group-header';
  label: string;
  path?: string;
};

type NavItem = {
  id: string;
  type: 'leaf' | 'parent' | 'section-header';
  label: string;
  path?: string;
  icon?: string;
  children?: NavChild[];
};

const getWorkspaceItems = (items: NavItem[]) => {
  const workspacesHeaderIndex = items.findIndex((item) => item.type === 'section-header');
  return workspacesHeaderIndex >= 0 ? items.slice(workspacesHeaderIndex + 1) : items;
};

const getActiveParentId = (items: NavItem[], currentPath: string) => {
  const activeParent = items.find(
    (item) =>
      item.type === 'parent' &&
      item.children?.some((child) => child.type === 'leaf' && child.path === currentPath),
  );

  return activeParent?.id ?? null;
};

export const CurrentNavShell: React.FC<ShellProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [logoSvgMarkup, setLogoSvgMarkup] = useState<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const [indicatorState, setIndicatorState] = useState({ top: 0, height: 0, visible: false });
  const workspaceItems = useMemo(() => getWorkspaceItems(navConfig.navTree as NavItem[]), []);
  const [openParentId, setOpenParentId] = useState<string | null>(() => getActiveParentId(workspaceItems, window.location.pathname));
  const railScrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const activeParentId = getActiveParentId(workspaceItems, currentPath);
    if (activeParentId) {
      setOpenParentId(activeParentId);
    }
  }, [currentPath, workspaceItems]);

  useEffect(() => {
    let isMounted = true;

    fetch('/rapid7-logo.svg')
      .then((response) => response.text())
      .then((svgText) => {
        if (isMounted) {
          setLogoSvgMarkup(svgText);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLogoSvgMarkup('');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navigateTo = (path?: string) => {
    if (!path) return;
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const toggleThemeMode = (event: React.MouseEvent) => {
    const currentThemeMode = window.localStorage.getItem('themeMode');
    const nextThemeMode = currentThemeMode === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem('themeMode', nextThemeMode);
    window.dispatchEvent(new CustomEvent('theme-mode-change', {
      detail: {
        mode: nextThemeMode,
        origin: { x: event.clientX, y: event.clientY },
      },
    }));
  };

  const switchNavStyle = (event: React.MouseEvent) => {
    const currentShellVariant = window.localStorage.getItem('shellVariant');
    const nextShellVariant = currentShellVariant === 'future' ? 'current' : 'future';
    window.localStorage.setItem('shellVariant', nextShellVariant);
    window.dispatchEvent(new CustomEvent('shell-variant-change', {
      detail: {
        variant: nextShellVariant,
        origin: { x: event.clientX, y: event.clientY },
      },
    }));
    setProfileMenuOpen(false);
  };

  const theme = useTheme<Theme>();
  const selectedParent = workspaceItems.find((item) => item.id === openParentId && item.type === 'parent');
  const clickedItemIndex = workspaceItems.findIndex((item) => item.id === clickedItemId);

  const measureIndicator = () => {
    const scrollContainer = railScrollRef.current;
    const activeItem = clickedItemId ? itemRefs.current[clickedItemId] : null;

    if (!scrollContainer || !activeItem) {
      setIndicatorState((previous) => (previous.visible ? { ...previous, visible: false } : previous));
      return;
    }

    setIndicatorState({
      top: activeItem.offsetTop - scrollContainer.scrollTop,
      height: activeItem.offsetHeight,
      visible: true,
    });
  };

  useLayoutEffect(() => {
    measureIndicator();
  }, [clickedItemId, currentPath, openParentId, workspaceItems]);

  useEffect(() => {
    const scrollContainer = railScrollRef.current;

    if (!scrollContainer) return;

    const handleMeasure = () => measureIndicator();

    scrollContainer.addEventListener('scroll', handleMeasure);
    window.addEventListener('resize', handleMeasure);

    return () => {
      scrollContainer.removeEventListener('scroll', handleMeasure);
      window.removeEventListener('resize', handleMeasure);
    };
  }, [clickedItemId, currentPath, openParentId, workspaceItems]);

  const colors = {
    bgCanvas: theme.palette.background.default,
    bgChrome: theme.palette.background.paper,
    bgRail: theme.palette.background.default,
    bgContent: theme.palette.background.default,
    bgHover: theme.palette.action.hover,
    bgSelected: theme.palette.action.selected,
    border: theme.palette.divider,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textDisabled: theme.palette.text.disabled,
    accent: '#e85e25',
    accentText: theme.palette.primary.contrastText,
    shadow: theme.shadows[4],
  };

  const renderDynamicIcon = (iconName?: string, size = 16, color?: string) => {
    const IconComponent = iconName ? (Icons as any)[iconName] : null;
    if (!IconComponent) {
      return (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '4px',
            border: `1px solid ${color ?? colors.textSecondary}`,
          }}
        />
      );
    }

    return <IconComponent style={{ width: size, height: size, color: color ?? colors.textSecondary, flexShrink: 0 }} />;
  };

  const renderUtilityButton = (key: string, icon: React.ReactNode) => (
    <Box
      key={key}
      sx={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textSecondary,
        '&:hover': {
          bgcolor: colors.bgHover,
        },
      }}
    >
      {icon}
    </Box>
  );

  return (
      <Box sx={{ height: '100vh', bgcolor: colors.bgCanvas, color: colors.textPrimary, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            height: '52px',
            px: '18px',
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.bgChrome,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1300,
          }}
        >
          <Box
            onClick={toggleThemeMode}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: colors.textPrimary,
              lineHeight: 0,
              '& svg': {
                display: 'block',
                height: '18px',
                width: 'auto',
              },
            }}
            dangerouslySetInnerHTML={{ __html: logoSvgMarkup }}
          />

          <Stack direction="row" spacing="8px" alignItems="center">
            {renderUtilityButton('feature-preview', <FeaturePreview style={{ width: 24, height: 24, color: colors.textPrimary }} />)}
            {renderUtilityButton('extensions', <Extensions style={{ width: 24, height: 24, color: colors.textPrimary }} />)}
            {renderUtilityButton('access-request', <AccessRequest style={{ width: 24, height: 24, color: colors.textPrimary }} />)}
            {renderUtilityButton('help-information', <HelpInformation style={{ width: 24, height: 24, color: colors.textPrimary }} />)}
            <Box
              onClick={() => setProfileMenuOpen((previous) => !previous)}
              sx={{
                width: '24px',
                height: '24px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: colors.bgHover,
                color: colors.textPrimary,
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              OP
              {profileMenuOpen && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '32px',
                    right: 0,
                    minWidth: '144px',
                    bgcolor: colors.bgChrome,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    boxShadow: colors.shadow,
                    py: '4px',
                    zIndex: 1400,
                    animation: 'currentNavProfileMenuIn 180ms ease-out',
                    '@keyframes currentNavProfileMenuIn': {
                      from: { opacity: 0, transform: 'translateY(-6px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Box px="12px" py="8px">
                    <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>Settings</Typography>
                  </Box>
                  <Box
                    onClick={(event) => {
                      event.stopPropagation();
                      switchNavStyle(event);
                    }}
                    px="12px"
                    py="8px"
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 160ms ease-out',
                      '&:hover': {
                        bgcolor: colors.bgHover,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: colors.textPrimary }}>Switch Nav</Typography>
                  </Box>
                  <Box px="12px" py="8px">
                    <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>Log Out</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            height: '48px',
            px: '18px',
            bgcolor: colors.bgContent,
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            position: 'relative',
            zIndex: 1200,
          }}
        >
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
            Command Platform
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', bgcolor: colors.bgContent }}>
          <Box
            sx={{
              width: '100px',
              bgcolor: colors.bgRail,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'relative',
              zIndex: 1100,
            }}
          >
            <Box
              sx={{
                height: '42px',
                px: '12px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '6px',
                color: colors.textDisabled,
              }}
            >
              {renderDynamicIcon('Search', 16, colors.textDisabled)}
              <Typography sx={{ fontSize: '11px', color: colors.textDisabled, whiteSpace: 'nowrap' }}>Go to...</Typography>
            </Box>

            <Box ref={railScrollRef} sx={{ flex: 1, overflowY: 'auto', py: '8px', position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: `${indicatorState.top}px`,
                  width: '4px',
                  height: `${indicatorState.height}px`,
                  borderRadius: '999px',
                  bgcolor: colors.accent,
                  opacity: indicatorState.visible ? 1 : 0,
                  transition: 'top 180ms ease, height 180ms ease, opacity 180ms ease',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />

              <Stack spacing="4px" sx={{ px: '6px' }}>
                {workspaceItems.map((item) => {
                  const isParent = item.type === 'parent';
                  const isParentActive = isParent && item.children?.some((child) => child.type === 'leaf' && child.path === currentPath);
                  const isLeafActive = item.type === 'leaf' && item.path === currentPath;
                  const isActive = isLeafActive || isParentActive;
                  const isClicked = clickedItemId === item.id;

                  return (
                    <Box
                      key={item.id}
                      ref={(node) => {
                        itemRefs.current[item.id] = node as HTMLDivElement | null;
                      }}
                      onClick={() => {
                        setClickedItemId(item.id);

                        if (item.type === 'parent') {
                          setOpenParentId((currentOpenParentId) => (currentOpenParentId === item.id ? null : item.id));
                          return;
                        }

                        setOpenParentId(null);
                        navigateTo(item.path);
                      }}
                      sx={{
                        position: 'relative',
                        minHeight: '64px',
                        px: '8px',
                        py: '8px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textAlign: 'center',
                        color: isActive ? colors.textPrimary : colors.textSecondary,
                        bgcolor: isClicked ? colors.bgSelected : 'transparent',
                        border: '1px solid transparent',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: isClicked ? colors.bgSelected : colors.bgHover,
                          color: colors.textPrimary,
                        },
                      }}
                    >
                      <Box sx={{ color: isActive ? colors.accent : colors.textSecondary, lineHeight: 0 }}>
                        {renderDynamicIcon(item.icon, 20, isActive ? colors.accent : colors.textSecondary)}
                      </Box>
                      <Typography sx={{ fontSize: '11px', lineHeight: 1.15, color: 'inherit' }}>{item.label}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              width: selectedParent ? '220px' : '0px',
              bgcolor: colors.bgRail,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              position: 'relative',
              zIndex: 1050,
              overflow: 'hidden',
              transition: 'width 220ms ease',
            }}
          >
            <Box
              sx={{
                width: '220px',
                height: '100%',
                opacity: selectedParent ? 1 : 0,
                transition: 'opacity 160ms ease',
              }}
            >
              <Stack
                direction="row"
                spacing="8px"
                alignItems="center"
                sx={{
                  px: '14px',
                  height: '42px',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                }}
              >
                <Box
                  onClick={() => setOpenParentId(null)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    color: colors.textSecondary,
                  }}
                >
                  <PreviousChevronLeftArrow style={{ width: 14, height: 14, color: colors.textSecondary }} />
                  <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>Close</Typography>
                </Box>
              </Stack>

              <Box sx={{ px: '14px', py: '12px', overflowY: 'auto' }}>
                <Stack spacing="2px">
                  {selectedParent?.children?.map((child) => {
                    if (child.type === 'group-header') {
                      return (
                        <Typography
                          key={child.id}
                          sx={{
                            pt: '10px',
                            pb: '4px',
                            px: '8px',
                            fontSize: '11px',
                            color: colors.textDisabled,
                            textTransform: 'none',
                          }}
                        >
                          {child.label}
                        </Typography>
                      );
                    }

                    const isActive = child.path === currentPath;
                    return (
                      <Box
                        key={child.id}
                        onClick={() => navigateTo(child.path)}
                        sx={{
                          minHeight: '34px',
                          px: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          color: isActive ? colors.textPrimary : colors.textSecondary,
                          bgcolor: isActive ? colors.bgSelected : 'transparent',
                          '&:hover': {
                            bgcolor: isActive ? colors.bgSelected : colors.bgHover,
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '13px', color: 'inherit' }}>{child.label}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', bgcolor: colors.bgContent }}>
            <Box sx={{ height: '100%', overflow: 'auto', px: '20px', pt: 0, pb: '16px' }}>{children}</Box>
          </Box>
        </Box>
      </Box>
  );
};