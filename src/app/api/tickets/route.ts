import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRCode, QRCodeData } from '@/lib/qr-utils';
import { sendTicketEmail, sendTicketViaTelegram, sendTicketViaViber } from '@/lib/messaging';
import { ApiResponse, Ticket, Performance } from '@/types';
import { TicketStatus } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const performanceId = searchParams.get('performanceId') || undefined;

    const tickets = await prisma.ticket.findMany({
      where: performanceId ? { performanceId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse<Ticket[]> = {
      success: true,
      data: tickets.map((t) => ({
        _id: t.id,
        performanceId: t.performanceId,
        placeRow: t.placeRow,
        placeNumber: t.placeNumber,
        customerPhoneNumber: t.customerPhoneNumber,
        customerName: t.customerName,
        referenceName: t.referenceName ?? undefined,
        qrCode: t.qrCode ?? undefined,
        status: t.status as Ticket['status'],
        isVisited: t.isVisited,
        visitedAt: t.visitedAt ?? undefined,
        approvedAt: t.approvedAt ?? undefined,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch tickets',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Create ticket request body:', body);

    const {
      performanceId,
      placeRow,
      placeNumber,
      customerPhoneNumber,
      customerName,
      referenceName,
      status,
    } = body as Partial<Ticket> & { performanceId: string };

    if (!performanceId || !placeRow || !placeNumber || !customerPhoneNumber || !customerName) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Ensure performance exists
    const performanceRecord = await prisma.performance.findUnique({ where: { id: performanceId } });
    if (!performanceRecord) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if seat is already taken
    const conflicting = await prisma.ticket.findFirst({
      where: {
        performanceId,
        placeRow: String(placeRow),
        placeNumber: String(placeNumber),
      },
    });
    if (conflicting) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Seat is already taken',
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Create the ticket (without QR first)
  const created = await prisma.ticket.create({
      data: {
        performanceId,
        placeRow: String(placeRow),
        placeNumber: String(placeNumber),
        customerPhoneNumber,
        customerName,
        referenceName: referenceName || null,
    status: (status || 'pending') as TicketStatus,
        isVisited: false,
      },
    });

    // Generate QR code with the actual ticket ID
    const qrCodeData: QRCodeData = {
      ticketId: created.id,
      performanceId,
      customerName,
      placeRow: String(placeRow),
      placeNumber: String(placeNumber),
      timestamp: Date.now(),
    };
    const qrCode = await generateQRCode(qrCodeData);

  const updated = await prisma.ticket.update({
      where: { id: created.id },
      data: { qrCode },
    });

    // Optional: send via channels
    const sendVia = Array.isArray((body as { sendVia?: string[] }).sendVia)
      ? (body as { sendVia?: string[] }).sendVia
      : undefined;
    const perf: Performance = {
      _id: performanceRecord.id,
      name: performanceRecord.name,
      description: performanceRecord.description,
      photo: performanceRecord.photo ?? undefined,
      date: performanceRecord.date,
      venue: performanceRecord.venue ?? undefined,
      price: performanceRecord.price ?? undefined,
      showId: performanceRecord.showId ?? undefined,
      createdAt: performanceRecord.createdAt,
      updatedAt: performanceRecord.updatedAt,
    };

    const ticketForMsg: Ticket = {
      _id: updated.id,
      performanceId: updated.performanceId,
      placeRow: updated.placeRow,
      placeNumber: updated.placeNumber,
      customerPhoneNumber: updated.customerPhoneNumber,
      customerName: updated.customerName,
      referenceName: updated.referenceName ?? undefined,
      qrCode: updated.qrCode ?? undefined,
      status: updated.status as Ticket['status'],
      isVisited: updated.isVisited,
      visitedAt: updated.visitedAt ?? undefined,
      approvedAt: updated.approvedAt ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    if (sendVia?.length) {
      const promises: Promise<void>[] = [];
      if (sendVia.includes('email')) promises.push(sendTicketEmail(ticketForMsg, perf, qrCode));
      if (sendVia.includes('telegram')) promises.push(sendTicketViaTelegram(ticketForMsg, perf, qrCode));
      if (sendVia.includes('viber')) promises.push(sendTicketViaViber(ticketForMsg, perf, qrCode));
      try {
        await Promise.all(promises);
      } catch (e) {
        console.error('Error sending ticket:', e);
      }
    }

    const response: ApiResponse<Ticket> = {
      success: true,
      data: ticketForMsg,
      message: 'Ticket created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to create ticket' + (error instanceof Error ? `: ${error.message}` : ''),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
