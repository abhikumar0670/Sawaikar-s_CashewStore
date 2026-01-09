#  Sawaikar's Premium Cashews - E-Commerce Platform

<div align="center">

![Sawaikar's Cashew Store](https://img.shields.io/badge/Sawaikar's-Cashew%20Store-8B4513?style=for-the-badge&logo=shopify&logoColor=white)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)

**A full-stack MERN e-commerce platform for premium quality cashews and dry fruits**

[Live Demo](#)  [Features](#-key-features)  [Installation](#-installation)  [Tech Stack](#-tech-stack)

</div>

---

##  About

**Sawaikar's Premium Cashews** is a modern, full-featured e-commerce web application built with the MERN stack. This platform provides a seamless shopping experience for customers looking to purchase premium quality cashews and dry fruits directly from Goa, India.

The application features a beautiful, responsive UI with smooth animations, a powerful admin dashboard for inventory management, secure payment processing, and automated email notifications for orders.

---

##  Brand Story & Legacy

**Sawaikar's Cashew Store** is more than an online shopit's a living tribute to the red soil of Ponda, Goa, where the Sawaikar family has cultivated and hand-roasted cashews since 1985. Every batch is wood-fire roasted in traditional drums, hand-graded, and packed with the warmth of Goan hospitality.

---

##  Key Features

###  Customer Features
- **Product Browsing** - Browse premium cashews with detailed descriptions and pricing
- **Advanced Filtering** - Filter products by category, price range, and ratings
- **Shopping Cart** - Add/remove items with real-time price updates
- **Wishlist** - Save favorite products for later
- **User Authentication** - Secure login/signup with Clerk authentication
- **Order Tracking** - Track order status in real-time
- **Payment History** - View complete payment and order history
- **Responsive Design** - Seamless experience across all devices

###  Admin Dashboard
- **Product Management** - Add, edit, delete products with image uploads
- **Order Management** - View and update order statuses
- **Customer Management** - View customer information and order history
- **Inventory Alerts** - Low stock notifications
- **Coupon Management** - Create and manage discount coupons
- **Sales Analytics** - Dashboard with sales statistics

###  Payment & Notifications
- **Razorpay Integration** - Secure payment gateway for Indian customers
- **Email Notifications** - Automated order confirmation emails via Nodemailer
- **Order Updates** - Email notifications for order status changes

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js 18** | UI Library |
| **Styled Components** | CSS-in-JS Styling |
| **React Router v6** | Client-side Routing |
| **Axios** | HTTP Requests |
| **React Toastify** | Toast Notifications |
| **React Icons** | Icon Library |
| **Clerk** | User Authentication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **MongoDB** | NoSQL Database |
| **Mongoose** | MongoDB ODM |
| **Razorpay SDK** | Payment Processing |
| **Nodemailer** | Email Service |
| **CORS** | Cross-Origin Requests |
| **Dotenv** | Environment Variables |

---

##  Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git
- Razorpay Account (for payments)
- Clerk Account (for authentication)

### Clone the Repository

```bash
git clone https://github.com/abhikumar0670/Sawaikar-s_CashewStore.git
cd Sawaikar-s_CashewStore
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

Create a `.env` file in the `backend` folder with your API keys.

Create a `.env` file in the `frontend` folder with your Clerk publishable key.

### Run the Application

```bash
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
cd frontend && npm start
```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

---

##  Author

**Abhishek Kumar**

- GitHub: [@abhikumar0670](https://github.com/abhikumar0670)
- Email: abhikumar0670@gmail.com

---

<div align="center">

** Star this repository if you found it helpful!**

Made with  in India 

</div>
