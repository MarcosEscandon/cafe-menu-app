import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D5016',
      light: '#4A7C59',
      dark: '#1A3009',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B4513',
      light: '#A0522D',
      dark: '#654321',
    },
    background: {
      default: '#F8F8FF',
      paper: '#FAFAFA',
    },
    text: {
      primary: '#2D5016',
      secondary: '#708090',
    },
    info: {
      main: '#4682B4',
    },
    success: {
      main: '#4A7C59',
    },
    warning: {
      main: '#D2691E',
    },
    error: {
      main: '#8B4513',
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

export default theme;
