import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Payments,
  Close,
  CreditCard,
  Money,
  LocalAtm
} from '@mui/icons-material';
import axios from 'axios';
import { useSocket } from '../SocketContext';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    menuItem: {
      name: string;
      price: number;
    };
    quantity: number;
    customizations: Array<{
      name: string;
      value: string | number | boolean;
      priceModifier: number;
    }>;
    subtotal: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  orderType: string;
  tableNumber?: string;
  notes?: string;
  createdAt: string;
}

const CashierView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-cashier');

    const handleNewOrder = (newOrder: Order) => {
      setOrders(prev => {
        const exists = prev.some(o => o._id === newOrder._id);
        if (exists) return prev.map(o => o._id === newOrder._id ? newOrder : o);
        return [newOrder, ...prev];
      });
    };

    const handleStatusUpdate = (updatedOrder: Order) => {
      setOrders(prev => {
        const exists = prev.some(o => o._id === updatedOrder._id);
        if (exists) return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        return [updatedOrder, ...prev];
      });
    };

    const handleCancelled = (cancelledOrder: Order) => {
      setOrders(prev => prev.map(order =>
        order._id === cancelledOrder._id ? { ...order, status: cancelledOrder.status } : order
      ));
    };

    const handleUpdated = (updatedOrder: Order) => {
      setOrders(prev => prev.map(order =>
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    };

    const handleDeleted = (deletedOrder: Order) => {
      setOrders(prev => prev.filter(order => order._id !== deletedOrder._id));
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-status-update', handleStatusUpdate);
    socket.on('order-cancelled', handleCancelled);
    socket.on('order-updated', handleUpdated);
    socket.on('order-deleted', handleDeleted);

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-status-update', handleStatusUpdate);
      socket.off('order-cancelled', handleCancelled);
      socket.off('order-updated', handleUpdated);
      socket.off('order-deleted', handleDeleted);
    };
  }, [socket]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    const response = await axios.patch(`${process.env.REACT_APP_API_URL || ''}/api/orders/${orderId}/status`, { 
      status: 'entregado',
      paymentStatus: status 
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    });
    
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, ...response.data } : order
    ));
  };

  const openPaymentDialog = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMethod('');
    setAmountReceived('');
    setPaymentDialog(true);
  };

  const processPayment = async () => {
    if (!selectedOrder || !paymentMethod) return;

    const amount = parseFloat(amountReceived);
    if (paymentMethod === 'cash' && (isNaN(amount) || amount < selectedOrder.totalAmount)) {
      alert('El monto recibido es insuficiente');
      return;
    }

    await updatePaymentStatus(selectedOrder._id, 'pagado');
    setPaymentDialog(false);
    setSelectedOrder(null);
    alert('Pago procesado exitosamente');
  };

  const getChange = () => {
    if (!selectedOrder || !amountReceived) return 0;
    const amount = parseFloat(amountReceived);
    if (isNaN(amount)) return 0;
    return amount - selectedOrder.totalAmount;
  };

  const pendingPayments = useMemo(() => 
    orders.filter(order => 
      order.paymentStatus === 'pendiente' && !['entregado', 'cancelado'].includes(order.status)
    ),
    [orders]
  );

  const completedPayments = useMemo(() => 
    orders.filter(order => order.paymentStatus === 'pagado'),
    [orders]
  );

  const totalRevenue = useMemo(() => 
    completedPayments.reduce((total, order) => total + order.totalAmount, 0),
    [completedPayments]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        <Payments sx={{ mr: 2, verticalAlign: 'middle' }} />
        Caja del Bosque
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {pendingPayments.length}
            </Typography>
            <Typography variant="body2">Pagos Pendientes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              ${totalRevenue.toFixed(2)}
            </Typography>
            <Typography variant="body2">Ingresos del Día</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="info.main">
              {completedPayments.length}
            </Typography>
            <Typography variant="body2">Pagos Procesados</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              ${pendingPayments.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
            </Typography>
            <Typography variant="body2">Por Cobrar</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Pedidos Listos para Pago */}
      <Typography variant="h5" gutterBottom>
        Pedidos Listos para Pago ({pendingPayments.length})
      </Typography>
      
      {pendingPayments.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay pedidos listos para pagar
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {pendingPayments.map(order => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card sx={{ 
                border: '2px solid',
                borderColor: 'success.main',
                bgcolor: 'success.light'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      #{order.orderNumber}
                    </Typography>
                    <Chip 
                      label={order.status}
                      color={order.status === 'listo' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    Cliente: {order.customerName}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Mesa: {order.tableNumber || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Tipo: {order.orderType === 'dine-in' ? 'Mesa' : 
                           order.orderType === 'takeaway' ? 'Para llevar' : 'Delivery'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Items:
                  </Typography>
                  <List dense>
                    {order.items.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText
                          primary={`${item.quantity}x ${item.menuItem.name}`}
                          secondary={item.customizations.length > 0 ? 
                            item.customizations.map(c => `${c.name}: ${c.value}`).join(', ') : 
                            ''
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    Total: ${order.totalAmount.toFixed(2)}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<Payments />}
                    onClick={() => openPaymentDialog(order)}
                    disabled={order.status !== 'listo'}
                  >
                    {order.status === 'listo' ? 'Procesar Pago' : `Estado: ${order.status}`}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Historial de Pagos */}
      <Typography variant="h5" gutterBottom>
        Historial de Pagos ({completedPayments.length})
      </Typography>
      
      <Grid container spacing={2}>
        {completedPayments.slice(0, 6).map(order => (
          <Grid item xs={12} sm={6} md={4} key={order._id}>
            <Card sx={{ opacity: 0.8 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">
                    #{order.orderNumber}
                  </Typography>
                  <Chip 
                    label="Pagado"
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="body2">
                  {order.customerName} - ${order.totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="caption" display="block">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog de Procesamiento de Pago */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Procesar Pago - #{selectedOrder?.orderNumber}
          <IconButton onClick={() => setPaymentDialog(false)} sx={{ float: 'right' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Total a Pagar: ${selectedOrder?.totalAmount.toFixed(2)}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Método de Pago:
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Button
                variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
                fullWidth
                startIcon={<Money />}
                onClick={() => setPaymentMethod('cash')}
              >
                Efectivo
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                fullWidth
                startIcon={<CreditCard />}
                onClick={() => setPaymentMethod('card')}
              >
                Tarjeta
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant={paymentMethod === 'transfer' ? 'contained' : 'outlined'}
                fullWidth
                startIcon={<LocalAtm />}
                onClick={() => setPaymentMethod('transfer')}
              >
                Transferencia
              </Button>
            </Grid>
          </Grid>
          
          {paymentMethod === 'cash' && (
            <TextField
              fullWidth
              label="Monto Recibido"
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
          
          {paymentMethod === 'cash' && amountReceived && parseFloat(amountReceived) >= (selectedOrder?.totalAmount || 0) && (
            <Alert severity="success">
              Cambio: ${getChange().toFixed(2)}
            </Alert>
          )}
          
          {paymentMethod === 'card' && (
            <Alert severity="info">
              Procesar pago con tarjeta en la terminal
            </Alert>
          )}
          
          {paymentMethod === 'transfer' && (
            <Alert severity="info">
              Esperar confirmación de transferencia bancaria
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancelar</Button>
          <Button 
            onClick={processPayment} 
            variant="contained"
            color="success"
            disabled={!paymentMethod || (paymentMethod === 'cash' && !amountReceived)}
          >
            Confirmar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashierView;
