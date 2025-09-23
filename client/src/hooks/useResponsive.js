import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook that exposes responsive breakpoints for components.
 * @returns {{ isMobile: boolean, isDesktop: boolean }} Responsive flags.
 */
function useResponsive() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return { isMobile, isDesktop };
}

export default useResponsive;
