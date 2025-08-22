// packages/ui/src/hooks/use-permissions.ts
import { useMemo } from "react";

export type Permission = {
	create: boolean;
	read: boolean;
	update: boolean;
	delete: boolean;
	admin: boolean;
};

export type UserPermissions = {
	patients: Permission;
	appointments: Permission;
	clinics: Permission;
	users: Permission;
};

// Mock permissions hook for now - in real app would check JWT/user role
export function usePermissions(): UserPermissions {
	return useMemo(
		() => ({
			patients: {
				create: true,
				read: true,
				update: true,
				delete: true,
				admin: false,
			},
			appointments: {
				create: true,
				read: true,
				update: true,
				delete: true,
				admin: false,
			},
			clinics: {
				create: false,
				read: true,
				update: false,
				delete: false,
				admin: false,
			},
			users: {
				create: false,
				read: true,
				update: false,
				delete: false,
				admin: false,
			},
		}),
		[]
	);
}

export function useHasPermission(resource: keyof UserPermissions, action: keyof Permission): boolean {
	const permissions = usePermissions();
	return permissions[resource][action];
}
