/**
 * useCoupon.js
 * Custom hook — manages coupon selection, validation, and discount calculation.
 * Drop this into any checkout or cart component.
 *
 * Usage:
 *   const coupon = useCoupon(subtotal, isNewUser);
 *   // Spread into <CouponSection {...coupon} subtotal={subtotal} isNewUser={isNewUser} />
 */

import { useState, useCallback } from 'react';
import { findCoupon, calculateDiscount } from './couponData';  // ES-module version

/**
 * useCoupon
 *
 * @param {number}  subtotal  — cart subtotal (excluding delivery fee)
 * @param {boolean} isNewUser — pass true if this user has never placed an order
 *
 * @returns {{
 *   appliedCoupon: object|null,
 *   discount: number,
 *   inputCode: string,
 *   setInputCode: Function,
 *   message: {type: 'success'|'error', text: string}|null,
 *   applyCoupon: Function,
 *   removeCoupon: Function,
 *   selectCoupon: Function,
 * }}
 */
export function useCoupon(subtotal, isNewUser) {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [inputCode,     setInputCode]     = useState('');
  const [message,       setMessage]       = useState(null);

  // Recompute discount whenever subtotal or applied coupon changes
  const discount = appliedCoupon
    ? calculateDiscount(appliedCoupon, subtotal, isNewUser)
    : 0;

  // ── Internal: attempt to apply a specific coupon object ──
  const _apply = useCallback(
    (coupon) => {
      if (!coupon) {
        setMessage({ type: 'error', text: 'Invalid or expired coupon code.' });
        return false;
      }

      if (coupon.forNewUser && !isNewUser) {
        setMessage({
          type: 'error',
          text: `"${coupon.code}" is only valid for first-time orders.`,
        });
        return false;
      }

      if (subtotal < coupon.minOrder) {
        setMessage({
          type: 'error',
          text: `Minimum order of ₹${coupon.minOrder} required for "${coupon.code}".`,
        });
        return false;
      }

      const disc = calculateDiscount(coupon, subtotal, isNewUser);
      setAppliedCoupon(coupon);
      setInputCode(coupon.code);
      setMessage({
        type: 'success',
        text: `🎉 "${coupon.code}" applied! You save ₹${disc}.`,
      });
      return true;
    },
    [subtotal, isNewUser]
  );

  // ── Apply by typing a code in the input ──
  const applyCoupon = useCallback(
    (codeOverride) => {
      const raw    = codeOverride || inputCode;
      const coupon = findCoupon(raw);
      _apply(coupon);
    },
    [inputCode, _apply]
  );

  // ── Apply by clicking a coupon card ──
  const selectCoupon = useCallback(
    (coupon) => {
      // Clicking the already-selected coupon deselects it
      if (appliedCoupon && appliedCoupon.code === coupon.code) {
        removeCoupon();
        return;
      }
      _apply(coupon);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appliedCoupon, _apply]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setInputCode('');
    setMessage(null);
  }, []);

  return {
    appliedCoupon,
    discount,
    inputCode,
    setInputCode,
    message,
    applyCoupon,
    removeCoupon,
    selectCoupon,
  };
}

export default useCoupon;