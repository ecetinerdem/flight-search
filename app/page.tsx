import FlightSearch from "@/components/FlightSearch";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Flight Search</h1>
        <FlightSearch />
      </div>
    </main>
  );
}
