const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'medium' },
  calories: Number,
  tags: [String],
  customizations: [{
    name: String,
    options: [{ name: String, price: Number }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
