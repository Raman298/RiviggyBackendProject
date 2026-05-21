
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc Get all restaurants
exports.getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, sortBy } = req.query;
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      const matchingMenuRestaurantIds = await MenuItem.find({
        isAvailable: true,
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { tags: { $regex: searchRegex } }
        ]
      }).distinct('restaurant');

      query.$or = [
        { name: { $regex: searchRegex } },
        { cuisine: { $regex: searchRegex } },
        { _id: { $in: matchingMenuRestaurantIds } }
      ];
    }
    if (cuisine) query.cuisine = { $in: [cuisine] };

    let sort = {};
    if (sortBy === 'rating') sort.rating = -1;
    else if (sortBy === 'deliveryTime') sort.deliveryTime = 1;
    else sort.createdAt = -1;

    const restaurants = await Restaurant.find(query).sort(sort);
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) { next(error); }
};

// @desc Get single restaurant with menu
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });
    // Group by category
    const menu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ success: true, restaurant, menu });
  } catch (error) { next(error); }
};

// @desc Create restaurant (admin)
exports.createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, restaurant });
  } catch (error) { next(error); }
};

// @desc Update restaurant (admin)
exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, restaurant });
  } catch (error) { next(error); }
};

// @desc Delete restaurant (admin)
exports.deleteRestaurant = async (req, res, next) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    await MenuItem.deleteMany({ restaurant: req.params.id });
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (error) { next(error); }
};

// @desc Add menu item (admin)
exports.addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const item = await MenuItem.create({ ...req.body, restaurant: req.params.id });
    res.status(201).json({ success: true, item });
  } catch (error) { next(error); }
};

// @desc Update menu item (admin)
exports.updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, item });
  } catch (error) { next(error); }
};

// @desc Delete menu item (admin)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.itemId);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) { next(error); }
};
