import { Heart } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";

type AuthLayoutProps = {
	children: React.ReactNode;
	title?: string;
	subtitle?: string;
	logoUrl?: string;
	backgroundImage?: string;
	className?: string;
	formWidth?: "sm" | "md" | "lg";
	showLogo?: boolean;
	showBackground?: boolean;
};

const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
	(
		{
			children,
			title,
			subtitle,
			logoUrl,
			backgroundImage,
			className,
			formWidth = "md",
			showLogo = true,
			showBackground = true,
			...props
		},
		ref,
	) => {
		const formWidthClasses = {
			sm: "max-w-sm",
			md: "max-w-md",
			lg: "max-w-lg",
		};

		return (
			<div
				className={cn(
					"flex min-h-screen items-center justify-center",
					showBackground && "bg-gradient-to-br from-blue-50 to-indigo-100",
					className,
				)}
				ref={ref}
				style={
					backgroundImage
						? { backgroundImage: `url(${backgroundImage})` }
						: undefined
				}
				{...props}
			>
				{/* Background Overlay */}
				{backgroundImage && <div className="absolute inset-0 bg-black/20" />}

				{/* Auth Card */}
				<div
					className={cn(
						"relative z-10 mx-4 w-full space-y-6 rounded-lg border bg-card p-8 shadow-lg",
						formWidthClasses[formWidth],
					)}
				>
					{/* Logo */}
					{showLogo && (
						<div className="text-center">
							{logoUrl ? (
								<img
									alt="Logo"
									className="mx-auto mb-4 h-12 w-auto"
									src={logoUrl}
								/>
							) : (
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
									<Heart className="h-6 w-6 text-primary-foreground" />
								</div>
							)}

							{title && (
								<h1 className="font-semibold text-2xl tracking-tight">
									{title}
								</h1>
							)}

							{subtitle && (
								<p className="mt-2 text-muted-foreground">{subtitle}</p>
							)}
						</div>
					)}

					{/* Form Content */}
					<div className="space-y-4">{children}</div>

					{/* Footer */}
					<div className="text-center text-muted-foreground text-sm">
						<p>© 2024 NeonPro. Todos os direitos reservados.</p>
						<div className="mt-2 flex justify-center gap-4">
							<a className="hover:text-primary" href="/privacy">
								Privacidade
							</a>
							<a className="hover:text-primary" href="/terms">
								Termos
							</a>
							<a className="hover:text-primary" href="/support">
								Suporte
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

AuthLayout.displayName = "AuthLayout";

export { AuthLayout };
export type { AuthLayoutProps };
