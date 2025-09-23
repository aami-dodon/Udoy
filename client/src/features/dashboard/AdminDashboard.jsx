import { Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3)
}));

const LogStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2)
}));

const metrics = [
  { title: 'Active Users', value: '2,431', description: 'Users logged in over the last 30 days.' },
  { title: 'Enrollments', value: '5,742', description: 'Course enrollments created this month.' },
  { title: 'Certificates Issued', value: '1,218', description: 'Celebratory certificates generated.' }
];

const logs = [
  { actor: 'Admin Zoe', action: 'Updated course visibility', date: '2 hours ago' },
  { actor: 'Teacher Miles', action: 'Issued certificate to A. Cruz', date: '5 hours ago' },
  { actor: 'System', action: 'Auto-disabled dormant accounts', date: 'Yesterday' }
];

/**
 * Admin dashboard highlighting platform-wide metrics.
 * @returns {JSX.Element} Admin dashboard view.
 */
function AdminDashboard() {
  return (
    <Stack spacing={4}>
      <Typography variant="h4">Platform overview</Typography>
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={4} key={metric.title}>
            <MetricCard>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6">{metric.title}</Typography>
                  <Typography variant="h3">{metric.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </Stack>
              </CardContent>
            </MetricCard>
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Latest audit log
          </Typography>
          <LogStack>
            {logs.map((log, index) => (
              <Stack key={log.action} spacing={0.5}>
                <Typography variant="subtitle1">{log.actor}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {log.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {log.date}
                </Typography>
                {index < logs.length - 1 && <Divider />}
              </Stack>
            ))}
          </LogStack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AdminDashboard;
