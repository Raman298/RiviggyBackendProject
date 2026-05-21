
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

const restaurants = [
  {
    name: "Spice Garden",
    description: "Authentic Indian cuisine with aromatic spices and traditional recipes",
    cuisine: ["Indian", "North Indian", "Mughlai"],
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    rating: 4.5, deliveryTime: "30-45 min", deliveryFee: 30, address: "Sector 17, Campus Area",
    tags: ["Popular", "Pure Veg Options"], priceRange: "$$"
  },
  {
    name: "Burger Bytes",
    description: "Gourmet burgers, loaded fries, and craft sodas for the modern foodie",
    cuisine: ["American", "Fast Food", "Burgers"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    rating: 4.3, deliveryTime: "20-30 min", deliveryFee: 20, address: "Main Street, University Campus",
    tags: ["Fast Delivery", "Student Favorite"], priceRange: "$$"
  },
  {
    name: "Pizza Palace",
    description: "Wood-fired pizzas with premium toppings and homemade sauces",
    cuisine: ["Italian", "Pizza", "Pasta"],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    rating: 4.6, deliveryTime: "35-50 min", deliveryFee: 40, address: "College Road, Campus Zone",
    tags: ["Group Orders Welcome", "Bestseller"], priceRange: "$$$"
  },
  {
    name: "Sushi Sensei",
    description: "Fresh, hand-crafted sushi rolls and Japanese delicacies",
    cuisine: ["Japanese", "Sushi", "Asian"],
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
    coverImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
    rating: 4.7, deliveryTime: "40-55 min", deliveryFee: 50, address: "East Block, Campus",
    tags: ["Premium", "Healthy"], priceRange: "$$$"
  },
  {
    name: "Dosa Corner",
    description: "South Indian delights - crispy dosas, idlis, and filter coffee",
    cuisine: ["South Indian", "Indian", "Breakfast"],
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400",
    coverImage: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
    rating: 4.4, deliveryTime: "25-35 min", deliveryFee: 15, address: "Canteen Block, Campus",
    tags: ["Budget Friendly", "Pure Veg", "Breakfast"], priceRange: "$"
  },
  {
    name: "The Pasta Lab",
    description: "Artisanal pastas and Italian comfort food crafted fresh daily",
    cuisine: ["Italian", "Pasta", "Continental"],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    rating: 4.2, deliveryTime: "30-45 min", deliveryFee: 35, address: "West Campus Cafeteria",
    tags: ["New", "Trending"], priceRange: "$$"
  },
  {
    name: "Taco Terminal",
    description: "Street-style tacos, nachos, and burrito bowls with bold Mexican flavors",
    cuisine: ["Mexican", "Fast Food", "Tex-Mex"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    rating: 4.4, deliveryTime: "20-35 min", deliveryFee: 25, address: "Innovation Hub, North Campus",
    tags: ["Spicy", "Student Special"], priceRange: "$$"
  },
  {
    name: "Noodle Nest",
    description: "Comforting ramen bowls, stir-fried noodles, and Asian street favorites",
    cuisine: ["Chinese", "Asian", "Noodles"],
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400",
    coverImage: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800",
    rating: 4.5, deliveryTime: "25-40 min", deliveryFee: 30, address: "Hostel Lane, South Campus",
    tags: ["Hot Picks", "Late Night"], priceRange: "$$"
  },
  {
    name: "Green Bowl Co",
    description: "Healthy salads, protein bowls, and fresh juices for guilt-free meals",
    cuisine: ["Healthy", "Salads", "Continental"],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    rating: 4.3, deliveryTime: "20-30 min", deliveryFee: 20, address: "Sports Complex Road, Central Campus",
    tags: ["High Protein", "Fresh"], priceRange: "$$"
  },
  {
    name: "Dessert District",
    description: "Cakes, waffles, brownies, and shakes for every sweet craving",
    cuisine: ["Desserts", "Bakery", "Beverages"],
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
    coverImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
    rating: 4.6, deliveryTime: "15-25 min", deliveryFee: 15, address: "Student Plaza, Main Gate",
    tags: ["Bestseller", "Sweet Tooth"], priceRange: "$$$"
  },
  {
    name: "Royal Thali Bhawan",
    description: "Traditional Indian thalis with rich curries, breads, rice, and sweets",
    cuisine: ["Indian", "North Indian", "Thali"],
    image: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=400",
    coverImage: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800",
    rating: 4.7, deliveryTime: "30-45 min", deliveryFee: 20, address: "Faculty Block, Central Campus",
    tags: ["Thali Special", "Family Combo"], priceRange: "$$"
  },
  {
    name: "Annapurna Thali House",
    description: "Affordable veg and mini thali combos with homestyle Indian flavors",
    cuisine: ["Indian", "Punjabi", "Thali"],
    image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400",
    coverImage: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=800",
    rating: 4.5, deliveryTime: "25-40 min", deliveryFee: 18, address: "Library Square, East Campus",
    tags: ["Budget Thali", "Student Favorite"], priceRange: "$"
  }
];

const menuData = {
  "Spice Garden": [
    { name: "Butter Chicken", category: "Main Course", price: 280, isVeg: false, description: "Creamy tomato-based chicken curry", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300", spiceLevel: "medium" },
    { name: "Paneer Tikka Masala", category: "Main Course", price: 240, isVeg: true, description: "Grilled cottage cheese in spiced gravy", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300", spiceLevel: "medium" },
    { name: "Biryani", category: "Rice", price: 220, isVeg: false, description: "Fragrant basmati rice with spices", image: "https://images.unsplash.com/photo-1563379091339-03246963d996?w=300", spiceLevel: "hot" },
    { name: "Garlic Naan", category: "Breads", price: 60, isVeg: true, description: "Soft flatbread with garlic butter", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300" },
    { name: "Mango Lassi", category: "Beverages", price: 80, isVeg: true, description: "Refreshing mango yogurt drink", image: "https://images.unsplash.com/photo-1571006017376-0fc1c7d1bba7?w=300" },
    { name: "Samosa (2 pcs)", category: "Starters", price: 50, isVeg: true, description: "Crispy pastry with spiced potato filling", image: "https://images.unsplash.com/photo-1601050690117-94f5f7a1c96b?w=300" }
  ],
  "Burger Bytes": [
    { name: "Classic Smash Burger", category: "Burgers", price: 199, isVeg: false, description: "Double smashed beef patty with special sauce", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300" },
    { name: "Crispy Chicken Burger", category: "Burgers", price: 179, isVeg: false, description: "Juicy fried chicken with coleslaw", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300" },
    { name: "Veggie Delight Burger", category: "Burgers", price: 149, isVeg: true, description: "Grilled veggie patty with fresh veggies", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300" },
    { name: "Loaded Cheese Fries", category: "Sides", price: 120, isVeg: true, description: "Crispy fries with cheese sauce and jalapeños", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300" },
    { name: "Milkshake", category: "Beverages", price: 149, isVeg: true, description: "Thick creamy milkshake in 3 flavors", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300" },
    { name: "Onion Rings", category: "Sides", price: 89, isVeg: true, description: "Golden crispy onion rings", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300" }
  ],
  "Pizza Palace": [
    { name: "Margherita", category: "Classic Pizzas", price: 299, isVeg: true, description: "Fresh tomato, mozzarella, and basil", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300" },
    { name: "Pepperoni Feast", category: "Non-Veg Pizzas", price: 399, isVeg: false, description: "Loaded with premium pepperoni", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300" },
    { name: "BBQ Chicken Pizza", category: "Non-Veg Pizzas", price: 379, isVeg: false, description: "Smoky BBQ chicken with onions", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300" },
    { name: "Garlic Bread", category: "Sides", price: 99, isVeg: true, description: "Toasted bread with herb garlic butter", image: "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=300" },
    { name: "Pasta Arabiata", category: "Pasta", price: 249, isVeg: true, description: "Spicy tomato sauce with penne", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300" }
  ],
  "Sushi Sensei": [
    { name: "California Roll (8 pcs)", category: "Rolls", price: 320, isVeg: false, description: "Crab, avocado and cucumber", image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=300" },
    { name: "Spicy Tuna Roll", category: "Rolls", price: 380, isVeg: false, description: "Fresh tuna with spicy mayo", image: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=300" },
    { name: "Veggie Rainbow Roll", category: "Rolls", price: 280, isVeg: true, description: "Colorful vegetables and avocado", image: "https://images.unsplash.com/photo-1574432583882-4711e91e74a3?w=300" },
    { name: "Miso Soup", category: "Soups", price: 120, isVeg: true, description: "Traditional Japanese miso broth", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300" },
    { name: "Edamame", category: "Starters", price: 150, isVeg: true, description: "Steamed salted soybeans", image: "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=300" }
  ],
  "Dosa Corner": [
    { name: "Masala Dosa", category: "Dosas", price: 80, isVeg: true, description: "Crispy crepe with spiced potato filling", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300" },
    { name: "Idli Sambar (3 pcs)", category: "Tiffin", price: 60, isVeg: true, description: "Steamed rice cakes with lentil soup", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300" },
    { name: "Uttapam", category: "Dosas", price: 90, isVeg: true, description: "Thick pancake with onion and tomato", image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=300" },
    { name: "Filter Coffee", category: "Beverages", price: 40, isVeg: true, description: "Traditional South Indian filter coffee", image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=300" },
    { name: "Vada (2 pcs)", category: "Starters", price: 50, isVeg: true, description: "Crispy lentil fritters", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300" }
  ],
  "The Pasta Lab": [
    { name: "Spaghetti Carbonara", category: "Pasta", price: 280, isVeg: false, description: "Creamy egg-based sauce with bacon bits", image: "https://images.unsplash.com/photo-1551183053-bf91798d047c?w=300" },
    { name: "Penne Arabiata", category: "Pasta", price: 220, isVeg: true, description: "Spicy tomato sauce with fresh herbs", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300" },
    { name: "Mushroom Risotto", category: "Risotto", price: 300, isVeg: true, description: "Creamy arborio rice with wild mushrooms", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300" },
    { name: "Tiramisu", category: "Desserts", price: 180, isVeg: true, description: "Classic Italian coffee dessert", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300" },
    { name: "Bruschetta", category: "Starters", price: 150, isVeg: true, description: "Toasted bread with tomato and basil", image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300" }
  ],
  "Taco Terminal": [
    { name: "Chicken Tacos (3 pcs)", category: "Tacos", price: 210, isVeg: false, description: "Soft tortillas stuffed with grilled chicken and salsa", image: "https://images.unsplash.com/photo-1611250188496-e966043a0629?w=300" },
    { name: "Bean Burrito Bowl", category: "Bowls", price: 190, isVeg: true, description: "Rice, beans, corn, salsa, and sour cream", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300" },
    { name: "Loaded Nachos", category: "Sides", price: 170, isVeg: true, description: "Crispy nachos with cheese sauce and jalapenos", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300" },
    { name: "Quesadilla", category: "Mains", price: 220, isVeg: true, description: "Grilled tortilla with cheese and veggie filling", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=300" },
    { name: "Churros", category: "Desserts", price: 120, isVeg: true, description: "Cinnamon sugar churros with chocolate dip", image: "https://images.unsplash.com/photo-1624371414361-e670edf09a7f?w=300" }
  ],
  "Noodle Nest": [
    { name: "Chicken Hakka Noodles", category: "Noodles", price: 210, isVeg: false, description: "Wok-tossed noodles with chicken and veggies", image: "https://images.unsplash.com/photo-1512003867696-6d5ce6835040?w=300" },
    { name: "Veg Schezwan Noodles", category: "Noodles", price: 180, isVeg: true, description: "Spicy schezwan noodles loaded with veggies", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300" },
    { name: "Veg Manchurian", category: "Starters", price: 170, isVeg: true, description: "Crispy vegetable dumplings in tangy sauce", image: "https://images.unsplash.com/photo-1606491048802-8342506b4b95?w=300" },
    { name: "Ramen Bowl", category: "Soups", price: 240, isVeg: false, description: "Comforting ramen with soft egg and chicken", image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=300" },
    { name: "Spring Rolls", category: "Starters", price: 130, isVeg: true, description: "Crispy rolls served with sweet chili dip", image: "https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=300" }
  ],
  "Green Bowl Co": [
    { name: "Peri Peri Paneer Bowl", category: "Bowls", price: 220, isVeg: true, description: "Brown rice, peri peri paneer, roasted veggies", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300" },
    { name: "Grilled Chicken Salad", category: "Salads", price: 250, isVeg: false, description: "Lettuce, grilled chicken, seeds, and light dressing", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300" },
    { name: "Quinoa Veg Bowl", category: "Bowls", price: 230, isVeg: true, description: "Protein-rich quinoa with sauteed vegetables", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300" },
    { name: "Cold Pressed Orange Juice", category: "Beverages", price: 110, isVeg: true, description: "Freshly pressed orange juice without added sugar", image: "https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?w=300" },
    { name: "Greek Yogurt Parfait", category: "Desserts", price: 140, isVeg: true, description: "Creamy yogurt layered with granola and berries", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300" }
  ],
  "Dessert District": [
    { name: "Choco Lava Cake", category: "Cakes", price: 160, isVeg: true, description: "Warm chocolate cake with molten center", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300" },
    { name: "Belgian Waffle", category: "Waffles", price: 180, isVeg: true, description: "Crispy waffle topped with chocolate drizzle", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=300" },
    { name: "Red Velvet Pastry", category: "Pastries", price: 140, isVeg: true, description: "Moist red velvet pastry with cream cheese frosting", image: "https://images.unsplash.com/photo-1464306076886-da185f6a9d8a?w=300" },
    { name: "Brownie Sundae", category: "Ice Cream", price: 170, isVeg: true, description: "Fudgy brownie served with vanilla ice cream", image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=300" },
    { name: "Oreo Shake", category: "Beverages", price: 150, isVeg: true, description: "Thick milkshake blended with oreo cookies", image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300" }
  ],
  "Royal Thali Bhawan": [
    { name: "Royal Veg Thali", category: "Thali", price: 249, isVeg: true, description: "Paneer, dal, sabzi, jeera rice, naan, salad, and sweet", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300" },
    { name: "Deluxe Punjabi Thali", category: "Thali", price: 279, isVeg: true, description: "Dal makhani, shahi paneer, mix veg, rice, roti basket", image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=300" },
    { name: "Mini Executive Thali", category: "Thali", price: 189, isVeg: true, description: "Perfect single-serve thali with 2 curries and breads", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300" },
    { name: "Dal Makhani", category: "Main Course", price: 140, isVeg: true, description: "Slow-cooked black lentils in creamy gravy", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300" },
    { name: "Butter Naan", category: "Breads", price: 45, isVeg: true, description: "Freshly baked naan brushed with butter", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300" }
  ],
  "Annapurna Thali House": [
    { name: "Student Veg Thali", category: "Thali", price: 159, isVeg: true, description: "Budget thali with dal, seasonal sabzi, rice, and 3 rotis", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300" },
    { name: "North Indian Thali", category: "Thali", price: 199, isVeg: true, description: "Rajma, paneer curry, pulao, roti, and raita", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300" },
    { name: "Special Sunday Thali", category: "Thali", price: 229, isVeg: true, description: "Festive thali with extra sweet and papad", image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=300" },
    { name: "Chole Bhature", category: "Mains", price: 129, isVeg: true, description: "Spiced chole served with fluffy bhature", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300" },
    { name: "Boondi Raita", category: "Sides", price: 60, isVeg: true, description: "Cooling yogurt with boondi and spices", image: "https://images.unsplash.com/photo-1598511726417-9f7f95df9ac4?w=300" }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/riviggy');
    console.log('Connected to MongoDB');

    // Clear existing
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@riviggy.com', 'user@riviggy.com'] } });

    // Create admin user
    await User.create({ name: 'Admin User', email: 'admin@riviggy.com', password: 'admin123', role: 'admin' });
    await User.create({ name: 'Test User', email: 'user@riviggy.com', password: 'user123', role: 'user' });
    console.log('Users seeded');

    // Create restaurants and menus
    for (const rData of restaurants) {
      const restaurant = await Restaurant.create(rData);
      const items = menuData[rData.name];
      if (items) {
        for (const item of items) {
          await MenuItem.create({ ...item, restaurant: restaurant._id });
        }
      }
      console.log(`Seeded: ${rData.name}`);
    }

    console.log('Database seeded successfully!');
    console.log('Admin: admin@riviggy.com / admin123');
    console.log('User: user@riviggy.com / user123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
