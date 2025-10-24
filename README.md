# 🏢 Bizabode CRM

A comprehensive, modern Customer Relationship Management system built with Next.js 14, TypeScript, and MongoDB. Features multi-tenancy, real-time updates, and a complete suite of business management tools.

## ✨ Features

### 🎯 Core CRM
- **Customer Management** - Complete customer lifecycle management
- **Lead Tracking** - Advanced lead scoring and conversion tracking
- **Sales Pipeline** - Visual sales process management
- **Activity Logging** - Comprehensive interaction history
- **Document Management** - Secure file storage and sharing

### 📦 Inventory Management
- **Stock Tracking** - Real-time inventory monitoring
- **Low Stock Alerts** - Automated reorder notifications
- **Bulk Import/Export** - CSV/Excel data management
- **Analytics Dashboard** - Inventory insights and trends

### 👥 Human Resources
- **Employee Management** - Complete HR records
- **Attendance Tracking** - Time and attendance management
- **Leave Management** - Vacation and sick leave tracking
- **Payroll System** - Automated payroll calculations

### 🛒 Procurement
- **Supplier Management** - Vendor relationship tracking
- **Purchase Orders** - Automated PO generation
- **Approval Workflows** - Multi-level approval processes
- **Cost Tracking** - Budget and expense management

### 📊 Analytics & Reporting
- **Real-time Dashboards** - Key performance indicators
- **Custom Reports** - Flexible reporting system
- **Data Export** - PDF, CSV, Excel export options
- **Visual Charts** - Interactive data visualization

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- MongoDB (or use Docker)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/bizabode-crm.git
cd bizabode-crm
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.production.example .env

# Edit environment variables
nano .env
```

### 3. Deploy with Docker
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 4. Access Application
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| **App** | 3000 | Main Next.js application |
| **MongoDB** | 27017 | Database server |
| **Redis** | 6379 | Caching and sessions |
| **Nginx** | 80/443 | Reverse proxy and load balancer |

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint
```

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bizabode_crm

# Authentication
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret

# Application
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 📁 Project Structure

```
bizabode-crm/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── crm/               # CRM pages
│   ├── hr/                # HR pages
│   ├── inventory/         # Inventory pages
│   └── procurement/       # Procurement pages
├── components/            # React components
│   ├── crm/              # CRM components
│   ├── hr/               # HR components
│   ├── inventory/        # Inventory components
│   ├── shared/           # Shared components
│   └── ui/               # UI components
├── lib/                  # Utilities and configurations
│   ├── api-client-config.ts  # Centralized API client
│   ├── utils/            # Utility functions
│   └── models/           # Database models
├── docker-compose.yml    # Docker services
├── Dockerfile           # Application container
└── nginx.conf           # Nginx configuration
```

## 🔧 Configuration

### Database Setup
The application automatically creates:
- Database indexes for optimal performance
- Initial collections
- User authentication setup

### Security Features
- **Multi-tenancy** - Complete data isolation
- **Role-based Access** - Granular permissions
- **API Rate Limiting** - DDoS protection
- **Input Validation** - XSS and injection prevention
- **Secure Headers** - Security best practices

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis health
docker-compose exec redis redis-cli ping
```

### Logs
```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f app
```

## 🚀 Deployment

### Coolify Deployment (Recommended)
For easy deployment on Coolify, see the [Coolify Deployment Guide](COOLIFY_DEPLOYMENT_README.md) for step-by-step instructions.

### Local Docker Deployment
```bash
# Use production configuration
docker-compose -f docker-compose.coolify.yml up -d
```

### Environment-Specific Configs
- **Development:** `docker-compose.yml`
- **Coolify:** `docker-compose.coolify.yml`
- **Production:** `Dockerfile.production`

## 🔒 Security

### Environment Security
- Never commit `.env` files
- Use strong, unique secrets
- Rotate credentials regularly
- Enable HTTPS in production

### Application Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

## 📈 Performance

### Optimization Features
- **Database Indexing** - Optimized queries
- **Caching** - Redis-based caching
- **CDN Ready** - Static asset optimization
- **Load Balancing** - Horizontal scaling support

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Resource monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)

## 🆘 Support

### Common Issues
1. **Port conflicts** - Check if ports 3000, 27017, 6379 are available
2. **Database connection** - Verify MongoDB is running
3. **Environment variables** - Ensure all required variables are set

### Getting Help
- Check the [Issues](https://github.com/yourusername/bizabode-crm/issues) page
- Review the [Documentation](docs/)
- Contact support: support@bizabode.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the robust database
- All contributors and users

---

**Built with ❤️ for modern businesses**