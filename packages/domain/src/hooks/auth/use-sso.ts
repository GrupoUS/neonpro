/**
 * Placeholder SSO hook
 */
import { useState } from "react";

export const useSSO = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [providers, _setProviders] = useState<string[]>(["google", "microsoft"]);

	return {
		isLoading,
		providers,
		loginWithProvider: async (_provider: string) => {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
			return { success: true };
		},
		getProviders: async () => {
			return providers;
		},
	};
};
