const { query } = require('../config/postgresql');

exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, sortBy, minRating } = req.query;
    let sql = 'SELECT id, name, cuisine, rating, address, price_range AS priceRange, cover_image FROM dineout_restaurants WHERE 1=1';
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR address ILIKE $${params.length})`;
    }
    if (cuisine) {
      params.push(cuisine);
      sql += ` AND cuisine = $${params.length}`;
    }
    if (minRating) {
      params.push(parseFloat(minRating));
      sql += ` AND rating >= $${params.length}`;
    }
    if (sortBy === 'rating') sql += ' ORDER BY rating DESC';
    else sql += ' ORDER BY id ASC';

    const result = await query(sql, params);
    const restaurants = result.rows.map(r => ({
      name: r.name,
      cuisine: r.cuisine,
      rating: parseFloat(r.rating) || 4.0,
      address: r.address,
      priceRange: r.pricerange || r.priceRange || '',
      coverImage: r.cover_image || r.coverImage || ''
    }));

    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    console.error('Error fetching dineout restaurants from Postgres:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching restaurants' });
  }
};
