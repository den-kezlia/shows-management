import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { AdminModel } from '@/lib/models';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'No token provided',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify JWT token
    const payload = verifyToken(token);
    if (!payload) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid or expired token',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check if admin still exists in database
    const admin = await AdminModel.findById(payload.adminId);
    if (!admin) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Admin user not found',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const response: ApiResponse<{ admin: object }> = {
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
        },
      },
      message: 'Token is valid',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error verifying token:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Token verification failed',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
