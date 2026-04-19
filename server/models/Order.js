const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  customizations: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    priceModifier: Number
  }],
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'reembolsado'],
    default: 'pendiente'
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    required: true
  },
  tableNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  estimatedTime: {
    type: Number, // minutos
    required: true
  },
  actualTime: {
    type: Number // minutos reales
  }
}, {
  timestamps: true
});

// Generar número de orden automáticamente
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
