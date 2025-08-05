import { type ClassValue, clsx } from "clsx";

// Simple implementation without tailwind-merge dependency
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
