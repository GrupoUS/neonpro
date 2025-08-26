"use client";

// Simplified Prediction Display - placeholder implementation
type PredictionDisplayProps = {
	className?: string;
};

export default function PredictionDisplay({
	className,
}: PredictionDisplayProps) {
	return (
		<div className={className}>
			<div className="rounded-lg border p-4">
				<h3 className="font-semibold text-lg">Prediction Display</h3>
				<p className="text-gray-600">
					ML prediction display will be implemented in a future version.
				</p>
			</div>
		</div>
	);
}
