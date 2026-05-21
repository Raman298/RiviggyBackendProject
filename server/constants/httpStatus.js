// Backend Constants - HTTP Status Codes and Error Messages

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Error Messages
  ERRORS: {
    AUTH: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      USER_NOT_FOUND: 'User not found',
      UNAUTHORIZED: 'Unauthorized access',
      TOKEN_EXPIRED: 'Token expired',
    },
    VALIDATION: {
      INVALID_INPUT: 'Invalid input data',
      EMAIL_EXISTS: 'Email already registered',
      PHONE_REQUIRED: 'Phone number is required',
    },
    RESTAURANT: {
      NOT_FOUND: 'Restaurant not found',
      CLOSED: 'Restaurant is closed',
    },
    ORDER: {
      NOT_FOUND: 'Order not found',
      INVALID_STATUS: 'Invalid order status',
    },
  },

  // Success Messages
  SUCCESS: {
    LOGIN: 'Login successful',
    REGISTER: 'Registration successful',
    ORDER_CREATED: 'Order placed successfully',
  },
};
