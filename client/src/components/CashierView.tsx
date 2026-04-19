import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Close,
  CreditCard,
  Money,
  LocalAtm
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

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
      value: any;
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

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://cafe-bosque-api.onrender.com' 
      : 'http://localhost:5000';
    const newSocket = io(socketUrl);

    newSocket.on('order-status-update', (updatedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    });

    return () => {
      newSocket.close();
    };
  }, []);

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
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL || ''}/api/orders/${orderId}/status`, { 
        status: 'entregado',
        paymentStatus: status 
      });
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, paymentStatus: status, status: 'entregado' } : order
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const openPaymentDialog = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMethod('');
    setAmountReceived('');
    setPaymentDialog(true);
  };

  const processPayment = () => {
    if (!selectedOrder || !paymentMethod) return;

    if (paymentMethod === 'cash' && amountReceived && parseFloat(amountReceived) < selectedOrder.totalAmount) {
      alert('El monto recibido es insuficiente');
      return;
    }

    updatePaymentStatus(selectedOrder._id, 'pagado');
    setPaymentDialog(false);
    setSelectedOrder(null);
    alert('Pago procesado exitosamente');
  };

  const getChange = () => {
    if (!selectedOrder || !amountReceived) return 0;
    return parseFloat(amountReceived) - selectedOrder.totalAmount;
  };

  const pendingPayments = orders.filter(order => 
    order.status === 'listo' && order.paymentStatus === 'pendiente'
  );

  const completedPayments = orders.filter(order => 
    order.paymentStatus === 'pagado'
  );

  const totalRevenue = completedPayments.reduce((total, order) => total + order.totalAmount, 0);

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
                      label="Listo para Pagar"
                      color="success"
                      icon={<CheckCircle />}
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
                  >
                    Procesar Pago
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
