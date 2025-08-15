import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Ticket } from '@/types';
import { TicketStatus } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const t = await prisma.ticket.findUnique({ where: { id } });
    if (!t) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    const response: ApiResponse<Ticket> = {
      success: true,
      data: {
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
      },
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
    const { id } = await params;
    const body = await request.json();
    
    const { performanceId, placeRow, placeNumber, customerPhoneNumber, customerName, referenceName, status } = body as Partial<Ticket> & { performanceId: string };
    
    // Validate required fields
    if (!performanceId || !placeRow || !placeNumber || !customerPhoneNumber || !customerName) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
  const updated = await prisma.ticket.update({
      where: { id },
      data: {
        performanceId,
        placeRow: String(placeRow),
        placeNumber: String(placeNumber),
        customerPhoneNumber,
        customerName,
        referenceName: referenceName || null,
    status: (status || 'paid') as TicketStatus,
      },
    });

    if (!updated) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Ticket not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Ticket> = {
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
      },
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
  const { id } = await params;
  const deleted = await prisma.ticket.delete({ where: { id } }).catch(() => null);
  if (!deleted) {
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
