import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { ApiResponse } from '@/types';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { username, password } = body;
    if (!username || !password) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Username and password are required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find admin user (by username or email)
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username as string },
          { email: username as string },
        ],
      },
    });

    if (!admin) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid credentials',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check password
  const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid credentials',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({
  adminId: admin.id,
  username: admin.username,
  email: admin.email,
    });

    const response: ApiResponse<{ token: string; admin: object }> = {
      success: true,
      data: {
        token,
  admin: { id: admin.id, username: admin.username, email: admin.email },
      },
      message: 'Login successful',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error during login:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Login failed',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
