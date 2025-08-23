import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "../providers/query-provider";

// Font configurations for professional healthcare typography
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

// Optima will be handled via CSS font stack in Tailwind config

export const metadata: Metadata = {
	title: "NeonPro - Healthcare Management",
	description: "Professional healthcare management system",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
				<QueryProvider>
					<AuthProvider>
						<ThemeProvider>
							{children}
							<Toaster />
						</ThemeProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
