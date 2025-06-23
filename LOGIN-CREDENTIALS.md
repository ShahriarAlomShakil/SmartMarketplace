# 🔐 Smart Marketplace - Login Credentials

This document contains the default login credentials for the Smart Marketplace application.

## Default Admin Account

### **Administrator**
- **Email:** `admin@smartmarketplace.com`
- **Password:** `Admin123!`
- **Role:** Administrator
- **Username:** `admin`
- **Status:** Verified
- **Description:** Platform administrator with full access

---

## Test User Accounts

### **Seller Accounts**

#### **John Doe - Electronics Seller**
- **Email:** `john@example.com`
- **Password:** `Password123!`
- **Role:** Seller
- **Username:** `johnSeller`
- **Location:** San Francisco, CA, USA
- **Bio:** Electronics enthusiast selling quality gadgets
- **Rating:** 4.5/5 (23 reviews)
- **Status:** Verified

#### **Mike Johnson - Tech Collector**
- **Email:** `mike@example.com`
- **Password:** `Password123!`
- **Role:** Seller
- **Username:** `mikeTech`
- **Location:** Austin, TX, USA
- **Bio:** Tech collector with rare vintage computers
- **Rating:** 4.9/5 (31 reviews)
- **Status:** Verified

#### **Emily Chen - Artist**
- **Email:** `emily@example.com`
- **Password:** `Password123!`
- **Role:** Seller
- **Username:** `emilyArt`
- **Location:** Portland, OR, USA
- **Bio:** Artist selling handmade crafts and vintage finds
- **Rating:** 4.7/5 (18 reviews)
- **Status:** Verified

### **Buyer Accounts**

#### **Sarah Smith - Buyer**
- **Email:** `sarah@example.com`
- **Password:** `Password123!`
- **Role:** Buyer
- **Username:** `sarahBuyer`
- **Location:** New York, NY, USA
- **Bio:** Love finding great deals on unique items
- **Rating:** 4.8/5 (15 reviews)
- **Status:** Verified

---

## Password Requirements

All passwords in this system must meet the following criteria:
- Minimum 6 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

---

## Usage Notes

1. **Database Seeding Required:** These credentials are created by the database seeder when you first run the application
2. **Pre-verified Accounts:** All test accounts are pre-verified and ready to use immediately
3. **Role-based Access:** Different roles have different permissions:
   - **Admin:** Full platform access, user management, system settings
   - **Seller:** Can create and manage product listings, handle negotiations
   - **Buyer:** Can browse products, make offers, participate in negotiations
4. **Development Environment:** These credentials are intended for development and testing purposes only

---

## Security Recommendations

⚠️ **Important Security Notes:**
- Change default passwords in production environments
- These credentials should only be used for development and testing
- Never commit real user credentials to version control
- Implement proper authentication flows in production
- Use environment variables for sensitive configuration

---

## Quick Test Scenarios

### **Test as Admin**
- Login with admin credentials to access administrative features
- Manage users, products, and system settings

### **Test as Seller**
- Login with any seller account to create product listings
- Test the product creation and management workflow
- Handle buyer negotiations and offers

### **Test as Buyer**
- Login with the buyer account to browse products
- Test the negotiation and purchasing workflow
- Interact with sellers through the messaging system

---

## Database Seeding

To ensure these accounts are available, run the database seeder:

```bash
# Seed the database with test data
cd backend
node src/utils/database-init.js --seed

# Or clear and reseed
node src/utils/database-init.js --clear-first --seed
```

---

*Last Updated: June 23, 2025*
*Generated for Smart Marketplace Development Environment*
