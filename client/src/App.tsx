import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import CustomerMenu from './components/CustomerMenu';
import KitchenView from './components/KitchenView';
import CashierView from './components/CashierView';
import Login from './components/Login';
import Navigation from './components/Navigation';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      <Routes>
        <Route path="/" element={<CustomerMenu />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/kitchen" element={<KitchenView />} />
        <Route path="/cashier" element={<CashierView />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Box>
  );
}

export default App;
