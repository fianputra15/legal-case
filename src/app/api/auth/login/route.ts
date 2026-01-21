import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserService } from "@/server/services";
import { UserRepository } from '@/server/db/repositories/user.repository';
import { ResponseHandler } from "@/server/utils/response";
import jwt from "jsonwebtoken";

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