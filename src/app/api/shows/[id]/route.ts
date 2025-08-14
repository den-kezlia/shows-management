import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Show } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const show = await prisma.show.findUnique({ where: { id } });
  if (!show) {
      return NextResponse.json({ success: false, error: 'Show not found' } as ApiResponse, { status: 404 });
    }
    const mapped: Show = {
      _id: show.id,
      name: show.name,
      description: show.description,
      mainImage: show.mainImage ?? undefined,
      galleryImages: show.galleryImages ?? [],
      createdAt: show.createdAt as unknown as Date,
      updatedAt: show.updatedAt as unknown as Date,
    };
    return NextResponse.json({ success: true, data: mapped } as ApiResponse<Show>);
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
    const { id } = await params;
    const body = await request.json();
    const { name, description, performanceIds, mainImage, galleryImages } = body as {
      name?: string;
      description?: string;
      performanceIds?: string[];
      mainImage?: string;
      galleryImages?: string[];
    };
    const update: Partial<Show & { performanceIds: string[] }> = { name: name as string, description: description as string };
    if (Array.isArray(performanceIds)) {
      update.performanceIds = performanceIds;
    }
    if (typeof mainImage === 'string') {
      update.mainImage = mainImage;
    }
    if (Array.isArray(galleryImages)) {
      update.galleryImages = galleryImages;
    }
  const updated = await prisma.show.update({ where: { id }, data: update });
    // If performanceIds provided, sync Performance.showId assignments
    if (Array.isArray(performanceIds)) {
      // Detach performances no longer in list
      await prisma.performance.updateMany({ where: { showId: id, NOT: { id: { in: performanceIds } } }, data: { showId: null } });
      // Attach new ones
      await prisma.performance.updateMany({ where: { id: { in: performanceIds } }, data: { showId: id } });
    }
    const mapped: Show = {
      _id: updated.id,
      name: updated.name,
      description: updated.description,
      mainImage: updated.mainImage ?? undefined,
      galleryImages: updated.galleryImages ?? [],
      createdAt: updated.createdAt as unknown as Date,
      updatedAt: updated.updatedAt as unknown as Date,
    };
    return NextResponse.json({ success: true, data: mapped, message: 'Show updated successfully' } as ApiResponse<Show>);
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
    const { id } = await params;
  await prisma.show.delete({ where: { id } });
  // Detach performances
  await prisma.performance.updateMany({ where: { showId: id }, data: { showId: null } });
    return NextResponse.json({ success: true, message: 'Show deleted successfully' } as ApiResponse);
  } catch (error) {
    console.error('Error deleting show:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete show' } as ApiResponse, { status: 500 });
  }
}
