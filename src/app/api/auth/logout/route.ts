import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: |
 *       Log out the current user by clearing the authentication cookie.
 *       This endpoint always returns success even if no user was logged in.
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             description: Clears authentication cookie
 *             schema:
 *               type: string
 *               example: "token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out"
 */
export async function POST() {
  const res = NextResponse.json({ message: "Logged out" }, { status: 200 });

  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return res;
}