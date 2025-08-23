import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryState = {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
};

type ErrorBoundaryProps = {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	showDetails?: boolean;
	title?: string;
};

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });
		this.props.onError?.(error, errorInfo);
	}

	private readonly handleRetry = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div
					className="flex min-h-screen items-center justify-center bg-gray-50"
					data-testid="error-boundary"
				>
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg
									className="h-6 w-6 text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="font-medium text-red-800 text-sm">
									Oops! Algo deu errado
								</h3>
								<div className="mt-2 text-red-700 text-sm">
									<p>
										Ocorreu um erro inesperado. Nossa equipe foi notificada.
									</p>
								</div>
								<div className="mt-4">
									<button
										className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 font-medium text-sm text-white leading-4 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
										onClick={this.handleRetry}
									>
										Tentar novamente
									</button>
								</div>
								{this.props.showDetails && (
									<div className="mt-4">
										<details className="cursor-pointer">
											<summary className="text-red-600 text-sm hover:text-red-700">
												Detalhes técnicos
											</summary>
											<div className="mt-2 rounded bg-gray-50 p-2 text-gray-600 text-xs">
												<p>
													<strong>Error:</strong> {this.state.error?.message}
												</p>
												<p>
													<strong>Stack:</strong> {this.state.error?.stack}
												</p>
												{this.state.errorInfo && (
													<p>
														<strong>Component Stack:</strong>{" "}
														{this.state.errorInfo.componentStack}
													</p>
												)}
											</div>
										</details>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Critical Error Boundary - for critical errors that require page reload
export class CriticalErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });
		this.props.onError?.(error, errorInfo);
	}

	private readonly handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div
					className="flex min-h-screen items-center justify-center bg-gray-50"
					data-testid="critical-error-boundary"
				>
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg
									className="h-6 w-6 text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="font-medium text-red-800 text-sm">
									{this.props.title
										? `Erro em ${this.props.title}`
										: "Erro Crítico"}
								</h3>
								<div className="mt-2 text-red-700 text-sm">
									<p>
										Ocorreu um erro crítico. É necessário recarregar a página.
									</p>
								</div>
								<div className="mt-4">
									<button
										className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 font-medium text-sm text-white leading-4 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
										onClick={this.handleReload}
									>
										Recarregar Página
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
	const WithErrorBoundaryComponent = (props: P) => (
		<ErrorBoundary {...errorBoundaryProps}>
			<WrappedComponent {...props} />
		</ErrorBoundary>
	);

	WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

	return WithErrorBoundaryComponent;
}

export default ErrorBoundary;
