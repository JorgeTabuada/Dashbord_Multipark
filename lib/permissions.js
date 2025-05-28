/**
 * Placeholder for permission logic.
 * For now, it allows all users to see all apps.
 *
 * @param {string} userRole - The role of the current user.
 * @param {string} appName - The name of the application being checked.
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
export const checkPermission = (userRole, appName) => {
  // For now, grant access to all apps for any authenticated role.
  // This will be replaced with more granular logic later.
  console.log(`Checking permission for role '${userRole}' on app '${appName}' - currently always true.`);
  return true;
};

const appPermissions = {
  caixa: ['admin', 'supervisor', 'tesoureiro', 'super_admin'],
  reservas: ['admin', 'supervisor', 'back_office', 'super_admin'],
  recolhas: ['admin', 'team_leader', 'super_admin'],
  // Add more app IDs (keys) and their permitted roles here
  // Example: 'faturacao': ['admin', 'financeiro', 'super_admin'],
};

/**
 * Gets apps available to a user for display on the dashboard.
 * @param {string} userRole - The role of the current user.
 * @returns {Array<Object>} - A list of application objects the user can see.
 */
export const getAppsForUser = (userRole) => {
  const allApps = [
    { name: "Caixa", link: "/caixa", icon: null, id: "caixa" },
    { name: "Reservas", link: "/reservas", icon: null, id: "reservas" },
    { name: "Recolhas", link: "/recolhas", icon: "/icons/recolhas.svg", id: "recolhas" },
    // { name: "Faturação", link: "/faturacao", icon: null, id: "faturacao" }, // Example for a new app
  ];

  if (!userRole) return [];
  if (userRole === 'super_admin') return allApps; // super_admin sees all apps defined in allApps

  return allApps.filter(app => {
    const permittedRoles = appPermissions[app.id];
    return permittedRoles ? permittedRoles.includes(userRole) : false;
  });
};

/**
 * Checks if a user role has permission to access a specific sub-application.
 * @param {string} userRole - The role of the current user.
 * @param {string} appId - The unique identifier of the sub-application (e.g., 'caixa', 'reservas').
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
export const canAccessSubApp = (userRole, appId) => {
  if (!userRole || !appId) {
    console.warn(`canAccessSubApp: Missing userRole ('${userRole}') or appId ('${appId}')`);
    return false;
  }
  if (userRole === 'super_admin') {
    // console.log(`canAccessSubApp: Granting access to '${appId}' for 'super_admin'.`);
    return true; // super_admin can access everything
  }
  const permittedRoles = appPermissions[appId];
  if (!permittedRoles) {
    console.warn(`canAccessSubApp: No permissions defined for appId '${appId}'. Denying access by default.`);
    return false; // If app is not in appPermissions, deny access (safer default)
  }
  const hasAccess = permittedRoles.includes(userRole);
  // console.log(`canAccessSubApp: Role '${userRole}' ${hasAccess ? 'has' : 'does not have'} access to '${appId}'. Permitted: ${permittedRoles.join(', ')}`);
  return hasAccess;
};
