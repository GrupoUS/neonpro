"use client";

import { useEffect, useState } from "react";

interface MetricValue {
	current: number;
	target: number;
	unit: string;
	trend?: "up" | "down" | "stable";
}

interface MetricWidgetProps {
	title: string;
	value: MetricValue;
	description?: string;
	color?: "green" | "blue" | "yellow" | "red";
}

export function MetricWidget({ title, value, description, color = "blue" }: MetricWidgetProps) {
	const isHealthy = value.current >= value.target;
	const percentage = Math.min((value.current / value.target) * 100, 100);

	const colorClasses = {
		green: "bg-green-100 border-green-500 text-green-900",
		blue: "bg-blue-100 border-blue-500 text-blue-900",
		yellow: "bg-yellow-100 border-yellow-500 text-yellow-900",
		red: "bg-red-100 border-red-500 text-red-900",
	};

	const trendIcon = {
		up: "📈",
		down: "📉",
		stable: "➡️",
	};

	return (
		<div className={`rounded-lg border-l-4 p-4 ${colorClasses[color]}`}>
			<div className="mb-2 flex items-center justify-between">
				<h3 className="font-medium">{title}</h3>
				{value.trend && <span className="text-lg">{trendIcon[value.trend]}</span>}
			</div>

			<div className="mb-2">
				<div className="font-bold text-2xl">
					{value.current.toFixed(1)}
					{value.unit}
				</div>
				<div className="text-sm opacity-75">
					Target: {value.target}
					{value.unit}
				</div>
			</div>

			{/* Progress bar */}
			<div className="mb-2 h-2 w-full rounded-full bg-gray-200">
				<div
					className={`h-2 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"}`}
					style={{ width: `${Math.min(percentage, 100)}%` }}
				/>
			</div>

			{description && <p className="text-xs opacity-75">{description}</p>}
		</div>
	);
}

interface ROIMetricProps {
	actualROI: number;
	targetROI: number;
	period: "monthly" | "annual";
}

export function ROIMetric({ actualROI, targetROI, period }: ROIMetricProps) {
	const isExceeding = actualROI >= targetROI;
	const percentageOfTarget = (actualROI / targetROI) * 100;

	return (
		<div
			className={`rounded-lg p-6 ${
				isExceeding ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
			} border`}
		>
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-gray-900 text-lg">ROI Performance</h3>
				<span
					className={`rounded-full px-3 py-1 text-sm ${
						isExceeding ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
					}`}
				>
					{percentageOfTarget.toFixed(1)}% of target
				</span>
			</div>

			<div className="mb-4 grid grid-cols-2 gap-4">
				<div>
					<div className="font-bold text-2xl text-green-600">${actualROI.toLocaleString()}</div>
					<div className="text-gray-600 text-sm">Actual ROI ({period})</div>
				</div>
				<div>
					<div className="font-bold text-2xl text-gray-700">${targetROI.toLocaleString()}</div>
					<div className="text-gray-600 text-sm">Target ROI ({period})</div>
				</div>
			</div>

			<div className="h-3 w-full rounded-full bg-gray-200">
				<div
					className={`h-3 rounded-full ${isExceeding ? "bg-green-500" : "bg-yellow-500"}`}
					style={{ width: `${Math.min(percentageOfTarget, 100)}%` }}
				/>
			</div>
		</div>
	);
}
