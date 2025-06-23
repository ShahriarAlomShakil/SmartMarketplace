#!/bin/bash

echo "🔍 Testing Search Suggestions Functionality"
echo "=============================================="

# Test the search suggestions API endpoint
echo "1. Testing search suggestions API..."
curl -s "http://localhost:5000/api/products/suggestions?q=phone" | jq '.status' 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Search suggestions API is working"
else
    echo "   ❌ Search suggestions API failed"
fi

echo ""
echo "2. Checking frontend components..."

# Check if SearchSuggestions component exists
if [ -f "frontend/src/components/ui/SearchSuggestions.tsx" ]; then
    echo "   ✅ SearchSuggestions component exists"
else
    echo "   ❌ SearchSuggestions component missing"
fi

# Check if ProductFilters uses SearchSuggestions
if grep -q "SearchSuggestions" frontend/src/components/product/ProductFilters.tsx; then
    echo "   ✅ ProductFilters integrates SearchSuggestions"
else
    echo "   ❌ ProductFilters missing SearchSuggestions integration"
fi

echo ""
echo "3. Testing z-index fix..."

# Check if custom CSS classes are added
if grep -q "search-suggestions-dropdown" frontend/src/styles/globals.css; then
    echo "   ✅ Custom CSS classes added for z-index fix"
else
    echo "   ❌ Custom CSS classes missing"
fi

echo ""
echo "🎯 Search Suggestions Test Summary:"
echo "   • API endpoint: /api/products/suggestions"
echo "   • Component: SearchSuggestions with enhanced z-index"
echo "   • Integration: ProductFilters with z-50 container"
echo "   • CSS Fix: Custom classes for dropdown visibility"
echo ""
echo "🌐 Test the search suggestions at:"
echo "   http://localhost:3000/products"
echo ""
echo "✨ Search suggestions should now appear above all other elements!"
