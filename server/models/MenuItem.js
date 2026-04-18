const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['café', 'té', 'postres', 'sandwiches', 'bebidas', 'otros']
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  customizationOptions: [{
    name: String,
    type: {
      type: String,
      enum: ['boolean', 'select', 'number'],
      required: true
    },
    options: [String], // Para tipo 'select'
    priceModifier: Number, // Modificador de precio
    required: {
      type: Boolean,
      default: false
    }
  }],
  preparationTime: {
    type: Number, // minutos
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
