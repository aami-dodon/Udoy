import { useMemo } from 'react';

export const NAVIGATION_BLUEPRINT = [
  { to: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { to: '/topics', label: 'Learning library', icon: 'BookOpen' },
  { to: '/topics/new', label: 'Create a topic', icon: 'PenSquare', roles: ['creator', 'teacher', 'admin'] },
  { to: '/uploads/test', label: 'Upload centre', icon: 'UploadCloud', roles: ['creator', 'teacher', 'admin'] },
  { to: '/admin/users', label: 'User management', icon: 'Shield', roles: ['admin'] },
  { to: '/profile', label: 'Profile & settings', icon: 'UserRound' },
];

export function extractUserRoles(user) {
  if (!user?.roles) {
    return [];
  }

  return Array.from(
    new Set(
      user.roles
        .map((role) => (typeof role === 'string' ? role.toLowerCase() : ''))
        .filter(Boolean)
    )
  );
}

export function filterNavigationByRoles(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return NAVIGATION_BLUEPRINT.filter((item) => !item.roles || item.roles.length === 0);
  }

  return NAVIGATION_BLUEPRINT.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return item.roles.some((role) => roles.includes(role));
  });
}

export default function usePostLoginNavigation(user) {
  const userRoles = useMemo(() => extractUserRoles(user), [user]);

  const navItems = useMemo(() => filterNavigationByRoles(userRoles), [userRoles]);

  return { navItems, userRoles };
}
