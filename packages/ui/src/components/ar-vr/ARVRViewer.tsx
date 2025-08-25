/**
 * AR/VR Medical Viewer Components  
 * FASE 3: Frontend Enhancement - Missing UI Components
 * Compliance: LGPD/ANVISA/CFM, WCAG 2.1 AA
 * Healthcare Use Cases: Medical Imaging, Surgery Planning, Training
 */

"use client";

import { useState, useEffect, useRef, useId } from "react";
import {
	Eye,
	Camera,
	Move3D,
	RotateCcw,
	ZoomIn,
	ZoomOut,
	Play,
	Pause,
	Square,
	Settings,
	Maximize,
	Minimize,
	Volume2,
	VolumeX,
	Monitor,
	Smartphone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Progress } from "../Progress";
import { Slider } from "../ui/slider";
import { Switch } from "../Switch";

// Types for AR/VR content
export interface MediaContent {
	id: string;
	type: "dicom" | "3d_model" | "video" | "ar_overlay" | "vr_environment";
	title: string;
	url: string;
	format: string;
	metadata: {
		patientId?: string;
		studyDate?: Date;
		modality?: string; // CT, MRI, X-Ray, etc.
		bodyPart?: string;
		dimensions?: { width: number; height: number; depth?: number };
		fileSize: number;
	};
	annotations?: Annotation[];
	accessLevel: "public" | "professional" | "restricted";
	lgpdCompliant: boolean;
}

export interface Annotation {
	id: string;
	type: "measurement" | "diagnosis" | "note" | "marker";
	position: { x: number; y: number; z?: number };
	content: string;
	author: string;
	timestamp: Date;
	color?: string;
}

export interface ViewerSettings {
	brightness: number;
	contrast: number;
	zoom: number;
	rotation: { x: number; y: number; z: number };
	showAnnotations: boolean;
	showGrid: boolean;
	renderQuality: "low" | "medium" | "high";
	colorScheme: "default" | "inverted" | "pseudocolor";
}

export interface ARVRViewerProps {
	content: MediaContent;
	mode: "ar" | "vr" | "3d" | "2d";
	settings?: Partial<ViewerSettings>;
	onSettingsChange?: (settings: ViewerSettings) => void;
	onAnnotationAdd?: (annotation: Omit<Annotation, "id" | "timestamp">) => void;
	showControls?: boolean;
	fullscreen?: boolean;
	className?: string;
}

// AR/VR Viewer component
export function ARVRViewer({
	content,
	mode = "2d",
	settings: initialSettings,
	onSettingsChange,
	onAnnotationAdd,
	showControls = true,
	fullscreen = false,
	className,
}: ARVRViewerProps) {
	const viewerId = useId();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	
	const defaultSettings: ViewerSettings = {
		brightness: 50,
		contrast: 50,
		zoom: 100,
		rotation: { x: 0, y: 0, z: 0 },
		showAnnotations: true,
		showGrid: false,
		renderQuality: "medium",
		colorScheme: "default",
		...initialSettings,
	};
	
	const [settings, setSettings] = useState(defaultSettings);
	const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);

	useEffect(() => {
		// Simulate loading process
		const loadContent = async () => {
			setIsLoading(true);
			setError(null);
			
			try {
				// Simulate progressive loading
				for (let i = 0; i <= 100; i += 10) {
					setLoadingProgress(i);
					await new Promise(resolve => setTimeout(resolve, 100));
				}
				
				// Initialize viewer based on content type
				await initializeViewer();
				setIsLoading(false);
			} catch (err) {
				setError(`Erro ao carregar conteúdo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
				setIsLoading(false);
			}
		};

		loadContent();
	}, [content.id, mode]);

	const initializeViewer = async () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas dimensions
		canvas.width = 800;
		canvas.height = 600;

		// Draw placeholder content based on type
		ctx.fillStyle = "#f0f0f0";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		ctx.fillStyle = "#333";
		ctx.font = "16px sans-serif";
		ctx.textAlign = "center";
		
		switch (content.type) {
			case "dicom":
				ctx.fillText("DICOM Medical Image Viewer", canvas.width / 2, canvas.height / 2 - 20);
				ctx.fillText(`Modality: ${content.metadata.modality || "Unknown"}`, canvas.width / 2, canvas.height / 2);
				ctx.fillText(`Body Part: ${content.metadata.bodyPart || "Unknown"}`, canvas.width / 2, canvas.height / 2 + 20);
				break;
			case "3d_model":
				ctx.fillText("3D Medical Model", canvas.width / 2, canvas.height / 2 - 10);
				ctx.fillText("Interactive 3D visualization would be rendered here", canvas.width / 2, canvas.height / 2 + 10);
				break;
			case "ar_overlay":
				ctx.fillText("AR Medical Overlay", canvas.width / 2, canvas.height / 2 - 10);
				ctx.fillText("Augmented Reality overlay would be displayed here", canvas.width / 2, canvas.height / 2 + 10);
				break;
			case "vr_environment":
				ctx.fillText("VR Medical Environment", canvas.width / 2, canvas.height / 2 - 10);
				ctx.fillText("Virtual Reality environment would be rendered here", canvas.width / 2, canvas.height / 2 + 10);
				break;
			default:
				ctx.fillText("Medical Content Viewer", canvas.width / 2, canvas.height / 2);
		}

		// Draw grid if enabled
		if (settings.showGrid) {
			drawGrid(ctx, canvas.width, canvas.height);
		}

		// Draw annotations if enabled
		if (settings.showAnnotations && content.annotations) {
			drawAnnotations(ctx, content.annotations);
		}
	};

	const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
		ctx.strokeStyle = "#ddd";
		ctx.lineWidth = 0.5;
		
		const gridSize = 50;
		for (let x = 0; x <= width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		
		for (let y = 0; y <= height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
	};

	const drawAnnotations = (ctx: CanvasRenderingContext2D, annotations: Annotation[]) => {
		annotations.forEach(annotation => {
			ctx.fillStyle = annotation.color || "#ff0000";
			ctx.fillRect(annotation.position.x - 5, annotation.position.y - 5, 10, 10);
			
			ctx.fillStyle = "#000";
			ctx.font = "12px sans-serif";
			ctx.fillText(annotation.content, annotation.position.x + 10, annotation.position.y);
		});
	};

	const handleSettingChange = <K extends keyof ViewerSettings>(
		key: K,
		value: ViewerSettings[K]
	) => {
		const newSettings = { ...settings, [key]: value };
		setSettings(newSettings);
		onSettingsChange?.(newSettings);
		
		// Re-render with new settings
		initializeViewer();
	};

	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!onAnnotationAdd) return;
		
		const canvas = canvasRef.current;
		if (!canvas) return;
		
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		// Create new annotation at click position
		const annotation: Omit<Annotation, "id" | "timestamp"> = {
			type: "marker",
			position: { x, y },
			content: "New annotation",
			author: "Current User",
			color: "#ff0000",
		};
		
		onAnnotationAdd(annotation);
	};

	const getModeIcon = (currentMode: string) => {
		switch (currentMode) {
			case "ar": return <Camera className="h-4 w-4" />;
			case "vr": return <Monitor className="h-4 w-4" />;
			case "3d": return <Move3D className="h-4 w-4" />;
			case "2d": return <Eye className="h-4 w-4" />;
			default: return <Eye className="h-4 w-4" />;
		}
	};

	return (
		<Card className={`${fullscreen ? "fixed inset-0 z-50" : ""} ${className}`}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							{getModeIcon(mode)}
							{content.title}
						</CardTitle>
						<CardDescription>
							{content.type.replace("_", " ").toUpperCase()} • 
							{content.metadata.modality && ` ${content.metadata.modality} •`}
							{content.metadata.bodyPart && ` ${content.metadata.bodyPart} •`}
							{content.metadata.studyDate && ` ${content.metadata.studyDate.toLocaleDateString()}`}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={content.accessLevel === "restricted" ? "destructive" : "default"}>
							{content.accessLevel}
						</Badge>
						{content.lgpdCompliant && (
							<Badge variant="outline">LGPD</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				{/* Main viewer area */}
				<div className="relative bg-black">
					{isLoading ? (
						<div className="h-96 flex items-center justify-center flex-col gap-4">
							<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
							<div className="text-white text-center">
								<p>Carregando conteúdo médico...</p>
								<Progress value={loadingProgress} className="mt-2 w-64" />
								<p className="text-sm mt-1">{loadingProgress}%</p>
							</div>
						</div>
					) : error ? (
						<div className="h-96 flex items-center justify-center flex-col gap-4 text-red-400">
							<p>{error}</p>
							<Button onClick={() => initializeViewer()} variant="outline">
								Tentar Novamente
							</Button>
						</div>
					) : (
						<canvas
							ref={canvasRef}
							className="w-full h-auto max-h-96 cursor-crosshair"
							onClick={handleCanvasClick}
							aria-label={`Visualizador ${mode.toUpperCase()} - ${content.title}`}
							tabIndex={0}
							role="img"
						/>
					)}

					{/* Overlay controls */}
					{showControls && !isLoading && !error && (
						<div className="absolute top-4 right-4 flex flex-col gap-2">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleSettingChange("zoom", settings.zoom + 10)}
								aria-label="Aumentar zoom"
							>
								<ZoomIn className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleSettingChange("zoom", Math.max(10, settings.zoom - 10))}
								aria-label="Diminuir zoom"
							>
								<ZoomOut className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleSettingChange("rotation", { x: 0, y: 0, z: 0 })}
								aria-label="Resetar rotação"
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{/* Settings panel */}
				{showControls && (
					<div className="p-4 border-t space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* Brightness */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Brilho</label>
								<Slider
									value={[settings.brightness]}
									onValueChange={([value]) => handleSettingChange("brightness", value)}
									min={0}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>

							{/* Contrast */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Contraste</label>
								<Slider
									value={[settings.contrast]}
									onValueChange={([value]) => handleSettingChange("contrast", value)}
									min={0}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>

							{/* Zoom */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Zoom ({settings.zoom}%)</label>
								<Slider
									value={[settings.zoom]}
									onValueChange={([value]) => handleSettingChange("zoom", value)}
									min={10}
									max={500}
									step={10}
									className="w-full"
								/>
							</div>
						</div>

						{/* Toggle controls */}
						<div className="flex flex-wrap gap-4">
							<div className="flex items-center space-x-2">
								<Switch
									id="annotations"
									checked={settings.showAnnotations}
									onCheckedChange={(checked) => handleSettingChange("showAnnotations", checked)}
								/>
								<label htmlFor="annotations" className="text-sm">
									Mostrar Anotações
								</label>
							</div>

							<div className="flex items-center space-x-2">
								<Switch
									id="grid"
									checked={settings.showGrid}
									onCheckedChange={(checked) => handleSettingChange("showGrid", checked)}
								/>
								<label htmlFor="grid" className="text-sm">
									Mostrar Grade
								</label>
							</div>

							<div className="flex items-center space-x-2">
								<label htmlFor="quality" className="text-sm">
									Qualidade:
								</label>
								<select
									id="quality"
									value={settings.renderQuality}
									onChange={(e) => handleSettingChange("renderQuality", e.target.value as ViewerSettings["renderQuality"])}
									className="px-2 py-1 border rounded text-sm bg-background"
								>
									<option value="low">Baixa</option>
									<option value="medium">Média</option>
									<option value="high">Alta</option>
								</select>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Export component and types
export default ARVRViewer;