// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    //Check for existing email OR username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { 
            username: {
              equals: username,
              mode: 'insensitive'
            }
          }
        ]
      }
    });

    if (existingUser) {
      const isEmail = existingUser.email === email;
      return NextResponse.json(
        { error: isEmail ? 'Email already registered' : 'Username already taken' },
        { status: 409 }
      );
    }

    //Hash password with argon2id
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });

    //Create user
    const user = await prisma.user.create({
      data: {
        email,
        username: username.trim(),
        password: hashedPassword
      }
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: { id: user.id, email: user.email, username: user.username }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}