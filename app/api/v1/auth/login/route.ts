import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // In a real application, you would validate the password and username.
    // For demo purposes, we will return the mock success payload directly.
    return NextResponse.json({
      token: "demo-token",
      user: {
        id: "u1",
        role: "admin"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
