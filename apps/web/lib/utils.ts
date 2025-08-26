import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Placeholder formatting functions
export function formatDate(date: Date | string): string {
	if (typeof date === "string") {
		date = new Date(date);
	}
	return date.toLocaleDateString();
}

export function formatTime(date: Date | string): string {
	if (typeof date === "string") {
		date = new Date(date);
	}
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
