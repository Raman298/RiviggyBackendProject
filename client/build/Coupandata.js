/**
 * couponData.js
 * Centralized coupon definitions and validation logic (CommonJS).
 * Add / remove coupons here — the route, hook and UI pick them up automatically.
 */

const COUPON_TYPES = {
  FLAT: 'flat',       // fixed rupee discount
  PERCENT: 'percent', // percentage discount (optional maxDiscount cap)
};

/**
 * forNewUser: true  → only valid if isNewUser === true (first-time order)
 * minOrder         → cart subtotal must be >= this value
 * maxDiscount      → caps a percent discount (e.g. 20% but max ₹100)
 * active           → set false to disable without deleting
 */
const COUPONS = [
  {
    code: 'WELCOME50',
    type: COUPON_TYPES.PERCENT,
    value: 50,
    label: 'New user — 50% off',
    description: '50% off your very first order',
    badge: 'New User',
    forNewUser: true,
    minOrder: 0,
    maxDiscount: 200,
    active: true,
    expiryLabel: 'First order only',
  },
  {
    code: 'FLAT80',
    type: COUPON_TYPES.FLAT,
    value: 80,
    label: '₹80 off',
    description: 'Flat ₹80 off on orders above ₹399',
    badge: 'Flat Deal',
    forNewUser: false,
    minOrder: 399,
    active: true,
    expiryLabel: 'Valid till 31 May',
  },
  {
    code: 'SAVE20',
    type: COUPON_TYPES.PERCENT,
    value: 20,
    label: '20% off',
    description: '20% off, max discount ₹100',
    badge: 'Weekend Special',
    forNewUser: false,
    minOrder: 200,
    maxDiscount: 100,
    active: true,
    expiryLabel: 'Valid till 25 May',
  },
  {
    code: 'GROUPFEAST',
    type: COUPON_TYPES.FLAT,
    value: 150,
    label: 'Group order ₹150 off',
    description: '₹150 off on group orders above ₹800',
    badge: 'Group',
    forNewUser: false,
    minOrder: 800,
    active: true,
    expiryLabel: 'Always active',
  },
];

/**
 * calculateDiscount
 * Returns the discount amount in ₹, or 0 if coupon is not applicable.
 *
 * @param {object}  coupon    — one of the COUPONS objects
 * @param {number}  subtotal  — cart subtotal before delivery
 * @param {boolean} isNewUser
 * @returns {number} discount in ₹ (0 means not applicable)
 */
function calculateDiscount(coupon, subtotal, isNewUser) {
  if (!coupon || !coupon.active) return 0;
  if (coupon.forNewUser && !isNewUser) return 0;
  if (subtotal < coupon.minOrder) return 0;

  let discount =
    coupon.type === COUPON_TYPES.PERCENT
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return discount;
}

/**
 * findCoupon
 * Case-insensitive lookup by code. Returns null if not found or inactive.
 *
 * @param {string} code
 * @returns {object|null}
 */
function findCoupon(code) {
  if (!code) return null;
  return (
    COUPONS.find((c) => c.code === code.trim().toUpperCase() && c.active) || null
  );
}

module.exports = { COUPON_TYPES, COUPONS, calculateDiscount, findCoupon };