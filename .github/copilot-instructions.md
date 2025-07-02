<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Tickets Agent v2 - Theater Ticket Management System

This is a full-stack web application built with:
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js API layer with MongoDB for data persistence
- **Authentication**: JWT-based admin authentication
- **Features**: Performance management, ticket creation, QR code generation/validation, multi-channel messaging

## Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components using shadcn/ui
- `src/lib/` - Utility functions, database models, and configurations
- `src/api/` - Express.js API routes and middleware
- `src/types/` - TypeScript type definitions

## Key Features
1. **Admin Panel**: CRUD operations for performances and tickets
2. **QR Code System**: Generation and validation for ticket verification
3. **Messaging Integration**: Email, Telegram, and Viber ticket delivery
4. **Responsive Design**: Mobile and desktop compatible interface
5. **Ticket Validation**: Scan QR codes to validate and prevent duplicate check-ins

## Development Guidelines
- Use TypeScript for all code
- Follow Next.js App Router conventions
- Use shadcn/ui components for consistent UI
- Implement proper error handling and validation
- Use MongoDB with Mongoose for data persistence
- Ensure mobile-responsive design patterns
