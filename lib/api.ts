import type { SearchParams, FlightResult } from "@/types/flight";

const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
const API_BASE_URL = process.env.NEXT_PUBLIC_RAPIDAPI_BASE_URL;

export async function searchFlights(params: SearchParams): Promise<FlightResult[]> {
    if (!API_KEY || !API_HOST || !API_BASE_URL) {
      throw new Error(
        `Missing environment variables: ${[
          !API_KEY && "NEXT_PUBLIC_RAPIDAPI_KEY",
          !API_HOST && "NEXT_PUBLIC_RAPIDAPI_HOST",
          !API_BASE_URL && "NEXT_PUBLIC_RAPIDAPI_BASE_URL",
        ]
          .filter(Boolean)
          .join(", ")}`
      );
    }
  
    // Correct URL construction
    const url = `https://${API_BASE_URL}api/v1/flights/searchFlights`;  // Modified this line
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromSkyId: params.origin,
          toSkyId: params.destination,
          date: params.departDate,
          returnDate: params.returnDate,
          adult: "1",
          child: "0",
          infant: "0",
          cabin: "ECONOMY",
          currency: "USD",
        }),
      });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();

    // Type guard to ensure data has the expected structure
    if (!isValidFlightResponse(data)) {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected API response format");
      }

    // Map the API response to the FlightResult type
    return data.data.itinerary.legs.map((leg: any) => ({
        price: leg.pricingOptions?.[0]?.totalPrice ?? 0,
        airline: leg.operatingCarrier?.name ?? "Unknown Airline",
        departure: {
          time: leg.departure ?? "",
          airport: leg.origin?.name ?? "",
        },
        arrival: {
          time: leg.arrival ?? "",
          airport: leg.destination?.name ?? "",
        },
        duration: formatDuration(leg.duration),
      }));
    } catch (error) {
      console.error("Error in searchFlights:", error);
      throw error instanceof Error
        ? error
        : new Error(typeof error === "object" ? JSON.stringify(error) : "Unknown error occurred");
    }
  }

// Helper functions remain the same
function isValidFlightResponse(data: any): boolean {
    return (
      data?.status === true &&
      data?.data?.itinerary?.legs?.length > 0 &&
      Array.isArray(data.data.itinerary.legs)
    );
  }
  
  function formatDuration(minutes?: number): string {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }