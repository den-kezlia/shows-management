import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Performance } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
  const performance = await prisma.performance.findUnique({ where: { id } });
    
    if (!performance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Performance> = {
      success: true,
      data: {
        _id: performance.id,
        name: performance.name,
        description: performance.description,
        photo: performance.photo ?? undefined,
        date: performance.date as unknown as Date,
        venue: performance.venue ?? undefined,
        price: performance.price ?? undefined,
        showId: performance.showId ?? undefined,
        createdAt: performance.createdAt as unknown as Date,
        updatedAt: performance.updatedAt as unknown as Date,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching performance:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch performance',
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
    const updatedPerformance = await prisma.performance.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        photo: body.photo,
        date: new Date(body.date),
        venue: body.venue,
        price: body.price,
      },
    });
    
    if (!updatedPerformance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Performance> = {
      success: true,
      data: {
        _id: updatedPerformance.id,
        name: updatedPerformance.name,
        description: updatedPerformance.description,
        photo: updatedPerformance.photo ?? undefined,
        date: updatedPerformance.date as unknown as Date,
        venue: updatedPerformance.venue ?? undefined,
        price: updatedPerformance.price ?? undefined,
        showId: updatedPerformance.showId ?? undefined,
        createdAt: updatedPerformance.createdAt as unknown as Date,
        updatedAt: updatedPerformance.updatedAt as unknown as Date,
      },
      message: 'Performance updated successfully',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating performance:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to update performance',
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
  const deletedPerformance = await prisma.performance.delete({ where: { id } });
  if (!deletedPerformance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Performance deleted successfully',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting performance:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to delete performance',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
