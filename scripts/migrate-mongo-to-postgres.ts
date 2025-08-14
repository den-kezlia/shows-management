#!/usr/bin/env ts-node
/**
 * One-off migration script: MongoDB -> Postgres (Prisma) and Images -> Vercel Blob
 *
 * Steps:
 * 1) Read Mongo collections (Shows, Performances, Tickets, Admins, Images)
 * 2) Create records in Postgres via Prisma with same IDs when possible
 * 3) For images, upload binary to Vercel Blob and store returned URLs
 *
 * Usage (local):
 *   1) Ensure env: MONGODB_URI, POSTGRES_URL, BLOB_READ_WRITE_TOKEN
 *   2) npm i -g ts-node (or use npx ts-node)
 *   3) npx ts-node scripts/migrate-mongo-to-postgres.ts
 */

import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';
import { PrismaClient, TicketStatus } from '@prisma/client';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

// Minimal Mongo schemas to read existing data
const PerformanceSchema = new Schema({
  _id: String,
  name: String,
  description: String,
  photo: String,
  date: Date,
  venue: String,
  price: Number,
  showId: String,
}, { collection: 'performances' });

const ShowSchema = new Schema({
  _id: String,
  name: String,
  description: String,
  mainImage: String,
  galleryImages: [String],
  performanceIds: [String],
}, { collection: 'shows' });

const TicketSchema = new Schema({
  _id: String,
  performanceId: String,
  placeRow: Schema.Types.Mixed,
  placeNumber: Schema.Types.Mixed,
  customerPhoneNumber: String,
  customerName: String,
  referenceName: String,
  qrCode: String,
  status: String,
  isVisited: Boolean,
  visitedAt: Date,
  approvedAt: Date,
}, { collection: 'tickets' });

const AdminSchema = new Schema({
  _id: String,
  username: String,
  email: String,
  password: String,
}, { collection: 'admins' });

const ImageSchema = new Schema({
  filename: String,
  contentType: String,
  size: Number,
  data: Buffer,
}, { collection: 'images' });

const PerformanceM = model('Performance', PerformanceSchema);
const ShowM = model('Show', ShowSchema);
const TicketM = model('Ticket', TicketSchema);
const AdminM = model('Admin', AdminSchema);
const ImageM = model('Image', ImageSchema);

async function uploadToBlob(name: string, buf: Buffer, contentType = 'application/octet-stream') {
  const key = `migration/${Date.now()}-${name.replace(/[^a-z0-9._-]/gi, '_')}`;
  const { url } = await put(key, new Blob([new Uint8Array(buf)], { type: contentType }), { access: 'public', addRandomSuffix: false });
  return url;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is required for migration');

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Admins
  const admins = await AdminM.find().lean();
  for (const a of admins) {
    if (!a.email || !a.username || !a.password) continue;
    await prisma.admin.upsert({
      where: { email: a.email as string },
      update: { username: a.username as string, password: a.password as string },
      create: { id: String(a._id), username: a.username as string, email: a.email as string, password: a.password as string },
    });
  }
  console.log(`Migrated admins: ${admins.length}`);

  // Shows first (without perf link)
  const shows = await ShowM.find().lean();
  for (const s of shows) {
    const mainImage = s.mainImage || null;
    // If legacy DB stored binary images, try to re-upload — optional: query ImageM if applicable
    // Here we assume string URLs already; add custom lookup if needed.
    await prisma.show.upsert({
      where: { id: String(s._id) },
      update: { name: (s.name || 'Untitled') as string, description: (s.description || '') as string, mainImage, galleryImages: (s.galleryImages || []) as string[] },
      create: { id: String(s._id), name: (s.name || 'Untitled') as string, description: (s.description || '') as string, mainImage, galleryImages: (s.galleryImages || []) as string[] },
    });
  }
  console.log(`Migrated shows: ${shows.length}`);

  // Performances
  const perfs = await PerformanceM.find().lean();
  for (const p of perfs) {
  await prisma.performance.upsert({
      where: { id: String(p._id) },
      update: {
    name: (p.name || 'Untitled') as string,
    description: (p.description || '') as string,
        photo: p.photo || null,
    date: new Date(p.date || Date.now()),
        venue: p.venue || null,
        price: p.price ?? null,
        showId: p.showId || null,
      },
      create: {
        id: String(p._id),
    name: (p.name || 'Untitled') as string,
    description: (p.description || '') as string,
        photo: p.photo || null,
    date: new Date(p.date || Date.now()),
        venue: p.venue || null,
        price: p.price ?? null,
        showId: p.showId || null,
      },
    });
  }
  console.log(`Migrated performances: ${perfs.length}`);

  // Re-sync show.performanceIds implicitly via showId foreign key; nothing else needed.

  // Tickets
  const tickets = await TicketM.find().lean();
  for (const t of tickets) {
  await prisma.ticket.upsert({
      where: { id: String(t._id) },
      update: {
    performanceId: (t.performanceId || '') as string,
        placeRow: String(t.placeRow),
        placeNumber: String(t.placeNumber),
    customerPhoneNumber: (t.customerPhoneNumber || '') as string,
    customerName: (t.customerName || '') as string,
        referenceName: t.referenceName || null,
        qrCode: t.qrCode || null,
        status: (t.status || 'pending') as TicketStatus,
        isVisited: !!t.isVisited,
        visitedAt: t.visitedAt || null,
        approvedAt: t.approvedAt || null,
      },
      create: {
        id: String(t._id),
    performanceId: (t.performanceId || '') as string,
        placeRow: String(t.placeRow),
        placeNumber: String(t.placeNumber),
    customerPhoneNumber: (t.customerPhoneNumber || '') as string,
    customerName: (t.customerName || '') as string,
        referenceName: t.referenceName || null,
        qrCode: t.qrCode || null,
        status: (t.status || 'pending') as TicketStatus,
        isVisited: !!t.isVisited,
        visitedAt: t.visitedAt || null,
        approvedAt: t.approvedAt || null,
      },
    });
  }
  console.log(`Migrated tickets: ${tickets.length}`);

  await mongoose.disconnect();
  await prisma.$disconnect();
  console.log('Migration complete');
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
