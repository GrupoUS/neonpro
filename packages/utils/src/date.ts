import { format, parseISO } from "date-fns";

export function formatDate(
	date: string | Date,
	pattern = "dd/MM/yyyy",
): string {
	const dateObj = typeof date === "string" ? parseISO(date) : date;
	return format(dateObj, pattern);
}

export function formatDateTime(date: string | Date): string {
	return formatDate(date, "dd/MM/yyyy HH:mm");
}
