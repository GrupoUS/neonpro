import * as React from "react";
import { cn } from "../../lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ className, size = "md", ...props }, ref) => {
	const sizeClasses = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12",
	};

	return (
		<div
			className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}
			ref={ref}
			{...props}
		/>
	);
});

Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
	({ className, ...props }, ref) => (
		<img className={cn("aspect-square h-full w-full", className)} ref={ref} {...props} />
	)
);

AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
			ref={ref}
			{...props}
		/>
	)
);

AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
