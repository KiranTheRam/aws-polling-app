import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, List, ListItem, ListItemText, Paper, Divider } from '@mui/material';

const API_URL = 'https://x8lo0d5xq4.execute-api.us-east-2.amazonaws.com/dev';

function PollDetailsPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPollDetails = async () => {
      try {
        const response = await axios.post(`${API_URL}/getPollResults`, { pollId: id });
        setPoll(response.data);
      } catch (error) {
        console.error('Error fetching poll details:', error);
      }
    };

    const pollDetailsTimer = setInterval(fetchPollDetails, 2000); // Fetch every 2 seconds

    // Clear the interval when the component unmounts or when the ID changes
    return () => clearInterval(pollDetailsTimer);
  }, [id]);

  const handleVote = async (selectedOption) => {
    try {
      // Check if user has already voted on this poll
      if (hasVoted) {
        alert('You have already voted on this poll.');
        return;
      }

      const requestBody = {
        pollId: id,
        selectedOption: selectedOption
      };
     
      await axios.post(`${API_URL}/vote`, requestBody);
      setHasVoted(true);
      setSelectedOption(selectedOption);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Typography variant="h1" align="center" gutterBottom>
        {poll.question}
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Vote
        </Typography>
        <List>
          {poll.options.map((option) => (
            <ListItem key={option}>
              <Button 
                onClick={() => handleVote(option)} 
                variant="contained" 
                color="primary" 
                disabled={hasVoted || selectedOption === option}
                fullWidth
              >
                {option} {(hasVoted && selectedOption === option) && `- Voted`}
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Divider />
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Results
        </Typography>
        <List>
          {Object.entries(poll.votes).map(([option, count]) => (
            <ListItem key={option}>
              <ListItemText primary={`${option}: ${count}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default PollDetailsPage;
