# Sawaikar's Cashew Store - Backend API

A Node.js/Express backend server with MongoDB for Sawaikar's Cashew Store e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update with your settings
   - Update `EMAIL_USER` and `EMAIL_PASS` for email functionality

4. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

5. Seed the database with sample products:
```bash
npm run seed
```

6. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

**Query Parameters for GET /api/products:**
- `category` - Filter by category (cashews, roasted, flavored, hampers, spreads)
- `featured` - Filter featured products (true/false)
- `search` - Search in name and description
- `sort` - Sort options (price-asc, price-desc, name-asc, name-desc, newest)
- `limit` - Limit number of results

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:orderId` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:orderId` | Update order status |
| DELETE | `/api/orders/:orderId` | Cancel order |

**Query Parameters for GET /api/orders:**
- `email` - Filter by user email
- `status` - Filter by order status
- `limit` - Limit number of results (default: 50)

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info and endpoints |
| GET | `/api/health` | Health check |
| POST | `/api/seed` | Seed database with sample data |

## 📦 Product Schema

```javascript
{
  id: String (unique),
  name: String,
  price: Number (in paisa, e.g., 89900 = ₹899),
  image: [String],
  category: String,
  company: String,
  description: String,
  colors: [String],
  stock: Number,
  reviews: Number,
  stars: Number (0-5),
  featured: Boolean,
  shipping: Boolean
}
```

## 📋 Order Schema

```javascript
{
  orderId: String (auto-generated),
  userEmail: String,
  userName: String,
  userPhone: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    color: String
  }],
  totalAmount: Number,
  shippingFee: Number,
  paymentStatus: String (pending/completed/failed/refunded),
  paymentMethod: String (upi/card/netbanking/cod/wallet),
  transactionId: String,
  orderStatus: String (placed/confirmed/processing/shipped/delivered/cancelled)
}
```

## 📧 Email Configuration

To enable order confirmation emails:

1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password: Google Account → Security → App Passwords
4. Update `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔧 Development

```bash
# Run in development mode with nodemon
npm run dev

# Run seed script
npm run seed

# Run in production
npm start
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── email.js        # Nodemailer configuration
├── models/
│   ├── Product.js      # Product schema
│   └── Order.js        # Order schema
├── routes/
│   ├── products.js     # Product routes
│   └── orders.js       # Order routes
├── .env                # Environment variables
├── package.json
├── seedData.js         # Database seeder
├── server.js           # Main entry point
└── README.md
```

## 🔒 Security Notes

- In production, add authentication middleware
- Use environment variables for sensitive data
- Enable HTTPS
- Add rate limiting
- Validate and sanitize all inputs

## 📝 License

ISC License
