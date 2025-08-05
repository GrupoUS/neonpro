"use client";

import { trpc } from "@/utils/trpc";

export function TRPCTest() {
  const { data: hello, isLoading: helloLoading } = trpc.hello.useQuery({
    text: "NeonPro",
  });

  const { data: status, isLoading: statusLoading } = trpc.getSystemStatus.useQuery();

  const { data: health, isLoading: healthLoading } = trpc.healthCheck.useQuery();

  if (helloLoading || statusLoading || healthLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-700">🔄 Carregando dados do tRPC...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-green-700 mb-4">✅ tRPC Funcionando!</h2>

      {/* Hello Test */}
      <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
        <h3 className="font-medium text-green-800">Hello Test:</h3>
        <p className="text-green-700">{hello?.greeting}</p>
        <small className="text-green-600">{hello?.timestamp}</small>
      </div>

      {/* System Status */}
      <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
        <h3 className="font-medium text-blue-800">System Status:</h3>
        <p className="text-blue-700">Status: {status?.status}</p>
        <p className="text-blue-700">Platform: {status?.platform}</p>
        <p className="text-blue-700">Version: {status?.version}</p>
        <small className="text-blue-600">Uptime: {status?.uptime?.toFixed(2)}s</small>
      </div>

      {/* Health Check */}
      <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
        <h3 className="font-medium text-purple-800">Health Check:</h3>
        <p className="text-purple-700">{health?.message}</p>
        <p className="text-purple-700">Environment: {health?.environment}</p>
        <small className="text-purple-600">{health?.timestamp}</small>
      </div>
    </div>
  );
}
