"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchFlights } from "@/lib/api";
import type { FlightResult } from "@/types/flight";
import { useToast } from "../hooks/use-toast";

export default function FlightSearch() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FlightResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departDate) return;

    setIsLoading(true);
    setResults([]);
    try {
      const searchParams = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departDate: format(departDate, "yyyy-MM-dd"),
        ...(returnDate && { returnDate: format(returnDate, "yyyy-MM-dd") }),
      };

      console.log("Search params:", searchParams);
      const flights = await searchFlights(searchParams);
      console.log("Search results:", flights);
      setResults(flights);

      if (flights.length === 0) {
        toast({
          title: "No Flights Found",
          description:
            "No flights match your search criteria. Please try different dates or airports.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Search Flights</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="origin">From</label>
              <Input
                id="origin"
                placeholder="Enter origin airport code (e.g., LAX)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="destination">To</label>
              <Input
                id="destination"
                placeholder="Enter destination airport code (e.g., JFK)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label>Departure Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !departDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departDate ? format(departDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departDate}
                    onSelect={setDepartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label>Return Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Plane className="mr-2 h-4 w-4" />
                Search Flights
              </>
            )}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-8 grid gap-4">
            {results.map((flight, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold">${flight.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {flight.airline}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <div className="font-semibold">Departure</div>
                        <div className="text-muted-foreground">
                          {flight.departure.time}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {flight.departure.airport}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">Duration</div>
                        <div className="text-muted-foreground">
                          {flight.duration}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">Arrival</div>
                        <div className="text-muted-foreground">
                          {flight.arrival.time}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {flight.arrival.airport}
                        </div>
                      </div>
                    </div>
                    <Button>Select</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
