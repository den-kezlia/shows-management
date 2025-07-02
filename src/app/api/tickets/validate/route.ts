import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TicketModel, PerformanceModel } from '@/lib/models';
import { parseQRCodeData } from '@/lib/qr-utils';
import { ApiResponse, TicketValidation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
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
    const ticket = await TicketModel.findById(parsedData.ticketId);
    if (!ticket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Find the performance
    const performance = await PerformanceModel.findById(ticket.performanceId);
    if (!performance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Validate ticket data matches QR data
    const isDataValid = 
      ticket.performanceId.toString() === parsedData.performanceId &&
      ticket.customerName === parsedData.customerName &&
      ticket.placeRow.toString() === parsedData.placeRow.toString() &&
      ticket.placeNumber.toString() === parsedData.placeNumber.toString();

    if (!isDataValid) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket data does not match QR code',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const alreadyVisited = ticket.isVisited;
    
    // Mark ticket as visited if not already visited
    if (!alreadyVisited) {
      ticket.isVisited = true;
      ticket.visitedAt = new Date();
      await ticket.save();
    }

    const validationResult: TicketValidation = {
      ticket: ticket.toObject(),
      performance: performance.toObject(),
      isValid: true,
      alreadyVisited,
    };
    
    const response: ApiResponse<TicketValidation> = {
      success: true,
      data: validationResult,
      message: alreadyVisited ? 'Ticket already used' : 'Ticket validated successfully',
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
