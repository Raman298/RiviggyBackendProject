# riviggy - Campus Food Ordering Platform

> A production-ready full-stack food ordering app with **Group Ordering** and **Auto Split Billing** built for university campuses.

---

## Features

| Feature | Details |
|---|---|
| Auth | JWT-based login/register, role-based (User/Admin) |
| Restaurants | Listing, search, filter by cuisine, sort by rating |
| Menu | Items with veg/non-veg, spice level, category grouping |
| Individual Cart | Add/update/remove items, checkout with address |
| Group Orders | Create room, share code, everyone adds items separately |
| Real-Time | Socket.IO live updates: item added, member joined |
| Split Bill | Auto-calculate per-person amount by contribution or equally |
| Order History | Individual and group orders with status tracking |
| UI | Dark-mode, Syne + DM Sans fonts, Tailwind CSS |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd riviggy

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

```bash
# In /server directory
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- 12 restaurants with full menus
- Admin account: `admin@riviggy.com` / `admin123`
- User account: `user@riviggy.com` / `user123`

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd server
npm run dev   # starts on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start     # starts on port 3000
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy the frontend to GitHub Pages

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. In GitHub, open **Settings > Pages** and set **Source** to **GitHub Actions**.
2. If the backend is deployed separately, add a repository variable named `REACT_APP_API_URL` under **Settings > Secrets and variables > Actions > Variables**. Set it to the public API base URL, for example `https://your-api.example.com/api`.
3. Push to `master`. GitHub Actions will build and deploy the `client` folder.

GitHub Pages hosts static frontend files only. The Express server, MongoDB, uploads, Socket.IO, and payment endpoints must run on a separate backend host. Without `REACT_APP_API_URL`, the deployed frontend will use `/api`, which works locally through the React development proxy but is not available on GitHub Pages.

---

## Project Structure

```
riviggy/
├── server/
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── orderController.js
│   │   └── groupOrderController.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── GroupOrder.js
│   ├── routes/             # Express routes
│   ├── middleware/         # Auth + error handling
│   ├── utils/
│   │   ├── socketHandler.js  # Socket.IO events
│   │   └── seed.js           # Database seeder
│   ├── index.js            # Entry point
│   └── .env.example
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── common/     # Navbar, LoadingSpinner
│       │   ├── restaurant/ # RestaurantCard, MenuItem
│       │   └── group/      # GroupRoom, BillSplit
│       ├── context/        # AuthContext, CartContext
│       ├── pages/          # All page components
│       ├── services/       # Axios API service
│       └── App.jsx
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Restaurants
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/restaurants` | List all (with search/filter) |
| GET | `/api/restaurants/:id` | Details + menu |
| POST | `/api/restaurants` | Create (admin) |
| POST | `/api/restaurants/:id/menu` | Add menu item (admin) |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create individual order |
| GET | `/api/orders/my` | My order history |
| GET | `/api/orders/:id` | Order details |

### Group Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/group-orders` | Create group room |
| GET | `/api/group-orders/join/:code` | Join by invite code |
| GET | `/api/group-orders/:id` | Room details |
| POST | `/api/group-orders/:id/items` | Add item (tracked per user) |
| DELETE | `/api/group-orders/:id/items/:idx` | Remove item |
| GET | `/api/group-orders/:id/split-bill` | Get split breakdown |
| PUT | `/api/group-orders/:id/split-mode` | Change split mode |
| POST | `/api/group-orders/:id/finalize` | Lock & place order (creator) |

---

## Socket.IO Events

| Event | Direction | Payload |
|---|---|---|
| `joinGroupRoom` | Client → Server | `{ groupCode, userId, userName }` |
| `memberJoined` | Server → Clients | `{ user }` |
| `itemAdded` | Server → Clients | `{ item, groupOrder }` |
| `itemRemoved` | Server → Clients | `{ itemIndex, groupOrder }` |
| `orderFinalized` | Server → Clients | `{ orderId }` |
| `userOnline` | Server → Clients | `{ userId, userName }` |

---

## Database Schema

### GroupOrder
```javascript
{
  code: "ABC12345",          // Unique invite code
  restaurant: ObjectId,
  creator: ObjectId,
  members: [{ user, name, avatar, subtotal, splitAmount }],
  items: [{ menuItem, name, price, quantity, addedBy, addedByName }],
  status: "active|locked|completed",
  splitMode: "by_contribution|equal",
  deliveryFee, tax, subtotal, total,
  closesAt: Date,            // Timer for auto-close
}
```

---

## .env Configuration

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/riviggy
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Optional: Razorpay for payments
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| User | user@riviggy.com | user123 |
| Admin | admin@riviggy.com | admin123 |

---

## Tech Stack

**Frontend:** React 18, React Router v6, Context API, Axios, Socket.IO Client, Tailwind CSS

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs

---

*Built for campus life - riviggy*
