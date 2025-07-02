import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PerformanceModel } from '@/lib/models';
import { ApiResponse, Performance } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const performance = await PerformanceModel.findById(id);
    
    if (!performance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Performance> = {
      success: true,
      data: performance.toObject(),
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
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const updatedPerformance = await PerformanceModel.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        photo: body.photo,
        date: new Date(body.date),
        venue: body.venue,
        price: body.price,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedPerformance) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Performance not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const response: ApiResponse<Performance> = {
      success: true,
      data: updatedPerformance.toObject(),
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
    await dbConnect();
    const { id } = await params;
    
    const deletedPerformance = await PerformanceModel.findByIdAndDelete(id);
    
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
