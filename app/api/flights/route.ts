// app/api/flights/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
const API_BASE_URL = process.env.NEXT_PUBLIC_RAPIDAPI_BASE_URL;

export async function POST(request: Request) {
  try {
    // Log environment variables (excluding API key)
    console.log('API Host:', API_HOST);
    console.log('API Base URL:', API_BASE_URL);
    
    // Validate environment variables
    if (!API_KEY || !API_HOST || !API_BASE_URL) {
      console.error('Missing environment variables:', {
        hasApiKey: !!API_KEY,
        hasApiHost: !!API_HOST,
        hasBaseUrl: !!API_BASE_URL
      });
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    const url = `https://${API_BASE_URL}/searchFlights`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromSkyId: body.origin,
        toSkyId: body.destination,
        date: body.departDate,
        returnDate: body.returnDate,
        adult: "1",
        child: "0",
        infant: "0",
        cabin: "ECONOMY",
        currency: "USD",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${response.statusText}\n${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successful API response:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error in flight search:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}