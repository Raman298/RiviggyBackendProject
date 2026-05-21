// PostgreSQL Database Connection Configuration
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'riviggy_dineout',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database tables on startup
const initializeDatabase = async () => {
  try {
    console.log('🗄️  Initializing PostgreSQL database...');
    
    // Create table bookings table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS table_bookings (
        id SERIAL PRIMARY KEY,
        booking_id VARCHAR(255) UNIQUE NOT NULL,
        restaurant_name VARCHAR(255) NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        guest_count VARCHAR(10) NOT NULL,
        cuisine_type VARCHAR(100) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on booking_date for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_booking_date ON table_bookings(booking_date);
    `);

    // Create index on user_email for user queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_email ON table_bookings(user_email);
    `);

    // Create dineout restaurants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dineout_restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cuisine VARCHAR(100),
        rating NUMERIC(2,1) DEFAULT 4.0,
        address TEXT,
        price_range VARCHAR(50),
        cover_image VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed sample restaurants if table empty
    const resCount = await pool.query('SELECT COUNT(*) FROM dineout_restaurants');
    const count = parseInt(resCount.rows[0].count, 10);
    if (count === 0) {
      await pool.query(`
        INSERT INTO dineout_restaurants (name, cuisine, rating, address, price_range, cover_image) VALUES
        ('Starbucks Coffee', 'Fast Food', 4.8, 'Vatika City Central, Ambala', '₹900 for two', '/assets/restaurant1.jpg'),
        ('Theobroma', 'Desserts', 4.9, 'Vatika City Center, Ambala', '₹400 for two', '/assets/restaurant2.jpg'),
        ('Barista Coffee', 'Beverages', 5.0, 'Vatika City Central, Ambala', '₹600 for two', '/assets/restaurant3.jpg');
      `);
      console.log('Inserted sample dineout restaurants into Postgres');
    }

    // Keep existing rows aligned with local JPG assets.
    await pool.query(`
      UPDATE dineout_restaurants
      SET cover_image = CASE
        WHEN name ILIKE '%Starbucks%' THEN '/assets/restaurant1.jpg'
        WHEN name ILIKE '%Theobroma%' THEN '/assets/restaurant2.jpg'
        WHEN name ILIKE '%Barista%' THEN '/assets/restaurant3.jpg'
        ELSE cover_image
      END
      WHERE cover_image IS NULL OR cover_image LIKE '/assets/restaurant%.svg' OR cover_image = '';
    `);

    console.log('✅ Database tables initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  }
};

// Query helper function
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return pool.connect();
};

module.exports = {
  pool,
  query,
  getClient,
  initializeDatabase,
};
