import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signIn, signInWithRedirect } from 'aws-amplify/auth';


import awsconfig from './aws-exports';

// Configure AWS Amplify
Amplify.configure(awsconfig);

const API_URL = 'https://x8lo0d5xq4.execute-api.us-east-2.amazonaws.com/dev';

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
      <label>
        Question:
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required />
      </label>
      <br />
      <label>
        Options (comma-separated):
        <input type="text" value={options} onChange={(e) => setOptions(e.target.value)} required />
      </label>
      <br />
      <button type="submit">Create Poll</button>
    </form>
  );
};

function App() {
  const [user, setUser] = useState(null); // Track authenticated user
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchPolls();
    checkUser(); // Check if user is already authenticated
  }, []);

  // const checkUser = async () => {
  //   try {
  //     const user = await Auth.currentAuthenticatedUser();
  //     setUser(user);
  //   } catch (error) {
  //     setUser(null);
  //   }
  // };
  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    }
  };

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
      setSelectedOption(selectedOption);
      const requestBody = {
        pollId: pollId,
        selectedOption: selectedOption
      };

      await axios.post(`${API_URL}/vote`, requestBody);
      fetchPollResults(pollId);
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
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const renderPolls = () => {
    return (
      <ul>
        {polls.map((poll) => (
          <li key={poll.pollId}>
            <button onClick={() => handleSelectPoll(poll.pollId)}>{poll.question}</button>
          </li>
        ))}
      </ul>
    );
  };

  const renderPollDetails = () => {
    if (!selectedPoll) return null;
    return (
      <div>
        <h2>{selectedPoll.question}</h2>
        <ul>
          {selectedPoll.options.map((option) => (
            <li key={option}>
              <button
                onClick={() => handleVote(selectedPoll.pollId, option)}
                disabled={!user || selectedOption || selectedPoll.votes[option].includes(user.username)}
              >
                {option}
              </button>
              {option === selectedOption && ` - Voted`}
            </li>
          ))}
        </ul>
        <h3>Results:</h3>
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


    const handleSignIn = () => {
      signIn();
    };

  return (
    <div>
      <h1>Polling Application</h1>
    <button onClick={handleSignIn}>
      Sign In
    </button>      
    <h2>Polls:</h2>
      {renderPolls()}
      <hr />
      <h2>Create Poll:</h2>
      {user && <CreatePollForm onCreatePoll={handleCreatePoll} />} {/* Show only if user is authenticated */}
      {!user && <p>Please sign in to create a poll.</p>} {/* Show sign-in prompt if user is not authenticated */}
      <hr />
      <h2>Poll Details:</h2>
      {renderPollDetails()}
    </div>
  );
}

export default App;
