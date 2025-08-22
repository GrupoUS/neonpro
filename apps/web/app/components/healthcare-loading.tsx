"use client";

import { Card, CardContent, Progress } from "@neonpro/ui";
import { motion } from "framer-motion";
import { Activity, Heart, Shield, Stethoscope } from "lucide-react";

type HealthcareLoadingProps = {
	message?: string;
	progress?: number;
	showProgress?: boolean;
};

const iconVariants = {
	animate: {
		scale: [1, 1.2, 1],
		rotate: [0, 10, -10, 0],
		transition: {
			duration: 2,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

const pulseVariants = {
	animate: {
		scale: [1, 1.05, 1],
		opacity: [0.7, 1, 0.7],
		transition: {
			duration: 1.5,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

export default function HealthcareLoading({
	message = "Carregando sistema de saúde...",
	progress,
	showProgress = false,
}: HealthcareLoadingProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
			<Card className="w-96 p-8">
				<CardContent className="flex flex-col items-center space-y-6">
					{/* Medical Icons Animation */}
					<div className="relative">
						<motion.div
							animate="animate"
							className="absolute inset-0 h-24 w-24 rounded-full bg-blue-100"
							variants={pulseVariants}
						/>
						<motion.div
							animate="animate"
							className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-blue-600"
							variants={iconVariants}
						>
							<Heart className="h-12 w-12 text-white" />
						</motion.div>
					</div>

					{/* Floating Medical Icons */}
					<div className="flex space-x-4">
						<motion.div
							animate={{
								y: [-10, 10, -10],
								transition: {
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0,
								},
							}}
							className="text-green-600"
						>
							<Activity className="h-6 w-6" />
						</motion.div>
						<motion.div
							animate={{
								y: [-10, 10, -10],
								transition: {
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0.5,
								},
							}}
							className="text-blue-600"
						>
							<Stethoscope className="h-6 w-6" />
						</motion.div>
						<motion.div
							animate={{
								y: [-10, 10, -10],
								transition: {
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 1,
								},
							}}
							className="text-purple-600"
						>
							<Shield className="h-6 w-6" />
						</motion.div>
					</div>

					{/* Loading Message */}
					<div className="text-center">
						<h3 className="mb-2 font-semibold text-gray-800 text-xl">Sistema NeonPro Health</h3>
						<p className="text-gray-600">{message}</p>
					</div>

					{/* Progress Bar */}
					{showProgress && typeof progress === "number" && (
						<div className="w-full space-y-2">
							<Progress className="h-2" value={progress} />
							<p className="text-center text-gray-500 text-sm">{progress.toFixed(0)}% concluído</p>
						</div>
					)}

					{/* Animated Dots */}
					<div className="flex space-x-1">
						{[0, 1, 2].map((i) => (
							<motion.div
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.5, 1, 0.5],
								}}
								className="h-2 w-2 rounded-full bg-blue-600"
								key={i}
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									delay: i * 0.3,
								}}
							/>
						))}
					</div>

					{/* Security Notice */}
					<div className="w-full rounded-lg border border-green-200 bg-green-50 p-3">
						<div className="flex items-center space-x-2">
							<Shield className="h-4 w-4 text-green-600" />
							<span className="text-green-800 text-sm">Conexão segura e compatível com LGPD</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
