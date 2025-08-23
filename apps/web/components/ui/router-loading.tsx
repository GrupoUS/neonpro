/**
 * ⏳ Router Loading Component - NeonPro Healthcare
 * ==============================================
 *
 * Global loading component for route transitions
 * with healthcare-specific branding.
 */

"use client";

import { Heart } from "lucide-react";

export function RouterLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center">
				<div className="mb-6 flex items-center justify-center">
					<div className="animate-pulse">
						<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
							<Heart className="h-8 w-8 text-white" />
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="text-muted-foreground">Carregando...</p>
				</div>
			</div>
		</div>
	);
}
