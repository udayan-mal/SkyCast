
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type AuthError = { message: string } | null;

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser | null;
  createdAt: string;
}

interface StoredUser {
  id: string;
  password: string;
}

interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const USERS_STORAGE_KEY = 'skycast:authUsers';
const SESSION_STORAGE_KEY = 'skycast:authSession';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readUsers = (): Record<string, StoredUser> => {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to read stored users:', error);
    return {};
  }
};

const writeUsers = (users: Record<string, StoredUser>) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to write stored users:', error);
  }
};

const readSession = (): AuthSession | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read stored session:', error);
    return null;
  }
};

const writeSession = (session: AuthSession | null) => {
  if (!isBrowser()) return;
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Failed to write stored session:', error);
  }
};

const createUserId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `user_${Math.random().toString(36).slice(2, 10)}`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialSession = readSession();
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { error: { message: 'Email is required.' } };
    }
    const users = readUsers();
    const storedUser = users[normalizedEmail];

    if (!storedUser || storedUser.password !== password) {
      return { error: { message: 'Invalid email or password.' } };
    }

    const authUser: AuthUser = { id: storedUser.id, email: normalizedEmail };
    const newSession: AuthSession = { user: authUser, createdAt: new Date().toISOString() };
    setSession(newSession);
    setUser(authUser);
    writeSession(newSession);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { error: { message: 'Email is required.' } };
    }
    if (password.length < 6) {
      return { error: { message: 'Password must be at least 6 characters long.' } };
    }

    const users = readUsers();
    if (users[normalizedEmail]) {
      return { error: { message: 'An account with this email already exists.' } };
    }

    const newUser: StoredUser = {
      id: createUserId(),
      password,
    };

    users[normalizedEmail] = newUser;
    writeUsers(users);

    const authUser: AuthUser = { id: newUser.id, email: normalizedEmail };
    const newSession: AuthSession = { user: authUser, createdAt: new Date().toISOString() };
    setSession(newSession);
    setUser(authUser);
    writeSession(newSession);

    return { error: null };
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    writeSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
