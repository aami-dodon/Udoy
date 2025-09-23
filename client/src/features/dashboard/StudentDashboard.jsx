import { Avatar, Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext.jsx';

const LargeAvatar = styled(Avatar)(() => ({
  width: 72,
  height: 72
}));

const ProgressCard = styled(Card)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.spacing(3)
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 6,
  backgroundColor: theme.palette.grey[200]
}));

const HeaderStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  }
}));

const CardsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const progressData = [
  { title: 'Math Adventures', value: 78 },
  { title: 'Science Explorers', value: 42 },
  { title: 'Creative Writing Lab', value: 91 }
];

/**
 * Student dashboard summarizing course progress.
 * @returns {JSX.Element} Student dashboard view.
 */
function StudentDashboard() {
  const { user } = useAuth();

  return (
    <Stack spacing={4}>
      <HeaderStack>
        <LargeAvatar>{user?.name?.[0]}</LargeAvatar>
        <Box>
          <Typography variant="h4">Welcome back, {user?.name}!</Typography>
          <Typography variant="body1" color="text.secondary">
            Continue your learning streak and finish your assignments to earn badges.
          </Typography>
        </Box>
      </HeaderStack>

      <CardsRow>
        {progressData.map((item) => (
          <ProgressCard key={item.title}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{item.title}</Typography>
                <ProgressBar value={item.value} variant="determinate" />
                <Typography variant="body2" color="text.secondary">
                  {item.value}% completed
                </Typography>
              </Stack>
            </CardContent>
          </ProgressCard>
        ))}
      </CardsRow>
    </Stack>
  );
}

export default StudentDashboard;
