import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, interests, regions, topics } = await request.json();

    // Basic validation
    if (!firstName || !lastName || !email || !interests || interests.length === 0) {
      return NextResponse.json(
        { error: 'First name, last name, email, and at least one interest are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Google Sheets Web App URL
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!GOOGLE_SCRIPT_URL) {
      console.error('GOOGLE_SHEETS_WEBHOOK_URL not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Send data to Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        interests: interests.join(', '),
        regions: regions?.join(', ') || '',
        topics: topics?.join(', ') || '',
        subscriptionDate: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Error saving data');
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error during newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Error during registration. Please try again.' },
      { status: 500 }
    );
  }
}
