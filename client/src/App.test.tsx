import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import App from './App';

test('renders Cafe Bosque navigation', () => {
  render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
  const navElement = screen.getByText(/Café Bosque/i);
  expect(navElement).toBeInTheDocument();
});
