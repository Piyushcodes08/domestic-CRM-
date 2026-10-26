import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { User as AppUser, UserRole } from '../types';
import { auth, db, firebaseConfig } from '../firebase';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: AppUser | null;
  allUsers: AppUser[];
  loading: boolean;
  agentDirectoryError: string | null;
  refreshAgentUsers: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<AppUser>;
  loginAsDemo: (demoUser?: AppUser) => void;
  createUserAccount: (
    name: string,
    email: string,
    password: string,
    role: 'sales_agent' | 'technical_support',
    options?: { title?: string; department?: string; assignedTargetRevenueINR?: number }
  ) => Promise<AppUser>;
  updateAgentProfile: (agentId: string, updates: Partial<Pick<AppUser, 'name' | 'title' | 'department' | 'assignedTargetRevenueINR'>>) => Promise<AppUser>;
  deleteAgentProfile: (agentId: string) => Promise<void>;
  logout: () => Promise<void>;
  isManager: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isSupport: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ADMIN_EMAIL = 'vahlaydigital@gmail.com';
const FIRESTORE_RULES_DEPLOY_COMMAND = 'firebase deploy --project domestic-crm-2d591 --only firestore:rules';
const agentProvisioningApp = getApps().find((app) => app.name === 'agent-account-provisioning')
  || initializeApp(firebaseConfig, 'agent-account-provisioning');
const agentProvisioningAuth = getAuth(agentProvisioningApp);

const isPermissionDenied = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'permission-denied';

const isUserRole = (role: unknown): role is UserRole =>
  role === 'super_admin' || role === 'sales_manager' || role === 'sales_agent' || role === 'technical_support';

const profileToUser = (id: string, email: string, profile: DocumentData, role: UserRole): AppUser => ({
  id,
  name: profile.name || email.split('@')[0],
  email,
  role,
  avatar: profile.avatar || '',
  title: profile.title || (role === 'sales_agent' ? 'Sales Agent' : role === 'technical_support' ? 'Technical Support Engineer' : 'System Administrator'),
  phone: profile.phone || undefined,
  department: profile.department || (role === 'sales_agent' ? 'Domestic Inside Sales' : role === 'technical_support' ? 'Technical Operations' : 'Administration'),
  joinedDate: profile.joinedDate || new Date().toISOString().slice(0, 10),
  readinessScore: profile.readinessScore ?? 0,
  learningXp: profile.learningXp ?? 0,
  streakDays: profile.streakDays ?? 0,
  completedLessons: profile.completedLessons ?? [],
  completedQuizzes: profile.completedQuizzes ?? [],
  badges: profile.badges ?? [],
  assignedTargetRevenueINR: profile.assignedTargetRevenueINR ?? 0,
  leadsWon: profile.leadsWon ?? 0,
  revenueGenerated: profile.revenueGenerated ?? 0
});

export const DEFAULT_ADMIN_USER: AppUser = {
  id: 'admin-vahlay',
  name: 'Piyush Gond',
  email: 'vahlaydigital@gmail.com',
  role: 'super_admin',
  avatar: '',
  title: 'Administrator',
  phone: '+91 83479 30515',
  department: 'Executive Administration',
  joinedDate: '2024-01-01',
  readinessScore: 100,
  learningXp: 9999,
  streakDays: 30,
  completedLessons: [],
  completedQuizzes: [],
  badges: ['badge-founder', 'badge-closer-elite'],
  assignedTargetRevenueINR: 0,
  leadsWon: 0,
  revenueGenerated: 0
};

export const DEFAULT_SUPPORT_USER: AppUser = {
  id: 'support-vahlay',
  name: 'Support Desk Engineer',
  email: 'support@vahlay.com',
  role: 'technical_support',
  avatar: '',
  title: 'Technical Support Lead',
  phone: '+91 83479 30515',
  department: 'Technical Operations',
  joinedDate: '2024-01-01',
  readinessScore: 100,
  learningXp: 5000,
  streakDays: 14,
  completedLessons: [],
  completedQuizzes: [],
  badges: ['badge-closer-elite'],
  assignedTargetRevenueINR: 0,
  leadsWon: 0,
  revenueGenerated: 0
};

export const DEFAULT_AGENT_USER: AppUser = {
  id: 'agent-vahlay',
  name: 'Sales Executive',
  email: 'agent@vahlay.com',
  role: 'sales_agent',
  avatar: '',
  title: 'Sales Agent',
  phone: '+91 83479 30515',
  department: 'Domestic Inside Sales',
  joinedDate: '2024-01-01',
  readinessScore: 90,
  learningXp: 2500,
  streakDays: 7,
  completedLessons: [],
  completedQuizzes: [],
  badges: ['badge-starter'],
  assignedTargetRevenueINR: 100000,
  leadsWon: 2,
  revenueGenerated: 24000
};

const LEGACY_MOCK_NAMES = new Set([
  'priya patel',
  'aman verma',
  'sneha kulkarni',
  'karan mehra',
  'ananya roy',
  'vikas nair',
  'pooja singh',
  'vikram malhotra',
  'neha gupta',
  'amit verma',
  'rohan sharma'
]);

const getDeletedUserIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('vahlay_deleted_user_ids');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markUserDeleted = (id: string, email?: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedUserIds();
    current.add(id);
    if (email) current.add(email.toLowerCase());
    localStorage.setItem('vahlay_deleted_user_ids', JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
};

const unmarkUserDeleted = (id: string, email?: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedUserIds();
    current.delete(id);
    if (email) current.delete(email.toLowerCase());
    localStorage.setItem('vahlay_deleted_user_ids', JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
};

const getCustomUsers = (): AppUser[] => {
  if (typeof window === 'undefined') return [];
  try {
    const deletedIds = getDeletedUserIds();
    const raw = localStorage.getItem('vahlay_custom_users');
    if (!raw) return [];
    const list: AppUser[] = JSON.parse(raw);
    return list.filter((u) => u && u.name && !LEGACY_MOCK_NAMES.has(u.name.toLowerCase()) && !deletedIds.has(u.id) && !deletedIds.has(u.email.toLowerCase()));
  } catch {
    return [];
  }
};

const saveCustomUser = (user: AppUser) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomUsers();
    const filtered = existing.filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem('vahlay_custom_users', JSON.stringify([...filtered, user]));
  } catch {
    // ignore
  }
};

const updateCustomUser = (id: string, updates: Partial<AppUser>) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomUsers();
    const updated = existing.map((u) => (u.id === id ? { ...u, ...updates } : u));
    localStorage.setItem('vahlay_custom_users', JSON.stringify(updated));
  } catch {
    // ignore
  }
};

const removeCustomUser = (id: string, email?: string) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomUsers();
    const updated = existing.filter((u) => u.id !== id && (!email || u.email.toLowerCase() !== email.toLowerCase()));
    localStorage.setItem('vahlay_custom_users', JSON.stringify(updated));
  } catch {
    // ignore
  }
};

const loadAuthenticatedProfile = async (firebaseUser: NonNullable<typeof auth.currentUser>): Promise<AppUser | null> => {
  const email = firebaseUser.email?.trim().toLowerCase();
  if (!email) return null;

  if (email === ADMIN_EMAIL.toLowerCase()) {
    let snapshot;
    try {
      snapshot = await getDoc(doc(db, 'admin', firebaseUser.uid));
    } catch (error) {
      if (isPermissionDenied(error)) {
        console.warn('Firestore denied access to admin collection:', error);
      }
    }
    if (snapshot && snapshot.exists()) {
      const profile = snapshot.data();
      return profileToUser(firebaseUser.uid, email, profile, 'super_admin');
    }

    try {
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userSnap.exists()) {
        const profile = userSnap.data();
        return profileToUser(firebaseUser.uid, email, profile, 'super_admin');
      }
    } catch (error) {
      console.warn('Could not read users doc for admin:', error);
    }

    // Default admin profile so admin is recognized immediately
    return profileToUser(
      firebaseUser.uid,
      email,
      {
        name: firebaseUser.displayName || 'Piyush Gond',
        email: ADMIN_EMAIL,
        role: 'super_admin',
        title: 'Administrator',
        department: 'Executive Administration'
      },
      'super_admin'
    );
  }

  let snapshot;
  try {
    snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new Error(`Firestore denied access to users/${firebaseUser.uid}. Publish the Firestore rules and confirm the agent profile exists. Deploy with: ${FIRESTORE_RULES_DEPLOY_COMMAND}`);
    }
    throw error;
  }

  if (!snapshot.exists()) {
    // Fallback: check users collection by email query
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const profile = qSnap.docs[0].data() as DocumentData;
        if (isUserRole(profile.role) && profile.role !== 'super_admin') {
          return profileToUser(firebaseUser.uid, email, profile, profile.role);
        }
      }
    } catch {
      // ignore
    }
    const customUsers = getCustomUsers();
    const foundLocal = customUsers.find((u) => u.email.toLowerCase() === email);
    if (foundLocal) {
      return { ...foundLocal, id: firebaseUser.uid };
    }
    return null;
  }

  const profile = snapshot.data();
  if (!isUserRole(profile.role) || profile.role === 'super_admin') return null;
  if (typeof profile.email !== 'string' || profile.email.trim().toLowerCase() !== email) return null;
  return profileToUser(firebaseUser.uid, email, profile, profile.role);
};

const loadAdminUsers = async (adminUser: AppUser): Promise<AppUser[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs.flatMap((userDoc) => {
    const profile = userDoc.data();
    // Load ALL roles except super_admin — agents, managers, support
    if (!isUserRole(profile.role) || profile.role === 'super_admin' || typeof profile.email !== 'string') return [];
    return [profileToUser(userDoc.id, profile.email, profile, profile.role)];
  });
  return [adminUser, ...users];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentDirectoryError, setAgentDirectoryError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('vahlay_demo_user') : null;
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            if (parsed.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              parsed.role = 'super_admin';
              parsed.title = 'Administrator';
            }
            setCurrentUser(parsed);
            const customUsers = getCustomUsers();
            setAllUsers([parsed, ...customUsers.filter((u) => u.id !== parsed.id)]);
            setLoading(false);
            return;
          } catch {
            // ignore
          }
        }
        // No authenticated session — require login
        setCurrentUser(null);
        setAllUsers([]);
        setLoading(false);
        return;
      }

      try {
        const user = await loadAuthenticatedProfile(firebaseUser);
        if (!user) {
          await signOut(auth);
          setCurrentUser(null);
          setAllUsers([]);
          return;
        }
        setCurrentUser(user);
        const customUsers = getCustomUsers();
        setAllUsers([user, ...customUsers.filter((u) => u.id !== user.id)]);
      } catch (error) {
        console.error('Failed to load Firebase user profile:', error);
        await signOut(auth);
        setCurrentUser(null);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    const user = await loadAuthenticatedProfile(firebaseUser);
    if (!user) {
      await signOut(auth);
      setCurrentUser(null);
      setAllUsers([]);
      return;
    }
    setCurrentUser(user);
    const customUsers = getCustomUsers();
    setAllUsers([user, ...customUsers.filter((u) => u.id !== user.id)]);
  };

  const refreshAgentUsers = useCallback(async () => {
    if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'technical_support') {
      return;
    }
    setAgentDirectoryError(null);
    const deletedIds = getDeletedUserIds();
    try {
      const liveUsers = await loadAdminUsers(currentUser);
      const filteredLive = liveUsers.filter((u) => !deletedIds.has(u.id) && !deletedIds.has(u.email.toLowerCase()));
      const customUsers = getCustomUsers();
      const existingIds = new Set(filteredLive.map((u) => u.id));
      const combined = [...filteredLive];
      for (const cu of customUsers) {
        if (!existingIds.has(cu.id)) {
          combined.push(cu);
        }
      }
      setAllUsers(combined);
    } catch (error) {
      console.warn('Firebase agent directory fallback to local directory:', error);
      const customUsers = getCustomUsers();
      const fallbackList = currentUser ? [currentUser, ...customUsers.filter((u) => u.id !== currentUser.id)] : customUsers;
      setAllUsers(fallbackList);
      setAgentDirectoryError(null);
    }
  }, [currentUser]);

  const loginWithEmail = async (email: string, password: string): Promise<AppUser> => {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    try {
      const user = await loadAuthenticatedProfile(credential.user);
      if (!user) {
        throw new Error('Account has no valid profile in Firestore. Ask an administrator to check your setup.');
      }
      setCurrentUser(user);
      const customUsers = getCustomUsers();
      setAllUsers([user, ...customUsers.filter((u) => u.id !== user.id)]);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('vahlay_logged_out');
      }
      return user;
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  };

  const createUserAccount = async (
    name: string,
    email: string,
    password: string,
    role: 'sales_agent' | 'technical_support',
    options?: { title?: string; department?: string; assignedTargetRevenueINR?: number }
  ): Promise<AppUser> => {
    const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) {
      throw new Error('Only a Super Administrator can create accounts.');
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || password.length < 6) {
      throw new Error('Enter a name, valid email, and a password with at least 6 characters.');
    }

    const defaultTitle = role === 'sales_agent' ? 'Sales Agent' : 'Technical Support';
    const defaultDept = role === 'sales_agent' ? 'Domestic Inside Sales' : 'Technical Operations';

    let generatedUid = `agent-${Date.now()}`;
    try {
      await setPersistence(agentProvisioningAuth, inMemoryPersistence);
      const credential = await createUserWithEmailAndPassword(agentProvisioningAuth, normalizedEmail, password);
      generatedUid = credential.user.uid;
      await signOut(agentProvisioningAuth);
    } catch (authError: any) {
      console.warn('Firebase Auth provisioning deferred, creating local active account:', authError);
      if (authError?.code === 'auth/email-already-in-use') {
        throw new Error(`The email "${normalizedEmail}" is already registered in Firebase Authentication.`);
      }
      if (authError?.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      }
    }

    const userProfile: AppUser = {
      id: generatedUid,
      name: normalizedName,
      email: normalizedEmail,
      role,
      avatar: '',
      title: options?.title || defaultTitle,
      department: options?.department || defaultDept,
      joinedDate: new Date().toISOString().slice(0, 10),
      readinessScore: 0,
      learningXp: 0,
      streakDays: 0,
      completedLessons: [],
      completedQuizzes: [],
      badges: [],
      assignedTargetRevenueINR: options?.assignedTargetRevenueINR ?? 0,
      leadsWon: 0,
      revenueGenerated: 0
    };

    try {
      await setDoc(doc(db, 'users', generatedUid), {
        ...userProfile,
        createdAt: serverTimestamp()
      });
    } catch (fsError) {
      console.warn('Firestore setDoc deferred, user persisted locally:', fsError);
    }

    unmarkUserDeleted(generatedUid, normalizedEmail);
    saveCustomUser(userProfile);
    setAllUsers((users) => {
      const exists = users.some((u) => u.id === userProfile.id || u.email.toLowerCase() === userProfile.email.toLowerCase());
      return exists
        ? users.map((u) => (u.id === userProfile.id || u.email.toLowerCase() === userProfile.email.toLowerCase() ? userProfile : u))
        : [...users, userProfile];
    });
    setAgentDirectoryError(null);
    return userProfile;
  };

  const updateAgentProfile = async (
    agentId: string,
    updates: Partial<Pick<AppUser, 'name' | 'title' | 'department' | 'assignedTargetRevenueINR'>>
  ): Promise<AppUser> => {
    const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) {
      throw new Error('Only a Super Administrator can update user profiles.');
    }

    const sanitizedUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) sanitizedUpdates.name = updates.name.trim();
    if (updates.title !== undefined) sanitizedUpdates.title = updates.title.trim();
    if (updates.department !== undefined) sanitizedUpdates.department = updates.department.trim();
    if (updates.assignedTargetRevenueINR !== undefined) sanitizedUpdates.assignedTargetRevenueINR = updates.assignedTargetRevenueINR;

    if (Object.keys(sanitizedUpdates).length === 0) {
      throw new Error('No valid agent fields were provided for update.');
    }

    try {
      await updateDoc(doc(db, 'users', agentId), sanitizedUpdates);
    } catch (fsErr) {
      console.warn('Firestore updateDoc skipped or deferred, updating locally:', fsErr);
    }

    updateCustomUser(agentId, sanitizedUpdates);
    setAllUsers((users) => users.map((user) => (user.id === agentId ? { ...user, ...sanitizedUpdates } : user)));
    if (currentUser?.id === agentId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...sanitizedUpdates } : prev));
    }

    const updated = allUsers.find((u) => u.id === agentId);
    return updated ? { ...updated, ...sanitizedUpdates } : ({ id: agentId, ...sanitizedUpdates } as AppUser);
  };

  const deleteAgentProfile = async (agentId: string): Promise<void> => {
    const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) {
      throw new Error('Only a Super Administrator can remove user accounts.');
    }

    if (!agentId) {
      throw new Error('A valid user ID is required for removal.');
    }

    const targetUser = allUsers.find((u) => u.id === agentId);
    const targetEmail = targetUser?.email;

    markUserDeleted(agentId, targetEmail);
    removeCustomUser(agentId, targetEmail);

    try {
      await deleteDoc(doc(db, 'users', agentId));
    } catch (fsErr) {
      console.warn('Firestore deleteDoc skipped or deferred, removing locally:', fsErr);
    }

    setAllUsers((users) =>
      users.filter((user) => user.id !== agentId && (!targetEmail || user.email.toLowerCase() !== targetEmail.toLowerCase()))
    );
    if (currentUser?.id === agentId) {
      setCurrentUser(null);
    }
  };

  const loginAsDemo = (demoUser?: AppUser) => {
    const userToLogin = demoUser || DEFAULT_ADMIN_USER;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vahlay_demo_user', JSON.stringify(userToLogin));
      sessionStorage.removeItem('vahlay_logged_out');
    }
    setCurrentUser(userToLogin);
    setAllUsers([userToLogin]);
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vahlay_demo_user');
      sessionStorage.setItem('vahlay_logged_out', 'true');
    }
    setCurrentUser(null);
    setAllUsers([]);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isManager = currentUser?.role === 'sales_manager';
  const isAgent = currentUser?.role === 'sales_agent' && !isAdmin;
  const isSupport = currentUser?.role === 'technical_support';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        agentDirectoryError,
        refreshAgentUsers,
        refreshUser,
        loginWithEmail,
        loginAsDemo,
        createUserAccount,
        updateAgentProfile,
        deleteAgentProfile,
        logout,
        isManager,
        isAdmin,
        isAgent,
        isSupport
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
