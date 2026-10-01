import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password")
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid credentials format." }, { status: 400 });
  }

  // Foundation only: wire this endpoint to the real auth service.
  // Do not authenticate users from frontend-only code.
  return NextResponse.json(
    { message: "Authentication service is not connected yet." },
    { status: 501 }
  );
}