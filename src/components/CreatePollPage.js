import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';

const API_URL = 'https://x8lo0d5xq4.execute-api.us-east-2.amazonaws.com/dev';

function CreatePollPage() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');

  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    const optionsArray = options.split(',').map((option) => option.trim());
    try {
      await axios.post(`${API_URL}/createPoll`, { question, options: optionsArray });
      // Optionally, you can redirect the user to the homepage or display a success message
      alert('Poll created successfully!');
      setQuestion('');
      setOptions('');
    } catch (error) {
      console.error('Error creating poll:', error);
      // Optionally, you can display an error message to the user
      alert('Error creating poll. Please try again later.');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: '16px', marginTop: '32px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Poll
        </Typography>
        <form onSubmit={handleCreatePollSubmit}>
          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            label="Options (comma-separated)"
            variant="outlined"
            fullWidth
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create Poll
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default CreatePollPage;
