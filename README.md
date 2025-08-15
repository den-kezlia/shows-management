# Tickets Agent v2 - Theater Ticket Management System

A full-stack app for managing theater shows, performances, tickets, and QR validation. Now powered by Next.js App Router, Prisma + Postgres, and Vercel Blob for images.

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
- **Backend**: Next.js App Router API routes
- **Database**: Postgres (Prisma ORM; Vercel Postgres recommended)
- **Authentication**: JWT-based admin authentication
- **QR Codes**: QR code generation and validation
- **Messaging**: Email (Nodemailer), Telegram Bot API, Viber Bot API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Postgres (Vercel Postgres or local)
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
   POSTGRES_URL=postgres://user:pass@host:5432/db
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   VIBER_BOT_TOKEN=your-viber-bot-token
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   BLOB_READ_WRITE_TOKEN=vercel-blob-token-here
   ```

4. **Prisma**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Run the Development Server**

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

```text
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # Next.js API routes (App Router)
│   ├── scanner/           # QR scanner page
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions and configurations
│   ├── prisma.ts         # Prisma client singleton
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

## 📦 Uploads

Images are uploaded to Vercel Blob via `/api/blob-upload`. Legacy `/api/upload` and `/api/images/*` return 410 and are deprecated.

## 🔁 One-off Migration: MongoDB -> Postgres (+ Blob)

If migrating existing Mongo data:

1. Add to `.env.local`:
   - MONGODB_URI (source)
   - POSTGRES_URL (target)
   - BLOB_READ_WRITE_TOKEN (for image uploads)
2. Prepare DB: `npm run prisma:generate && npm run prisma:migrate`
3. Run locally with ts-node:

```bash
npx ts-node scripts/migrate-mongo-to-postgres.ts
```

Notes:

- Upserts Admins, Shows, Performances, Tickets, preserving IDs where possible.
- Images already use Blob URLs; extend the script to fetch any binary images and upload with `uploadToBlob`.
- Seats uniqueness is enforced by Prisma unique index on Ticket: (performanceId, placeRow, placeNumber).

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
