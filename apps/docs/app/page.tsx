"use client";

import { Button } from "@neonpro/ui/button";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
								<span className="font-bold text-lg text-white">N</span>
							</div>
							<div>
								<h1 className="font-bold text-2xl text-slate-900 dark:text-white">
									NeonPro Documentation
								</h1>
								<p className="text-slate-600 text-sm dark:text-slate-300">
									Healthcare Platform Documentation
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Button variant="outline">GitHub</Button>
							<Button>Get Started</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto flex-1 px-4 py-12">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="mb-6 font-bold text-4xl text-slate-900 dark:text-white">
						Welcome to NeonPro Documentation
					</h2>
					<p className="mx-auto mb-12 max-w-2xl text-slate-600 text-xl dark:text-slate-300">
						Comprehensive documentation for the NeonPro healthcare platform,
						including API references, component guides, and compliance
						documentation.
					</p>

					<div className="mt-16 grid gap-8 md:grid-cols-3">
						<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
								<span className="text-blue-600 text-xl dark:text-blue-400">
									📚
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-lg text-slate-900 dark:text-white">
								API Documentation
							</h3>
							<p className="text-slate-600 text-sm dark:text-slate-300">
								Complete API reference with examples and authentication guides.
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
								<span className="text-green-600 text-xl dark:text-green-400">
									🧩
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-lg text-slate-900 dark:text-white">
								Component Library
							</h3>
							<p className="text-slate-600 text-sm dark:text-slate-300">
								UI components with live examples and implementation guides.
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
								<span className="text-purple-600 text-xl dark:text-purple-400">
									🏥
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-lg text-slate-900 dark:text-white">
								Healthcare Compliance
							</h3>
							<p className="text-slate-600 text-sm dark:text-slate-300">
								HIPAA, ANVISA, and regulatory compliance documentation.
							</p>
						</div>
					</div>

					<div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
						<Button className="px-8" size="lg">
							Browse Documentation
						</Button>
						<Button className="px-8" size="lg" variant="outline">
							View Components
						</Button>
					</div>
				</div>
			</main>

			<footer className="mt-auto border-t bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col items-center justify-between md:flex-row">
						<div className="text-slate-600 text-sm dark:text-slate-300">
							© 2024 NeonPro. Built with Next.js and Turborepo.
						</div>
						<div className="mt-4 flex items-center space-x-6 md:mt-0">
							<a
								className="text-slate-600 text-sm hover:text-blue-600 dark:text-slate-300"
								href="https://github.com"
								rel="noopener noreferrer"
								target="_blank"
							>
								GitHub
							</a>
							<a
								className="text-slate-600 text-sm hover:text-blue-600 dark:text-slate-300"
								href="/api/health"
							>
								API Status
							</a>
							<a
								className="text-slate-600 text-sm hover:text-blue-600 dark:text-slate-300"
								href="/support"
							>
								Support
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
