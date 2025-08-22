import { Clock } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Button } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export type TimePickerProps = {
	value: string;
	onChange: (time: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
};

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
	({ value, onChange, placeholder = "Selecione um horário", disabled, className }, ref) => {
		const [open, setOpen] = React.useState(false);

		return (
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
						disabled={disabled}
						ref={ref}
						variant="outline"
					>
						<Clock className="mr-2 h-4 w-4" />
						{value || placeholder}
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-0">
					<div className="p-3">
						<input
							className="w-full rounded-md border p-2"
							onChange={(e) => {
								onChange(e.target.value);
								setOpen(false);
							}}
							type="time"
							value={value}
						/>
					</div>
				</PopoverContent>
			</Popover>
		);
	}
);

TimePicker.displayName = "TimePicker";

export { TimePicker };
