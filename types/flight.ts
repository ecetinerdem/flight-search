export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}

export interface FlightResult {
  price: number;
  airline: string;
  departure: {
    time: string;
    airport: string;
  };
  arrival: {
    time: string;
    airport: string;
  };
  duration: string;
}