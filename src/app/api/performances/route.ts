import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PerformanceModel } from '@/lib/models';
import { ApiResponse, Performance } from '@/types';

export async function GET() {
  try {
    await dbConnect();
    const performances = await PerformanceModel.find().sort({ date: 1 });
    
    const response: ApiResponse<Performance[]> = {
      success: true,
      data: performances.map(p => p.toObject()),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching performances:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch performances',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    const { name, description, date, venue, price } = body;
    if (!name || !description || !date) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields: name, description, date',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const performance = new PerformanceModel({
      name,
      description,
      photo: body.photo || null,
      date: new Date(date),
      venue: venue || '',
      price: price ? parseFloat(price) : 0,
    });

    const savedPerformance = await performance.save();
    
    const response: ApiResponse<Performance> = {
      success: true,
      data: savedPerformance.toObject(),
      message: 'Performance created successfully',
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating performance:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to create performance',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
