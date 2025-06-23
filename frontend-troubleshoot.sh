#!/bin/bash

# Frontend Troubleshooting Script
# This script helps diagnose and fix common frontend startup issues

echo "🔧 Smart Marketplace Frontend Troubleshooter"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check Node.js and npm versions
check_versions() {
    echo -e "${BLUE}📋 Checking versions...${NC}"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Next.js: $(npx next --version 2>/dev/null || echo 'Not found')"
    echo ""
}

# Function to check dependencies
check_dependencies() {
    echo -e "${BLUE}📦 Checking dependencies...${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ node_modules directory exists${NC}"
    else
        echo -e "${RED}❌ node_modules directory missing${NC}"
        echo -e "${YELLOW}💡 Run: npm install${NC}"
        return 1
    fi
    
    if [ -f "package-lock.json" ]; then
        echo -e "${GREEN}✅ package-lock.json exists${NC}"
    else
        echo -e "${YELLOW}⚠️  package-lock.json missing${NC}"
    fi
    echo ""
}

# Function to check for TypeScript errors
check_typescript() {
    echo -e "${BLUE}🔍 Checking TypeScript...${NC}"
    if npx tsc --noEmit > /dev/null 2>&1; then
        echo -e "${GREEN}✅ No TypeScript errors${NC}"
    else
        echo -e "${RED}❌ TypeScript errors found${NC}"
        echo -e "${YELLOW}💡 Run: npx tsc --noEmit${NC}"
    fi
    echo ""
}

# Function to check port availability
check_ports() {
    echo -e "${BLUE}🔌 Checking port availability...${NC}"
    
    for port in 3000 3001 3002; do
        if lsof -i :$port > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Port $port is in use${NC}"
        else
            echo -e "${GREEN}✅ Port $port is available${NC}"
        fi
    done
    echo ""
}

# Function to try different startup methods
try_startup_methods() {
    echo -e "${BLUE}🚀 Trying different startup methods...${NC}"
    
    echo "Method 1: npm run dev"
    timeout 5 npm run dev > /dev/null 2>&1 &
    PID1=$!
    sleep 2
    if kill -0 $PID1 2>/dev/null; then
        echo -e "${GREEN}✅ npm run dev works${NC}"
        kill $PID1 2>/dev/null
    else
        echo -e "${RED}❌ npm run dev failed${NC}"
    fi
    
    echo "Method 2: npx next dev --port 3001"
    timeout 5 npx next dev --port 3001 > /dev/null 2>&1 &
    PID2=$!
    sleep 2
    if kill -0 $PID2 2>/dev/null; then
        echo -e "${GREEN}✅ npx next dev works${NC}"
        kill $PID2 2>/dev/null
    else
        echo -e "${RED}❌ npx next dev failed${NC}"
    fi
    echo ""
}

# Function to recommend fixes
recommend_fixes() {
    echo -e "${YELLOW}💡 Recommended fixes:${NC}"
    echo "1. Update package.json scripts to use specific port:"
    echo '   "dev": "next dev --port 3001"'
    echo ""
    echo "2. Clear Next.js cache:"
    echo "   rm -rf .next"
    echo ""
    echo "3. Reinstall dependencies:"
    echo "   rm -rf node_modules package-lock.json"
    echo "   npm install"
    echo ""
    echo "4. Run directly with npx:"
    echo "   npx next dev --port 3001"
    echo ""
}

# Main execution
cd /home/shakil/Projects/DamaDami/frontend

check_versions
check_dependencies
check_typescript
check_ports
try_startup_methods
recommend_fixes

echo -e "${GREEN}🏁 Troubleshooting complete!${NC}"
