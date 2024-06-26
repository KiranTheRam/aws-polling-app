import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, IconButton } from '@mui/material';
import { lightTheme, darkTheme } from './themes';
import HomePage from './components/HomePage';
import CreatePollPage from './components/CreatePollPage';
import PollDetailsPage from './components/PollDetailsPage';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Amplify } from 'aws-amplify';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';


Amplify.configure(awsconfig);

function App({ signOut }) {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Container>
          <IconButton onClick={toggleTheme} sx={{ position: 'fixed', top: 10, right: 10 }}>
            {theme === lightTheme ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          <button onClick={signOut}>Sign out</button>
          <Router>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/create' element={<CreatePollPage />} />
              <Route path='/poll/:id' element={<PollDetailsPage />} />
            </Routes>
          </Router>
        </Container>
    </ThemeProvider>
  );
//   return (
//     <div>
//     <h1>Thankyou for doing verification</h1>
//     <h2>My Content</h2>
//      <button onClick={signOut}>Sign out</button>
//   </div>
// );
}

export default withAuthenticator(App);