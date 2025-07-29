"use client";

import { useEffect, useState } from "react";

export default function SegmentationDebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching segmentation data...");
        const response = await fetch("/api/segmentation/segments");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Response data:", result);
        setData(result);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Segmentation Debug</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">API Response:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Test Links:</h2>
        <div className="space-y-2">
          <a
            href="/api/segmentation/segments"
            target="_blank"
            className="block text-blue-600 hover:underline"
          >
            /api/segmentation/segments
          </a>
          <a
            href="/dashboard/segmentation"
            target="_blank"
            className="block text-blue-600 hover:underline"
          >
            /dashboard/segmentation
          </a>
        </div>
      </div>
    </div>
  );
}
