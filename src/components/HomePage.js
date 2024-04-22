import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, List, ListItem, Paper, Card, CardContent } from '@mui/material';

const API_URL = 'https://x8lo0d5xq4.execute-api.us-east-2.amazonaws.com/dev';

function HomePage() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.post(`${API_URL}/getPolls`, {});
      setPolls(response.data.polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h1" align="center" gutterBottom>
        Polling Application
      </Typography>
      <Paper>
      <Typography variant="h2" align="center" gutterBottom>
        Current Polls
      </Typography>
      <List>
        {polls.map((poll) => (
          <ListItem key={poll.pollId}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  <Link to={`/poll/${poll.pollId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {poll.question}
                  </Link>
                </Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
      </Paper>
      <Button component={Link} to="/create" variant="contained" color="primary">
        Create Poll
      </Button>
    </Container>
  );
}

export default HomePage;
