#!/bin/bash

# Day 20 Verification Script - Advanced Notifications and Analytics Features
# This script verifies the implementation of Day 20 requirements

echo "🔍 DAY 20 VERIFICATION: Advanced Notifications and Analytics Features"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verification counters
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Function to check if file exists and contains specific content
check_file_content() {
    local file="$1"
    local content="$2"
    local description="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        if grep -q "$content" "$file"; then
            echo -e "${GREEN}✓${NC} $description"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${RED}✗${NC} $description (content not found)"
        fi
    else
        echo -e "${RED}✗${NC} $description (file not found)"
    fi
}

# Function to check if file exists
check_file_exists() {
    local file="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $description"
    fi
}

echo -e "${BLUE}📱 NOTIFICATION SYSTEM VERIFICATION${NC}"
echo "--------------------------------------------"

# 1. Notification Center Component
check_file_exists "frontend/src/components/notifications/NotificationCenter.tsx" "Notification Center component exists"
check_file_content "frontend/src/components/notifications/NotificationCenter.tsx" "blur" "Notification Center has blur background styling"
check_file_content "frontend/src/components/notifications/NotificationCenter.tsx" "backdrop-blur" "Notification Center uses backdrop blur"

# 2. Notification Preferences
check_file_exists "frontend/src/components/notifications/NotificationPreferences.tsx" "Notification Preferences component exists"
check_file_content "frontend/src/components/notifications/NotificationPreferences.tsx" "categories" "Notification preferences has category settings"
check_file_content "frontend/src/components/notifications/NotificationPreferences.tsx" "quietHours" "Notification preferences has quiet hours"

# 3. Notification Service
check_file_exists "frontend/src/services/NotificationService.ts" "Notification Service exists"
check_file_content "frontend/src/services/NotificationService.ts" "browser" "Notification Service supports browser notifications"
check_file_content "frontend/src/services/NotificationService.ts" "email" "Notification Service supports email notifications"
check_file_content "frontend/src/services/NotificationService.ts" "push" "Notification Service supports push notifications"

# 4. Service Worker for Push Notifications
check_file_exists "frontend/public/sw.js" "Service Worker for push notifications exists"
check_file_content "frontend/public/sw.js" "push" "Service Worker handles push events"
check_file_content "frontend/public/sw.js" "notificationclick" "Service Worker handles notification clicks"

# 5. Email Service Backend
check_file_exists "backend/src/services/emailService.js" "Email Service backend exists"
check_file_content "backend/src/services/emailService.js" "template" "Email Service supports templates"
check_file_content "backend/src/services/emailService.js" "sendNotification" "Email Service can send notifications"

# 6. Dashboard Integration
check_file_content "frontend/src/pages/dashboard.tsx" "NotificationCenter" "Notification Center integrated in dashboard"
check_file_content "frontend/src/pages/dashboard.tsx" "notifications" "Dashboard has notification tab"

echo ""
echo -e "${BLUE}📊 ANALYTICS SYSTEM VERIFICATION${NC}"
echo "----------------------------------------"

# 7. Analytics Dashboard Component
check_file_exists "frontend/src/components/analytics/AnalyticsDashboard.tsx" "Analytics Dashboard component exists"
check_file_content "frontend/src/components/analytics/AnalyticsDashboard.tsx" "user.*admin" "Analytics Dashboard supports user/admin modes"
check_file_content "frontend/src/components/analytics/AnalyticsDashboard.tsx" "export" "Analytics Dashboard has export functionality"

# 8. Analytics Service
check_file_exists "frontend/src/services/AnalyticsService.ts" "Analytics Service exists"
check_file_content "frontend/src/services/AnalyticsService.ts" "trackEvent" "Analytics Service tracks events"
check_file_content "frontend/src/services/AnalyticsService.ts" "realtime" "Analytics Service supports real-time updates"
check_file_content "frontend/src/services/AnalyticsService.ts" "generateReport" "Analytics Service can generate reports"

# 9. Analytics Types
check_file_exists "frontend/src/types/Analytics.ts" "Analytics type definitions exist"
check_file_content "frontend/src/types/Analytics.ts" "UserAnalytics" "User analytics types defined"
check_file_content "frontend/src/types/Analytics.ts" "NegotiationAnalytics" "Negotiation analytics types defined"
check_file_content "frontend/src/types/Analytics.ts" "AnalyticsReport" "Analytics report types defined"

# 10. Backend Analytics
check_file_exists "backend/src/services/conversationAnalytics.js" "Backend conversation analytics exists"
check_file_content "backend/src/services/conversationAnalytics.js" "generateReport" "Backend can generate analytics reports"
check_file_content "backend/src/services/conversationAnalytics.js" "insights" "Backend provides analytics insights"

# 11. Profile Analytics
check_file_exists "frontend/src/components/profile/ProfileAnalytics.tsx" "Profile Analytics component exists"
check_file_content "frontend/src/components/profile/ProfileAnalytics.tsx" "timeRange" "Profile Analytics has time range selection"

# 12. Product Analytics
check_file_exists "frontend/src/components/product/ProductAnalytics.tsx" "Product Analytics component exists"
check_file_content "frontend/src/components/product/ProductAnalytics.tsx" "views.*negotiations" "Product Analytics tracks views and negotiations"

# 13. Dashboard Integration
check_file_content "frontend/src/pages/dashboard.tsx" "AnalyticsDashboard" "Analytics Dashboard integrated in main dashboard"
check_file_content "frontend/src/pages/dashboard.tsx" "analytics" "Dashboard has analytics tab"

echo ""
echo -e "${BLUE}🔧 API ENDPOINTS VERIFICATION${NC}"
echo "------------------------------------"

# 14. Analytics API Routes
check_file_content "backend/src/routes/profile.js" "analytics" "Profile analytics API endpoint exists"
check_file_content "backend/src/routes/negotiations.js" "analytics" "Negotiation analytics API endpoint exists"
check_file_content "backend/src/routes/ai.js" "analytics" "AI analytics API endpoint exists"
check_file_content "backend/src/routes/ai.js" "export-analytics" "Analytics export API endpoint exists"

echo ""
echo -e "${BLUE}🎨 UI/UX FEATURES VERIFICATION${NC}"
echo "-----------------------------------"

# 15. Modern Design Elements
check_file_content "frontend/src/components/notifications/NotificationCenter.tsx" "motion" "Notification Center uses animations"
check_file_content "frontend/src/components/analytics/AnalyticsDashboard.tsx" "motion" "Analytics Dashboard uses animations"
check_file_content "frontend/src/components/notifications/NotificationCenter.tsx" "ModernButton\|ModernBadge" "Notification Center uses modern UI components"
check_file_content "frontend/src/components/analytics/AnalyticsDashboard.tsx" "ModernButton\|ModernBadge" "Analytics Dashboard uses modern UI components"

# 16. Responsive Design
check_file_content "frontend/src/components/notifications/NotificationCenter.tsx" "md:" "Notification Center is responsive"
check_file_content "frontend/src/components/analytics/AnalyticsDashboard.tsx" "md:\|lg:" "Analytics Dashboard is responsive"

echo ""
echo -e "${BLUE}📈 FEATURE COMPLETENESS CHECK${NC}"
echo "-----------------------------------"

# 17. Real-time Notifications
check_file_content "frontend/src/services/NotificationService.ts" "WebSocket\|socket" "Real-time notification delivery implemented"

# 18. Custom Report Generation
check_file_content "frontend/src/services/AnalyticsService.ts" "pdf\|csv\|xlsx" "Custom report formats supported"

# 19. User Behavior Tracking
check_file_content "frontend/src/services/AnalyticsService.ts" "trackUserAction\|trackEvent" "User behavior tracking implemented"

# 20. Performance Insights
check_file_content "frontend/src/types/Analytics.ts" "performance.*metrics" "Performance insights types defined"

echo ""
echo "=============================================================="
echo -e "${BLUE}📋 VERIFICATION SUMMARY${NC}"
echo "=============================================================="

PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $((TOTAL_CHECKS - PASSED_CHECKS))"
echo "Success Rate: $PERCENTAGE%"

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Day 20 implementation is highly complete${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}✅ GOOD! Day 20 implementation is mostly complete${NC}"
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  FAIR! Day 20 implementation needs some improvements${NC}"
else
    echo -e "${RED}❌ NEEDS WORK! Day 20 implementation requires significant improvements${NC}"
fi

echo ""
echo -e "${BLUE}🚀 NEXT STEPS FOR COMPLETION:${NC}"
echo "1. Test notification system end-to-end"
echo "2. Verify analytics data accuracy"
echo "3. Test report generation and export"
echo "4. Perform mobile responsiveness testing"
echo "5. Conduct accessibility testing"
echo "6. Load test real-time features"

exit 0
