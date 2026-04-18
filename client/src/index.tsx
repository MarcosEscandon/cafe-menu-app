import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D5016', // Verde bosque profundo
      light: '#4A7C59', // Verde bosque claro
      dark: '#1A3009', // Verde bosque oscuro
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B4513', // Marrón madera
      light: '#A0522D', // Marrón sienna
      dark: '#654321', // Marrón oscuro
    },
    background: {
      default: '#F8F8FF', // Blanco nieve
      paper: '#FAFAFA', // Blanco papel
    },
    text: {
      primary: '#2D5016', // Verde bosque para texto principal
      secondary: '#708090', // Gris montaña para texto secundario
    },
    info: {
      main: '#4682B4', // Azul mar
    },
    success: {
      main: '#4A7C59', // Verde bosque
    },
    warning: {
      main: '#D2691E', // Naranja atardecer
    },
    error: {
      main: '#8B4513', // Marrón madera
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#2D5016',
    },
    h2: {
      fontWeight: 600,
      color: '#2D5016',
    },
    h3: {
      fontWeight: 600,
      color: '#4A7C59',
    },
    h4: {
      fontWeight: 500,
      color: '#2D5016',
    },
    h5: {
      fontWeight: 500,
      color: '#2D5016',
    },
    h6: {
      fontWeight: 500,
      color: '#4A7C59',
    },
    body1: {
      color: '#2D5016',
    },
    body2: {
      color: '#708090',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          background: 'linear-gradient(45deg, #2D5016 0%, #4A7C59 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4A7C59 0%, #2D5016 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(45, 80, 22, 0.1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(45, 80, 22, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #2D5016 0%, #4A7C59 50%, #8B4513 100%)',
          boxShadow: '0 2px 8px rgba(45, 80, 22, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
