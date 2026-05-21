const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Schema for individual items within a group order, tagged by user
const groupItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, required: true, min: 1 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addedByName: String,
  addedAt: { type: Date, default: Date.now }
});

// Schema for member in a group order
const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  avatar: String,
  joinedAt: { type: Date, default: Date.now },
  subtotal: { type: Number, default: 0 },
  // Amount after splitting shared costs
  splitAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paidAmount: { type: Number, default: 0 },
  razorpayOrderId: String,
  razorpayPaymentId: String
});

const groupOrderSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 8).toUpperCase()
  },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  items: [groupItemSchema],
  status: {
    type: String,
    enum: ['active', 'locked', 'completed', 'cancelled'],
    default: 'active'
  },
  splitMode: {
    type: String,
    enum: ['by_contribution', 'equal'],
    default: 'by_contribution'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'online'],
    default: 'cod'
  },
  // Shared costs
  deliveryFee: { type: Number, default: 30 },
  taxRate: { type: Number, default: 0.05 }, // 5% tax
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  // Timer for auto-close
  closesAt: Date,
  name: { type: String, default: 'Group Order' },
  finalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

// Virtual: calculate per-member breakdown
groupOrderSchema.methods.calculateSplit = function() {
  const sharedCost = this.deliveryFee + this.tax;
  const memberCount = this.members.length || 1;

  this.members.forEach(member => {
    // Items subtotal for this member
    const memberItems = this.items.filter(
      item => item.addedBy.toString() === member.user.toString()
    );
    member.subtotal = memberItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (this.splitMode === 'equal') {
      member.splitAmount = member.subtotal + (sharedCost / memberCount);
    } else {
      // Split shared costs proportionally to contribution
      const totalItemsCost = this.subtotal || 1;
      const proportion = member.subtotal / totalItemsCost;
      member.splitAmount = member.subtotal + (sharedCost * proportion);
    }
  });

  return this.members;
};

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
