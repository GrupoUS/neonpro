/**
 * 🔍 Not Found Component - NeonPro Healthcare
 * ==========================================
 *
 * 404 page for routes that don't exist
 * with helpful navigation options.
 */

"use client";

import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6 text-center">
				<div className="flex justify-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<Search className="h-8 w-8 text-muted-foreground" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="font-bold text-6xl text-primary">404</h1>
					<h2 className="font-semibold text-2xl">Página não encontrada</h2>
					<p className="text-muted-foreground">
						A página que você está procurando não existe ou foi removida.
					</p>
				</div>

				<div className="flex flex-col justify-center gap-3 sm:flex-row">
					<Button asChild>
						<Link to="/">
							<Home className="mr-2 h-4 w-4" />
							Voltar ao Início
						</Link>
					</Button>

					<Button
						asChild
						onClick={() => window.history.back()}
						variant="outline"
					>
						<button>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar
						</button>
					</Button>
				</div>

				<div className="border-t pt-4">
					<p className="text-muted-foreground text-sm">
						Se você acredita que isso é um erro, entre em contato com o suporte.
					</p>
				</div>
			</div>
		</div>
	);
}
