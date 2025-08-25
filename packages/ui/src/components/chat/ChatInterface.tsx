"use client";

// Simplified Chat Interface - placeholder implementation
interface ChatInterfaceProps {
	interface_type?: "external" | "internal";
	className?: string;
	placeholder?: string;
}

export default function ChatInterface({ interface_type = "external", className, placeholder }: ChatInterfaceProps) {
	return (
		<div className={className}>
			<div className="p-4 border rounded-lg">
				<h3 className="text-lg font-semibold">Chat Interface</h3>
				<p className="text-gray-600">
					{interface_type === "external" ? "External" : "Internal"} chat interface will be implemented in a future version.
				</p>
				<input 
					type="text" 
					placeholder={placeholder || "Type a message..."} 
					className="mt-2 w-full p-2 border rounded"
					disabled
				/>
			</div>
		</div>
	);
}