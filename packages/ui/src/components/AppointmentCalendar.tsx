import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	getDay,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";

// Types
type AppointmentData = {
	id: string;
	patientId: string;
	patientName: string;
	patientAvatar?: string;
	title: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	status:
		| "scheduled"
		| "confirmed"
		| "in-progress"
		| "completed"
		| "cancelled"
		| "no-show";
	type: "consultation" | "procedure" | "follow-up" | "emergency";
	location?: string;
	notes?: string;
};

type CalendarTimeSlot = {
	time: string;
	available: boolean;
	appointments: AppointmentData[];
};

type CalendarView = {
	month: "month";
	week: "week";
	day: "day";
};

type AppointmentCalendarProps = {
	appointments: AppointmentData[];
	selectedDate?: Date;
	view?: keyof CalendarView;
	onDateSelect?: (date: Date) => void;
	onAppointmentSelect?: (appointment: AppointmentData) => void;
	onTimeSlotSelect?: (date: Date, time: string) => void;
	onViewChange?: (view: keyof CalendarView) => void;
	onAppointmentAction?: (
		action: "view" | "edit" | "cancel" | "complete",
		appointment: AppointmentData,
	) => void;
	workingHours?: { start: string; end: string };
	slotDuration?: number; // minutes
	showWeekends?: boolean;
	loading?: boolean;
	className?: string;
};

export const AppointmentCalendar = React.forwardRef<
	HTMLDivElement,
	AppointmentCalendarProps
>(
	(
		{
			appointments = [],
			selectedDate = new Date(),
			view = "month",
			onDateSelect,
			onAppointmentSelect,
			onTimeSlotSelect,
			onViewChange,
			onAppointmentAction,
			workingHours = { start: "08:00", end: "18:00" },
			slotDuration = 30,
			showWeekends = false,
			loading = false,
			className,
		},
		ref,
	) => {
		const [currentDate, setCurrentDate] = React.useState(selectedDate);
		const [currentView, setCurrentView] = React.useState(view);

		// Update current date when selectedDate changes
		React.useEffect(() => {
			setCurrentDate(selectedDate);
		}, [selectedDate]);

		// Utility functions
		const _formatRelativeTime = (date: Date) => {
			return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
		};

		const _getInitials = (name: string) => {
			return name
				.split(" ")
				.map((word) => word.charAt(0))
				.join("")
				.toUpperCase()
				.slice(0, 2);
		};

		const getStatusVariant = (status: string) => {
			switch (status) {
				case "confirmed":
					return "confirmed";
				case "scheduled":
					return "default";
				case "in-progress":
					return "pending";
				case "completed":
					return "confirmed";
				case "cancelled":
					return "cancelled";
				case "no-show":
					return "cancelled";
				default:
					return "default";
			}
		};

		const getStatusLabel = (status: string) => {
			switch (status) {
				case "scheduled":
					return "Agendado";
				case "confirmed":
					return "Confirmado";
				case "in-progress":
					return "Em andamento";
				case "completed":
					return "Concluído";
				case "cancelled":
					return "Cancelado";
				case "no-show":
					return "Faltou";
				default:
					return status;
			}
		};
		const getTypeIcon = (type: string) => {
			switch (type) {
				case "consultation":
					return "👩‍⚕️";
				case "procedure":
					return "🔧";
				case "follow-up":
					return "🔄";
				case "emergency":
					return "🚨";
				default:
					return "📅";
			}
		};

		// Generate time slots
		const generateTimeSlots = (): CalendarTimeSlot[] => {
			const slots: CalendarTimeSlot[] = [];
			const [startHour, startMinute] = workingHours.start
				.split(":")
				.map(Number);
			const [endHour, endMinute] = workingHours.end.split(":").map(Number);

			const startTime = startHour * 60 + startMinute;
			const endTime = endHour * 60 + endMinute;

			for (let time = startTime; time < endTime; time += slotDuration) {
				const hours = Math.floor(time / 60);
				const minutes = time % 60;
				const timeString = `${hours.toString().padStart(2, "0")}:${minutes
					.toString()
					.padStart(2, "0")}`;

				const dayAppointments = appointments.filter(
					(apt) =>
						isSameDay(apt.startTime, currentDate) &&
						format(apt.startTime, "HH:mm") === timeString,
				);

				slots.push({
					time: timeString,
					available: dayAppointments.length === 0,
					appointments: dayAppointments,
				});
			}

			return slots;
		};

		// Navigation functions
		const navigateMonth = (direction: "prev" | "next") => {
			const newDate =
				direction === "prev"
					? subMonths(currentDate, 1)
					: addMonths(currentDate, 1);
			setCurrentDate(newDate);
			onDateSelect?.(newDate);
		};

		const handleViewChange = (newView: keyof CalendarView) => {
			setCurrentView(newView);
			onViewChange?.(newView);
		};

		const handleDateClick = (date: Date) => {
			setCurrentDate(date);
			onDateSelect?.(date);
		};

		const handleTimeSlotClick = (timeSlot: CalendarTimeSlot) => {
			if (timeSlot.available && onTimeSlotSelect) {
				onTimeSlotSelect(currentDate, timeSlot.time);
			} else if (timeSlot.appointments.length === 1) {
				onAppointmentSelect?.(timeSlot.appointments[0]);
			}
		}; // Month view
		const renderMonthView = () => {
			const monthStart = startOfMonth(currentDate);
			const monthEnd = endOfMonth(currentDate);
			const calendarStart = startOfWeek(monthStart, { locale: ptBR });
			const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
			const days = eachDayOfInterval({
				start: calendarStart,
				end: calendarEnd,
			});

			if (!showWeekends) {
				// Filter out weekends
				const _filteredDays = days.filter((day) => {
					const dayOfWeek = getDay(day);
					return dayOfWeek !== 0 && dayOfWeek !== 6; // Sunday = 0, Saturday = 6
				});
			}

			return (
				<div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-muted">
					{/* Days of week header */}
					{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
						(day, index) => {
							if (!showWeekends && (index === 0 || index === 6)) {
								return null;
							}
							return (
								<div
									className="bg-background p-2 text-center font-medium text-muted-foreground text-sm"
									key={day}
								>
									{day}
								</div>
							);
						},
					)}

					{/* Calendar days */}
					{days.map((day) => {
						if (!showWeekends && (getDay(day) === 0 || getDay(day) === 6)) {
							return null;
						}

						const dayAppointments = appointments.filter((apt) =>
							isSameDay(apt.startTime, day),
						);
						const isCurrentMonth = isSameMonth(day, currentDate);
						const isSelected = isSameDay(day, selectedDate);
						const isToday = isSameDay(day, new Date());

						return (
							<div
								className={cn(
									"min-h-[80px] cursor-pointer bg-background p-2 transition-colors hover:bg-muted/50",
									!isCurrentMonth && "bg-muted/30 text-muted-foreground",
									isSelected && "ring-2 ring-primary",
									isToday && "bg-primary/5",
								)}
								key={day.toString()}
								onClick={() => handleDateClick(day)}
							>
								<div className="mb-1 font-medium text-sm">
									{format(day, "d")}
								</div>
								<div className="space-y-1">
									{dayAppointments.slice(0, 2).map((appointment, _index) => (
										<div
											className={cn(
												"cursor-pointer truncate rounded p-1 text-xs",
												getStatusVariant(appointment.status) === "confirmed" &&
													"bg-green-100 text-green-800",
												getStatusVariant(appointment.status) === "pending" &&
													"bg-yellow-100 text-yellow-800",
												getStatusVariant(appointment.status) === "cancelled" &&
													"bg-red-100 text-red-800",
												getStatusVariant(appointment.status) === "default" &&
													"bg-blue-100 text-blue-800",
											)}
											key={appointment.id}
											onClick={(e) => {
												e.stopPropagation();
												onAppointmentSelect?.(appointment);
											}}
										>
											{format(appointment.startTime, "HH:mm")}{" "}
											{appointment.patientName}
										</div>
									))}
									{dayAppointments.length > 2 && (
										<div className="text-muted-foreground text-xs">
											+{dayAppointments.length - 2} mais
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			);
		}; // Day view with time slots
		const renderDayView = () => {
			const timeSlots = generateTimeSlots();

			return (
				<div className="space-y-2">
					<div className="text-center">
						<h3 className="font-semibold text-lg">
							{format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
						</h3>
						<p className="text-muted-foreground text-sm">
							{timeSlots.filter((slot) => !slot.available).length} agendamentos
						</p>
					</div>

					<div className="max-h-96 space-y-1 overflow-y-auto">
						{timeSlots.map((slot) => (
							<div
								className={cn(
									"flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
									slot.available && "border-dashed hover:bg-muted/50",
									!slot.available && "bg-muted/30",
								)}
								key={slot.time}
								onClick={() => handleTimeSlotClick(slot)}
							>
								<div className="w-16 font-medium text-muted-foreground text-sm">
									{slot.time}
								</div>

								{slot.available ? (
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<Plus className="h-4 w-4" />
										Disponível
									</div>
								) : (
									<div className="flex-1 space-y-1">
										{slot.appointments.map((appointment) => (
											<div
												className="flex items-center gap-3 rounded border bg-background p-2"
												key={appointment.id}
												onClick={(e) => {
													e.stopPropagation();
													onAppointmentSelect?.(appointment);
												}}
											>
												<div className="text-lg">
													{getTypeIcon(appointment.type)}
												</div>
												<div className="flex-1">
													<div className="font-medium">
														{appointment.patientName}
													</div>
													<div className="text-muted-foreground text-sm">
														{appointment.title}
													</div>
												</div>
												<Badge variant={getStatusVariant(appointment.status)}>
													{getStatusLabel(appointment.status)}
												</Badge>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			);
		};
		return (
			<div className={cn("space-y-4", className)} ref={ref}>
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h2 className="font-semibold text-xl">
							{format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
						</h2>
						<div className="flex items-center">
							<Button
								onClick={() => navigateMonth("prev")}
								size="sm"
								variant="outline"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								className="mx-1"
								onClick={() => setCurrentDate(new Date())}
								size="sm"
								variant="outline"
							>
								Hoje
							</Button>
							<Button
								onClick={() => navigateMonth("next")}
								size="sm"
								variant="outline"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* View toggles */}
						<div className="flex items-center rounded-lg border p-1">
							<Button
								onClick={() => handleViewChange("month")}
								size="sm"
								variant={currentView === "month" ? "default" : "ghost"}
							>
								<Calendar className="h-4 w-4" />
								Mês
							</Button>
							<Button
								onClick={() => handleViewChange("day")}
								size="sm"
								variant={currentView === "day" ? "default" : "ghost"}
							>
								<Clock className="h-4 w-4" />
								Dia
							</Button>
						</div>
					</div>
				</div>

				{/* Calendar content */}
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 animate-pulse" />
							<span className="text-muted-foreground text-sm">
								Carregando agenda...
							</span>
						</div>
					</div>
				) : (
					<div>
						{currentView === "month" && renderMonthView()}
						{currentView === "day" && renderDayView()}
					</div>
				)}

				{/* Summary */}
				<div className="flex items-center justify-between text-muted-foreground text-sm">
					<div className="flex items-center gap-4">
						<span>{appointments.length} agendamentos total</span>
						<span>
							{
								appointments.filter((apt) =>
									isSameDay(apt.startTime, currentDate),
								).length
							}{" "}
							hoje
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-green-200" />
							<span>Confirmado</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-yellow-200" />
							<span>Pendente</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-red-200" />
							<span>Cancelado</span>
						</div>
					</div>
				</div>
			</div>
		);
	},
);
AppointmentCalendar.displayName = "AppointmentCalendar";

export type {
	AppointmentCalendarProps,
	AppointmentData,
	CalendarTimeSlot,
	CalendarView,
};
