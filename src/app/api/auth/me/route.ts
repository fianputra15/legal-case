import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserRepository } from "@/server/db/repositories/user.repository";
import { UserService } from "@/server/services";
import { ResponseHandler } from "@/server/utils/response";


/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user information
 *     description: |
 *       Retrieve information about the currently authenticated user using session cookie.
 *       Requires a valid JWT token stored in the "token" cookie.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             examples:
 *               client:
 *                 summary: Client user response
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       id: "cmkpizd280000fssdv9ltu6v6"
 *                       email: "client@example.com"
 *                       firstName: "Jane"
 *                       lastName: "Doe"
 *                       role: "CLIENT"
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                       updatedAt: "2024-01-16T14:20:00Z"
 *               lawyer:
 *                 summary: Lawyer user response
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       id: "cmklaw123456789"
 *                       email: "lawyer@legal.com"
 *                       firstName: "John"
 *                       lastName: "Smith"
 *                       role: "LAWYER"
 *                       createdAt: "2024-01-10T08:15:00Z"
 *                       updatedAt: "2024-01-15T16:45:00Z"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               missing_token:
 *                 summary: No authentication token provided
 *                 value:
 *                   error: "Unauthorized"
 *               invalid_token:
 *                 summary: Invalid or expired token
 *                 value:
 *                   error: "Invalid or expired token"
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "User not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

const userService = new UserService(new UserRepository());

export async function GET() {
  try {
    // Retrieve the "token" cookie from the request
    const token = (await cookies()).get("token")?.value;

    // If there is no token, return 401 Unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT using the secret
    // This should give us the userId encoded in the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId.toString());

    // If no user is found, return 404 Not Found
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If the user exists, return their details
    // return NextResponse.json({ user });
    return ResponseHandler.success({
      user: user,
    });
    
  } catch {
    // Catch any errors (invalid/expired token, DB error, etc.)
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}