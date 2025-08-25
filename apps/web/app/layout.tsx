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

export const export const metadata: Metadata = {
	title: "NeonPro - Healthcare Management",
	description: "Professional healthcare management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
				<QueryProvider>
					<AuthProvider>
						<ThemeProvider>
							{children}
							<Toaster />
							
							{/* AI Agent Chat Placeholder - será implementado como componente separado */}
							<div className="fixed bottom-5 right-5 z-50">
								<div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg cursor-pointer hover:scale-110 transition-transform">
									<span className="text-primary-foreground text-xs">🤖</span>
								</div>
							</div>
						</ThemeProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
				<QueryProvider>
					<AuthProvider>
						<ThemeProvider>
							{children}
							<Toaster />
							
							{/* AI Agent Chat Placeholder */}
							<div className="fixed bottom-5 right-5 z-50">
								<div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg">
									<span className="text-primary-foreground text-xs">🤖</span>
								</div>
							</div>
						</ThemeProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}

// =============================================================================
// 🤖 AGENT CHAT INTEGRATION - Global Healthcare AI Assistant
// =============================================================================
// Componente global do assistente AI disponível em todas as páginas
// Posicionado no canto inferior direito como popup
// Integrado com Archon MCP, Speech Recognition e dados específicos do cliente
// =============================================================================

import { AgentChat } from '../components/ui/button';
import { Suspense } from 'react';

/**
 * Layout wrapper with AgentChat integration
 * Provides the AI assistant globally across the application
 */
/**
 * Layout wrapper with AgentChat integration
 * Provides the AI assistant globally across the application
 */
export function LayoutWithAgent({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      {children}
      
      {/* AI Agent Chat - Globally available */}
      <div className="fixed bottom-5 right-5 z-50">
        {/* Placeholder for AgentChat - will be implemented when imports are fixed */}
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg">
          <span className="text-primary-foreground text-xs">AI</span>
        </div>
      </div>
    </div>
  );
}
          theme="healthcare"
          enableVoice={true}
          enableNotifications={true}
        />
      </Suspense>
    </div>
  );
}

// =============================================================================
// HEALTHCARE AI GLOBAL STYLES ENHANCEMENT
// =============================================================================

// Extend global styles for healthcare AI interface
const healthcareAIStyles = `
  /* Healthcare AI Chat Popup Global Styles */
  .healthcare-ai-overlay {
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .healthcare-ai-gradient {
    background: linear-gradient(135deg, 
      hsl(var(--primary)) 0%, 
      hsl(var(--primary-light)) 50%, 
      hsl(var(--accent)) 100%
    );
  }

  .healthcare-ai-shadow {
    box-shadow: 
      0 20px 40px -12px rgba(var(--primary-rgb), 0.25),
      0 8px 16px -4px rgba(var(--primary-rgb), 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .healthcare-ai-voice-wave {
    animation: voice-wave 1.5s ease-in-out infinite;
  }

  @keyframes voice-wave {
    0%, 100% { transform: scaleY(1); opacity: 0.7; }
    50% { transform: scaleY(1.5); opacity: 1; }
  }

  .healthcare-ai-typing {
    animation: typing-dots 1.4s infinite;
  }

  @keyframes typing-dots {
    0%, 20% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }

  /* Accessibility improvements for AI chat */
  .healthcare-ai-chat {
    font-size: 1rem;
    line-height: 1.6;
  }

  .healthcare-ai-chat:focus-within {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .healthcare-ai-overlay {
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid white;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .healthcare-ai-voice-wave,
    .healthcare-ai-typing {
      animation: none;
    }
  }

  /* Dark mode optimizations for AI chat */
  @media (prefers-color-scheme: dark) {
    .healthcare-ai-overlay {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  }
`;

// Inject styles into document head (client-side only)
if (typeof window !== 'undefined') {
  const styleId = 'healthcare-ai-global-styles';
  
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = healthcareAIStyles;
    document.head.appendChild(styleElement);
  }
}
