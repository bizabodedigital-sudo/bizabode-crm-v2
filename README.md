# Bizabode QR Inventory + CRM System

A comprehensive inventory management and CRM system with QR code tracking, built with Next.js, TypeScript, and MongoDB.

## 🚀 Features

### Core Modules

- **Inventory Management**: Track items, stock levels, and movements with barcode/QR support
- **CRM Pipeline**: Complete sales funnel from leads to closed deals
- **Quotes & Invoices**: Generate and send professional PDF documents
- **Payment Tracking**: Record and manage customer payments
- **Delivery Management**: QR-based delivery confirmations
- **Analytics & Reports**: Sales funnel, pipeline value, and conversion metrics
- **Multi-tenancy**: Support for multiple companies with role-based access control
- **License Management**: Integration with Bizabode licensing API

### Technical Features

- **Authentication**: JWT-based authentication with role-based permissions
- **Real-time Updates**: Optimistic UI updates with Zustand state management
- **PDF Generation**: Automated quote and invoice PDF creation
- **Email Notifications**: Automated email sending for quotes, invoices, and payments
- **QR Code System**: Generate and verify QR codes for deliveries
- **Responsive Design**: Mobile-first UI with TailwindCSS and shadcn/ui

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB 6+ (local or MongoDB Atlas)
- SMTP email account (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd bizabode-crm
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bizabode-crm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@bizabode.com

# Bizabode License API
LICENSE_API_URL=https://api.bizabode.com/v1/license
LICENSE_API_KEY=your-license-api-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

4. **Start MongoDB**

```bash
# If using local MongoDB
mongod --dbpath /path/to/data/directory

# Or use MongoDB Atlas connection string in MONGODB_URI
```

5. **Run the development server**

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bizabode-crm/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── items/                # Inventory management
│   │   ├── leads/                # Lead management
│   │   ├── opportunities/        # Opportunity tracking
│   │   ├── quotes/               # Quote generation
│   │   ├── invoices/             # Invoice management
│   │   ├── payments/             # Payment tracking
│   │   ├── deliveries/           # Delivery management
│   │   ├── reports/              # Analytics & reports
│   │   └── license/              # License management
│   ├── dashboard/                # Dashboard pages
│   ├── inventory/                # Inventory pages
│   ├── crm/                      # CRM pages
│   └── ...
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard widgets
│   ├── inventory/                # Inventory components
│   ├── crm/                      # CRM components
│   └── ...
├── lib/                          # Utilities and configurations
│   ├── models/                   # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Company.ts
│   │   ├── Item.ts
│   │   ├── Lead.ts
│   │   ├── Opportunity.ts
│   │   ├── Quote.ts
│   │   ├── Invoice.ts
│   │   ├── Payment.ts
│   │   └── Delivery.ts
│   ├── middleware/               # API middleware
│   │   ├── auth.ts               # JWT authentication
│   │   └── rbac.ts               # Role-based access control
│   ├── services/                 # Business logic services
│   │   ├── pdf-service.ts        # PDF generation
│   │   ├── qr-service.ts         # QR code handling
│   │   ├── email-service.ts      # Email sending
│   │   └── license-service.ts    # License verification
│   ├── utils/                    # Helper functions
│   └── db.ts                     # Database connection
└── uploads/                      # File uploads directory

```

## 🔐 User Roles & Permissions

| Role      | Permissions                                                    |
| --------- | -------------------------------------------------------------- |
| Admin     | Full access to all features                                    |
| Manager   | Manage CRM, inventory (read), generate quotes/invoices         |
| Sales     | Manage leads, opportunities, quotes (read-only invoices)       |
| Warehouse | Manage inventory, stock movements, deliveries                  |
| Viewer    | Read-only access to all data                                   |

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Inventory

- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/adjust-stock` - Adjust stock levels

### CRM - Leads

- `GET /api/leads` - List all leads
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/convert` - Convert lead to opportunity

### CRM - Opportunities

- `GET /api/opportunities` - List all opportunities
- `POST /api/opportunities` - Create new opportunity
- `GET /api/opportunities/:id` - Get opportunity details
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### CRM - Quotes

- `GET /api/quotes` - List all quotes
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/:id` - Get quote details
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote
- `GET /api/quotes/:id/pdf` - Download quote PDF
- `POST /api/quotes/:id/send` - Send quote via email

### CRM - Invoices

- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice (draft only)
- `POST /api/invoices/:id/mark-paid` - Mark invoice as paid

### CRM - Deliveries

- `GET /api/deliveries` - List all deliveries
- `POST /api/deliveries` - Create new delivery
- `POST /api/deliveries/:id/confirm` - Confirm delivery with QR code

### Reports

- `GET /api/reports/sales-funnel` - Get sales funnel data
- `GET /api/reports/pipeline-value` - Get pipeline value metrics

### License

- `GET /api/license/status` - Get license status
- `POST /api/license/activate` - Activate license key

## 🔧 Configuration

### Email Setup (Gmail Example)

1. Enable 2-factor authentication in your Google account
2. Generate an app-specific password
3. Use these credentials in `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
```

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bizabode-crm?retryWrites=true&w=majority
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t bizabode-crm .

# Run container
docker run -p 3000:3000 --env-file .env.local bizabode-crm
```

## 🧪 Testing

```bash
# Run linter
pnpm lint

# Type checking
pnpm type-check
```

## 📝 Default Credentials (Development)

For testing, you can use:

- **Email**: admin@bizabode.com
- **Password**: demo123
- **License Key**: DEMO-LICENSE-KEY

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@bizabode.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting with charts
- [ ] WhatsApp integration for notifications
- [ ] Multi-currency support
- [ ] Automated backup system
- [ ] API webhooks
- [ ] Custom fields for CRM entities
- [ ] Email template customization
- [ ] Advanced analytics dashboard

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, and TailwindCSS**

