
const GroupOrder = require('../models/GroupOrder');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc Create group order room
exports.createGroupOrder = async (req, res, next) => {
  try {
    const { restaurantId, name, closingMinutes } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const closesAt = closingMinutes
      ? new Date(Date.now() + closingMinutes * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000); // default 1 hour

    const groupOrder = await GroupOrder.create({
      restaurant: restaurantId,
      creator: req.user._id,
      name: name || `${req.user.name}'s Group Order`,
      deliveryFee: restaurant.deliveryFee || 30,
      closesAt,
      members: [{
        user: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
        subtotal: 0
      }]
    });

    await groupOrder.populate('restaurant', 'name image deliveryFee');
    res.status(201).json({ success: true, groupOrder });
  } catch (error) { next(error); }
};

// @desc Join group order by code
exports.joinGroupOrder = async (req, res, next) => {
  try {
    const { code } = req.params;
    const groupOrder = await GroupOrder.findOne({ code })
      .populate('restaurant', 'name image deliveryFee')
      .populate('members.user', 'name avatar')
      .populate('items.addedBy', 'name avatar');

    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found. Check your code.' });
    if (groupOrder.status !== 'active') return res.status(400).json({ success: false, message: 'This group order is no longer active' });

    // Check if already a member
    const isMember = groupOrder.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      groupOrder.members.push({ user: req.user._id, name: req.user.name, avatar: req.user.avatar, subtotal: 0 });
      await groupOrder.save();

      // Emit to room
      const io = req.app.get('io');
      io.to(`group_${groupOrder.code}`).emit('memberJoined', {
        user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
      });
    }

    // Re-fetch with populated data
    const updated = await GroupOrder.findById(groupOrder._id)
      .populate('restaurant', 'name image deliveryFee')
      .populate('members.user', 'name avatar')
      .populate('items.menuItem', 'name price image');

    res.json({ success: true, groupOrder: updated });
  } catch (error) { next(error); }
};

// @desc Get group order details
exports.getGroupOrder = async (req, res, next) => {
  try {
    const groupOrder = await GroupOrder.findById(req.params.id)
      .populate('restaurant', 'name image deliveryFee address')
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('items.menuItem', 'name price image category')
      .populate('items.addedBy', 'name avatar');

    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });
    res.json({ success: true, groupOrder });
  } catch (error) { next(error); }
};

// @desc Add item to group order
exports.addItemToGroup = async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;
    const groupOrder = await GroupOrder.findById(req.params.id);
    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });
    if (groupOrder.status !== 'active') return res.status(400).json({ success: false, message: 'Group order is locked' });

    const isMember = groupOrder.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Join the group order first' });

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ success: false, message: 'Menu item not found' });

    // Check if user already added this item - update quantity
    const existingItemIdx = groupOrder.items.findIndex(
      i => i.menuItem.toString() === menuItemId && i.addedBy.toString() === req.user._id.toString()
    );

    if (existingItemIdx >= 0) {
      groupOrder.items[existingItemIdx].quantity += quantity;
    } else {
      groupOrder.items.push({
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity,
        addedBy: req.user._id,
        addedByName: req.user.name
      });
    }

    // Recalculate subtotal
    groupOrder.subtotal = groupOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    groupOrder.tax = Math.round(groupOrder.subtotal * groupOrder.taxRate);
    groupOrder.total = groupOrder.subtotal + groupOrder.deliveryFee + groupOrder.tax;

    // Update member subtotal
    const memberIdx = groupOrder.members.findIndex(m => m.user.toString() === req.user._id.toString());
    if (memberIdx >= 0) {
      const memberItems = groupOrder.items.filter(i => i.addedBy.toString() === req.user._id.toString());
      groupOrder.members[memberIdx].subtotal = memberItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    await groupOrder.save();

    const io = req.app.get('io');
    io.to(`group_${groupOrder.code}`).emit('itemAdded', {
      item: { menuItem: menuItemId, name: menuItem.name, price: menuItem.price, image: menuItem.image, quantity, addedByName: req.user.name, addedBy: req.user._id },
      groupOrder: { subtotal: groupOrder.subtotal, tax: groupOrder.tax, total: groupOrder.total, members: groupOrder.members }
    });

    res.json({ success: true, groupOrder });
  } catch (error) { next(error); }
};

// @desc Remove item from group order
exports.removeItemFromGroup = async (req, res, next) => {
  try {
    const { itemIndex } = req.params;
    const groupOrder = await GroupOrder.findById(req.params.id);
    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });
    if (groupOrder.status !== 'active') return res.status(400).json({ success: false, message: 'Group order is locked' });

    const item = groupOrder.items[itemIndex];
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Only creator or item owner can remove
    if (item.addedBy.toString() !== req.user._id.toString() && groupOrder.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this item' });
    }

    groupOrder.items.splice(itemIndex, 1);
    groupOrder.subtotal = groupOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    groupOrder.tax = Math.round(groupOrder.subtotal * groupOrder.taxRate);
    groupOrder.total = groupOrder.subtotal + groupOrder.deliveryFee + groupOrder.tax;

    // Update member subtotal
    const memberIdx = groupOrder.members.findIndex(m => m.user.toString() === req.user._id.toString());
    if (memberIdx >= 0) {
      const memberItems = groupOrder.items.filter(i => i.addedBy.toString() === req.user._id.toString());
      groupOrder.members[memberIdx].subtotal = memberItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    await groupOrder.save();

    const io = req.app.get('io');
    io.to(`group_${groupOrder.code}`).emit('itemRemoved', {
      itemIndex: parseInt(itemIndex),
      groupOrder: { subtotal: groupOrder.subtotal, tax: groupOrder.tax, total: groupOrder.total, members: groupOrder.members }
    });

    res.json({ success: true, groupOrder });
  } catch (error) { next(error); }
};

// @desc Set split mode
exports.setSplitMode = async (req, res, next) => {
  try {
    const { splitMode } = req.body;
    const groupOrder = await GroupOrder.findById(req.params.id);
    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });
    if (groupOrder.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can change split mode' });
    }
    groupOrder.splitMode = splitMode;
    await groupOrder.save();
    res.json({ success: true, groupOrder });
  } catch (error) { next(error); }
};

// @desc Get split bill breakdown
exports.getSplitBill = async (req, res, next) => {
  try {
    const groupOrder = await GroupOrder.findById(req.params.id)
      .populate('members.user', 'name avatar')
      .populate('items.addedBy', 'name avatar')
      .populate('items.menuItem', 'name price');

    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });

    const memberCount = groupOrder.members.length || 1;
    const sharedCost = groupOrder.deliveryFee + groupOrder.tax;

    const breakdown = groupOrder.members.map(member => {
      const memberItems = groupOrder.items.filter(
        i => i.addedBy._id.toString() === member.user._id.toString()
      );
      const itemsSubtotal = memberItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      let sharedSplit = 0;
      if (groupOrder.splitMode === 'equal') {
        sharedSplit = sharedCost / memberCount;
      } else {
        const totalSubtotal = groupOrder.subtotal || 1;
        sharedSplit = sharedCost * (itemsSubtotal / totalSubtotal);
      }

      return {
        user: member.user,
        items: memberItems,
        itemsSubtotal: Math.round(itemsSubtotal),
        deliveryShare: Math.round(groupOrder.deliveryFee / (groupOrder.splitMode === 'equal' ? memberCount : (groupOrder.subtotal / Math.max(itemsSubtotal, 1)))),
        taxShare: Math.round(sharedSplit - groupOrder.deliveryFee / (groupOrder.splitMode === 'equal' ? memberCount : (groupOrder.subtotal / Math.max(itemsSubtotal, 1)))),
        sharedSplit: Math.round(sharedSplit),
        total: Math.round(itemsSubtotal + sharedSplit)
      };
    });

    res.json({
      success: true,
      breakdown,
      summary: {
        subtotal: groupOrder.subtotal,
        deliveryFee: groupOrder.deliveryFee,
        tax: groupOrder.tax,
        total: groupOrder.total,
        splitMode: groupOrder.splitMode,
        memberCount
      }
    });
  } catch (error) { next(error); }
};

// @desc Finalize / lock group order (creator only)
exports.finalizeGroupOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;
    const groupOrder = await GroupOrder.findById(req.params.id)
      .populate('restaurant')
      .populate('items.menuItem');

    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });
    const creatorId = String(groupOrder.creator?._id || groupOrder.creator);
    if (creatorId !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the creator can finalize' });
    }
    if (groupOrder.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Group order already locked' });
    }

    // Create a master order
    const order = await Order.create({
      user: req.user._id,
      restaurant: groupOrder.restaurant._id,
      items: groupOrder.items.map(i => ({
        menuItem: i.menuItem._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      subtotal: groupOrder.subtotal,
      deliveryFee: groupOrder.deliveryFee,
      tax: groupOrder.tax,
      total: groupOrder.total,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      isGroupOrder: true,
      groupOrder: groupOrder._id,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000)
    });

    groupOrder.calculateSplit();
    groupOrder.paymentMethod = paymentMethod || 'cod';
    groupOrder.members.forEach((member) => {
      member.paymentStatus = 'pending';
      member.paidAmount = 0;
      member.razorpayOrderId = undefined;
      member.razorpayPaymentId = undefined;
    });

    groupOrder.status = 'locked';
    groupOrder.finalOrder = order._id;
    await groupOrder.save();

    const io = req.app.get('io');
    io.to(`group_${groupOrder.code}`).emit('orderFinalized', {
      orderId: order._id,
      status: 'locked',
      message: 'Order has been placed!'
    });

    res.json({ success: true, order, groupOrder });
  } catch (error) { next(error); }
};

// @desc Create member Razorpay order for share payment
exports.createMemberPaymentOrder = async (req, res, next) => {
  try {
    const groupOrder = await GroupOrder.findById(req.params.id);
    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });
    if (groupOrder.status !== 'locked') return res.status(400).json({ success: false, message: 'Group order is not ready for member payments' });
    if (groupOrder.paymentMethod === 'cod') {
      return res.status(400).json({ success: false, message: 'Share payment is available only for online group orders' });
    }

    const member = groupOrder.members.find(m => String(m.user) === String(req.user._id));
    if (!member) return res.status(403).json({ success: false, message: 'Only group members can pay' });
    if ((member.paymentStatus || 'pending') === 'paid') {
      return res.status(400).json({ success: false, message: 'Your share is already paid' });
    }

    const amount = Math.round((member.splitAmount || 0) * 100);
    if (amount <= 0) return res.status(400).json({ success: false, message: 'Your payable amount is zero' });

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `${groupOrder._id.toString()}_${req.user._id.toString()}`.slice(0, 40),
      notes: {
        groupOrderId: groupOrder._id.toString(),
        userId: req.user._id.toString()
      }
    });

    member.razorpayOrderId = razorpayOrder.id;
    member.paymentStatus = 'pending';
    await groupOrder.save();

    res.json({
      success: true,
      groupOrderId: groupOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: member.splitAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) { next(error); }
};

// @desc Verify member share payment and mark group completed when all paid
exports.verifyMemberPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay payment details' });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const groupOrder = await GroupOrder.findById(req.params.id)
      .populate('members.user', 'name avatar')
      .populate('creator', 'name avatar')
      .populate('restaurant', 'name image deliveryFee address');

    if (!groupOrder) return res.status(404).json({ success: false, message: 'Group order not found' });

    const member = groupOrder.members.find(m => String(m.user?._id || m.user) === String(req.user._id));
    if (!member) return res.status(403).json({ success: false, message: 'Only group members can pay' });
    if (member.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, message: 'Payment order mismatch' });
    }

    member.paymentStatus = 'paid';
    member.paidAmount = member.splitAmount || 0;
    member.razorpayPaymentId = razorpayPaymentId;

    const everyonePaid = groupOrder.members.every(m => (m.paymentStatus || 'pending') === 'paid');
    if (everyonePaid) {
      groupOrder.status = 'completed';
      if (groupOrder.finalOrder) {
        await Order.findByIdAndUpdate(groupOrder.finalOrder, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      }
    }

    await groupOrder.save();

    res.json({ success: true, message: 'Share payment verified', groupOrder });
  } catch (error) { next(error); }
};

// @desc Get user's joined group orders only
exports.getMyGroupOrders = async (req, res, next) => {
  try {
    const groupOrders = await GroupOrder.find({ 'members.user': req.user._id })
      .populate('restaurant', 'name image')
      .populate('creator', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, groupOrders });
  } catch (error) { next(error); }
};
