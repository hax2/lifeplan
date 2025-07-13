import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from '@prisma/client'; // Import Prisma types

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    // This is the corrected, type-safe error handling block
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property is now accessible in a type-safe way
      if (error.code === 'P2002') {
        return NextResponse.json({ error: "Email already exists." }, { status: 409 });
      }
    }
    // For all other errors, return a generic message
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}