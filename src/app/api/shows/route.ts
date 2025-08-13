import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ShowModel, PerformanceModel } from '@/lib/models';
import { ApiResponse, Show } from '@/types';

export async function GET() {
  try {
    await dbConnect();
    const shows = await ShowModel.find().sort({ createdAt: -1 });
    const response: ApiResponse<Show[]> = { success: true, data: shows.map(s => s.toObject()) };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch shows' } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
  const { name, description, performanceId, performanceIds, mainImage, galleryImages } = body;
    if (!name || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields: name, description' } as ApiResponse, { status: 400 });
    }

    // Normalize performance IDs array (merge single selection if provided)
    const combinedIds: string[] = Array.from(new Set([
      ...(Array.isArray(performanceIds) ? performanceIds : []),
      ...(performanceId ? [performanceId] : [])
    ])).filter(Boolean);

    const show = new ShowModel({
      name,
      description,
      initialPerformanceId: performanceId || null,
      performanceIds: combinedIds,
      mainImage: mainImage || null,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
    });
    const savedShow = await show.save();

    // Attach all selected performances
    if (combinedIds.length) {
      await PerformanceModel.updateMany({ _id: { $in: combinedIds } }, { showId: savedShow._id });
    }

    return NextResponse.json({ success: true, data: savedShow.toObject(), message: 'Show created successfully' } as ApiResponse<Show>, { status: 201 });
  } catch (error) {
    console.error('Error creating show:', error);
    return NextResponse.json({ success: false, error: 'Failed to create show' } as ApiResponse, { status: 500 });
  }
}
