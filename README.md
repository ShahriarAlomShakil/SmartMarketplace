# 🛍️ Smart Marketplace - AI-Powered Buy & Sell Platform

A modern, intelligent marketplace where users can list products for sale and buyers can negotiate with an AI agent powered by Google Gemini LLM. Built with Next.js, Express.js, and MongoDB, featuring a beautiful glass morphism design.

## ✨ Features

### 🤖 AI-Powered Negotiation
- **Intelligent Bargaining**: AI agents simulate realistic human-like haggling behavior
- **Google Gemini Integration**: Advanced conversational AI for natural negotiations
- **Dynamic Pricing**: AI considers market context, urgency, and user preferences
- **Personality Settings**: Configurable AI personalities (friendly, professional, firm, flexible)

### 🛒 Product Management
- **Easy Listing**: Intuitive product listing with drag-and-drop image upload
- **Smart Pricing**: Set base prices and minimum acceptable offers
- **Rich Media**: Multiple image support with automatic optimization
- **Categories & Filters**: Comprehensive categorization and search functionality

### 💬 Real-time Communication
- **Live Chat**: WebSocket-powered real-time messaging
- **Typing Indicators**: See when the AI or other users are typing
- **Message History**: Complete conversation tracking and analytics
- **Negotiation Timeline**: Visual progress tracking of offers and counter-offers

### 🎨 Modern UI/UX
- **Glass Morphism Design**: Beautiful frosted glass effects and backdrop blur
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Themes**: System preference detection with manual toggle
- **Smooth Animations**: Micro-interactions and transition effects

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Password Security**: Strong password requirements and hashing
- **Email Verification**: Account verification system
- **Rate Limiting**: API protection against abuse

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- Google Gemini API Key
- Cloudinary Account (for image storage)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-marketplace.git
cd smart-marketplace
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

4. **Required Environment Variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-marketplace

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# Google Gemini API
GEMINI_API_KEY=your-google-gemini-api-key

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

5. **Start the development servers**
```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend server
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## 🐳 Docker Setup

### Development with Docker Compose

1. **Start all services**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f
```

3. **Stop services**
```bash
docker-compose down
```

### Production Deployment

1. **Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy with SSL**
```bash
docker-compose -f docker-compose.prod.yml --profile production up -d
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
GET  /api/auth/profile      - Get user profile
PUT  /api/auth/profile      - Update user profile
```

### Product Endpoints
```
GET    /api/products        - Get all products (with filters)
GET    /api/products/:id    - Get product by ID
POST   /api/products        - Create new product
PUT    /api/products/:id    - Update product
DELETE /api/products/:id    - Delete product
GET    /api/products/search - Search products
```

### Negotiation Endpoints
```
GET  /api/negotiations           - Get user negotiations
POST /api/negotiations/start     - Start new negotiation
POST /api/negotiations/:id/offer - Send offer
POST /api/negotiations/:id/accept- Accept offer
POST /api/negotiations/:id/reject- Reject offer
```

For complete API documentation, visit `/api/docs` when running the server.

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js, MongoDB, Socket.io
- **AI**: Google Gemini API
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary
- **Real-time**: WebSocket (Socket.io)

### Project Structure
```
smart-marketplace/
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic
│   │   └── config/        # Configuration files
├── shared/                # Shared types and constants
└── docker-compose.yml     # Docker configuration
```

## 🔧 Development

### Available Scripts

**Backend**
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
npm run lint       # Lint code
npm run lint:fix   # Fix linting issues
```

**Frontend**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Lint code
npm run type-check # TypeScript type checking
```

### Code Style
- ESLint configuration for code consistency
- Prettier for code formatting
- TypeScript for type safety
- Conventional commit messages

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Environment Setup
1. Set up production environment variables
2. Configure MongoDB Atlas or self-hosted MongoDB
3. Set up Cloudinary for image storage
4. Configure domain and SSL certificates

### Build and Deploy
```bash
# Build frontend
cd frontend
npm run build

# Start production servers
cd ../backend
npm start
```

### Docker Production Deployment
```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits focused and descriptive

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent conversation capabilities
- **Cloudinary** for image storage and optimization
- **MongoDB** for flexible data storage
- **Next.js** for the amazing React framework
- **Tailwind CSS** for utility-first styling
- **Socket.io** for real-time communication

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/smart-marketplace/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/smart-marketplace/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/smart-marketplace/discussions)
- **Email**: support@smartmarketplace.com

## 🗺️ Roadmap

### Phase 1 ✅
- [x] Project setup and basic structure
- [x] Authentication system
- [x] Product listing functionality
- [x] Basic UI components

### Phase 2 🚧
- [ ] Gemini AI integration
- [ ] Real-time chat system
- [ ] Advanced search and filtering
- [ ] User profiles and ratings

### Phase 3 📋
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Multi-language support

---

**Made with ❤️ by the Smart Marketplace Team**
