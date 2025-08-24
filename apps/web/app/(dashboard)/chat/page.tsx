"use client";

import { Activity, Bot, Globe, Lock, MessageSquare, Shield, Users, Zap } from "lucide-react";
import { useState } from "react";
import { UniversalAIChat } from "@/app/components/chat/universal-ai-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

interface ChatPageProps {
	searchParams?: {
		interface?: "external" | "internal";
		patientId?: string;
	};
}

export default function ChatPage({ searchParams }: ChatPageProps) {
	const { user } = useAuth();
	const [activeInterface, setActiveInterface] = useState<"external" | "internal">(
		searchParams?.interface || "external"
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="font-bold text-3xl tracking-tight">Chat Universal com IA</h1>
					<p className="text-muted-foreground">
						Sistema dual de chat: Interface externa para pacientes e interna para equipe médica
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<MessageSquare className="h-8 w-8 text-blue-500" />
							<div>
								<p className="font-bold text-2xl">24/7</p>
								<p className="text-muted-foreground text-xs">Disponibilidade</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<Activity className="h-8 w-8 text-green-500" />
							<div>
								<p className="font-bold text-2xl">95%</p>
								<p className="text-muted-foreground text-xs">Taxa de Resolução</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<Shield className="h-8 w-8 text-purple-500" />
							<div>
								<p className="font-bold text-2xl">LGPD</p>
								<p className="text-muted-foreground text-xs">Compliant</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<Zap className="h-8 w-8 text-orange-500" />
							<div>
								<p className="font-bold text-2xl">&lt;2s</p>
								<p className="text-muted-foreground text-xs">Tempo Resposta</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Chat Interface */}
				<Tabs onValueChange={(value) => setActiveInterface(value as "external" | "internal")} value={activeInterface}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger className="flex items-center gap-2" value="external">
							<Globe className="h-4 w-4" />
							Interface Externa (Pacientes)
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2" value="internal">
							<Lock className="h-4 w-4" />
							Interface Interna (Equipe)
						</TabsTrigger>
					</TabsList>

					<TabsContent className="space-y-4" value="external">
						<div className="grid gap-6 lg:grid-cols-4">
							{/* Interface Info */}
							<div className="space-y-4 lg:col-span-1">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Globe className="h-5 w-5 text-blue-500" />
											Interface Externa
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="space-y-2">
											<Badge className="text-green-600" variant="outline">
												<Activity className="mr-1 h-3 w-3" />
												Ativo
											</Badge>
											<p className="text-muted-foreground text-sm">
												Atendimento automatizado para pacientes com agendamentos, informações e orientações médicas
												básicas.
											</p>
										</div>

										<div className="border-t pt-3">
											<h4 className="mb-2 font-medium">Funcionalidades:</h4>
											<ul className="space-y-1 text-muted-foreground text-sm">
												<li>• Agendamento de consultas</li>
												<li>• Informações sobre exames</li>
												<li>• Orientações médicas</li>
												<li>• Suporte 24/7</li>
											</ul>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Chat Component */}
							<div className="lg:col-span-3">
								<Card className="h-[700px]">
									<CardContent className="h-full p-0">
										<UniversalAIChat
											className="h-full"
											interface="external"
											minimizable={false}
											patientId={searchParams?.patientId}
											userId={user?.id}
										/>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					<TabsContent className="space-y-4" value="internal">
						<div className="grid gap-6 lg:grid-cols-4">
							{/* Interface Info */}
							<div className="space-y-4 lg:col-span-1">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Lock className="h-5 w-5 text-green-500" />
											Interface Interna
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="space-y-2">
											<Badge className="text-green-600" variant="outline">
												<Shield className="mr-1 h-3 w-3" />
												Seguro
											</Badge>
											<p className="text-muted-foreground text-sm">
												Assistente avançado para equipe médica com acesso a dados operacionais, métricas e insights.
											</p>
										</div>

										<div className="border-t pt-3">
											<h4 className="mb-2 font-medium">Funcionalidades:</h4>
											<ul className="space-y-1 text-muted-foreground text-sm">
												<li>• Análise de performance</li>
												<li>• Relatórios em tempo real</li>
												<li>• Gestão de inventário</li>
												<li>• Insights preditivos</li>
											</ul>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Chat Component */}
							<div className="lg:col-span-3">
								<Card className="h-[700px]">
									<CardContent className="h-full p-0">
										<UniversalAIChat className="h-full" interface="internal" minimizable={false} userId={user?.id} />
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
