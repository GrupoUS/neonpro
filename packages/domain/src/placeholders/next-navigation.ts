// Placeholder imports for missing modules
export const useRouter = () => ({
	push: (_path: string) => {},
	replace: (_path: string) => {},
	back: () => {},
	forward: () => {},
});

export const useSearchParams = () => ({
	get: (_key: string) => null,
	has: (_key: string) => false,
});

export const usePathname = () => "/";
