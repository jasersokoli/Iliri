import { create } from 'zustand';

export interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    theme: 'light' | 'dark';
  } | null;
  token: string | null;
  login: (name: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<AuthState['user']>) => void;
}

// Load from localStorage on init
const loadAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state || { user: null, token: null };
    }
  } catch {
    // Ignore errors
  }
  return { user: null, token: null };
};

// Save to localStorage
const saveAuthToStorage = (state: { user: AuthState['user']; token: string | null }) => {
  try {
    localStorage.setItem('auth-storage', JSON.stringify({ state }));
  } catch {
    // Ignore errors
  }
};

const initialState = loadAuthFromStorage();

// Mock authentication - replace with actual API calls
export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  token: initialState.token,
  login: async (name: string, _password: string, rememberMe = false) => {
    // TODO: Replace with actual API call
    // Mock successful login
    const mockUser = {
      id: '1',
      name: name.trim(),
      email: 'user@example.com',
      theme: 'light' as const,
    };
    const mockToken = 'mock-token';
    
    const newState = { user: mockUser, token: mockToken };
    set(newState);
    if (rememberMe) {
      saveAuthToStorage(newState);
    }
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('auth-storage');
  },
  updateUser: (updates) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updates } : null;
      const newState = { ...state, user: newUser };
      saveAuthToStorage(newState);
      return newState;
    });
  },
}));

