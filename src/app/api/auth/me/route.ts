import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserRepository } from "@/server/db/repositories/user.repository";
import { UserService } from "@/server/services";
import { ResponseHandler } from "@/server/utils/response";

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