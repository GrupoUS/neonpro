import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, Check, Eye, EyeOff, X } from "lucide-react";
import type * as React from "react";
import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../lib/utils";

const inputVariants = cva(
	"flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background backdrop-blur-sm transition-all duration-300 file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"border-input bg-background/80 shadow-healthcare-sm hover:bg-background focus-visible:bg-background",
				medical:
					"border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-healthcare-sm backdrop-blur-sm hover:from-primary/8 hover:via-primary/5 focus-visible:border-primary/50 focus-visible:ring-primary/40",
				sensitive:
					"border-warning/40 bg-gradient-to-br from-warning/8 via-warning/5 to-transparent shadow-healthcare-md backdrop-blur-sm hover:from-warning/12 hover:via-warning/8 focus-visible:border-warning/60 focus-visible:ring-warning/40",
				critical:
					"border-destructive/40 bg-gradient-to-br from-destructive/8 via-destructive/5 to-transparent shadow-healthcare-md backdrop-blur-sm hover:from-destructive/12 hover:via-destructive/8 focus-visible:border-destructive/60 focus-visible:ring-destructive/40",
				success:
					"border-success/40 bg-gradient-to-br from-success/8 via-success/5 to-transparent shadow-healthcare-sm backdrop-blur-sm hover:from-success/12 hover:via-success/8 focus-visible:border-success/60 focus-visible:ring-success/40",
			},
			inputSize: {
				default: "h-10",
				sm: "h-8 text-xs",
				lg: "h-12",
			},
			validation: {
				none: "",
				valid:
					"border-success/60 bg-gradient-to-br from-success/10 via-success/5 to-transparent shadow-healthcare-sm focus-visible:ring-success/40",
				invalid:
					"border-destructive/60 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent shadow-healthcare-md focus-visible:ring-destructive/40",
				warning:
					"border-warning/60 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent shadow-healthcare-sm focus-visible:ring-warning/40",
			},
		},
		defaultVariants: {
			variant: "default",
			inputSize: "default",
			validation: "none",
		},
	},
);

// Healthcare-specific input masks and validators
const healthcareMasks = {
	cpf: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{3})(\d)/, "$1.$2")
			.replace(/(\d{3})(\d)/, "$1.$2")
			.replace(/(\d{3})(\d{1,2})/, "$1-$2")
			.replace(/(-\d{2})\d+?$/, "$1");
	},
	cns: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
	},
	phone: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{2})(\d)/, "($1) $2")
			.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
	},
	cep: (value: string) => {
		return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
	},
	date: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{2})(\d)/, "$1/$2")
			.replace(/(\d{2})(\d)/, "$1/$2")
			.replace(/(\d{4})\d+?$/, "$1");
	},
	time: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{2})(\d)/, "$1:$2")
			.replace(/(\d{2}:\d{2})\d+?$/, "$1");
	},
	weight: (value: string) => {
		return value
			.replace(/[^\d.,]/g, "")
			.replace(/,/g, ".")
			.replace(/(\d{3})(\d)/, "$1.$2");
	},
	height: (value: string) => {
		return value
			.replace(/[^\d.,]/g, "")
			.replace(/,/g, ".")
			.replace(/(\d{1,3})\.(\d{2})\d*/, "$1.$2");
	},
	temperature: (value: string) => {
		return value
			.replace(/[^\d.,]/g, "")
			.replace(/,/g, ".")
			.replace(/(\d{2})\.(\d)\d*/, "$1.$2");
	},
	pressure: (value: string) => {
		return value
			.replace(/[^\d/]/g, "")
			.replace(/(\d{2,3})(\d)/, "$1/$2")
			.replace(/(\d{2,3}\/\d{2,3})\d+?$/, "$1");
	},
};

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {
	// Healthcare-specific props
	medicalType?:
		| "cpf"
		| "cns"
		| "phone"
		| "cep"
		| "date"
		| "time"
		| "weight"
		| "height"
		| "temperature"
		| "pressure";
	sensitiveData?: boolean;
	lgpdCompliant?: boolean;
	showValidation?: boolean;
	validationMessage?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	loading?: boolean;
	onValidation?: (isValid: boolean, message?: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			variant = "default",
			inputSize = "default",
			validation = "none",
			type = "text",
			medicalType,
			sensitiveData = false,
			lgpdCompliant = true,
			showValidation = false,
			validationMessage,
			leftIcon,
			rightIcon,
			loading = false,
			onValidation,
			onChange,
			value,
			...props
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = useState(false);
		const [internalValue, setInternalValue] = useState(value || "");

		// Determine validation state
		const getValidationState = useCallback(
			(val: string) => {
				if (!(showValidation && val)) {
					return "none";
				}

				// Basic validation patterns for healthcare data
				const validationPatterns = {
					cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
					cns: /^\d{3} \d{4} \d{4} \d{4}$/,
					phone: /^\(\d{2}\) \d{4,5}-\d{4}$/,
					cep: /^\d{5}-\d{3}$/,
					date: /^\d{2}\/\d{2}\/\d{4}$/,
					time: /^\d{2}:\d{2}$/,
					weight: /^\d{1,3}(\.\d{1,2})?$/,
					height: /^\d{1,3}(\.\d{2})?$/,
					temperature: /^\d{2}(\.\d)?$/,
					pressure: /^\d{2,3}\/\d{2,3}$/,
					email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				};

				if (medicalType && validationPatterns[medicalType]) {
					return validationPatterns[medicalType].test(val)
						? "valid"
						: "invalid";
				}

				if (type === "email") {
					return validationPatterns.email.test(val) ? "valid" : "invalid";
				}

				return val.length > 0 ? "valid" : "invalid";
			},
			[medicalType, type, showValidation],
		);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				let newValue = e.target.value;

				// Apply healthcare masks
				if (medicalType && healthcareMasks[medicalType]) {
					newValue = healthcareMasks[medicalType](newValue);
				}

				setInternalValue(newValue);

				// Update validation
				if (showValidation && onValidation) {
					const validationState = getValidationState(newValue);
					onValidation(validationState === "valid", validationMessage);
				}

				// Call original onChange with masked value
				const syntheticEvent = {
					...e,
					target: { ...e.target, value: newValue },
				};
				onChange?.(syntheticEvent);
			},
			[
				medicalType,
				showValidation,
				onValidation,
				validationMessage,
				getValidationState,
				onChange,
			],
		);

		// Determine final validation state
		const finalValidation = showValidation
			? getValidationState(String(value || internalValue))
			: validation;

		// Auto-set variant based on medical type
		const finalVariant = medicalType
			? sensitiveData
				? "sensitive"
				: "medical"
			: variant;

		const isPassword = type === "password";
		const inputType = isPassword && showPassword ? "text" : type;

		const ValidationIcon = () => {
			if (loading) {
				return (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent drop-shadow-sm" />
				);
			}

			switch (finalValidation) {
				case "valid":
					return <Check className="h-4 w-4 text-success drop-shadow-sm" />;
				case "invalid":
					return <X className="h-4 w-4 text-destructive drop-shadow-sm" />;
				case "warning":
					return (
						<AlertCircle className="h-4 w-4 text-warning drop-shadow-sm" />
					);
				default:
					return null;
			}
		};

		return (
			<div className="relative w-full">
				{leftIcon && (
					<div className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
						{leftIcon}
					</div>
				)}

				<input
					aria-describedby={
						validationMessage ? `${props.id}-validation` : undefined
					}
					aria-invalid={finalValidation === "invalid"}
					className={cn(
						inputVariants({
							variant: finalVariant,
							inputSize,
							validation: finalValidation,
						}),
						leftIcon && "pl-10",
						(rightIcon || isPassword || showValidation) && "pr-10",
						sensitiveData && "font-mono tracking-wider",
						lgpdCompliant && "data-[lgpd=true]:bg-green-50/20",
						className,
					)}
					data-lgpd={lgpdCompliant}
					data-medical-type={medicalType}
					data-sensitive={sensitiveData}
					data-validation={finalValidation}
					onChange={handleChange}
					ref={ref}
					type={inputType}
					value={value || internalValue}
					{...props}
				/>

				<div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-1">
					{showValidation && <ValidationIcon />}

					{isPassword && (
						<button
							aria-label={showPassword ? "Hide password" : "Show password"}
							className="text-muted-foreground transition-colors hover:text-foreground"
							onClick={() => setShowPassword(!showPassword)}
							type="button"
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					)}

					{rightIcon && !isPassword && !showValidation && (
						<div className="text-muted-foreground">{rightIcon}</div>
					)}
				</div>

				{validationMessage && finalValidation === "invalid" && (
					<p
						className="mt-1 flex items-center gap-1 text-red-500 text-sm"
						id={`${props.id}-validation`}
						role="alert"
					>
						<AlertCircle className="h-3 w-3" />
						{validationMessage}
					</p>
				)}

				{sensitiveData && lgpdCompliant && (
					<p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
						<div className="h-2 w-2 rounded-full bg-green-500" />
						Dados protegidos pela LGPD
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input, inputVariants, healthcareMasks };
