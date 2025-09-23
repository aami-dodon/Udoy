import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/apiClient.js';
import { useAuth } from '../../providers/AuthProvider.jsx';

const classLevels = [4, 5, 6, 7, 8];

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(user?.classLevel || 4);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: topicRes }, { data: courseRes }] = await Promise.all([
          apiClient.get('/academics/topics'),
          apiClient.get('/academics/courses'),
        ]);
        setTopics(topicRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = courses.filter((course) => course.classLevel === Number(selectedClass));

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4">Welcome back, {user?.firstName}</Typography>
          <Typography color="text.secondary">Role: {user?.role}</Typography>
        </Box>
        <Button variant="outlined" onClick={logout}>
          Logout
        </Button>
      </Box>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Class Level"
            value={selectedClass}
            onChange={(event) => setSelectedClass(event.target.value)}
          >
            {classLevels.map((level) => (
              <MenuItem key={level} value={level}>
                Class {level}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography color="text.secondary">
            Explore curated subjects across topics, chapters, and courses tailored for Indian Classes 4-8.
          </Typography>
        </Grid>
      </Grid>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{course.title}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {course.subject.title} • {course.subject.chapter.topic.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filteredCourses.length === 0 ? (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography>No courses available for the selected class level yet.</Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : null}
        </Grid>
      )}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Learning Topics Overview
        </Typography>
        <Grid container spacing={2}>
          {topics.map((topic) => (
            <Grid item xs={12} md={6} key={topic.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{topic.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {topic.description}
                  </Typography>
                  <Typography variant="subtitle2">Chapters</Typography>
                  <ul>
                    {topic.chapters.map((chapter) => (
                      <li key={chapter.id}>
                        <Typography variant="body2">{chapter.title}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
