# Tickets Agent v2 - Theater Ticket Management System

A comprehensive full-stack web application for managing theater performances, creating tickets, and validating entries with QR codes. Built with Next.js, Express.js, MongoDB, and shadcn/ui.

## 🎭 Features

- **Performance Management**: Create and manage theater performances with details, photos, and schedules
- **Ticket Generation**: Generate tickets with QR codes for specific seats and customers
- **Multi-Channel Delivery**: Send tickets via Email, Telegram, or Viber
- **QR Code Validation**: Scan and validate tickets at venue entrances
- **Admin Panel**: Complete management interface for performances and tickets
- **Responsive Design**: Works on both desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Express.js API layer
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based admin authentication
- **QR Codes**: QR code generation and validation
- **Messaging**: Email (Nodemailer), Telegram Bot API, Viber Bot API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- (Optional) SMTP server for email functionality
- (Optional) Telegram Bot Token for Telegram integration
- (Optional) Viber Bot Token for Viber integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickets-agent-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tickets-agent-v2
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   VIBER_BOT_TOKEN=your-viber-bot-token
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or ensure your MongoDB Atlas connection is configured
   ```

5. **Create an Admin User**
   ```bash
   # Create a simple script to add an admin user to MongoDB
   # This is a one-time setup step
   ```

6. **Run the Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📱 Usage

### Admin Panel
1. Navigate to `/admin` and log in with admin credentials
2. Access the dashboard to manage performances and tickets
3. Create new performances with details and photos
4. Generate tickets for specific seats and customers
5. Send tickets via email, Telegram, or Viber

### QR Scanner
1. Navigate to `/scanner` for ticket validation
2. Upload QR code images or use camera scanner
3. Validate tickets and prevent duplicate entries
4. Track entry status and timing

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── scanner/           # QR scanner page
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions and configurations
│   ├── models.ts         # MongoDB models
│   ├── db.ts             # Database connection
│   ├── auth.ts           # Authentication utilities
│   ├── qr-utils.ts       # QR code utilities
│   ├── messaging.ts      # Email/Telegram/Viber integration
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

## 🔧 API Endpoints

### Performances
- `GET /api/performances` - List all performances
- `POST /api/performances` - Create new performance
- `GET /api/performances/[id]` - Get specific performance
- `PUT /api/performances/[id]` - Update performance
- `DELETE /api/performances/[id]` - Delete performance

### Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create new ticket
- `POST /api/tickets/validate` - Validate QR code

### Authentication
- `POST /api/auth/login` - Admin login

## 🧪 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📧 Messaging Integration

### Email Setup
Configure SMTP settings in `.env.local` for email ticket delivery.

### Telegram Bot Setup
1. Create a bot via @BotFather on Telegram
2. Get the bot token and add it to `.env.local`
3. Users need to start a conversation with your bot

### Viber Bot Setup
1. Create a Viber bot account
2. Get the bot token and add it to `.env.local`
3. Configure webhook endpoints as needed

## 🔒 Security Considerations

- Change JWT secret in production
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Validate and sanitize all user inputs

## 🚀 Deployment

The application can be deployed to various platforms:

- **Vercel**: Native Next.js support
- **Railway**: Full-stack application support
- **Heroku**: Docker or buildpack deployment
- **DigitalOcean App Platform**: Container-based deployment

Ensure environment variables are configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [ ] Real-time camera QR scanning
- [ ] WhatsApp integration
- [ ] SMS ticket delivery
- [ ] Advanced analytics dashboard
- [ ] Bulk ticket operations
- [ ] Seating chart visualization
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Customer portal
