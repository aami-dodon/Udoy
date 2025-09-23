import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive.js';
import api from '../../services/apiClient.js';

const HeroSection = styled(Box)(({ theme }) => ({
  width: '100%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: theme.spacing(3),
  color: theme.palette.common.white,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(10, 8),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6, 3)
  }
}));

const HeroContent = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  textAlign: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    textAlign: 'left',
    alignItems: 'flex-start'
  }
}));

const HeroDescription = styled(Typography)(({ theme }) => ({
  maxWidth: 600,
  marginInline: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginInline: 0
  }
}));

const HeroActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const FeatureCard = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  minHeight: 220
}));

/**
 * Marketing landing page highlighting LMS value props.
 * @returns {JSX.Element} Landing view.
 */
function LandingPage() {
  const { isMobile } = useResponsive();
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const { data } = await api.get('/landing/highlights');
        setHighlights(data.highlights);
      } catch (error) {
        setHighlights([]);
      }
    }
    fetchHighlights();
  }, []);

  const featureData = useMemo(() => {
    if (highlights.length > 0) {
      return highlights;
    }
    return [
      { title: 'Guided Courses', description: 'Curated curricula with scaffolded lessons and interactive quizzes.' },
      { title: 'Real-time Dashboards', description: 'Track progress, mastery, and engagement across cohorts.' },
      { title: 'Certificates', description: 'Celebrate growth with auto-generated certificates and shareable badges.' }
    ];
  }, [highlights]);

  return (
    <Stack spacing={8} alignItems="center">
      <HeroSection>
        <HeroContent>
          <Chip label="Community-first learning" color="secondary" />
          <Typography variant={isMobile ? 'h4' : 'h2'}>
            Empower young learners with joyful, guided learning journeys.
          </Typography>
          <HeroDescription variant="body1">
            UDOY brings together playful lessons, bite-sized quizzes, and real-time progress tracking so that students, teachers,
            and families can collaborate effortlessly.
          </HeroDescription>
          <HeroActions>
            <Button component={RouterLink} to="/signup" variant="contained" color="secondary" size="large">
              Get Started
            </Button>
            <Button component={RouterLink} to="/courses" variant="outlined" color="inherit" size="large">
              Explore Courses
            </Button>
          </HeroActions>
        </HeroContent>
      </HeroSection>

      <Grid container spacing={4} justifyContent="center">
        {featureData.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <FeatureCard spacing={2}>
              <Typography variant="h5">{feature.title}</Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.description}
              </Typography>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default LandingPage;
