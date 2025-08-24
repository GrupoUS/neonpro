// Appointment-related types

export type AppointmentData = {
	id: string;
	patientId: string;
	patientName: string;
	patientAvatar?: string;
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
	type: "consultation" | "procedure" | "follow-up" | "emergency";
	practitioner?: string;
	room?: string;
	notes?: string;
	urgency?: "low" | "medium" | "high" | "urgent";
};

export type AppointmentCardProps = {
	appointment: AppointmentData;
	onView?: () => void;
	onEdit?: () => void;
	onCancel?: () => void;
	onReschedule?: () => void;
	onCheckIn?: () => void;
	showPatientInfo?: boolean;
	compact?: boolean;
	className?: string;
};
