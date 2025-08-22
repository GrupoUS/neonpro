/**
 * Placeholder RBAC hook
 */
import { useState } from "react";

export const useRBAC = () => {
	const [permissions, setPermissions] = useState<string[]>([]);
	const [roles, setRoles] = useState<string[]>([]);

	return {
		permissions,
		roles,
		hasPermission: (permission: string) => permissions.includes(permission),
		hasRole: (role: string) => roles.includes(role),
		loadPermissions: async (_userId: string) => {
			setPermissions(["read", "write"]);
			setRoles(["user"]);
		},
	};
};
