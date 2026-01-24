import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserService } from "@/server/services";
import { UserRepository } from '@/server/db/repositories/user.repository';
import { ResponseHandler } from "@/server/utils/response";
import jwt from "jsonwebtoken";


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user credentials and set secure httpOnly cookie with JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             client:
 *               summary: Client login
 *               value:
 *                 email: "client@example.com"
 *                 password: "client123"
 *             lawyer:
 *               summary: Lawyer login
 *               value:
 *                 email: "lawyer@legal.com"
 *                 password: "lawyer123"
 *             admin:
 *               summary: Admin login
 *               value:
 *                 email: "admin@legal.com"
 *                 password: "admin123"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly authentication cookie
 *             schema:
 *               type: string
 *               example: "auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *             example:
 *               message: "Login successful"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid credentials"
 *               message: "Please check your email and password"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Validation failed"
 *               message: "Email is required"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */



const userService = new UserService(new UserRepository());

export async function POST(req: Request) {
  // 🔹 Parse the request body
  const { email, password } = await req.json();

  // 🔹 Validate required fields
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Authenticate user with constant-time password verification
  const user = await userService.authenticateUser(email, password);
  if (!user) {
    return ResponseHandler.unauthorized('Invalid credentials');
  }


  // 🔹 Generate JWT token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h", // token valid for 1 hour
  });

  // 🔹 Store JWT in a secure cookie
  //   - httpOnly: prevents JavaScript access (XSS protection)
  //   - secure: cookie only sent over HTTPS (enabled in production)
  //   - sameSite: strict, prevents CSRF attacks
  //   - maxAge: cookie expires after 1 hour
  //   - path: available throughout the app
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  // 🔹 Respond with success message
  return NextResponse.json({ message: "Login successful" });
}