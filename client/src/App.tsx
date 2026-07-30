import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';

const CustomerMenu = lazy(() => import('./components/CustomerMenu'));
const KitchenView = lazy(() => import('./components/KitchenView'));
const CashierView = lazy(() => import('./components/CashierView'));
const Login = lazy(() => import('./components/Login'));
const MenuManager = lazy(() => import('./components/MenuManager'));

function App() {
  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        }>
          <Routes>
            <Route path="/" element={<CustomerMenu />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/kitchen" element={<KitchenView />} />
            <Route path="/cashier" element={<CashierView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/menu-manager" element={<MenuManager />} />
          </Routes>
        </Suspense>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
