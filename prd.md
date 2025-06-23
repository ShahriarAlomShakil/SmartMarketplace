*# 📘 Product Requirements Document (PRD)

## 🧠 Project Title:
**Smart Marketplace – AI-Powered Buy & Sell Platform with Gemini Bargaining**

---

## 🧾 Summary:
Smart Marketplace is a web-based platform where users can **list products for sale** and buyers can **bargain with an AI agent** powered by **Gemini LLM**. Sellers define a base price and a minimum acceptable bargaining price. Buyers can negotiate with an intelligent AI that mimics human-like haggling behavior. The system uses **Google Gemini API** for all conversational logic.

---

## 🎯 Objectives:

- Provide a smooth and smart bargaining experience for online product trading.
- Simulate realistic negotiation using a Gemini-based AI agent.
- Allow users to list products with control over pricing thresholds.
- Facilitate quick, automated, and enjoyable negotiations.

---

## 👤 User Roles:

### 🧑 Seller:
- Registers and logs in
- Creates product listings with:
  - Title, images, description
  - Base price
  - Minimum acceptable price
  - Optional: urgency level, condition tag

### 🧑 Buyer:
- Browses listed products
- Starts a negotiation with the product’s AI seller agent
- Offers initial price and continues a limited negotiation loop
- Finalizes purchase if both parties agree

---

## 🧩 Key Features:

### 1. 🛍 Product Listing (Seller Side)
- Modern blurry card design with enhanced backdrop blur
- Image upload with preview in blurred containers
- Form with base price and lowest acceptable price
- Listings visible to all users with smooth animations
- Listing edit/delete feature with confirmation modals

### 2. 🤝 AI Negotiation (Buyer Side)
- Interactive chat interface with modern blurry design
- Real-time typing indicators with enhanced blur effects
- Gemini API generates seller-side responses
- Modern message bubbles with enhanced backdrop blur
- Stops at:
  - Agreement
  - Rejection by AI
  - Exceeding round limit (e.g., 5)

### 3. 🧠 Gemini Integration
- Uses Gemini API to simulate smart price negotiations
- Dynamic prompts include:
  - Product details
  - Buyer's offer
  - Seller's min/max range
- Adjustable tone: friendly, formal, aggressive (optional)

### 4. 📝 Negotiation History
- Logged per product and per user (for future display)
- Modern timeline view with glass-morphism cards
- Allows user to review previous offers/counter-offers
- Optional: save best deals reached

### 5. 🎨 Modern UI/UX Design
- Glass-morphism design elements throughout
- Backdrop blur effects on cards and modals
- Smooth transitions and micro-interactions
- Responsive design with mobile-first approach
- Dark/Light theme toggle with system preference detection

---

## 🎨 Design Guidelines:

### Visual Design Principles:
- **Modern Blurry Design**: Enhanced semi-transparent elements with stronger backdrop blur effects
- **Enhanced Blur**: Cards and containers with `backdrop-filter: blur(20px+)` CSS
- **Layered Depth**: Multiple enhanced blur levels for visual hierarchy
- **Smooth Shadows**: Enhanced drop shadows to improve modern aesthetic
- **Gradient Overlays**: More pronounced color gradients on background elements

### Color Palette:
- **Primary**: Modern blues with enhanced transparency (rgba(59, 130, 246, 0.9))
- **Secondary**: Soft purples and teals with stronger blur backgrounds
- **Neutral**: Light grays with enhanced modern effects for content areas
- **Accent**: Vibrant colors for CTAs with enhanced backdrop blur

### Typography:
- **Headings**: Clean sans-serif with semi-bold weights
- **Body**: High contrast for readability over blurred backgrounds
- **Interactive**: Clear hierarchy with proper color contrast

### Component Examples:
```css
/* Modern Blurry Card */
.modern-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Enhanced Blur Background */
.blur-background {
  background: linear-gradient(135deg, 
    rgba(74, 144, 226, 0.4) 0%, 
    rgba(159, 122, 234, 0.4) 100%);
  backdrop-filter: blur(24px);
}
```

---

## 🧰 Tech Stack:

| Layer           | Technology                             |
|------------------|----------------------------------------|
| Frontend         | Next.js, Tailwind CSS, Framer Motion   |
| Backend/API      | Express.js, Node.js                    |
| AI Integration   | Google Gemini API (LLM)                |
| Database         | MongoDB                                |
| Auth             | JWT Authentication                     |
| Image Handling   | Local File System                      |
| UI/UX            | Glass morphism, Backdrop blur effects  |

---

## 🗂 Folder Structure:

```
smart-marketplace/
├── frontend/                           # Client-side application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── BlurCard.tsx
│   │   │   │   ├── GlassButton.tsx
│   │   │   │   └── BackdropBlur.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ChatBox.tsx
│   │   │   ├── ListingForm.tsx
│   │   │   └── Navigation.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── sell.tsx
│   │   │   └── product/[id].tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useNegotiation.ts
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   └── constants.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       └── glass-morphism.css
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── backend/                            # Server-side application
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── productController.js
│   │   │   ├── userController.js
│   │   │   └── negotiationController.js
│   │   ├── models/
│   │   │   ├── Product.js
│   │   │   ├── User.js
│   │   │   └── Negotiation.js
│   │   ├── routes/
│   │   │   ├── products.js
│   │   │   ├── users.js
│   │   │   └── negotiations.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   └── imageService.js
│   │   ├── utils/
│   │   │   ├── promptTemplates.js
│   │   │   └── responseFormatter.js
│   │   └── config/
│   │       ├── database.js
│   │       └── gemini.js
│   ├── package.json
│   └── server.js
├── shared/                             # Shared types and utilities
│   ├── types/
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   └── Negotiation.ts
│   └── constants/
│       └── apiEndpoints.ts
├── .env.example
├── docker-compose.yml
├── prd.md
└── README.md
```



---

## 📈 Success Metrics:

- 90%+ completion of successful negotiation sessions
- Realistic and relevant counter-offers by Gemini
- Product listing and browsing UX is smooth and responsive
- Positive feedback from demo/test users

---

## 🤖 Sample Gemini Prompt Template:

```json
{
  "prompt": "You are acting as a seller AI for a used iPhone 13 listed at $500. The minimum acceptable price is $450. A buyer just offered $400. Respond in a friendly, concise way and give a counter-offer."
}
*