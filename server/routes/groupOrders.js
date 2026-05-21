
const express = require('express');
const router = express.Router();
const {
  createGroupOrder, joinGroupOrder, getGroupOrder,
  addItemToGroup, removeItemFromGroup, setSplitMode,
  getSplitBill, finalizeGroupOrder, getMyGroupOrders,
  createMemberPaymentOrder, verifyMemberPayment
} = require('../controllers/groupOrderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroupOrder);
router.get('/my', protect, getMyGroupOrders);
router.get('/join/:code', protect, joinGroupOrder);
router.get('/:id', protect, getGroupOrder);
router.post('/:id/items', protect, addItemToGroup);
router.delete('/:id/items/:itemIndex', protect, removeItemFromGroup);
router.put('/:id/split-mode', protect, setSplitMode);
router.get('/:id/split-bill', protect, getSplitBill);
router.post('/:id/finalize', protect, finalizeGroupOrder);
router.post('/:id/member-payment-order', protect, createMemberPaymentOrder);
router.post('/:id/verify-member-payment', protect, verifyMemberPayment);

module.exports = router;
