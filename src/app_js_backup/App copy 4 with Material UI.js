import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Container, Grid } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const API_URL = 'https://x8lo0d5xq4.execute-api.us-east-2.amazonaws.com/dev';

const theme = createTheme();

const CreatePollForm = ({ onCreatePoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');

  const handleCreatePollSubmit = (e) => {
    e.preventDefault();
    const optionsArray = options.split(',').map((option) => option.trim());
    onCreatePoll(question, optionsArray);
  };

  return (
    <form onSubmit={handleCreatePollSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Options (comma-separated)"
            variant="outlined"
            fullWidth
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Create Poll
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

function App() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedPoll) {
        fetchPollResults(selectedPoll.pollId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [selectedPoll]);

  const fetchPolls = async () => {
    try {
      const response = await axios.post(`${API_URL}/getPolls`, {});
      setPolls(response.data.polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const fetchPollResults = async (pollId) => {
    try {
      const response = await axios.post(`${API_URL}/getPollResults`, { pollId });
      setSelectedPoll(response.data);
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const handleVote = async (pollId, selectedOption) => {
    try {
      // Check if user has already voted on this poll
      const hasVoted = localStorage.getItem(`poll_${pollId}`);
      if (hasVoted) {
        alert('You have already voted on this poll.');
        return;
      }

      setSelectedOption(selectedOption);
      const requestBody = {
        pollId: pollId,
        selectedOption: selectedOption
      };

      await axios.post(`${API_URL}/vote`, requestBody);
      fetchPollResults(pollId);

      // Store in local storage that user has voted on this poll
      localStorage.setItem(`poll_${pollId}`, true);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreatePoll = async (question, options) => {
    try {
      await axios.post(`${API_URL}/createPoll`, { question, options });
      fetchPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleSelectPoll = async (pollId) => {
    try {
      const response = await axios.post(`${API_URL}/getPollResults`, { pollId });
      setSelectedPoll(response.data);
      setSelectedOption(null);
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const renderPolls = () => {
    return (
      <Grid container spacing={2}>
        {polls.map((poll) => (
          <Grid item xs={12} key={poll.pollId}>
            <Button variant="contained" color="primary" onClick={() => handleSelectPoll(poll.pollId)}>
              {poll.question}
            </Button>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderPollDetails = () => {
    if (!selectedPoll) return null;
    return (
      <div>
        <Typography variant="h5">{selectedPoll.question}</Typography>
        <ul>
          {selectedPoll.options.map((option) => (
            <li key={option}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleVote(selectedPoll.pollId, option)}
                disabled={selectedOption}
              >
                {option}
              </Button>
              {option === selectedOption && ` - Voted`}
            </li>
          ))}
        </ul>
        <Typography variant="h6">Results:</Typography>
        <ul>
          {Object.entries(selectedPoll.votes).map(([option, count]) => (
            <li key={option}>
              {option}: {count}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h2" component="h1" gutterBottom>
          Polling Application
        </Typography>
        <Typography variant="h3" component="h2" gutterBottom>
          Polls:
        </Typography>
        {renderPolls()}
        <hr />
        <Typography variant="h3" component="h2" gutterBottom>
          Create Poll:
        </Typography>
        <CreatePollForm onCreatePoll={handleCreatePoll} />
        <hr />
        <Typography variant="h3" component="h2" gutterBottom>
          Poll Details:
        </Typography>
        {renderPollDetails()}
      </Container>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);
