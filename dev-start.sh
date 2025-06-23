#!/bin/bash

# Smart Marketplace Development Startup Script
# This script helps you start the development environment quickly

echo "🚀 Smart Marketplace Development Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${RED}🔧 Please edit .env file with your configuration before continuing!${NC}"
    echo -e "${BLUE}   Required: MONGODB_URI, GEMINI_API_KEY${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if dependencies are installed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📥 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📥 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Function to start development servers
start_dev() {
    echo -e "${BLUE}🌟 Starting development servers...${NC}"
    
    # Check if MongoDB is running (optional check)
    if command_exists mongod; then
        if ! pgrep -x "mongod" > /dev/null; then
            echo -e "${YELLOW}⚠️  MongoDB not running. Please start MongoDB manually or use Docker.${NC}"
        fi
    fi
    
    # Start backend in background
    echo -e "${BLUE}🔧 Starting backend server...${NC}"
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    echo -e "${BLUE}🎨 Starting frontend server...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Development servers started!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3001${NC}"
    echo -e "${BLUE}🔌 Backend:  http://localhost:5000${NC}"
    echo -e "${BLUE}🏥 Health:   http://localhost:5000/health${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
    
    # Wait for Ctrl+C
    trap 'echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
    wait
}

# Function to start with Docker
start_docker() {
    echo -e "${BLUE}🐳 Starting with Docker Compose...${NC}"
    
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker not found. Please install Docker${NC}"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose${NC}"
        exit 1
    fi
    
    docker-compose up --build
}

# Function to run setup checks
setup_check() {
    echo -e "${BLUE}🔍 Running setup verification...${NC}"
    
    # Check backend health (if running)
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend server not running${NC}"
    fi
    
    # Check frontend (if running)
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend server is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend server not running${NC}"
    fi
    
    # Verify .env variables
    source .env
    if [ -z "$MONGODB_URI" ]; then
        echo -e "${RED}❌ MONGODB_URI not set in .env${NC}"
    else
        echo -e "${GREEN}✅ MONGODB_URI configured${NC}"
    fi
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${RED}❌ GEMINI_API_KEY not set in .env${NC}"
    else
        echo -e "${GREEN}✅ GEMINI_API_KEY configured${NC}"
    fi
}

# Parse command line arguments
case "$1" in
    "docker")
        start_docker
        ;;
    "check")
        setup_check
        ;;
    "install")
        echo -e "${BLUE}📦 Installing all dependencies...${NC}"
        cd backend && npm install && cd ..
        cd frontend && npm install && cd ..
        echo -e "${GREEN}✅ All dependencies installed${NC}"
        ;;
    *)
        echo "Usage: $0 [docker|check|install]"
        echo ""
        echo "Options:"
        echo "  (no args)  Start development servers normally"
        echo "  docker     Start with Docker Compose"
        echo "  check      Verify setup and running services"
        echo "  install    Install all dependencies"
        echo ""
        start_dev
        ;;
esac
