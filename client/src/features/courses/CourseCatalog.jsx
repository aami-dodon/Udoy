import { Card, CardActions, CardContent, CardHeader, Chip, Grid, Stack, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useMemo } from 'react';

const categories = ['STEM', 'Languages', 'Creative Arts'];

const courses = [
  {
    id: 'math-adventures',
    title: 'Math Adventures',
    category: 'STEM',
    summary: 'Interactive missions exploring geometry, fractions, and problem solving.'
  },
  {
    id: 'spanish-express',
    title: 'Spanish Express',
    category: 'Languages',
    summary: 'Conversational Spanish lessons with music and storytelling.'
  },
  {
    id: 'digital-art-lab',
    title: 'Digital Art Lab',
    category: 'Creative Arts',
    summary: 'Illustration, animation, and digital painting for beginners.'
  }
];

const CourseCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(3)
}));

const SectionStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3)
}));

/**
 * Course catalog listing available learning paths.
 * @returns {JSX.Element} Catalog view.
 */
function CourseCatalog() {
  const groupedCourses = useMemo(() => {
    return categories.map((category) => ({
      category,
      items: courses.filter((course) => course.category === category)
    }));
  }, []);

  return (
    <Stack spacing={6}>
      <SectionStack>
        <Typography variant="h3">Discover your next adventure</Typography>
        <Typography variant="body1" color="text.secondary">
          Browse curated programs with video lessons, quizzes, and downloadable certificates.
        </Typography>
      </SectionStack>

      {groupedCourses.map((section) => (
        <SectionStack key={section.category}>
          <Typography variant="h5">{section.category}</Typography>
          <Grid container spacing={3}>
            {section.items.map((course) => (
              <Grid item xs={12} md={4} key={course.id}>
                <CourseCard>
                  <CardHeader title={course.title} action={<Chip label={course.category} color="primary" />} />
                  <CardContent>
                    <Typography variant="body1" color="text.secondary">
                      {course.summary}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button component={RouterLink} to={`/courses/${course.id}`} size="small" variant="contained">
                      View course
                    </Button>
                  </CardActions>
                </CourseCard>
              </Grid>
            ))}
          </Grid>
        </SectionStack>
      ))}
    </Stack>
  );
}

export default CourseCatalog;
