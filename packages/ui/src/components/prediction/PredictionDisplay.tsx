/**
 * AI Prediction Display Components
 * FASE 3: Frontend Enhancement - Missing UI Components
 * Compliance: LGPD/ANVISA/CFM, WCAG 2.1 AA
 */

"use client";

import { useState, useEffect, useId } from "react";
import {
	Brain,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	CheckCircle,
	Clock,
	Target,
	Activity,
	Heart,
	Thermometer,
	Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
import { Badge } from "../Badge";
import { Progress } from "../Progress";
import { Button } from "../Button";

// Types for prediction data
export interface PredictionResult {
	id: string;
	type: "diagnosis" | "risk_assessment" | "treatment_outcome" | "health_trend";
	title: string;
	confidence: number; // 0-100
	prediction: string;
	details: string[];
	severity: "low" | "medium" | "high" | "critical";
	timeframe: string;
	recommendations: string[];
	dataPoints: {
		label: string;
		value: number;
		unit?: string;
		trend?: "up" | "down" | "stable";
	}[];
	lastUpdated: Date;
	source: string;
	lgpdCompliant: boolean;
}

export interface PredictionDisplayProps {
	predictions: PredictionResult[];
	loading?: boolean;
	onPredictionClick?: (prediction: PredictionResult) => void;
	showConfidence?: boolean;
	showRecommendations?: boolean;
	compactView?: boolean;
	className?: string;
}

// Individual prediction card component
interface PredictionCardProps {
	prediction: PredictionResult;
	onClick?: (prediction: PredictionResult) => void;
	showConfidence?: boolean;
	showRecommendations?: boolean;
	compact?: boolean;
}

function PredictionCard({
	prediction,
	onClick,
	showConfidence = true,
	showRecommendations = true,
	compact = false,
}: PredictionCardProps) {
	const cardId = useId();
	const titleId = useId();
	
	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "critical": return "destructive";
			case "high": return "secondary";
			case "medium": return "default";
			case "low": return "outline";
			default: return "outline";
		}
	};

	const getSeverityIcon = (severity: string) => {
		switch (severity) {
			case "critical": return <AlertTriangle className="h-4 w-4" />;
			case "high": return <TrendingUp className="h-4 w-4" />;
			case "medium": return <Activity className="h-4 w-4" />;
			case "low": return <CheckCircle className="h-4 w-4" />;
			default: return <Target className="h-4 w-4" />;
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "diagnosis": return <Brain className="h-5 w-5" />;
			case "risk_assessment": return <AlertTriangle className="h-5 w-5" />;
			case "treatment_outcome": return <Target className="h-5 w-5" />;
			case "health_trend": return <TrendingUp className="h-5 w-5" />;
			default: return <Activity className="h-5 w-5" />;
		}
	};

	return (
		<Card 
			className={`cursor-pointer transition-all hover:shadow-md ${onClick ? "hover:scale-[1.02]" : ""}`}
			onClick={() => onClick?.(prediction)}
			role="button"
			tabIndex={0}
			aria-labelledby={titleId}
			aria-describedby={`${cardId}-details`}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.(prediction);
				}
			}}
		>
			<CardHeader className={compact ? "pb-2" : ""}>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						{getTypeIcon(prediction.type)}
						<CardTitle id={titleId} className="text-lg">
							{prediction.title}
						</CardTitle>
					</div>
					<Badge 
						variant={getSeverityColor(prediction.severity)}
						className="flex items-center gap-1"
					>
						{getSeverityIcon(prediction.severity)}
						{prediction.severity}
					</Badge>
				</div>
				{!compact && (
					<CardDescription>
						Previsão gerada por IA • {prediction.timeframe} • {prediction.source}
					</CardDescription>
				)}
			</CardHeader>
			
			<CardContent className="space-y-4">
				{/* Main prediction */}
				<div id={`${cardId}-details`}>
					<p className="font-medium text-foreground mb-2">
						{prediction.prediction}
					</p>
					{!compact && prediction.details.map((detail, index) => (
						<p key={index} className="text-sm text-muted-foreground mb-1">
							• {detail}
						</p>
					))}
				</div>

				{/* Confidence score */}
				{showConfidence && (
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Confiança da Previsão</span>
							<span className="font-medium">{prediction.confidence}%</span>
						</div>
						<Progress 
							value={prediction.confidence} 
							className="h-2"
							aria-label={`Nível de confiança: ${prediction.confidence}%`}
						/>
					</div>
				)}

				{/* Data points */}
				{!compact && prediction.dataPoints.length > 0 && (
					<div className="grid grid-cols-2 gap-3">
						{prediction.dataPoints.slice(0, 4).map((dataPoint, index) => (
							<div key={index} className="text-center p-2 bg-muted/50 rounded">
								<div className="flex items-center justify-center gap-1 text-sm font-medium">
									{dataPoint.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
									{dataPoint.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
									{dataPoint.value}
									{dataPoint.unit && <span className="text-muted-foreground">{dataPoint.unit}</span>}
								</div>
								<div className="text-xs text-muted-foreground mt-1">
									{dataPoint.label}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Recommendations */}
				{showRecommendations && !compact && prediction.recommendations.length > 0 && (
					<div className="border-t pt-3">
						<h4 className="text-sm font-medium mb-2 flex items-center gap-2">
							<Target className="h-4 w-4" />
							Recomendações
						</h4>
						<ul className="space-y-1">
							{prediction.recommendations.slice(0, 3).map((rec, index) => (
								<li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
									<CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
									{rec}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Metadata */}
				<div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
					<div className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						Atualizado: {prediction.lastUpdated.toLocaleString()}
					</div>
					{prediction.lgpdCompliant && (
						<Badge variant="outline" className="text-xs">
							LGPD
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// Main prediction display component
export function PredictionDisplay({
	predictions,
	loading = false,
	onPredictionClick,
	showConfidence = true,
	showRecommendations = true,
	compactView = false,
	className,
}: PredictionDisplayProps) {
	const [filteredPredictions, setFilteredPredictions] = useState(predictions);
	const [selectedType, setSelectedType] = useState<string>("all");
	const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

	useEffect(() => {
		let filtered = predictions;
		
		if (selectedType !== "all") {
			filtered = filtered.filter(p => p.type === selectedType);
		}
		
		if (selectedSeverity !== "all") {
			filtered = filtered.filter(p => p.severity === selectedSeverity);
		}

		setFilteredPredictions(filtered);
	}, [predictions, selectedType, selectedSeverity]);

	const predictionTypes = Array.from(new Set(predictions.map(p => p.type)));
	const severityLevels = Array.from(new Set(predictions.map(p => p.severity)));

	if (loading) {
		return (
			<div className={`space-y-4 ${className}`}>
				{Array.from({ length: 3 }).map((_, index) => (
					<Card key={index}>
						<CardHeader>
							<div className="flex items-center space-x-4">
								<div className="h-10 w-10 bg-muted animate-pulse rounded" />
								<div className="space-y-2 flex-1">
									<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
									<div className="h-3 bg-muted animate-pulse rounded w-1/2" />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="h-3 bg-muted animate-pulse rounded" />
								<div className="h-3 bg-muted animate-pulse rounded w-5/6" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`} role="region" aria-label="Previsões de IA">
			{/* Filter controls */}
			{predictions.length > 0 && !compactView && (
				<div className="flex flex-wrap gap-2">
					<div className="flex items-center gap-2">
						<label htmlFor="type-filter" className="text-sm font-medium">
							Tipo:
						</label>
						<select
							id="type-filter"
							value={selectedType}
							onChange={(e) => setSelectedType(e.target.value)}
							className="px-3 py-1 border rounded text-sm bg-background"
						>
							<option value="all">Todos</option>
							{predictionTypes.map(type => (
								<option key={type} value={type}>
									{type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-center gap-2">
						<label htmlFor="severity-filter" className="text-sm font-medium">
							Severidade:
						</label>
						<select
							id="severity-filter"
							value={selectedSeverity}
							onChange={(e) => setSelectedSeverity(e.target.value)}
							className="px-3 py-1 border rounded text-sm bg-background"
						>
							<option value="all">Todas</option>
							{severityLevels.map(severity => (
								<option key={severity} value={severity}>
									{severity.charAt(0).toUpperCase() + severity.slice(1)}
								</option>
							))}
						</select>
					</div>
				</div>
			)}

			{/* Predictions list */}
			{filteredPredictions.length === 0 ? (
				<Card>
					<CardContent className="text-center py-8">
						<Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground">
							{predictions.length === 0 
								? "Nenhuma previsão disponível no momento."
								: "Nenhuma previsão corresponde aos filtros selecionados."
							}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className={compactView ? "grid gap-3" : "space-y-4"}>
					{filteredPredictions.map((prediction) => (
						<PredictionCard
							key={prediction.id}
							prediction={prediction}
							onClick={onPredictionClick}
							showConfidence={showConfidence}
							showRecommendations={showRecommendations}
							compact={compactView}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// Export all components and types
export default PredictionDisplay;