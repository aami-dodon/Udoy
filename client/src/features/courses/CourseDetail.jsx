import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Card, CardContent, Chip, Stack, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../../services/apiClient.js';

const LessonsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3)
}));

const LessonRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const Description = styled(Typography)(({ theme }) => ({
  maxWidth: 720
}));

const EnrollButton = styled(Button)(() => ({
  alignSelf: 'flex-start'
}));

const mockLessons = [
  { title: 'Lesson 1: Introduction', duration: '8 min', type: 'Video' },
  { title: 'Lesson 2: Practice quiz', duration: '12 questions', type: 'Quiz' },
  { title: 'Lesson 3: Project', duration: '30 min', type: 'Activity' }
];

const courseLookup = {
  'math-adventures': {
    title: 'Math Adventures',
    description: 'Solve mysteries with fractions, geometry, and logic puzzles in a playful universe.',
    instructor: 'Teacher Miles',
    category: 'STEM'
  },
  'spanish-express': {
    title: 'Spanish Express',
    description: 'Sing, act, and play games while learning everyday Spanish vocabulary.',
    instructor: 'Teacher Paloma',
    category: 'Languages'
  },
  'digital-art-lab': {
    title: 'Digital Art Lab',
    description: 'Build a portfolio of vibrant digital art pieces with easy-to-follow lessons.',
    instructor: 'Teacher Jun',
    category: 'Creative Arts'
  }
};

/**
 * Detail view for a specific course.
 * @returns {JSX.Element} Course detail view.
 */
function CourseDetail() {
  const { id } = useParams();
  const course = useMemo(() => courseLookup[id], [id]);

  const handleEnroll = async () => {
    await api.post(`/courses/${id}/enroll`);
  };

  if (!course) {
    return <Typography variant="h5" color="text.secondary">Course not found.</Typography>;
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Chip label={course.category} color="primary" />
        <Typography variant="h3">{course.title}</Typography>
        <Description variant="body1" color="text.secondary">
          {course.description}
        </Description>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar>{course.instructor[0]}</Avatar>
          <Typography variant="body2" color="text.secondary">
            Led by {course.instructor}
          </Typography>
        </Stack>
        <EnrollButton onClick={handleEnroll} variant="contained" color="primary" size="large">
          Enroll now
        </EnrollButton>
      </Stack>

      <LessonsCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Lessons included
          </Typography>
          <Stack spacing={2}>
            {mockLessons.map((lesson) => (
              <LessonRow key={lesson.title}>
                <Typography variant="subtitle1">{lesson.title}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label={lesson.type} color="secondary" variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    {lesson.duration}
                  </Typography>
                </Stack>
              </LessonRow>
            ))}
          </Stack>
        </CardContent>
      </LessonsCard>
    </Stack>
  );
}

export default CourseDetail;
