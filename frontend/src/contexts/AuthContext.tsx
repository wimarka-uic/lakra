import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authAPI, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  markGuidelinesSeen: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forceRefreshUser: () => Promise<void>; // Force refresh without error handling
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and validate/refresh user data
    const initializeAuth = async () => {
      const storedUser = authStorage.getUser();
      const storedToken = authStorage.getToken();

      console.log('Auth initialization: Stored user onboarding status:', storedUser?.onboarding_status);

      if (storedUser && storedToken) {
        try {
          // Always fetch fresh user data to ensure we have the latest onboarding status
          console.log('Auth initialization: Fetching fresh user data...');
          const currentUser = await authAPI.getCurrentUser();
          console.log('Auth initialization: Fresh user onboarding status:', currentUser.onboarding_status);
          authStorage.setUser(currentUser);
          setUser(currentUser);
        } catch (error: unknown) {
          console.error('Token validation failed, logging out:', error);
          // Token is invalid, clear storage and logout
          authStorage.removeToken();
          authStorage.removeUser();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const authData = await authAPI.login(credentials);
    authStorage.setToken(authData.access_token);
    authStorage.setUser(authData.user);
    setUser(authData.user);
  };

  const register = async (userData: RegisterData) => {
    const authData = await authAPI.register(userData);
    authStorage.setToken(authData.access_token);
    authStorage.setUser(authData.user);
    setUser(authData.user);
  };

  const markGuidelinesSeen = async () => {
    try {
      const updatedUser = await authAPI.markGuidelinesSeen();
      authStorage.setUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error marking guidelines as seen:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        // No token, ensure user is logged out
        setUser(null);
        return;
      }
      
      const currentUser = await authAPI.getCurrentUser();
      authStorage.setUser(currentUser);
      setUser(currentUser);
    } catch (error: unknown) {
      console.error('Error refreshing user data:', error);
      // If refresh fails due to invalid token, logout user
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          authStorage.removeToken();
          authStorage.removeUser();
          setUser(null);
        }
      }
      throw error;
    }
  };

  const forceRefreshUser = async () => {
    const token = authStorage.getToken();
    if (!token) {
      console.warn('forceRefreshUser: No token found');
      return;
    }
    
    console.log('forceRefreshUser: Fetching fresh user data after quiz completion...');
    console.log('forceRefreshUser: Current stored user onboarding_status:', authStorage.getUser()?.onboarding_status);
    
    try {
      const currentUser = await authAPI.getCurrentUser();
      console.log('forceRefreshUser: API returned user onboarding status:', currentUser.onboarding_status);
      console.log('forceRefreshUser: Full user object from API:', currentUser);
      
      // Force update both storage and state
      authStorage.setUser(currentUser);
      setUser(currentUser);
      
      console.log('forceRefreshUser: User state updated, new onboarding_status:', currentUser.onboarding_status);
      
      // Verify the update worked
      const verifyUser = authStorage.getUser();
      console.log('forceRefreshUser: Verification - stored user onboarding_status:', verifyUser?.onboarding_status);
      
    } catch (error) {
      console.error('forceRefreshUser: Error fetching user data:', error);
      throw error;
    }
  };

  // Auto-refresh user data periodically to keep onboarding status up to date
  useEffect(() => {
    if (!user || !authStorage.getToken()) return;

    const refreshUserData = async () => {
      try {
        const token = authStorage.getToken();
        if (!token) return;
        
        console.log('Background refresh: Fetching latest user data...');
        const currentUser = await authAPI.getCurrentUser();
        console.log('Background refresh: User onboarding status:', currentUser.onboarding_status);
        authStorage.setUser(currentUser);
        setUser(currentUser);
      } catch (error) {
        console.warn('Background user refresh failed:', error);
      }
    };

    const interval = setInterval(refreshUserData, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const logout = () => {
    authStorage.removeToken();
    authStorage.removeUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    markGuidelinesSeen,
    refreshUser,
    forceRefreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 