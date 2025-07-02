import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { AdminModel } from '@/lib/models';
import { comparePassword, generateToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { username, password } = body;
    if (!username || !password) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Username and password are required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find admin user
    const admin = await AdminModel.findOne({ 
      $or: [{ username }, { email: username }] 
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
      adminId: admin._id.toString(),
      username: admin.username,
      email: admin.email,
    });

    const response: ApiResponse<{ token: string; admin: object }> = {
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
        },
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
