import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TicketModel, PerformanceModel } from '@/lib/models';
import { generateQRCode, QRCodeData } from '@/lib/qr-utils';
import { sendTicketEmail, sendTicketViaTelegram, sendTicketViaViber } from '@/lib/messaging';
import { ApiResponse, Ticket } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const performanceId = searchParams.get('performanceId');
    
    let query = {};
    if (performanceId) {
      query = { performanceId };
    }
    
    const tickets = await TicketModel.find(query)
      .populate('performanceId')
      .sort({ createdAt: -1 });
    
    const response: ApiResponse<Ticket[]> = {
      success: true,
      data: tickets.map(t => t.toObject()),
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
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    const { performanceId, placeRow, placeNumber, customerPhoneNumber, customerName, referenceName } = body;
    if (!performanceId || !placeRow || !placeNumber || !customerPhoneNumber || !customerName || !referenceName) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if performance exists
    const performance = await PerformanceModel.findById(performanceId);
    if (!performance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if seat is already taken
    const existingTicket = await TicketModel.findOne({
      performanceId,
      placeRow,
      placeNumber,
    });

    if (existingTicket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Seat is already taken',
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Create ticket first to get the MongoDB ObjectId
    const ticket = new TicketModel({
      performanceId,
      placeRow,
      placeNumber,
      customerPhoneNumber,
      customerName,
      referenceName,
      isVisited: false,
    });

    const savedTicket = await ticket.save();
    
    // Generate QR code with the actual ticket ID
    const qrCodeData: QRCodeData = {
      ticketId: savedTicket._id.toString(),
      performanceId,
      customerName,
      placeRow,
      placeNumber,
      timestamp: Date.now(),
    };

    const qrCode = await generateQRCode(qrCodeData);
    
    // Update ticket with QR code
    savedTicket.qrCode = qrCode;
    await savedTicket.save();
    
    // Send ticket via requested channels
    const sendVia = body.sendVia as string[];
    const sendingPromises: Promise<void>[] = [];

    if (sendVia?.includes('email')) {
      sendingPromises.push(sendTicketEmail(savedTicket.toObject(), performance.toObject(), qrCode));
    }
    if (sendVia?.includes('telegram')) {
      sendingPromises.push(sendTicketViaTelegram(savedTicket.toObject(), performance.toObject(), qrCode));
    }
    if (sendVia?.includes('viber')) {
      sendingPromises.push(sendTicketViaViber(savedTicket.toObject(), performance.toObject(), qrCode));
    }

    // Execute all sending operations
    if (sendingPromises.length > 0) {
      try {
        await Promise.all(sendingPromises);
      } catch (sendError) {
        console.error('Error sending ticket:', sendError);
        // Continue even if sending fails
      }
    }
    
    const response: ApiResponse<Ticket> = {
      success: true,
      data: savedTicket.toObject(),
      message: 'Ticket created successfully',
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to create ticket',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
