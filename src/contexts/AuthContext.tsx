import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData, RegisterResult } from '../types';
import { authAPI, authStorage } from '../services/supabase-api';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<RegisterResult>;

  logout: () => void;
  markGuidelinesSeen: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forceRefreshUser: () => Promise<void>; // Force refresh without error handling
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Safe hook that doesn't throw error, useful for components that should work without auth
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context || {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => { throw new Error('Auth not available'); },
    register: async () => { throw new Error('Auth not available'); },
    logout: () => {},
    markGuidelinesSeen: async () => {},
    refreshUser: async () => {},
    forceRefreshUser: async () => {},
    sendPasswordResetEmail: async () => {},
    resetPassword: async () => {},
  };
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

      logger.debug('Initializing auth with stored user', {
        component: 'AuthContext',
        action: 'initialize',
        userId: storedUser?.id,
        metadata: { onboardingStatus: storedUser?.onboarding_status }
      });

      if (storedUser && storedToken) {
        try {
          logger.debug('Fetching fresh user data to validate token', {
            component: 'AuthContext',
            action: 'validateToken',
            userId: storedUser.id
          });
          
          // Add timeout to prevent hanging on Supabase connection issues
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Auth initialization timeout')), 5000);
          });
          
          const currentUser = await Promise.race([
            authAPI.getCurrentUser(),
            timeoutPromise
          ]) as User;
          
          logger.authEvent('tokenValidated', currentUser.id, {
            onboardingStatus: currentUser.onboarding_status
          });
          
          authStorage.setUser(currentUser);
          setUser(currentUser);
        } catch (error: unknown) {
          logger.authEvent('tokenValidationFailed', storedUser.id);
          logger.apiError('getCurrentUser', error as Error, {
            component: 'AuthContext',
            metadata: { errorMessage: (error as Error).message }
          });
          
          // If Supabase is down or timeout, keep stored user for graceful degradation
          // Only clear if it's a 401 (unauthorized) error
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401) {
              authStorage.removeToken();
              authStorage.removeUser();
              setUser(null);
            } else {
              // Supabase connection issue - use cached user data
              logger.warn('Using cached user data due to connection issue', {
                component: 'AuthContext',
                action: 'initialize',
                userId: storedUser.id
              });
              setUser(storedUser);
            }
          } else {
            // Network error or timeout - use cached user data
            logger.warn('Using cached user data due to network/timeout issue', {
              component: 'AuthContext',
              action: 'initialize',
              userId: storedUser.id
            });
            setUser(storedUser);
          }
        }
      }
      setIsLoading(false);
    };

    // Always stop loading after a maximum timeout to prevent blocking the app
    const maxTimeout = setTimeout(() => {
      logger.warn('Auth initialization max timeout reached', {
        component: 'AuthContext',
        action: 'initialize'
      });
      setIsLoading(false);
    }, 6000);

    initializeAuth().finally(() => clearTimeout(maxTimeout));
    
    return () => clearTimeout(maxTimeout);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      logger.debug('Starting login process', {
        component: 'AuthContext',
        action: 'login',
        metadata: { isUsernameLogin: !credentials.email.includes('@') }
      });
      
      // Add timeout for login to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login request timeout')), 10000);
      });
      
      const authData = await Promise.race([
        authAPI.login(credentials),
        timeoutPromise
      ]) as Awaited<ReturnType<typeof authAPI.login>>;
      
      logger.debug('Login API call successful', {
        component: 'AuthContext',
        action: 'login',
        metadata: { userId: authData.user.id }
      });
      
      authStorage.setToken(authData.access_token);
      authStorage.setUser(authData.user);
      setUser(authData.user);
      
      logger.debug('Login process completed', {
        component: 'AuthContext',
        action: 'login',
        metadata: { userId: authData.user.id }
      });
    } catch (error) {
      logger.error('Login process failed', {
        component: 'AuthContext',
        action: 'login',
        metadata: { error: (error as Error).message }
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    const result = await authAPI.register(userData);
    return result;
  };



  const markGuidelinesSeen = async () => {
    try {
      const updatedUser = await authAPI.markGuidelinesSeen();
      authStorage.setUser(updatedUser);
      setUser(updatedUser);
      
      logger.userAction('guidelinesMarkedSeen', updatedUser.id);
    } catch (error) {
      logger.apiError('markGuidelinesSeen', error as Error, {
        component: 'AuthContext',
        userId: user?.id
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        logger.debug('No token found during refresh, logging out user', {
          component: 'AuthContext',
          action: 'refreshUser'
        });
        setUser(null);
        return;
      }
      
      const currentUser = await authAPI.getCurrentUser();
      authStorage.setUser(currentUser);
      setUser(currentUser);
      
      logger.debug('User data refreshed successfully', {
        component: 'AuthContext',
        action: 'refreshUser',
        userId: currentUser.id,
        metadata: { onboardingStatus: currentUser.onboarding_status }
      });
    } catch (error: unknown) {
      logger.apiError('refreshUser', error as Error, {
        component: 'AuthContext',
        userId: user?.id
      });
      
      // If refresh fails due to invalid token, logout user
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          logger.authEvent('tokenExpired', user?.id);
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
      logger.warn('No token found during force refresh', {
        component: 'AuthContext',
        action: 'forceRefreshUser'
      });
      return;
    }
    
    // Check if we already have updated user data in storage that's newer than our current state
    const storedUser = authStorage.getUser();
    if (storedUser && storedUser.onboarding_status !== user?.onboarding_status) {
      logger.debug('Using updated user data from storage', {
        component: 'AuthContext',
        action: 'forceRefreshUser',
        userId: storedUser.id,
        metadata: { 
          storedOnboardingStatus: storedUser.onboarding_status,
          currentOnboardingStatus: user?.onboarding_status
        }
      });
      setUser(storedUser);
      return;
    }
    
    logger.debug('Fetching fresh user data from API', {
      component: 'AuthContext',
      action: 'forceRefreshUser',
      userId: storedUser?.id,
      metadata: { currentOnboardingStatus: storedUser?.onboarding_status }
    });
    
    try {
      const currentUser = await authAPI.getCurrentUser();
      
      logger.debug('API returned fresh user data', {
        component: 'AuthContext',
        action: 'forceRefreshUser',
        userId: currentUser.id,
        metadata: { 
          newOnboardingStatus: currentUser.onboarding_status,
          previousOnboardingStatus: user?.onboarding_status
        }
      });
      
      // Force update both storage and state
      authStorage.setUser(currentUser);
      setUser(currentUser);
      
      logger.debug('User state force updated successfully', {
        component: 'AuthContext',
        action: 'forceRefreshUser',
        userId: currentUser.id,
        metadata: { onboardingStatus: currentUser.onboarding_status }
      });
      
    } catch (error) {
      logger.apiError('forceRefreshUser', error as Error, {
        component: 'AuthContext',
        userId: user?.id
      });
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
        
        logger.debug('Background refresh: Fetching latest user data', {
          component: 'AuthContext',
          action: 'backgroundRefresh',
          userId: user?.id
        });
        
        const currentUser = await authAPI.getCurrentUser();
        
        logger.debug('Background refresh completed', {
          component: 'AuthContext',
          action: 'backgroundRefresh',
          userId: currentUser.id,
          metadata: { onboardingStatus: currentUser.onboarding_status }
        });
        
        authStorage.setUser(currentUser);
        setUser(currentUser);
      } catch (error) {
        logger.warn('Background user refresh failed', {
          component: 'AuthContext',
          action: 'backgroundRefresh',
          userId: user?.id,
          metadata: { error: (error as Error).message }
        });
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

  const sendPasswordResetEmail = async (email: string) => {
    await authAPI.sendPasswordResetEmail(email);
  };

  const resetPassword = async (newPassword: string) => {
    await authAPI.resetPassword(newPassword);
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
    sendPasswordResetEmail,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 