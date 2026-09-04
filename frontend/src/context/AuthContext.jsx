import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const DEMO_ROLES = {
  admin: {
    id: 'admin',
    name: 'Admin',
    email: 'admin@transactionguard.ai',
    password: 'admin123',
    role: 'Administrator',
    roleTitle: 'Platform Administrator',
    badge: 'ADMINISTRATOR',
    badgeClass: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    description: 'Full access to the TransactionGuard AI platform.',
    permissionsDesc: 'Full platform access',
    access: [
      'Dashboard',
      'Analyze Transaction',
      'Review Queue',
      'Transactions',
      'Audit Trail',
      'Analytics',
      'Settings',
      'User Management'
    ],
    restricted: []
  },
  analyst: {
    id: 'analyst',
    name: 'Alex',
    email: 'analyst@transactionguard.ai',
    password: 'analyst123',
    role: 'Risk Analyst',
    roleTitle: 'Risk Analyst',
    badge: 'RISK ANALYST',
    badgeClass: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    description: 'Investigates suspicious transactions and analyzes transaction risk.',
    permissionsDesc: 'Analysis & Investigation',
    access: [
      'Dashboard',
      'Analyze Transaction',
      'Review Queue',
      'Transactions',
      'Audit Trail',
      'Analytics',
      'Settings'
    ],
    restricted: [
      'User Management'
    ]
  },
  reviewer: {
    id: 'reviewer',
    name: 'Priya',
    email: 'reviewer@transactionguard.ai',
    password: 'reviewer123',
    role: 'Reviewer',
    roleTitle: 'Transaction Reviewer',
    badge: 'REVIEWER',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    description: 'Reviews flagged transactions and records human review decisions.',
    permissionsDesc: 'Human Review & Auditing',
    access: [
      'Dashboard',
      'Review Queue',
      'Transactions',
      'Transaction Details',
      'Audit Trail'
    ],
    restricted: [
      'Analyze Transaction',
      'Analytics',
      'Settings',
      'User Management'
    ]
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('tg_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const loginWithRole = useCallback((roleId) => {
    const roleConfig = DEMO_ROLES[roleId] || DEMO_ROLES.admin;
    const userData = {
      id: roleConfig.id,
      name: roleConfig.name,
      email: roleConfig.email,
      role: roleConfig.role,
      roleTitle: roleConfig.roleTitle,
      badge: roleConfig.badge,
      badgeClass: roleConfig.badgeClass,
      description: roleConfig.description,
      access: roleConfig.access,
      restricted: roleConfig.restricted
    };
    sessionStorage.setItem('tg_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback((email, password) => {
    const trimmedEmail = email?.trim().toLowerCase();
    
    // Check Admin
    if (
      trimmedEmail === DEMO_ROLES.admin.email &&
      (password === DEMO_ROLES.admin.password || password === 'demo123')
    ) {
      return { success: true, user: loginWithRole('admin') };
    }

    // Check Analyst
    if (
      trimmedEmail === DEMO_ROLES.analyst.email &&
      password === DEMO_ROLES.analyst.password
    ) {
      return { success: true, user: loginWithRole('analyst') };
    }

    // Check Reviewer
    if (
      trimmedEmail === DEMO_ROLES.reviewer.email &&
      password === DEMO_ROLES.reviewer.password
    ) {
      return { success: true, user: loginWithRole('reviewer') };
    }

    return {
      success: false,
      error: 'Invalid credentials. Use one of the demo accounts listed below.'
    };
  }, [loginWithRole]);

  const demoLogin = useCallback((roleId = 'admin') => {
    return loginWithRole(roleId);
  }, [loginWithRole]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('tg_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        demoLogin,
        loginWithRole,
        logout,
        isAuthenticated: !!user,
        roles: DEMO_ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
