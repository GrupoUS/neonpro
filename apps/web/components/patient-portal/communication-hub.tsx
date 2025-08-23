"use client";

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@neonpro/ui";
import { cn } from "@neonpro/utils";
import {
	AlertTriangle,
	Bell,
	Calendar,
	CheckCircle,
	Clock,
	Heart,
	Image as ImageIcon,
	MessageCircle,
	Mic,
	MoreVertical,
	Paperclip,
	Phone,
	Pin,
	Search,
	Send,
	Shield,
	Star,
	User,
	Video,
} from "lucide-react";
import { useState } from "react";

// Mock data for communications
const mockCommunications = {
	conversations: [
		{
			id: 1,
			type: "chat",
			participant: {
				name: "Dra. Ana Santos",
				role: "Dermatologista",
				avatar: "/doctor-avatar-1.jpg",
				isOnline: true,
				clinic: "NeonPro Clínica Ipanema",
			},
			lastMessage: {
				text: "Como está se sentindo após o procedimento? Algum desconforto?",
				timestamp: "2024-08-18T14:30:00Z",
				from: "doctor",
				type: "text",
			},
			unreadCount: 2,
			isPinned: true,
			priority: "high",
			status: "active",
		},
		{
			id: 2,
			type: "chat",
			participant: {
				name: "Enfermeira Carol",
				role: "Enfermeira Especialista",
				avatar: "/nurse-avatar-1.jpg",
				isOnline: false,
				clinic: "NeonPro Clínica Ipanema",
			},
			lastMessage: {
				text: "Lembre-se de aplicar o creme hidratante 2x ao dia",
				timestamp: "2024-08-17T16:45:00Z",
				from: "nurse",
				type: "text",
			},
			unreadCount: 0,
			isPinned: false,
			priority: "medium",
			status: "active",
		},
		{
			id: 3,
			type: "support",
			participant: {
				name: "Suporte NeonPro",
				role: "Atendimento ao Cliente",
				avatar: "/support-avatar.jpg",
				isOnline: true,
				clinic: "NeonPro",
			},
			lastMessage: {
				text: "Seu agendamento foi confirmado para 25/08 às 14:30",
				timestamp: "2024-08-17T10:20:00Z",
				from: "support",
				type: "appointment",
			},
			unreadCount: 1,
			isPinned: false,
			priority: "low",
			status: "active",
		},
	],
	currentConversation: {
		id: 1,
		participant: {
			name: "Dra. Ana Santos",
			role: "Dermatologista",
			avatar: "/doctor-avatar-1.jpg",
			isOnline: true,
			clinic: "NeonPro Clínica Ipanema",
			phone: "+55 (21) 99999-9999",
			email: "ana.santos@neonpro.com",
		},
		messages: [
			{
				id: 1,
				text: "Olá Maria! Como foi sua experiência com o Botox ontem?",
				timestamp: "2024-08-18T09:00:00Z",
				from: "doctor",
				type: "text",
				status: "read",
			},
			{
				id: 2,
				text: "Oi Doutora! Foi tranquilo, senti apenas um pequeno desconforto durante a aplicação.",
				timestamp: "2024-08-18T09:15:00Z",
				from: "patient",
				type: "text",
				status: "read",
			},
			{
				id: 3,
				text: "Que bom! Isso é normal. Está sentindo algum inchaço ou vermelhidão hoje?",
				timestamp: "2024-08-18T09:20:00Z",
				from: "doctor",
				type: "text",
				status: "read",
			},
			{
				id: 4,
				text: "Um pouquinho de inchaço no local das aplicações, mas nada demais.",
				timestamp: "2024-08-18T13:45:00Z",
				from: "patient",
				type: "text",
				status: "read",
			},
			{
				id: 5,
				text: "Perfeito! Isso é esperado nas primeiras 24-48h. Continue com os cuidados que orientei.",
				timestamp: "2024-08-18T14:00:00Z",
				from: "doctor",
				type: "text",
				status: "read",
			},
			{
				id: 6,
				text: "Como está se sentindo após o procedimento? Algum desconforto?",
				timestamp: "2024-08-18T14:30:00Z",
				from: "doctor",
				type: "text",
				status: "delivered",
			},
		],
	},
	emergencyContacts: [
		{
			id: 1,
			name: "Emergência 24h",
			phone: "+55 (21) 99999-9999",
			description: "Para emergências médicas relacionadas aos tratamentos",
			available: "24/7",
			type: "emergency",
		},
		{
			id: 2,
			name: "Plantão Médico",
			phone: "+55 (21) 98888-8888",
			description: "Médico de plantão para dúvidas urgentes",
			available: "Noites e fins de semana",
			type: "urgent",
		},
	],
	notifications: [
		{
			id: 1,
			title: "Lembrete de Consulta",
			message: "Sua consulta é amanhã às 14:30 com Dra. Ana Santos",
			type: "appointment",
			timestamp: "2024-08-18T08:00:00Z",
			read: false,
			priority: "high",
		},
		{
			id: 2,
			title: "Resultado Disponível",
			message: "Seus resultados da avaliação estão prontos",
			type: "result",
			timestamp: "2024-08-17T15:30:00Z",
			read: false,
			priority: "medium",
		},
		{
			id: 3,
			title: "Cuidado Pós-Procedimento",
			message: "Lembre-se: evite exercícios por mais 12 horas",
			type: "care",
			timestamp: "2024-08-18T12:00:00Z",
			read: true,
			priority: "medium",
		},
	],
};

function ConversationList({
	conversations,
	onSelectConversation,
	selectedId,
}: any) {
	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
		}
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
		});
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "border-l-red-500";
			case "medium":
				return "border-l-yellow-500";
			case "low":
				return "border-l-green-500";
			default:
				return "border-l-gray-300";
		}
	};

	return (
		<div className="space-y-2">
			{conversations.map((conversation: any) => (
				<Card
					className={cn(
						"cursor-pointer border-l-4 transition-all hover:shadow-md",
						selectedId === conversation.id
							? "border-primary bg-primary/10"
							: getPriorityColor(conversation.priority),
					)}
					key={conversation.id}
					onClick={() => onSelectConversation(conversation)}
				>
					<CardContent className="p-4">
						<div className="flex items-center space-x-3">
							{/* Avatar */}
							<div className="relative">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
									<User className="h-5 w-5 text-primary" />
								</div>
								{conversation.participant.isOnline && (
									<div className="-bottom-1 -right-1 absolute h-3 w-3 rounded-full border-2 border-white bg-green-500" />
								)}
							</div>

							{/* Content */}
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<h3 className="truncate font-medium text-sm">
											{conversation.participant.name}
										</h3>
										{conversation.isPinned && (
											<Pin className="h-3 w-3 text-muted-foreground" />
										)}
									</div>
									<div className="flex items-center space-x-1">
										<span className="text-muted-foreground text-xs">
											{formatTime(conversation.lastMessage.timestamp)}
										</span>
										{conversation.unreadCount > 0 && (
											<Badge className="flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-white text-xs">
												{conversation.unreadCount}
											</Badge>
										)}
									</div>
								</div>

								<p className="text-muted-foreground text-xs">
									{conversation.participant.role}
								</p>
								<p className="mt-1 truncate text-muted-foreground text-sm">
									{conversation.lastMessage.text}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function ChatWindow({ conversation }: any) {
	const [message, setMessage] = useState("");
	const [_showCallOptions, _setShowCallOptions] = useState(false);

	const formatMessageTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getMessageStatus = (status: string) => {
		switch (status) {
			case "sent":
				return <Clock className="h-3 w-3 text-gray-400" />;
			case "delivered":
				return <CheckCircle className="h-3 w-3 text-gray-400" />;
			case "read":
				return <CheckCircle className="h-3 w-3 text-primary" />;
			default:
				return null;
		}
	};

	const handleSendMessage = () => {
		if (message.trim()) {
			// Logic to send message would go here
			setMessage("");
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Chat Header */}
			<div className="border-b p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
								<User className="h-5 w-5 text-primary" />
							</div>
							{conversation.participant.isOnline && (
								<div className="-bottom-1 -right-1 absolute h-3 w-3 rounded-full border-2 border-white bg-green-500" />
							)}
						</div>

						<div>
							<h3 className="font-medium">{conversation.participant.name}</h3>
							<p className="text-muted-foreground text-sm">
								{conversation.participant.role} •{" "}
								{conversation.participant.clinic}
							</p>
							<p className="text-green-600 text-xs">
								{conversation.participant.isOnline ? "Online" : "Offline"}
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Button size="sm" variant="outline">
							<Phone className="h-4 w-4" />
						</Button>
						<Button size="sm" variant="outline">
							<Video className="h-4 w-4" />
						</Button>
						<Button size="sm" variant="outline">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{conversation.messages.map((msg: any) => (
					<div
						className={cn(
							"flex",
							msg.from === "patient" ? "justify-end" : "justify-start",
						)}
						key={msg.id}
					>
						<div
							className={cn(
								"max-w-xs space-y-1 rounded-lg px-4 py-2 lg:max-w-md",
								msg.from === "patient"
									? "bg-primary text-white"
									: "bg-gray-100 dark:bg-gray-800",
							)}
						>
							<p className="text-sm">{msg.text}</p>
							<div
								className={cn(
									"flex items-center justify-end space-x-1 text-xs",
									msg.from === "patient"
										? "text-primary-light"
										: "text-muted-foreground",
								)}
							>
								<span>{formatMessageTime(msg.timestamp)}</span>
								{msg.from === "patient" && getMessageStatus(msg.status)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Message Input */}
			<div className="border-t p-4">
				<div className="flex items-center space-x-2">
					<div className="flex space-x-1">
						<Button size="sm" variant="outline">
							<Paperclip className="h-4 w-4" />
						</Button>
						<Button size="sm" variant="outline">
							<ImageIcon className="h-4 w-4" />
						</Button>
						<Button size="sm" variant="outline">
							<Mic className="h-4 w-4" />
						</Button>
					</div>

					<div className="flex flex-1 space-x-2">
						<Input
							className="flex-1"
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
							placeholder="Digite sua mensagem..."
							value={message}
						/>
						<Button
							className="bg-primary hover:bg-primary-dark"
							disabled={!message.trim()}
							onClick={handleSendMessage}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function NotificationsList({ notifications }: any) {
	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "appointment":
				return <Calendar className="h-5 w-5 text-blue-600" />;
			case "result":
				return <Star className="h-5 w-5 text-accent" />;
			case "care":
				return <Heart className="h-5 w-5 text-primary" />;
			case "emergency":
				return <AlertTriangle className="h-5 w-5 text-red-600" />;
			default:
				return <Bell className="h-5 w-5 text-gray-600" />;
		}
	};

	const formatNotificationTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

		if (diffInMinutes < 60) {
			return `${Math.floor(diffInMinutes)} min atrás`;
		}
		if (diffInMinutes < 1440) {
			return `${Math.floor(diffInMinutes / 60)} horas atrás`;
		}
		return date.toLocaleDateString("pt-BR");
	};

	return (
		<div className="space-y-3">
			{notifications.map((notification: any) => (
				<Card
					className={cn(
						"cursor-pointer transition-all hover:shadow-md",
						notification.read
							? ""
							: "border-l-4 border-l-primary bg-primary/10",
					)}
					key={notification.id}
				>
					<CardContent className="p-4">
						<div className="flex items-start space-x-3">
							<div className="flex-shrink-0">
								{getNotificationIcon(notification.type)}
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between">
									<h3
										className={cn(
											"font-medium text-sm",
											notification.read ? "" : "font-semibold",
										)}
									>
										{notification.title}
									</h3>
									<span className="text-muted-foreground text-xs">
										{formatNotificationTime(notification.timestamp)}
									</span>
								</div>
								<p className="mt-1 text-muted-foreground text-sm">
									{notification.message}
								</p>

								{notification.priority === "high" && (
									<Badge
										className="mt-2 bg-red-100 text-red-800"
										variant="secondary"
									>
										Urgente
									</Badge>
								)}
							</div>

							<div className="flex items-center space-x-1">
								{!notification.read && (
									<div className="h-2 w-2 rounded-full bg-primary" />
								)}
								<Button size="sm" variant="ghost">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function EmergencyContacts({ contacts }: any) {
	return (
		<div className="space-y-4">
			{contacts.map((contact: any) => (
				<Card className="border-l-4 border-l-red-500" key={contact.id}>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<h3 className="flex items-center space-x-2 font-medium text-sm">
									<AlertTriangle className="h-4 w-4 text-red-600" />
									<span>{contact.name}</span>
								</h3>
								<p className="text-muted-foreground text-xs">
									{contact.description}
								</p>
								<p className="font-medium text-red-600 text-xs">
									{contact.available}
								</p>
							</div>

							<div className="flex space-x-2">
								<Button className="bg-red-600 hover:bg-red-700" size="sm">
									<Phone className="h-4 w-4" />
									Ligar
								</Button>
								<Button size="sm" variant="outline">
									<MessageCircle className="h-4 w-4" />
									Chat
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function CommunicationHub() {
	const [activeTab, setActiveTab] = useState("messages");
	const [selectedConversation, setSelectedConversation] = useState(
		mockCommunications.currentConversation,
	);
	const [searchTerm, setSearchTerm] = useState("");

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
				<div>
					<h1 className="font-bold text-2xl tracking-tight lg:text-3xl">
						Central de Comunicação
					</h1>
					<p className="text-muted-foreground">
						Mantenha-se conectado com sua equipe médica
					</p>
				</div>

				<div className="flex space-x-2">
					<Button variant="outline">
						<Search className="h-4 w-4" />
						Buscar
					</Button>
					<Button className="bg-primary hover:bg-primary-dark">
						<MessageCircle className="h-4 w-4" />
						Nova Mensagem
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-l-4 border-l-blue-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									Mensagens Não Lidas
								</p>
								<p className="font-bold text-2xl">3</p>
							</div>
							<MessageCircle className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Médicos Online</p>
								<p className="font-bold text-2xl">2</p>
							</div>
							<User className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-yellow-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Notificações</p>
								<p className="font-bold text-2xl">2</p>
							</div>
							<Bell className="h-8 w-8 text-accent" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-red-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Suporte 24h</p>
								<p className="font-bold text-sm">Disponível</p>
							</div>
							<Shield className="h-8 w-8 text-red-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Communication Interface */}
			<Tabs onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="messages">
						Mensagens ({mockCommunications.conversations.length})
					</TabsTrigger>
					<TabsTrigger value="notifications">
						Notificações (
						{mockCommunications.notifications.filter((n) => !n.read).length})
					</TabsTrigger>
					<TabsTrigger value="emergency">Emergência</TabsTrigger>
				</TabsList>

				<TabsContent value="messages">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Conversation List */}
						<div className="lg:col-span-1">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Conversas</CardTitle>
									<div className="relative">
										<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											className="pl-10"
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder="Buscar conversas..."
											value={searchTerm}
										/>
									</div>
								</CardHeader>
								<CardContent>
									<ConversationList
										conversations={mockCommunications.conversations}
										onSelectConversation={setSelectedConversation}
										selectedId={selectedConversation?.id}
									/>
								</CardContent>
							</Card>
						</div>

						{/* Chat Window */}
						<div className="lg:col-span-2">
							<Card className="h-[600px]">
								{selectedConversation ? (
									<ChatWindow conversation={selectedConversation} />
								) : (
									<CardContent className="flex h-full items-center justify-center">
										<div className="text-center text-muted-foreground">
											<MessageCircle className="mx-auto mb-4 h-12 w-12" />
											<p>Selecione uma conversa para começar</p>
										</div>
									</CardContent>
								)}
							</Card>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="notifications">
					<Card>
						<CardHeader>
							<CardTitle>Notificações</CardTitle>
							<CardDescription>
								Mantenha-se atualizado sobre seus tratamentos e consultas
							</CardDescription>
						</CardHeader>
						<CardContent>
							<NotificationsList
								notifications={mockCommunications.notifications}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="emergency">
					<div className="space-y-6">
						<Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
							<CardHeader>
								<CardTitle className="flex items-center space-x-2 text-red-700">
									<AlertTriangle className="h-5 w-5" />
									<span>Contatos de Emergência</span>
								</CardTitle>
								<CardDescription className="text-red-600">
									Em caso de reações adversas ou emergências médicas
								</CardDescription>
							</CardHeader>
							<CardContent>
								<EmergencyContacts
									contacts={mockCommunications.emergencyContacts}
								/>
							</CardContent>
						</Card>

						{/* Emergency Guidelines */}
						<Card>
							<CardHeader>
								<CardTitle>Quando Contatar a Emergência</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
										<h4 className="mb-2 font-medium text-red-700">
											Emergências Médicas (Ligue Imediatamente)
										</h4>
										<ul className="space-y-1 text-red-600 text-sm">
											<li>• Dificuldade para respirar ou engolir</li>
											<li>
												• Reação alérgica grave (urticária, inchaço facial)
											</li>
											<li>• Dor intensa e persistente</li>
											<li>• Sangramento excessivo</li>
										</ul>
									</div>

									<div className="rounded-lg bg-accent/10 p-4 dark:bg-accent/20">
										<h4 className="mb-2 font-medium text-accent">
											Situações Urgentes (Contate em 24h)
										</h4>
										<ul className="space-y-1 text-accent text-sm">
											<li>• Inchaço anormal após 48h</li>
											<li>• Vermelhidão persistente</li>
											<li>• Febre ou sinais de infecção</li>
											<li>• Assimetria inesperada</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
