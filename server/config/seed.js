/**
 * Seed script to populate the database with sample data
 * Run: node config/seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB for seeding...');

  // Clear existing data
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@riviggy.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  });

  // Create sample users
  await User.create([
    { name: 'Arjun Sharma', email: 'arjun@test.com', password: 'test123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun' },
    { name: 'Priya Patel', email: 'priya@test.com', password: 'test123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
    { name: 'Rahul Gupta', email: 'rahul@test.com', password: 'test123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul' },
  ]);

  // Create restaurants
  const restaurants = await Restaurant.create([
    {
      name: "Biryani Boulevard",
      description: "Authentic Hyderabadi dum biryani made with finest basmati rice",
      cuisine: ["Biryani", "Mughlai", "North Indian"],
      rating: 4.5,
      deliveryTime: "30-45 min",
      deliveryFee: 30,
      minOrder: 150,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
      address: "Block A, Campus Market, Punjab University",
      isOpen: true,
      tags: ["Popular", "Bestseller"],
    },
    {
      name: "Pizza Planet",
      description: "NY-style hand-tossed pizzas with premium toppings",
      cuisine: ["Pizza", "Italian", "Fast Food"],
      rating: 4.3,
      deliveryTime: "25-35 min",
      deliveryFee: 25,
      minOrder: 199,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
      address: "Food Court, Student Center, Block B",
      isOpen: true,
      tags: ["New", "Trending"],
    },
    {
      name: "Burger Barn",
      description: "Juicy gourmet burgers with house-made sauces",
      cuisine: ["Burgers", "American", "Fast Food"],
      rating: 4.1,
      deliveryTime: "20-30 min",
      deliveryFee: 20,
      minOrder: 99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      address: "Canteen Row, Hostel Block C",
      isOpen: true,
      tags: ["Budget Friendly"],
    },
    {
      name: "Thali House",
      description: "Traditional Punjabi thali with unlimited rotis",
      cuisine: ["North Indian", "Punjabi", "Thali"],
      rating: 4.6,
      deliveryTime: "35-50 min",
      deliveryFee: 15,
      minOrder: 120,
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
      address: "Main Canteen, Academic Block",
      isOpen: true,
      tags: ["Homestyle", "Value"],
    },
    {
      name: "Café Connect",
      description: "Specialty coffee, sandwiches and light bites",
      cuisine: ["Cafe", "Sandwiches", "Beverages"],
      rating: 4.4,
      deliveryTime: "15-25 min",
      deliveryFee: 10,
      minOrder: 80,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
      address: "Library Complex, Ground Floor",
      isOpen: true,
      tags: ["Quick Bites", "Coffee"],
    },
  ]);

  // Create menu items for each restaurant
  const menuItems = [
    // Biryani Boulevard
    { restaurant: restaurants[0]._id, name: "Chicken Dum Biryani", description: "Slow-cooked with saffron and whole spices", price: 199, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", isVeg: false, rating: 4.7, popular: true },
    { restaurant: restaurants[0]._id, name: "Mutton Biryani", description: "Tender mutton pieces with aromatic rice", price: 249, category: "Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400", isVeg: false, rating: 4.8, popular: true },
    { restaurant: restaurants[0]._id, name: "Veg Dum Biryani", description: "Garden vegetables with kewra water", price: 149, category: "Biryani", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400", isVeg: true, rating: 4.4 },
    { restaurant: restaurants[0]._id, name: "Raita", description: "Chilled yogurt with cucumber and mint", price: 39, category: "Sides", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400", isVeg: true },
    { restaurant: restaurants[0]._id, name: "Shorba Soup", description: "Spiced broth served with biryani", price: 59, category: "Sides", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400", isVeg: false },

    // Pizza Planet
    { restaurant: restaurants[1]._id, name: "Margherita Pizza", description: "Classic tomato sauce with fresh mozzarella", price: 199, category: "Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", isVeg: true, popular: true },
    { restaurant: restaurants[1]._id, name: "BBQ Chicken Pizza", description: "Smoky BBQ sauce, chicken tikka, red onions", price: 279, category: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", isVeg: false, rating: 4.5, popular: true },
    { restaurant: restaurants[1]._id, name: "Paneer Tikka Pizza", description: "Tandoori paneer with capsicum and onion", price: 249, category: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", isVeg: true },
    { restaurant: restaurants[1]._id, name: "Garlic Bread", description: "Buttery garlic bread with herbs", price: 99, category: "Sides", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400", isVeg: true },
    { restaurant: restaurants[1]._id, name: "Pasta Arrabiata", description: "Penne in spicy tomato sauce", price: 159, category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400", isVeg: true },

    // Burger Barn
    { restaurant: restaurants[2]._id, name: "Classic Beef Burger", description: "Angus beef patty with lettuce, tomato, pickles", price: 149, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", isVeg: false, popular: true },
    { restaurant: restaurants[2]._id, name: "Crispy Chicken Burger", description: "Southern-fried chicken with coleslaw", price: 139, category: "Burgers", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400", isVeg: false, rating: 4.3 },
    { restaurant: restaurants[2]._id, name: "Veggie Stack Burger", description: "Grilled veggie patty with avocado spread", price: 119, category: "Burgers", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400", isVeg: true },
    { restaurant: restaurants[2]._id, name: "Loaded Fries", description: "Crispy fries with cheese sauce and jalapeños", price: 89, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400", isVeg: true, popular: true },
    { restaurant: restaurants[2]._id, name: "Chocolate Shake", description: "Thick and creamy Belgian chocolate milkshake", price: 99, category: "Beverages", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400", isVeg: true },

    // Thali House
    { restaurant: restaurants[3]._id, name: "Full Punjabi Thali", description: "Dal makhani, paneer, 4 rotis, rice, salad, sweet", price: 179, category: "Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", isVeg: true, popular: true },
    { restaurant: restaurants[3]._id, name: "Non-Veg Thali", description: "Chicken curry, dal, 4 rotis, rice, salad", price: 219, category: "Thali", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400", isVeg: false },
    { restaurant: restaurants[3]._id, name: "Dal Makhani", description: "Creamy slow-cooked black lentils", price: 99, category: "Mains", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", isVeg: true },
    { restaurant: restaurants[3]._id, name: "Butter Naan", description: "Soft naan brushed with butter", price: 25, category: "Breads", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", isVeg: true },

    // Café Connect
    { restaurant: restaurants[4]._id, name: "Cappuccino", description: "Double shot espresso with steamed milk foam", price: 89, category: "Coffee", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400", isVeg: true, popular: true },
    { restaurant: restaurants[4]._id, name: "Club Sandwich", description: "Triple-layer sandwich with chicken and veggies", price: 149, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", isVeg: false },
    { restaurant: restaurants[4]._id, name: "Cold Coffee", description: "Chilled coffee with ice cream", price: 99, category: "Coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400", isVeg: true, popular: true },
    { restaurant: restaurants[4]._id, name: "Veg Wrap", description: "Grilled veggies with hummus in a whole wheat wrap", price: 119, category: "Snacks", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400", isVeg: true },
  ];

  await MenuItem.insertMany(menuItems);

  console.log('Database seeded successfully!');
  console.log('Admin credentials: admin@riviggy.com / admin123');
  console.log('Test user: arjun@test.com / test123');
  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
