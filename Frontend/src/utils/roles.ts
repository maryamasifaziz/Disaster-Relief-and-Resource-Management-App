import { AuthUser, UserRole } from '@/src/types/api';

export const hasRole = (roles: UserRole[] = [], role: UserRole) =>
  roles.includes(role);

export const deriveRoleFlags = (roles: UserRole[] = []) => ({
  isCitizen: hasRole(roles, 'Citizen'),
  isRescueWorker: hasRole(roles, 'Rescue Worker'),
  isNGO: hasRole(roles, 'NGO'),
  isGovernment: hasRole(roles, 'Government'),
});

export const canViewAllEmergencies = (roles: UserRole[] = []) =>
  hasRole(roles, 'Rescue Worker') ||
  hasRole(roles, 'Government') ||
  hasRole(roles, 'NGO');

export const canManageTasks = (roles: UserRole[] = []) =>
  hasRole(roles, 'Government');

export const canUpdateTasks = (roles: UserRole[] = []) =>
  hasRole(roles, 'Rescue Worker') || hasRole(roles, 'Government');

export const canManageResources = (roles: UserRole[] = []) =>
  hasRole(roles, 'NGO') || hasRole(roles, 'Government');

export const canManageShelters = (roles: UserRole[] = []) =>
  hasRole(roles, 'NGO') || hasRole(roles, 'Government');

export const buildUserInitials = (user?: AuthUser) => {
  if (!user?.name) return 'DM';
  return user.name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

