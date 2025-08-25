"use client";

// Simplified Prediction Display - placeholder implementation
interface PredictionDisplayProps {
	className?: string;
}

export default function PredictionDisplay({ className }: PredictionDisplayProps) {
	return (
		<div className={className}>
			<div className="p-4 border rounded-lg">
				<h3 className="text-lg font-semibold">Prediction Display</h3>
				<p className="text-gray-600">ML prediction display will be implemented in a future version.</p>
			</div>
		</div>
	);
}