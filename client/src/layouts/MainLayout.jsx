import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useResponsive from '../hooks/useResponsive.js';

const LayoutRoot = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}));

const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2)
}));

const NavActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1)
  }
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  paddingBlock: theme.spacing(6)
}));

/**
 * Top-level responsive layout with app bar and centered content container.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Routed page content.
 * @returns {JSX.Element} Wrapped children content with navigation.
 */
function MainLayout({ children }) {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navLinks = [
    { label: 'Courses', to: '/courses' },
    { label: 'Student', to: '/dashboard/student' },
    { label: 'Teacher', to: '/dashboard/teacher' },
    { label: 'Admin', to: '/dashboard/admin' }
  ];

  return (
    <LayoutRoot>
      <AppBar position="sticky" color="primary" elevation={0}>
        <HeaderToolbar>
          <Typography variant="h6" component={RouterLink} to="/" color="inherit">
            UDOY LMS
          </Typography>
          <NavActions>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                color={location.pathname === link.to ? 'secondary' : 'inherit'}
                component={RouterLink}
                to={link.to}
                size={isMobile ? 'small' : 'medium'}
              >
                {link.label}
              </Button>
            ))}
            <Button component={RouterLink} to="/login" variant="contained" color="secondary" size={isMobile ? 'small' : 'medium'}>
              Login
            </Button>
          </NavActions>
        </HeaderToolbar>
      </AppBar>
      <ContentContainer maxWidth="lg">{children}</ContentContainer>
    </LayoutRoot>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainLayout;
