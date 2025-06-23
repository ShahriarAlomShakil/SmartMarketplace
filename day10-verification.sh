#!/bin/bash

# Day 10 Verification Script
echo "🚀 Day 10 - Product Detail & Advanced Search Verification"
echo "=================================================="

# Check if development server is running
echo "1. Checking development servers..."
if pgrep -f "next dev" > /dev/null; then
    echo "   ✅ Frontend server is running"
else
    echo "   ❌ Frontend server is not running"
fi

if pgrep -f "node.*server.js" > /dev/null; then
    echo "   ✅ Backend server is running"
else
    echo "   ❌ Backend server is not running"
fi

# Check backend API endpoints
echo -e "\n2. Testing API endpoints..."

# Test search suggestions endpoint
echo "   Testing search suggestions..."
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/products/suggestions?q=test")
if [ "$response" = "200" ]; then
    echo "   ✅ Search suggestions endpoint working"
else
    echo "   ❌ Search suggestions endpoint failed (HTTP $response)"
fi

# Test categories endpoint
echo "   Testing categories endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/products/categories")
if [ "$response" = "200" ]; then
    echo "   ✅ Categories endpoint working"
else
    echo "   ❌ Categories endpoint failed (HTTP $response)"
fi

# Check frontend components
echo -e "\n3. Checking frontend components..."

components=(
    "frontend/src/pages/products/[id].tsx"
    "frontend/src/components/product/RelatedProducts.tsx"
    "frontend/src/components/product/ProductFilters.tsx"
    "frontend/src/components/ui/SearchSuggestions.tsx"
    "frontend/src/components/ui/ImageLightbox.tsx"
    "frontend/src/components/product/ImageGallery.tsx"
)

for component in "${components[@]}"; do
    if [ -f "/home/shakil/Projects/DamaDami/$component" ]; then
        echo "   ✅ $component exists"
    else
        echo "   ❌ $component missing"
    fi
done

# Check backend enhancements
echo -e "\n4. Checking backend enhancements..."

# Check for search suggestions controller
if grep -q "getSearchSuggestions" "/home/shakil/Projects/DamaDami/backend/src/controllers/productController.js"; then
    echo "   ✅ Search suggestions controller implemented"
else
    echo "   ❌ Search suggestions controller missing"
fi

# Check for suggestions route
if grep -q "/suggestions" "/home/shakil/Projects/DamaDami/backend/src/routes/products.js"; then
    echo "   ✅ Search suggestions route defined"
else
    echo "   ❌ Search suggestions route missing"
fi

# Test database connection
echo -e "\n5. Testing database connection..."
response=$(curl -s "http://localhost:5000/api/products?limit=1")
if echo "$response" | grep -q '"status":"success"'; then
    echo "   ✅ Database connection working"
else
    echo "   ❌ Database connection failed"
fi

echo -e "\n🎉 Day 10 Verification Complete!"
echo "=================================================="

# Summary
echo -e "\n📊 Summary of Day 10 Features:"
echo "   • Enhanced product detail page with image gallery"
echo "   • Advanced search with autocomplete suggestions"
echo "   • Related products recommendation system"
echo "   • Improved seller profile display"
echo "   • Like/share functionality"
echo "   • Mobile-responsive design"
echo "   • Modern blur UI effects"
echo ""
echo "🔗 Test URLs:"
echo "   • Frontend: http://localhost:3000"
echo "   • Products: http://localhost:3000/products"
echo "   • API: http://localhost:5000/api/products"
echo ""
echo "✨ Day 10 implementation is ready for testing!"
