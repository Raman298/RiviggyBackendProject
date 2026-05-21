// Table Booking Routes
const express = require('express');
const tableBookingController = require('../controllers/tableBookingController');

const router = express.Router();
const { protect } = require('../middleware/auth');

const { getRestaurants } = require('../controllers/dineoutController');

/**
 * @route   GET /api/dineout
 * @desc    Display table booking form
 * @access  Public
 */
router.get('/', tableBookingController.showBookingPage);

/**
 * @route   GET /api/dineout/bookings-page
 * @desc    Display my bookings page
 * @access  Public
 */
router.get('/bookings-page', protect, tableBookingController.showBookingsPage);

/**
 * @route   POST /api/dineout/book
 * @desc    Create a new table booking
 * @access  Public
 */
router.post('/book', tableBookingController.createBooking);

/**
 * @route   GET /api/dineout/bookings
 * @desc    Get user bookings by email
 * @access  Public
 * @query   email - User email address
 */
router.get('/bookings', tableBookingController.getUserBookings);

// Dineout restaurants (from Postgres)
router.get('/restaurants', getRestaurants);

/**
 * @route   GET /api/dineout/booking/:bookingId
 * @desc    Get booking details
 * @access  Public
 */
router.get('/booking/:bookingId', tableBookingController.getBookingDetail);

/**
 * @route   PATCH /api/dineout/booking/:bookingId
 * @desc    Update booking details
 * @access  Public
 */
router.patch('/booking/:bookingId', tableBookingController.updateBooking);

/**
 * @route   DELETE /api/dineout/booking/:bookingId
 * @desc    Cancel a booking
 * @access  Public
 */
router.delete('/booking/:bookingId', tableBookingController.cancelBooking);

/**
 * @route   GET /api/dineout/admin/all
 * @desc    Get all bookings (admin only)
 * @access  Admin
 * @query   status - Filter by status
 * @query   date - Filter by date
 */
router.get('/admin/all', tableBookingController.getAllBookings);

module.exports = router;
