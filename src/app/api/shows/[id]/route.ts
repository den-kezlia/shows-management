import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ShowModel, PerformanceModel } from '@/lib/models';
import { ApiResponse, Show } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const show = await ShowModel.findById(id);
    if (!show) {
      return NextResponse.json({ success: false, error: 'Show not found' } as ApiResponse, { status: 404 });
    }
    return NextResponse.json({ success: true, data: show.toObject() } as ApiResponse<Show>);
  } catch (error) {
    console.error('Error fetching show:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch show' } as ApiResponse, { status: 500 });
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
    const { name, description, performanceIds, mainImage, galleryImages } = body;
    const update: any = { name, description };
    if (Array.isArray(performanceIds)) {
      update.performanceIds = performanceIds;
    }
    if (typeof mainImage === 'string') {
      update.mainImage = mainImage;
    }
    if (Array.isArray(galleryImages)) {
      update.galleryImages = galleryImages;
    }
    const updated = await ShowModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    // If performanceIds provided, sync Performance.showId assignments
    if (Array.isArray(performanceIds)) {
      // Detach performances no longer in list
      await PerformanceModel.updateMany({ showId: id, _id: { $nin: performanceIds } }, { $unset: { showId: '' } });
      // Attach new ones
      await PerformanceModel.updateMany({ _id: { $in: performanceIds } }, { showId: id });
    }
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Show not found' } as ApiResponse, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated.toObject(), message: 'Show updated successfully' } as ApiResponse<Show>);
  } catch (error) {
    console.error('Error updating show:', error);
    return NextResponse.json({ success: false, error: 'Failed to update show' } as ApiResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await ShowModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Show not found' } as ApiResponse, { status: 404 });
    }
    // Optionally detach performances (set showId null)
    await PerformanceModel.updateMany({ showId: id }, { $unset: { showId: '' } });
    return NextResponse.json({ success: true, message: 'Show deleted successfully' } as ApiResponse);
  } catch (error) {
    console.error('Error deleting show:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete show' } as ApiResponse, { status: 500 });
  }
}
