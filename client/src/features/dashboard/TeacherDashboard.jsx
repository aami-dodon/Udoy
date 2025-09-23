import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StatCard = styled(Card)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.spacing(3)
}));

const CardsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const analytics = [
  { label: 'Active Students', value: 128, status: 'success' },
  { label: 'Completion Rate', value: '82%', status: 'warning' },
  { label: 'Quiz Average', value: '76%', status: 'primary' }
];

/**
 * Teacher dashboard summarizing classroom analytics.
 * @returns {JSX.Element} Teacher dashboard view.
 */
function TeacherDashboard() {
  return (
    <Stack spacing={4}>
      <Typography variant="h4">Classroom pulse</Typography>
      <CardsRow>
        {analytics.map((item) => (
          <StatCard key={item.label}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="h3">{item.value}</Typography>
                <Chip label="Live" color={item.status} variant="outlined" />
              </Stack>
            </CardContent>
          </StatCard>
        ))}
      </CardsRow>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Students needing attention
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Identify learners with low quiz scores or stalled progress so you can reach out proactively.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default TeacherDashboard;
