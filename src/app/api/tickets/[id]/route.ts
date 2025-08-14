import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TicketModel } from '@/lib/models';
import { ApiResponse, Ticket } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const ticket = await TicketModel.findById(id).populate('performanceId');
    
    if (!ticket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Ticket> = {
      success: true,
      data: ticket.toObject(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch ticket',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
  const { performanceId, placeRow, placeNumber, customerPhoneNumber, customerName, referenceName, status } = body;
    
    // Validate required fields
    if (!performanceId || !placeRow || !placeNumber || !customerPhoneNumber || !customerName) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const ticket = await TicketModel.findByIdAndUpdate(
      id,
      {
        performanceId,
        placeRow: parseInt(placeRow) || 1,
        placeNumber: parseInt(placeNumber) || 1,
        customerPhoneNumber,
        customerName,
        referenceName,
        status: status || 'paid',
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('performanceId');
    
    if (!ticket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Ticket> = {
      success: true,
      data: ticket.toObject(),
      message: 'Ticket updated successfully',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to update ticket',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const ticket = await TicketModel.findByIdAndDelete(id);
    
    if (!ticket) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Ticket deleted successfully',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting ticket:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to delete ticket',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
