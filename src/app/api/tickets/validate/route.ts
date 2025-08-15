import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseQRCodeData } from '@/lib/qr-utils';
import { ApiResponse, TicketValidation, Ticket } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { qrData } = body;
    if (!qrData) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'QR data is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse QR code data
    const parsedData = parseQRCodeData(qrData);
    if (!parsedData) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid QR code format',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

  // Find the ticket
  const ticket = await prisma.ticket.findUnique({ where: { id: parsedData.ticketId } });
  if (!ticket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

  // Find the performance
  const performance = await prisma.performance.findUnique({ where: { id: ticket.performanceId } });
  if (!performance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Validate ticket data matches QR data
    const isDataValid = 
  ticket.performanceId === parsedData.performanceId &&
  ticket.customerName === parsedData.customerName &&
  String(ticket.placeRow) === String(parsedData.placeRow) &&
  String(ticket.placeNumber) === String(parsedData.placeNumber);

    if (!isDataValid) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket data does not match QR code',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

  const alreadyVisited = ticket.isVisited;
    
    // Don't automatically mark as visited - wait for manual approval
    // if (!alreadyVisited) {
    //   ticket.isVisited = true;
    //   ticket.visitedAt = new Date();
    //   await ticket.save();
    // }

    const validationResult: TicketValidation = {
      ticket: {
        _id: ticket.id,
        performanceId: ticket.performanceId,
        placeRow: ticket.placeRow,
        placeNumber: ticket.placeNumber,
        customerPhoneNumber: ticket.customerPhoneNumber,
        customerName: ticket.customerName,
        referenceName: ticket.referenceName ?? undefined,
        qrCode: ticket.qrCode ?? undefined,
        status: ticket.status as Ticket['status'],
        isVisited: ticket.isVisited,
        visitedAt: ticket.visitedAt ?? undefined,
        approvedAt: ticket.approvedAt ?? undefined,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      performance: {
        _id: performance.id,
        name: performance.name,
        description: performance.description,
        photo: performance.photo ?? undefined,
        date: performance.date,
        venue: performance.venue ?? undefined,
        price: performance.price ?? undefined,
        showId: performance.showId ?? undefined,
        createdAt: performance.createdAt,
        updatedAt: performance.updatedAt,
      },
      isValid: true,
      alreadyVisited,
    };
    
    const response: ApiResponse<TicketValidation> = {
      success: true,
      data: validationResult,
      message: alreadyVisited ? 'Ticket already approved' : 'Ticket scanned successfully',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error validating ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to validate ticket',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
