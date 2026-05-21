const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  cuisine: [{ type: String }],
  image: { type: String, required: true },
  coverImage: String,
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  deliveryTime: { type: String, default: '30-45 min' },
  deliveryFee: { type: Number, default: 30 },
  minOrder: { type: Number, default: 100 },
  isOpen: { type: Boolean, default: true },
  address: { type: String, required: true },
  tags: [String],
  priceRange: { type: String, enum: ['$', '$$', '$$$'], default: '$$' },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
