import { Schema, model, models } from 'mongoose';
import { Performance, Ticket, Admin } from '@/types';

// Performance Schema
const performanceSchema = new Schema<Performance>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String },
    date: { type: Date, required: true },
    venue: { type: String },
    price: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Ticket Schema
const ticketSchema = new Schema<Ticket>(
  {
    performanceId: { type: String, required: true, ref: 'Performance' },
    placeRow: { type: Schema.Types.Mixed, required: true },
    placeNumber: { type: Schema.Types.Mixed, required: true },
    customerPhoneNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    referenceName: { type: String, required: true },
    qrCode: { type: String },
    status: { type: String, enum: ['paid', 'approved', 'pending'], default: 'paid' },
    isVisited: { type: Boolean, default: false },
    visitedAt: { type: Date },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Admin Schema
const adminSchema = new Schema<Admin>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
ticketSchema.index({ performanceId: 1, placeRow: 1, placeNumber: 1 });
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ referenceName: 1 });

// Export models
export const PerformanceModel = models.Performance || model<Performance>('Performance', performanceSchema);
export const TicketModel = models.Ticket || model<Ticket>('Ticket', ticketSchema);
export const AdminModel = models.Admin || model<Admin>('Admin', adminSchema);
