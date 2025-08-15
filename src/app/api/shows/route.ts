import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Show } from '@/types';

export async function GET() {
  try {
    const shows = await prisma.show.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = shows.map((s) => ({
      _id: s.id,
      name: s.name,
      description: s.description,
      mainImage: s.mainImage ?? undefined,
      galleryImages: s.galleryImages ?? [],
      createdAt: s.createdAt as unknown as Date,
      updatedAt: s.updatedAt as unknown as Date,
    }));
    const response: ApiResponse<Show[]> = { success: true, data: mapped };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch shows' } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

  const savedShow = await prisma.show.create({
      data: {
        name,
        description,
        mainImage: mainImage || null,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      },
    });

    if (combinedIds.length) {
      await prisma.performance.updateMany({
        where: { id: { in: combinedIds } },
        data: { showId: savedShow.id },
      });
    }

    const mappedShow: Show = {
      _id: savedShow.id,
      name: savedShow.name,
      description: savedShow.description,
      mainImage: savedShow.mainImage ?? undefined,
      galleryImages: savedShow.galleryImages ?? [],
      createdAt: savedShow.createdAt as unknown as Date,
      updatedAt: savedShow.updatedAt as unknown as Date,
    };
    return NextResponse.json({ success: true, data: mappedShow, message: 'Show created successfully' } as ApiResponse<Show>, { status: 201 });
  } catch (error) {
    console.error('Error creating show:', error);
    return NextResponse.json({ success: false, error: 'Failed to create show' } as ApiResponse, { status: 500 });
  }
}
