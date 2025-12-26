import Navbar from "@/components/Navbar"; // Alias should work now

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="mt-16 min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold">Welcome to My App</h1>
      </div>
    </>
  );
}
