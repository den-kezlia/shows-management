import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Ticket } from '@/types';
import { TicketStatus } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { ticketId } = body;
    if (!ticketId) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket ID is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if ticket is in paid status
    if (ticket.status !== 'paid') {
      const errorResponse: ApiResponse = {
        success: false,
        error: `Cannot approve ticket with status: ${ticket.status}. Only paid tickets can be approved.`,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Update ticket status to approved
  const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
    status: 'approved' as TicketStatus,
        isVisited: true,
        visitedAt: new Date(),
        approvedAt: new Date(),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
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
      } as Ticket,
      message: 'Ticket approved successfully',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error approving ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to approve ticket',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
