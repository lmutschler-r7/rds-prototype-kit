import React, { useEffect, useState } from 'react';
import { Box, Stack, Theme, Typography, useTheme } from '@rapid7/rds';
import * as Icons from '@rapid7/icons';
import navConfig from '../app/nav-future.json';

interface ShellProps {
  children: React.ReactNode;
}

export const FutureNavShell: React.FC<ShellProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [logoSvgMarkup, setLogoSvgMarkup] = useState<string>('');
  
  // High-fidelity sidebar layout orchestration states
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

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

  const toggleParent = (id: string) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const theme = useTheme<Theme>();

  const colors = {
    bgApp: theme.palette.background.default,
    bgMain: theme.palette.background.default,
    textInactive: theme.palette.text.secondary,
    textActive: theme.palette.text.primary,
    textDisabled: theme.palette.text.disabled,
    bgHover: theme.palette.action.hover,
    bgActive: theme.palette.action.selected,
    border: theme.palette.divider,
    divider: theme.palette.divider,
    controlHover: theme.palette.action.hover,
    accent: theme.palette.primary.main,
    textOnAccent: theme.palette.primary.contrastText,
    navShadow: theme.shadows[8]
  };

  return (
      <Box display="flex" width="100vw" height="100vh" bgcolor={colors.bgApp} p="8px" position="relative">
        
        {/* Left Edge Hover Detector Strip - Active only when unpinned */}
        {!isPinned && (
          <Box
            onMouseEnter={() => setIsHovered(true)}
            sx={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: '16px',
              zIndex: 1590,
            }}
          />
        )}

        {/* Structural Layout Spacer */}
        <Box
          sx={{
            width: isPinned ? '220px' : '0px',
            transition: 'width 200ms ease-out',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        />

        {/* Nav Sidebar Component Container */}
        <Box
          onMouseEnter={() => !isPinned && setIsHovered(true)}
          onMouseLeave={() => !isPinned && setIsHovered(false)}
          sx={{
            width: '220px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
            p: '8px',
            pt: '8px',
            position: 'fixed',
            top: '8px',
            bottom: '8px',
            left: isPinned ? '8px' : (isHovered ? '8px' : '-230px'),
            zIndex: 1600,
            bgcolor: colors.bgApp,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            boxShadow: isPinned ? 'none' : colors.navShadow,
            transition: 'left 200ms ease-out, boxShadow 200ms ease-out',
          }}
        >
          {/* Deepened Ambient Radial Glow Layer - Higher Opacity and Wider Blur Radius */}
          <Box 
            sx={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.bgActive} 0%, transparent 75%)`,
              filter: 'blur(24px)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Workspace User Menu Area + Right Aligned Action Utilities */}
          <Stack direction="row" alignItems="center" gap="6px" px="7px" py="2px" mb="16px" width="100%" sx={{ position: 'relative', zIndex: 2 }}>
            <Box bgcolor={colors.accent} width="20px" height="20px" borderRadius="6px" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography variant="body2" sx={{ fontSize: '10px', fontWeight: 'bold', color: colors.textOnAccent, lineHeight: 1 }}>LE</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '14px', color: colors.textActive, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
              {navConfig.username}
            </Typography>
            
            {/* Right Aligned Quick Action Set */}
            <Stack direction="row" alignItems="center" gap="4px" sx={{ marginLeft: 'auto', flexShrink: 0 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                sx={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: colors.controlHover }
                }}
              >
                <Icons.Search style={{ color: colors.textInactive, width: '14px', height: '14px' }} />
              </Box>

              <Box 
                onClick={() => {
                  setIsPinned(!isPinned);
                  if (isPinned) setIsHovered(true);
                }}
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                sx={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: colors.controlHover }
                }}
              >
                {isPinned ? (
                  <Icons.StarEnabled style={{ color: colors.accent, width: '14px', height: '14px' }} />
                ) : (
                  <Icons.StarEmpty style={{ color: colors.textInactive, width: '14px', height: '14px' }} />
                )}
              </Box>
            </Stack>
          </Stack>

          {/* Navigation Tree */}
          <Box flex="1" overflow="auto" sx={{ position: 'relative', zIndex: 2, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: colors.border, borderRadius: '4px' } }}>
            <Stack spacing="1px" px="4px">
              {navConfig.navTree.map((item: any) => {
                const IconComponent = item.icon ? (Icons as any)[item.icon] : null;

                if (item.type === 'section-header') {
                  const isWorkspaces = item.id === 'workspaces-header' || item.label.toLowerCase() === 'workspaces';
                  return (
                    <React.Fragment key={item.id}>
                      <Box sx={{ height: isWorkspaces ? '16px' : '12px', width: '100%' }} />
                      <Box px="6px" py="2px">
                        <Typography sx={{ fontSize: '12px', color: colors.textInactive, fontWeight: 'medium' }}>{item.label}</Typography>
                      </Box>
                    </React.Fragment>
                  );
                }

                if (item.type === 'leaf') {
                  const isActive = item.path ? currentPath === item.path : false;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => navigateTo(item.path)}
                      px="6px"
                      display="flex" 
                      alignItems="center" 
                      gap="8px"
                      borderRadius="8px"
                      bgcolor={isActive ? colors.bgActive : 'transparent'}
                      sx={{ 
                        height: '26px',
                        minHeight: '26px',
                        maxHeight: '26px',
                        cursor: item.path ? 'pointer' : 'default', 
                        '&:hover': { bgcolor: isActive ? colors.bgActive : colors.bgHover } 
                      }}
                    >
                      {IconComponent && <IconComponent size="small" style={{ color: isActive ? colors.textActive : colors.textInactive, width: '16px', height: '16px', flexShrink: 0 }} />}
                      <Typography sx={{ fontSize: '12px', color: isActive ? colors.textActive : colors.textInactive, lineHeight: 1 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  );
                }

                if (item.type === 'parent') {
                  const isExpanded = !!expandedParents[item.id];
                  return (
                    <Box key={item.id} width="100%">
                      <Box 
                        onClick={() => toggleParent(item.id)}
                        display="flex" 
                        alignItems="center"
                        px="6px" 
                        borderRadius="8px"
                        sx={{ 
                          height: '26px',
                          minHeight: '26px',
                          maxHeight: '26px',
                          cursor: 'pointer', 
                          '&:hover': { bgcolor: colors.bgHover } 
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap="6px">
                          {IconComponent && <IconComponent size="small" style={{ color: colors.textInactive, width: '16px', height: '16px', flexShrink: 0 }} />}
                          <Typography sx={{ fontSize: '12px', color: colors.textInactive, lineHeight: 1 }}>{item.label}</Typography>
                          <Box sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center' }}>
                            <Icons.NextChevronRightArrow style={{ color: colors.textInactive, width: '14px', height: '14px' }} />
                          </Box>
                        </Stack>
                      </Box>
                      
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateRows: isExpanded ? '1fr' : '0fr',
                          transition: 'grid-template-rows 200ms ease-out',
                          overflow: 'hidden',
                          pointerEvents: isExpanded ? 'auto' : 'none'
                        }}
                      >
                        <Box sx={{ minHeight: 0 }}>
                          <Stack spacing="1px" mt="1px" position="relative">
                            {item.children.map((child: any, childIndex: number) => {
                              const isLastChild = childIndex === item.children.length - 1;
                              
                              if (child.type === 'group-header') {
                                return (
                                  <Box key={child.id} pl="28px" pr="6px" display="flex" alignItems="center" position="relative" sx={{ height: '26px' }}>
                                    <Box position="absolute" left="14px" top="0" height={isLastChild ? '13px' : '100%'} width="1px" bgcolor={colors.divider} />
                                    {isLastChild && <Box position="absolute" left="14px" top="13px" width="6px" height="1px" bgcolor={colors.divider} />}
                                    <Typography sx={{ fontSize: '10px', color: colors.textDisabled, letterSpacing: '0.3px', lineHeight: 1 }}>{child.label}</Typography>
                                  </Box>
                                );
                              }
                              
                              const isChildActive = child.path ? currentPath === child.path : false;
                              return (
                                <Box
                                  key={child.id}
                                  onClick={() => navigateTo(child.path)}
                                  pl="28px" pr="6px"
                                  display="flex" 
                                  alignItems="center"
                                  borderRadius="8px"
                                  bgcolor={isChildActive ? colors.bgActive : 'transparent'}
                                  position="relative"
                                  sx={{ 
                                    height: '26px',
                                    minHeight: '26px',
                                    maxHeight: '26px',
                                    cursor: child.path ? 'pointer' : 'default', 
                                    '&:hover': { bgcolor: isChildActive ? colors.bgActive : colors.bgHover } 
                                  }}
                                >
                                  <Box position="absolute" left="14px" top="0" height={isLastChild ? '13px' : '100%'} width="1px" bgcolor={colors.divider} />
                                  {isLastChild && <Box position="absolute" left="14px" top="13px" width="6px" height="1px" bgcolor={colors.divider} />}
                                  <Typography sx={{ fontSize: '12px', color: isChildActive ? colors.textActive : colors.textInactive, lineHeight: 1 }}>
                                    {child.label}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>
                      </Box>
                    </Box>
                  );
                }
                return null;
              })}
            </Stack>
          </Box>

          {/* Cleaned Up Footer Area referencing the local repository file asset */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              mt: 'auto',
              pt: '16px',
              pb: '6px',
              px: '10px',
              userSelect: 'none',
              color: colors.textActive,
              lineHeight: 0
            }}
          >
            {logoSvgMarkup ? (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  '& svg': {
                    display: 'block',
                    height: '12px',
                    width: 'auto'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: logoSvgMarkup }}
              />
            ) : (
              <img
                src="/rapid7-logo.svg"
                style={{ height: '12px', display: 'block' }}
                alt="Rapid7 Logo"
              />
            )}
          </Box>

        </Box>

        {/* Main Content Workspace */}
        <Box 
          flex="1" 
          bgcolor={colors.bgMain} 
          borderRadius="12px" 
          border={`1px solid ${colors.border}`} 
          display="flex" 
          flexDirection="column" 
          overflow="hidden"
          sx={{
            position: 'relative',
            zIndex: 1,
            marginLeft: isPinned ? '12px' : '0px',
            transition: 'margin-left 200ms ease-out'
          }}
        >
           <Box flex="1" px="16px" pb="16px" overflow="auto">
             {children}
           </Box>
        </Box>

      </Box>
  );
};