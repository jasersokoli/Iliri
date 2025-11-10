# Iliri - Inventory Management System

A comprehensive inventory management web application for electrical stores, built with React and TypeScript. This application handles daily operations including stock control, sales tracking, supplier management, and client management.

## Features

### 🔐 Authentication & Security
- Secure login system with validation
- Session management with "Remember Me" option
- Password validation (minimum 8 characters)
- Account state management (active, disabled, locked)
- Login attempt logging

### 📊 Dashboard
- **Analytics Graphs:**
  - Total Sales
  - Total Revenue
  - Total Profit
  - Total Debt (Unpaid Invoices)
  - Inventory Value
- **Notification System:**
  - Real-time low stock alerts
  - System notifications
  - Mark as read functionality
- **Notes Section:** Internal reminders with localStorage persistence
- **Summary Tables:**
  - Top-selling products
  - Most active clients

### 📦 Resources Management

#### Articles (Products)
- List view with search and filtering (Active/Deleted/All)
- Inline editing for prices and stock levels
- Minimum stock tracking with automatic alerts
- Low stock highlighting (red background)
- Add/Edit/Delete functionality
- Code generation (Code 1 & Code 2)
- Duplicate prevention based on Code

#### Suppliers
- Full CRUD operations
- Search by name, code, or telephone
- Active/Inactive filtering
- Quick supplier selection dropdown

#### Clients
- Full CRUD operations
- Search by name, code, or telephone
- Active/Inactive filtering
- Unpaid clients highlighting
- Email and address fields

### 🛒 Purchases
- List all purchases with search and filtering
- Add new purchases with multiple items
- Automatic stock updates on purchase
- Purchase details modal with item breakdown
- Cost updates when purchasing at different prices
- Supplier filtering
- Date tracking

### 💳 Sales
- List all sales with search and filtering
- Add new sales with multiple items
- Payment status tracking (Paid/Unpaid)
- Client reference field (e.g., "Jaser's house")
- Price type selection (Price 1, Price 2, Price 3, Custom)
- Automatic stock deduction on sale
- Unpaid sales highlighting (red background)
- Real-time debt calculation updates

### 👤 Profile Management
- Account information display
- Change password (with session revocation)
- Change email (with verification flow)
- Theme preference (Light/Dark mode)
- Persistent theme storage

### 🖨️ Print Functionality
- Print button on all main sections
- Clean, formatted print layouts
- Automatic exclusion of UI elements (filters, sidebars)

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Recharts** - Analytics charts
- **date-fns** - Date formatting

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Iliri
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

## Default Login Credentials

For testing purposes, use these mock credentials:
- **Name:** `admin`
- **Password:** `password123`

> ⚠️ **Note:** These are mock credentials for development. Replace with actual authentication when connecting to a backend API.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout with sidebar and topbar
│   ├── Modal.tsx       # Modal component
│   ├── Resources/      # Resources-related components
│   ├── Purchases/      # Purchases-related components
│   └── Sales/          # Sales-related components
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Resources.tsx
│   ├── Purchases.tsx
│   ├── Sales.tsx
│   └── Profile.tsx
├── store/              # State management
│   ├── authStore.ts    # Authentication state
│   └── dataStore.ts    # Application data state
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── helpers.ts
├── App.tsx             # Main app component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Usage Guide

### Dashboard
- View real-time analytics and metrics
- Check notifications for low stock alerts
- Add internal notes for reminders
- View top-selling products and active clients

### Managing Articles
1. Navigate to **Resources** → **List Articles**
2. Search or filter articles as needed
3. Double-click any row to edit
4. Inline edit prices and stock by double-clicking cells
5. Add new article via **Add New Article** button

### Creating a Purchase
1. Navigate to **Purchases** → **Add New Purchase**
2. Select a supplier
3. Add articles by entering code or name
4. Set unit cost and quantity
5. Save to update inventory automatically

### Creating a Sale
1. Navigate to **Sales** → **Add New Sale**
2. Select a customer
3. Optionally add client reference
4. Add articles and select price type
5. Mark as "Not Paid" if needed (affects debt calculation)
6. Save to deduct from inventory

### Managing Suppliers/Clients
1. Navigate to **Resources**
2. Select **List Suppliers** or **List Clients**
3. Use search and filters to find records
4. Double-click to edit
5. Add new records via the **Add New** button

## Key Features Implementation

### Real-Time Analytics Updates
All analytics graphs and metrics update automatically when:
- A purchase is added/updated/deleted
- A sale is added/updated/deleted
- An article is added/updated/deleted
- Payment status changes on a sale

### Low Stock Notifications
- Automatically generated when article stock ≤ minimum stock
- Displayed in Dashboard notification table
- Highlighted in red in Articles list
- Can be marked as read

### Payment Status Tracking
- Unpaid sales contribute to Total Debt graph
- Paid sales contribute to Sales, Revenue, and Profit graphs
- Toggle payment status directly from Sales list
- Real-time analytics recalculation on status change

### Inline Editing
- Double-click on editable cells (Cost, Prices, Stock) in Articles list
- Changes saved on Enter or blur
- Escape to cancel

### Keyboard Navigation
- Full keyboard support throughout the application
- Tab navigation
- Enter to activate
- Escape to close modals

## Backend Integration

Currently, the application uses mock data stored in localStorage. To connect to a backend API:

1. **Update Authentication:**
   - Replace mock login in `src/store/authStore.ts`
   - Add API endpoints for authentication
   - Implement session token management

2. **Update Data Store:**
   - Replace localStorage operations in `src/store/dataStore.ts`
   - Add API service layer for CRUD operations
   - Implement error handling and loading states

3. **Add API Service:**
   - Create `src/services/api.ts` for HTTP requests
   - Configure base URL and interceptors
   - Add request/response transformers

4. **Environment Variables:**
   - Create `.env` file for API endpoints
   - Configure different environments (dev, staging, prod)

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The application uses mock authentication - replace with real API calls
- Data persistence is via localStorage - replace with backend API
- All dates are handled as JavaScript Date objects
- Currency formatting uses 2 decimal places
- Theme preference is stored per user

## Future Enhancements

- [ ] Backend API integration
- [ ] User roles and permissions
- [ ] Advanced reporting and exports
- [ ] Email notifications
- [ ] Barcode scanning support
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Mobile responsive improvements
- [ ] Offline mode support

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for efficient inventory management**

