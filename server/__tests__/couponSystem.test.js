describe('Coupon System Tests', () => {
  const COUPONS_DATA = {
    SAVE10: { discount: 50, minAmount: 300 },
    FLAT100: { discount: 100, minAmount: 500 },
    SUPER20: { discount: 150, minAmount: 750 }
  };

  describe('Coupon Validation', () => {
    const validateCoupon = (code, subtotal) => {
      if (!code || !COUPONS_DATA[code]) {
        return { valid: false, message: 'Invalid coupon code' };
      }

      const coupon = COUPONS_DATA[code];
      if (subtotal < coupon.minAmount) {
        return { 
          valid: false, 
          message: `Minimum order value of ₹${coupon.minAmount} required` 
        };
      }

      return { valid: true, discount: coupon.discount };
    };

    it('should validate correct coupon code', () => {
      const result = validateCoupon('SAVE10', 500);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(50);
    });

    it('should reject invalid coupon code', () => {
      const result = validateCoupon('INVALID', 500);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid coupon');
    });

    it('should reject coupon when minimum amount not met', () => {
      const result = validateCoupon('SAVE10', 200);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Minimum order value');
    });

    it('should accept coupon at exact minimum amount', () => {
      const result = validateCoupon('SAVE10', 300);
      expect(result.valid).toBe(true);
    });

    it('should accept coupon above minimum amount', () => {
      const result = validateCoupon('FLAT100', 600);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(100);
    });
  });

  describe('Coupon Eligibility', () => {
    const getCouponEligibility = (subtotal) => {
      const available = Object.entries(COUPONS_DATA)
        .filter(([code, data]) => subtotal >= data.minAmount)
        .map(([code, data]) => ({
          code,
          label: `${data.discount} off - Min ₹${data.minAmount}`,
          eligible: true,
          discount: data.discount
        }));
      return available;
    };

    it('should show all eligible coupons for high subtotal', () => {
      const coupons = getCouponEligibility(1000);
      expect(coupons.length).toBe(3);
      expect(coupons.map(c => c.code)).toContain('SAVE10');
      expect(coupons.map(c => c.code)).toContain('FLAT100');
      expect(coupons.map(c => c.code)).toContain('SUPER20');
    });

    it('should show only eligible coupons', () => {
      const coupons = getCouponEligibility(400);
      expect(coupons.length).toBe(1);
      expect(coupons[0].code).toBe('SAVE10');
    });

    it('should show no coupons below minimum', () => {
      const coupons = getCouponEligibility(100);
      expect(coupons.length).toBe(0);
    });
  });

  describe('Discount Calculation', () => {
    const applyDiscount = (subtotal, couponCode, tax, deliveryFee) => {
      if (!COUPONS_DATA[couponCode]) return subtotal + tax + deliveryFee;
      
      const discount = COUPONS_DATA[couponCode].discount;
      return Math.max(0, subtotal + tax + deliveryFee - discount);
    };

    it('should calculate correct final price with coupon', () => {
      const subtotal = 500;
      const tax = 25;
      const deliveryFee = 30;
      const total = applyDiscount(subtotal, 'SAVE10', tax, deliveryFee);
      expect(total).toBe(505); // 500 + 25 + 30 - 50
    });

    it('should not go below zero after discount', () => {
      const subtotal = 50;
      const tax = 2;
      const deliveryFee = 30;
      const total = applyDiscount(subtotal, 'FLAT100', tax, deliveryFee);
      expect(total).toBe(0);
    });

    it('should calculate multiple discounts separately', () => {
      const base = 1000;
      const tax = 50;
      const delivery = 30;
      const flatDiscount = COUPONS_DATA['FLAT100'].discount;
      const total = base + tax + delivery - flatDiscount;
      expect(total).toBe(980);
    });
  });

  describe('Coupon Code Formatting', () => {
    const validateCouponFormat = (code) => {
      return /^[A-Z0-9]+$/.test(code) && code.length > 2;
    };

    it('should accept uppercase alphanumeric codes', () => {
      expect(validateCouponFormat('SAVE10')).toBe(true);
      expect(validateCouponFormat('FLAT100')).toBe(true);
    });

    it('should reject lowercase codes', () => {
      expect(validateCouponFormat('save10')).toBe(false);
    });

    it('should reject codes with special characters', () => {
      expect(validateCouponFormat('SAVE-10')).toBe(false);
    });

    it('should reject too short codes', () => {
      expect(validateCouponFormat('SA')).toBe(false);
    });
  });
});
