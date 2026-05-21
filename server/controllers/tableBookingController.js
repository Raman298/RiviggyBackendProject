// Table Booking Controller - Business logic for table reservations
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/postgresql');
const { HTTP_STATUS, ERRORS } = require('../constants/httpStatus');

class TableBookingController {
  /**
   * Render the dineout booking page
   */
  async showBookingPage(req, res) {
    try {
      res.render('dineout', {
        success: false,
        error: null,
      });
    } catch (error) {
      console.error('Error rendering booking page:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error loading booking page',
      });
    }
  }

  /**
   * Create a new table booking
   */
  async createBooking(req, res) {
    try {
      const {
        restaurantName,
        bookingDate,
        bookingTime,
        guestCount,
        cuisineType,
        userName,
        userEmail,
        userPhone,
        specialRequests,
      } = req.body;

      // Validation
      if (!restaurantName || !bookingDate || !bookingTime || !guestCount || !userName || !userEmail || !userPhone) {
        return res.render('dineout', {
          success: false,
          error: 'All required fields must be filled',
        });
      }

      // Validate date is not in the past
      const booking = new Date(`${bookingDate}T${bookingTime}`);
      const now = new Date();
      if (booking < now) {
        return res.render('dineout', {
          success: false,
          error: 'Cannot book a table for past date/time',
        });
      }

      // Validate phone number
      const phone = userPhone.replace(/\D/g, '');
      if (phone.length !== 10) {
        return res.render('dineout', {
          success: false,
          error: 'Please enter a valid 10-digit phone number',
        });
      }

      // Generate unique booking ID
      const bookingId = `DIN-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

      // Insert into database
      const result = await query(
        `INSERT INTO table_bookings 
         (booking_id, restaurant_name, booking_date, booking_time, guest_count, cuisine_type, 
          user_name, user_email, user_phone, special_requests, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *;`,
        [
          bookingId,
          restaurantName,
          bookingDate,
          bookingTime,
          guestCount,
          cuisineType || 'Other',
          userName,
          userEmail,
          userPhone,
          specialRequests || null,
          'Confirmed',
        ]
      );

      // Render success page
      res.render('dineout', {
        success: true,
        bookingId: bookingId,
        bookingDate: new Date(bookingDate).toLocaleDateString('en-IN'),
        bookingTime: bookingTime,
        guestCount: guestCount,
      });

      // TODO: Send confirmation email
      console.log(`✅ Booking created: ${bookingId}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.render('dineout', {
        success: false,
        error: 'Error creating booking. Please try again.',
      });
    }
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email is required',
        });
      }

      const result = await query(
        `SELECT * FROM table_bookings WHERE user_email = $1 ORDER BY booking_date DESC;`,
        [email]
      );

      res.json({
        success: true,
        bookings: result.rows,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching bookings',
      });
    }
  }

  /**
   * Get booking details by ID
   */
  async getBookingDetail(req, res) {
    try {
      const { bookingId } = req.params;

      const result = await query(
        `SELECT * FROM table_bookings WHERE booking_id = $1;`,
        [bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Booking not found',
        });
      }

      res.json({
        success: true,
        booking: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching booking',
      });
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;

      const result = await query(
        `UPDATE table_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE booking_id = $2
         RETURNING *;`,
        ['Cancelled', bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Booking not found',
        });
      }

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: result.rows[0],
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error cancelling booking',
      });
    }
  }

  /**
   * Update booking details
   */
  async updateBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { bookingDate, bookingTime, guestCount, specialRequests } = req.body;

      const result = await query(
        `UPDATE table_bookings 
         SET booking_date = COALESCE($1, booking_date),
             booking_time = COALESCE($2, booking_time),
             guest_count = COALESCE($3, guest_count),
             special_requests = COALESCE($4, special_requests),
             updated_at = CURRENT_TIMESTAMP
         WHERE booking_id = $5
         RETURNING *;`,
        [bookingDate, bookingTime, guestCount, specialRequests, bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Booking not found',
        });
      }

      res.json({
        success: true,
        message: 'Booking updated successfully',
        booking: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error updating booking',
      });
    }
  }

  /**
   * Get all bookings (admin only)
   */
  async getAllBookings(req, res) {
    try {
      const { status, date } = req.query;
      let query_text = 'SELECT * FROM table_bookings WHERE 1=1';
      const params = [];

      if (status) {
        query_text += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      if (date) {
        query_text += ` AND booking_date = $${params.length + 1}`;
        params.push(date);
      }

      query_text += ' ORDER BY booking_date DESC, booking_time ASC';

      const result = await query(query_text, params);

      res.json({
        success: true,
        total: result.rows.length,
        bookings: result.rows,
      });
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching bookings',
      });
    }
  }

  /**
   * Render the my bookings page
   */
  async showBookingsPage(req, res) {
    try {
      const userEmail = req.user && req.user.email ? req.user.email : null;

      // Fetch bookings for this user from Postgres and pass to template for server-side rendering
      let bookings = [];
      if (userEmail) {
        const result = await query(
          `SELECT * FROM table_bookings WHERE user_email = $1 ORDER BY booking_date DESC, booking_time ASC;`,
          [userEmail]
        );
        bookings = result.rows || [];
      }

      res.render('my-bookings', { userEmail, bookings });
    } catch (error) {
      console.error('Error rendering bookings page:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error loading bookings page',
      });
    }
  }
}

module.exports = new TableBookingController();
