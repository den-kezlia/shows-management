import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Performance } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const showId = request.nextUrl.searchParams.get('showId');
  const performances = await prisma.performance.findMany({
      where: showId ? { showId } : undefined,
      orderBy: { date: 'asc' },
    });
    
    const response: ApiResponse<Performance[]> = {
      success: true,
      data: performances.map(p => ({
        _id: p.id,
        name: p.name,
        description: p.description,
        photo: p.photo ?? undefined,
        date: p.date as unknown as Date,
        venue: p.venue ?? undefined,
        price: p.price ?? undefined,
        showId: p.showId ?? undefined,
        createdAt: p.createdAt as unknown as Date,
        updatedAt: p.updatedAt as unknown as Date,
      })),
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
    const body = await request.json();
    
    // Validate required fields
  const { name, description, date, venue, price, showId } = body;
    if (!name || !description || !date) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields: name, description, date',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

  const savedPerformance = await prisma.performance.create({
      data: {
        name,
        description,
        photo: body.photo || null,
        date: new Date(date),
        venue: venue || '',
        price: price ? parseFloat(price) : 0,
        showId: showId || undefined,
      },
    });
    
    const response: ApiResponse<Performance> = {
      success: true,
      data: {
        _id: savedPerformance.id,
        name: savedPerformance.name,
        description: savedPerformance.description,
        photo: savedPerformance.photo ?? undefined,
        date: savedPerformance.date as unknown as Date,
        venue: savedPerformance.venue ?? undefined,
        price: savedPerformance.price ?? undefined,
        showId: savedPerformance.showId ?? undefined,
        createdAt: savedPerformance.createdAt as unknown as Date,
        updatedAt: savedPerformance.updatedAt as unknown as Date,
      },
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
