import * as React from "react";

// Basic type exports for UI components
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

// Placeholder component functions (non-JSX stubs)
export const Button = (props: ButtonProps) => {
  // Stub: return null or a div for now
  return React.createElement("button", { ...props, className: props.className || "btn-stub" });
};

export const Input = (props: InputProps) => {
  return React.createElement("input", { ...props, className: props.className || "input-stub" });
};

export const Card = (props: CardProps) => {
  return React.createElement("div", { ...props, className: props.className || "card-stub" });
};

export const CardHeader = (props: CardProps) => {
  return React.createElement("div", { ...props, className: props.className || "card-header-stub" });
};

export const CardTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  return React.createElement("h3", { ...props, className: props.className || "card-title-stub" });
};

// Placeholder for other components
export const Alert = () => null;
export const Badge = () => null;
export const Label = () => null;
export const Select = () => null;
export const Tabs = () => null;
export const Textarea = () => null;

// Export cn from utils
export { cn } from "./utils";
