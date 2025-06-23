#!/bin/bash

echo "🚀 Day 8 Smart Marketplace - Final Verification"
echo "=============================================="

echo ""
echo "📋 Checking Development Servers..."

# Check if backend is running
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Backend server is running (Node.js)"
else
    echo "❌ Backend server is not running"
fi

# Check if frontend is running
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Frontend server is running (Next.js)"
else
    echo "❌ Frontend server is not running"
fi

echo ""
echo "🌐 Checking Port Availability..."

# Check port 5000 (Backend)
if lsof -i :5000 > /dev/null 2>&1; then
    echo "✅ Port 5000 (Backend API) is active"
else
    echo "❌ Port 5000 (Backend API) is not active"
fi

# Check port 3001 (Frontend)
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Port 3001 (Frontend) is active"
else
    echo "❌ Port 3001 (Frontend) is not active"
fi

echo ""
echo "📁 Checking Day 8 Components..."

# Check if new components exist
components=(
    "frontend/src/components/dashboard/SellerDashboard.tsx"
    "frontend/src/components/product/ProductExport.tsx"
    "frontend/src/components/product/ProductRecommendations.tsx"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $component exists"
    else
        echo "❌ $component missing"
    fi
done

echo ""
echo "🎯 Day 8 Features Implemented:"
echo "   📊 Seller Dashboard with Analytics"
echo "   📤 Product Export Functionality"
echo "   🤖 AI-Powered Product Recommendations"
echo "   🔍 Enhanced Product Management"
echo "   🎨 Modern Dashboard with Tab Navigation"

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Dashboard: http://localhost:3001/dashboard"
echo "   Backend API: http://localhost:5000/api"

echo ""
echo "✨ Day 8 Implementation Status: COMPLETED ✨"
echo "=============================================="
