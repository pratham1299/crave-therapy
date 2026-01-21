# Crave Therapy 🏥

A full-stack mood-based restaurant ordering app with a medical/therapy theme.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |

## Project Structure

```
CT/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Navbar, AuthModal
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── pages/            # Landing, MoodSelect, Menu, Checkout
│   │   │   ├── admin/        # Dashboard, MenuManager, CouponManager, OrderManager, MoodManager
│   │   │   └── counter/      # CounterPortal (Staff billing)
│   │   └── utils/            # api.js, audio.js
│   └── public/logo.png
│
└── server/                    # Node.js Backend
    ├── models/               # User, Mood, MenuItem, Coupon, Order
    ├── routes/               # auth, moods, menu, coupons, orders, admin, counter
    ├── middleware/           # auth.js
    ├── config/               # db.js
    ├── seed.js               # Database seeder
    └── server.js             # Express server
```

## Quick Start

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend  
cd client
npm install
```

### 2. Start MongoDB
```bash
mongod --dbpath /path/to/data
```

Or update `server/.env` with MongoDB Atlas connection string.

### 3. Seed Database
```bash
cd server
node seed.js
```

This creates:
- 4 moods (Heartbroken, Angry, Stressed, Hyper)
- 22 menu items
- 6 coupons (2 public, 4 exclusive)
- Admin & Staff users

### 4. Run the App
```bash
# Terminal 1 - Backend
cd server
npm run dev   # Runs on http://localhost:5000

# Terminal 2 - Frontend
cd client
npm run dev   # Runs on http://localhost:3000
```

## Login Credentials

| Role | Email | Password | Home Page |
|------|-------|----------|-----------|
| Admin | admin@cravetherapy.com | admin123 | Admin Dashboard |
| Staff | staff@cravetherapy.com | staff123 | Counter Portal |
| Customer | (register new) | - | Landing Page |

## Features

### 👤 Customer Features
- Mood-based menu selection (Heartbroken, Angry, Stressed, Hyper)
- Auto-playing mood music (Web Audio API)
- Add to cart with quantity controls
- Guest checkout (no login required)
- Login/Register for exclusive coupons
- Coupon validation with backend

### 🛠️ Admin Panel
- Dashboard with stats (orders, revenue, users)
- Menu item CRUD (add/edit/delete by mood)
- Mood category management
- Coupon management (exclusive coupons for logged-in users)
- Order management with status updates

### 🧾 Staff Counter Portal
- View pending & completed orders (tabs)
- Search by customer name, phone, or table
- Add/remove items from orders before payment
- Mark orders as paid
- Today's billing stats

### 🎨 Design
- Medical/therapy theme with typewriter fonts
- Graph paper background
- Teal color scheme
- Custom animations (heartbeat, float, bounce, pill drop)
- Responsive mobile-first design

## Menu Items (Seeded)

| Mood | Sample Items |
|------|-------------|
| 💔 Heartbroken | Comfort Hug Pasta, I Don't Care Burger, Emotional Support Fries |
| 😤 Angry | Rage Release Burger, Crunch Therapy Wrap, Fury Fries |
| 😰 Stressed | Chill Pill Sandwich, Zen Garden Bowl, Calm Down Chai |
| ⚡ Hyper | Energy Burst Bowl, Hyperactive Wings, Sugar Rush Shake |

## Coupons (Seeded)

| Code | Discount | For Logged-in Users? |
|------|----------|---------------------|
| RELIEF100 | ₹100 OFF | No |
| WEEKEND20 | 20% OFF | No |
| B1G1CARE | BOGO | Yes |
| DOC50 | ₹50 OFF | Yes |
| FIRSTDOSE | 15% OFF | Yes |
| VIPCARE | ₹40 OFF | Yes |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/moods | Get all moods with items |
| GET | /api/menu | Get all menu items |
| GET | /api/coupons | Get available coupons |
| POST | /api/coupons/validate | Validate coupon code |
| POST | /api/orders | Place order |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

Admin & Counter routes require authentication.

## Environment Variables

See `server/.env` for configuration:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)

## Future Enhancements

1. Real MP3 music files for moods
2. Payment gateway integration (Razorpay/Stripe)
3. QR code generator for tables
4. Email notifications for orders
5. Real-time order updates with Socket.io

---

Built with ❤️ for food therapy
