import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { formatters } from "../utils/formatters";
import { Button } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export type DatePickerProps = {
	date?: Date | null;
	onDateChange: (date: Date | null) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
};

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
	(
		{
			date,
			onDateChange,
			placeholder = "Selecione uma data",
			disabled,
			className,
		},
		ref,
	) => {
		const [open, setOpen] = React.useState(false);

		return (
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground",
							className,
						)}
						disabled={disabled}
						ref={ref}
						variant="outline"
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? formatters.date(date) : placeholder}
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-0">
					<div className="p-3">
						<input
							className="w-full rounded-md border p-2"
							onChange={(e) => {
								if (e.target.value) {
									onDateChange(new Date(e.target.value));
								} else {
									onDateChange(null);
								}
								setOpen(false);
							}}
							type="date"
							value={date ? date.toISOString().split("T")[0] : ""}
						/>
					</div>
				</PopoverContent>
			</Popover>
		);
	},
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
