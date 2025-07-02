import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TicketModel } from '@/lib/models';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
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
    const ticket = await TicketModel.findById(ticketId);
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
    ticket.status = 'approved';
    ticket.isVisited = true;
    ticket.visitedAt = new Date();
    ticket.approvedAt = new Date();
    await ticket.save();

    const response: ApiResponse = {
      success: true,
      data: ticket.toObject(),
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
