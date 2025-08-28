"use client";

// Simplified Chat Interface - placeholder implementation
interface ChatInterfaceProps {
  interface_type?: "external" | "internal";
  className?: string;
  placeholder?: string;
}

export default function ChatInterface({
  interface_type = "external",
  className,
  placeholder,
}: ChatInterfaceProps) {
  return (
    <div className={className}>
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold text-lg">Chat Interface</h3>
        <p className="text-gray-600">
          {interface_type === "external" ? "External" : "Internal"}{" "}
          chat interface will be implemented in a future version.
        </p>
        <input
          className="mt-2 w-full rounded border p-2"
          disabled
          placeholder={placeholder || "Type a message..."}
          type="text"
        />
      </div>
    </div>
  );
}
