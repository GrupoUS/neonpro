import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
	title: "Cadastro - NeonPro Healthcare",
	description:
		"Crie sua conta no NeonPro Healthcare - Sistema completo de gestão para clínicas estéticas",
	keywords: "cadastro, registro, clínica estética, gestão, LGPD, ANVISA, CFM",
};

export default function SignupPage() {
	return (
		<div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col border-border border-r bg-gradient-to-br from-primary/5 to-chart-5/5 p-10 text-foreground lg:flex">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-5/5" />
				<div className="relative z-20 flex items-center font-medium text-xl">
					<div className="neonpro-gradient neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg">
						<svg
							className="h-5 w-5 text-primary-foreground"
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
						</svg>
					</div>
					<span className="font-bold text-primary">NeonPro Healthcare</span>
				</div>
				<div className="relative z-20 mt-auto space-y-8">
					<blockquote className="space-y-4">
						<p className="font-medium text-foreground text-lg leading-relaxed">
							&ldquo;Transforme sua clínica estética com tecnologia brasileira
							de ponta. Junte-se a centenas de profissionais que já confiam na
							nossa plataforma para gestão completa, segura e em total
							conformidade.&rdquo;
						</p>
						<footer className="font-medium text-muted-foreground">
							Dra. Maria Fernanda, Diretora Médica - Instituto Estética Brasil
						</footer>
					</blockquote>

					{/* Enhanced Benefits */}
					<div className="space-y-4">
						<h4 className="font-semibold text-foreground/90 text-sm uppercase tracking-wide">
							Por que escolher o NeonPro Healthcare?
						</h4>
						<div className="space-y-3">
							<div className="trust-indicator">
								<span className="text-foreground/80">
									Conformidade LGPD/ANVISA automatizada
								</span>
							</div>
							<div className="trust-indicator">
								<span className="text-foreground/80">
									Gestão especializada para medicina estética
								</span>
							</div>
							<div className="trust-indicator">
								<span className="text-foreground/80">
									Segurança de dados de nível hospitalar
								</span>
							</div>
							<div className="trust-indicator">
								<span className="text-foreground/80">
									Treinamento e suporte especializado incluído
								</span>
							</div>
							<div className="trust-indicator">
								<span className="text-foreground/80">
									Teste gratuito por 30 dias sem compromisso
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-background lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px]">
					{/* Enhanced Header */}
					<div className="flex flex-col space-y-4 text-center">
						<div className="neonpro-gradient neonpro-glow mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
							<svg
								className="h-6 w-6 text-primary-foreground"
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
							</svg>
						</div>
						<h1 className="font-bold text-3xl text-foreground tracking-tight">
							Comece sua Transformação Digital
						</h1>
						<p className="mx-auto max-w-md text-muted-foreground leading-relaxed">
							Crie sua conta gratuita e descubra como o NeonPro Healthcare pode
							revolucionar a gestão da sua clínica estética
						</p>
					</div>

					{/* Signup Form */}
					<SignupForm />

					{/* Enhanced Legal Notice */}
					<div className="space-y-4">
						<p className="px-4 text-center text-muted-foreground text-xs leading-relaxed">
							Ao criar sua conta, você concorda com nossos{" "}
							<a
								className="font-medium underline underline-offset-4 hover:text-primary"
								href="/terms"
								rel="noopener"
								target="_blank"
							>
								Termos de Serviço
							</a>
							,{" "}
							<a
								className="font-medium underline underline-offset-4 hover:text-primary"
								href="/privacy"
								rel="noopener"
								target="_blank"
							>
								Política de Privacidade LGPD
							</a>{" "}
							e confirma estar ciente das{" "}
							<a
								className="font-medium underline underline-offset-4 hover:text-primary"
								href="/compliance"
								rel="noopener"
								target="_blank"
							>
								Diretrizes de Conformidade ANVISA/CFM
							</a>
							.
						</p>

						{/* Security & Trust Notice */}
						<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
							<p className="text-foreground/80 text-xs leading-relaxed">
								🛡️ Seus dados estão protegidos com criptografia de nível bancário
								• ✓ Conformidade total com LGPD • 📞 Suporte especializado
								incluído • 🆓 30 dias grátis sem compromisso
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
