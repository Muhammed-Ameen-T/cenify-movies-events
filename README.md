# Cenify 🎭

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](https://expressjs.com/)

> A modern, full-stack theater ticket booking platform built with the MERN stack, offering seamless movie and event booking experiences with real-time seat selection and secure payment processing.

## 🌟 Overview

Cenify is a comprehensive theater ticket booking application that revolutionizes the way users discover, book, and manage their entertainment experiences. Built with modern web technologies and best practices, it provides a scalable, secure, and user-friendly platform for theaters, event organizers, and customers.

### ✨ Key Features

- **🎬 Multi-Entertainment Platform**: Browse movies, theater shows, concerts, and special events
- **🔄 Real-Time Seat Selection**: Interactive seat maps with live availability updates
- **💳 Secure Payment Processing**: Multiple payment gateways with PCI compliance
- **👤 User Management**: Comprehensive account system with booking history and preferences
- **🤖 Smart Recommendations**: AI-powered suggestions based on user behavior and preferences
- **📱 Mobile-First Design**: Responsive interface optimized for all devices
- **🎫 Digital Tickets**: QR code-based tickets with instant delivery
- **📊 Analytics Dashboard**: Real-time insights for theater managers and administrators
- **🔔 Notification System**: Email and SMS alerts for bookings and updates
- **🌐 Multi-Language Support**: Localization for global accessibility

## 🛠️ Technology Stack

### Frontend
- **React.js** (v18+) - Component-based UI framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Server state management

### Backend
- **Node.js** (v14+) - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Primary database
- **Redis** - Caching and session management
- **JWT** - Authentication and authorization
- **Mongoose** - MongoDB object modeling

### Payment & Integration
- **Stripe** - Payment processing
- **PayPal** - Alternative payment method
- **Twilio** - SMS notifications
- **SendGrid** - Email services
- **Cloudinary** - Image and media management

### Development & Deployment
- **Docker** - Containerization
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD pipeline
- **AWS/Digital Ocean** - Cloud hosting

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cenify.git
   cd cenify
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/cenify
   REDIS_URL=redis://localhost:6379
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Payment Gateways
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   
   # Email & SMS
   SENDGRID_API_KEY=your_sendgrid_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   
   # Cloud Storage
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running as service)
   mongod
   
   # Start Redis (if not running as service)
   redis-server
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run server    # Backend only
   npm run client    # Frontend only
   ```

6. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/api-docs`

## 📁 Project Structure

```
cenify/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Redux store configuration
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── app.js              # Express app configuration
├── docs/                   # Documentation
├── tests/                  # Test files
├── docker-compose.yml      # Docker configuration
├── package.json
└── README.md
```

## 🔌 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/profile      # Get user profile
PUT    /api/auth/profile      # Update user profile
```

### Movies & Events
```
GET    /api/movies            # Get all movies
GET    /api/movies/:id        # Get movie by ID
GET    /api/events            # Get all events
GET    /api/events/:id        # Get event by ID
GET    /api/theaters          # Get all theaters
GET    /api/theaters/:id      # Get theater details
```

### Booking Management
```
POST   /api/bookings          # Create new booking
GET    /api/bookings          # Get user bookings
GET    /api/bookings/:id      # Get booking details
PUT    /api/bookings/:id      # Update booking
DELETE /api/bookings/:id      # Cancel booking
```

### Payment Processing
```
POST   /api/payments/stripe   # Process Stripe payment
POST   /api/payments/paypal   # Process PayPal payment
GET    /api/payments/:id      # Get payment details
```

For detailed API documentation, visit `/api-docs` when running the server.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📦 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in production mode
docker-compose -f docker-compose.prod.yml up --build
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production` in your environment variables
2. Configure production database URLs
3. Set up SSL certificates
4. Configure reverse proxy (Nginx recommended)

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ..
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## 📋 Roadmap

### Phase 1 (Current)
- [x] Basic booking functionality
- [x] User authentication
- [x] Payment integration
- [x] Real-time seat selection

### Phase 2 (Q3 2025)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-theater management
- [ ] Loyalty program integration

### Phase 3 (Q4 2025)
- [ ] AI-powered recommendations
- [ ] Social features and reviews
- [ ] Event organizer portal
- [ ] Advanced reporting tools

## 🔒 Security

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest and in transit
- **Payment Security**: PCI DSS compliant payment processing
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: API rate limiting to prevent abuse

## 📊 Performance

- **Caching**: Redis-based caching for frequently accessed data
- **Database Optimization**: Indexed queries and connection pooling
- **CDN**: Static asset delivery via CDN
- **Lazy Loading**: Component-level code splitting
- **Image Optimization**: Automatic image compression and format conversion

## 🐛 Known Issues

- Seat selection may occasionally lag during high traffic periods
- Payment processing timeout issues with slow internet connections
- Mobile Safari specific styling issues in iOS 14.x

## 📞 Support

For support and questions:

- **Email**: support@cenify.com
- **Documentation**: [docs.cenify.com](https://docs.cenify.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/cenify/issues)
- **Community**: [Discord Server](https://discord.gg/cenify)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Open Source Libraries**: Thanks to all the open-source contributors
- **Design Inspiration**: Modern theater booking platforms
- **Testing Data**: Sample data provided by various theater chains
- **Community**: Special thanks to our beta testers and contributors

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/cenify?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/cenify?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/cenify)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/cenify)

---

<p align="center">
  Made with ❤️ by the Cenify Team
</p>

<p align="center">
  <a href="https://cenify.com">Website</a> •
  <a href="https://docs.cenify.com">Documentation</a> •
  <a href="https://github.com/yourusername/cenify/issues">Report Bug</a> •
  <a href="https://github.com/yourusername/cenify/issues">Request Feature</a>
</p>
