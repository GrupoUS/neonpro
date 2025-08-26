export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg text-gray-600">This page could not be found.</p>
      <a href="/" className="mt-4 text-blue-600 hover:underline">
        Return Home
      </a>
    </div>
  );
}