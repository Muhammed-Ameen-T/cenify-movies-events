# 🎭 Cenify

> A modern full-stack theater booking platform built with MERN, featuring real-time seat selection and seamless payment processing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## ✨ Features

- 🎬 **Multi-Entertainment Platform** - Movies, shows, concerts & events
- 🪑 **Real-Time Seat Selection** - Interactive seat maps with live updates
- 💳 **Secure Payments** - Stripe & PayPal integration
- 🎫 **Digital Tickets** - QR code generation & instant delivery
- 💰 **User Wallet** - Store credits & instant checkout
- ⭐ **Loyalty Points** - Earn rewards on every booking
- 🎟️ **Movie Pass** - Subscription plans for unlimited access
- 📱 **Mobile-First Design** - Responsive across all devices
- 🔔 **Smart Notifications** - Email & SMS alerts

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Redux Toolkit
- Tailwind CSS
- Framer Motion

**Backend**
- Node.js + Express
- Clean Architecture
- MongoDB + Mongoose
- Redis (Caching)
- JWT Authentication

**Integrations**
- Stripe (Payments)
- Twilio (SMS)
- Cloudinary (Media)

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB v4.4+
- Redis v6.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/Muhammed-Ameen-T/cenify.git
cd cenify

# Install dependencies
npm install
cd client && npm install && cd ..

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start services
npm run dev
```

**Access the app:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/cenify
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Notifications
SENDGRID_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Storage
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## 📁 Project Structure

```
cenify/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   ├── store/          # Redux store
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
│   └── vite.config.js
│
├── server/                 # Clean Architecture backend
│   ├── src/
│   │   ├── domain/         # Business logic & entities
│   │   ├── application/    # Use cases
│   │   ├── infrastructure/ # External services
│   │   └── presentation/   # Controllers & routes
│   └── app.js
│
└── docker-compose.yml
```

## 🐳 Docker Deployment

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🗺️ Roadmap

**Q2 2025**
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-theater management

**Q3 2025**
- [ ] AI-powered recommendations
- [ ] Social features & reviews
- [ ] Event organizer portal

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT © [Cenify Team](LICENSE)

## 📞 Support

- 📧 Email: mhdameent2006@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Muhammed-Ameen-T/cenify-movies-events/issues)
---

<p align="center">Made with ❤️ by Ameen</p>
