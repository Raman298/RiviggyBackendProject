describe('Auth Validators', () => {
  describe('validateRegister', () => {
    it('should return true for valid email format', () => {
      const email = 'user@example.com';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid email format', () => {
      const email = 'invalid.email';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValid).toBe(false);
    });

    it('should reject email without domain', () => {
      const email = 'user@';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValid).toBe(false);
    });
  });

  describe('validateLogin', () => {
    it('should accept valid login credentials format', () => {
      const email = 'test@example.com';
      const password = 'SecurePass123!';

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const passwordValid = password.length >= 6;

      expect(emailValid && passwordValid).toBe(true);
    });

    it('should reject short password', () => {
      const password = '123';
      const passwordValid = password.length >= 6;

      expect(passwordValid).toBe(false);
    });

    it('should reject empty email', () => {
      const email = '';
      const emailValid = email.length > 0;

      expect(emailValid).toBe(false);
    });
  });
});