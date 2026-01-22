import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { Logger } from '@/server/utils/logger';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';

const userService = new UserService(new UserRepository());

/**
 * GET /api/lawyers/available - Get list of available lawyers
 * 
 * Authorization: Authenticated users only
 * Returns list of lawyers with their specializations and ratings
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication first - using same pattern as /me route
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT using the secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Mock lawyers data - in real app this would come from database
    const mockLawyers = [
      {
        id: "lawyer1",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@lawfirm.com",
        specialization: "Employment Law",
        experience: 8,
        rating: 4.8,
        hourlyRate: 350,
        profileImage: null,
        hasRequestedAccess: false
      },
      {
        id: "lawyer2", 
        firstName: "Michael",
        lastName: "Wong",
        email: "michael@legalpartners.com",
        specialization: "Employment & Labor Law",
        experience: 12,
        rating: 4.9,
        hourlyRate: 450,
        profileImage: null,
        hasRequestedAccess: false
      },
      {
        id: "lawyer3",
        firstName: "Linda",
        lastName: "Tan",
        email: "linda@advocategroup.com", 
        specialization: "Contract & Employment Law",
        experience: 6,
        rating: 4.7,
        hourlyRate: 300,
        profileImage: null,
        hasRequestedAccess: false
      },
      {
        id: "lawyer4",
        firstName: "David",
        lastName: "Lee",
        email: "david@legalexperts.com", 
        specialization: "Corporate & Employment Law",
        experience: 15,
        rating: 4.9,
        hourlyRate: 500,
        profileImage: null,
        hasRequestedAccess: false
      }
    ];

    Logger.info(`Available lawyers fetched by user ${user.email}`);

    return ResponseHandler.success(mockLawyers, 'Lawyers retrieved successfully');

  } catch (error) {
    Logger.error('Get available lawyers error:', error);
    return ResponseHandler.internalError('Failed to retrieve lawyers');
  }
}