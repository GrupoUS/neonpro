import * as React from "react";
import { cn } from "../utils/cn";

export type FormFieldProps = {
	label?: string;
	description?: string;
	error?: string;
	required?: boolean;
	children: React.ReactNode;
	className?: string;
	htmlFor?: string;
};

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
	({ label, description, error, required, children, className, htmlFor }, ref) => {
		const generatedId = React.useId();
		const fieldId = htmlFor || generatedId;
		return (
			<div className={cn("space-y-2", className)} ref={ref}>
				{label && (
					<label
						className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						htmlFor={fieldId}
					>
						{label}
						{required && <span className="ml-1 text-red-500">*</span>}
					</label>
				)}

				{children}

				{description && <p className="text-muted-foreground text-sm">{description}</p>}

				{error && <p className="text-red-600 text-sm">{error}</p>}
			</div>
		);
	}
);

FormField.displayName = "FormField";

export { FormField };
