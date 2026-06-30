
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing...');
    initializeAuth();
  }, []);

  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefresh = (event) => {
      console.log('🔄 AuthProvider: Token refreshed event received');
      const { token: newToken, user: newUser } = event.detail;
      
      if (newToken) {
        setToken(newToken);
      }
      
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (newUser.role) {
          localStorage.setItem('role', newUser.role);
        }
      }
      
      console.log('✅ AuthProvider: Token and user state updated from refresh');
    };

    window.addEventListener('token-refreshed', handleTokenRefresh);
    
    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefresh);
    };
  }, []);

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    console.log('📦 AuthProvider: Found in localStorage:', {
      hasToken: !!storedToken,
      hasUser: !!storedUser,
      role: storedRole
    });

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Ensure role is set
        if (!parsedUser.role && storedRole) {
          parsedUser.role = storedRole;
        }
        
        // ✅ Ensure _id is set (backend might return 'id')
        if (!parsedUser._id && parsedUser.id) {
          parsedUser._id = parsedUser.id;
        }
        
        console.log('✅ AuthProvider: User loaded:', parsedUser);
        
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ AuthProvider: Failed to parse user:', error);
        localStorage.clear();
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    console.log('🔐 AuthContext.login: Starting login for:', email);
    
    try {
      const response = await authAPI.login({ email, password });
      console.log('🔐 AuthContext.login: Raw API response:', response);
      console.log('🔐 AuthContext.login: response.data:', response.data);

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;

        // ✅ Normalize user object - ensure _id exists
        if (!newUser._id && newUser.id) {
          newUser._id = newUser.id;
        }

        console.log('💾 AuthContext.login: Extracted data:', {
          hasToken: !!newToken,
          tokenPreview: newToken?.substring(0, 20) + '...',
          user: newUser,
          userId: newUser._id || newUser.id,
          role: newUser.role
        });

        if (!newToken) {
          console.error('❌ AuthContext.login: No token in response!');
          return { success: false, message: 'No token received from server' };
        }

        if (!newUser || !newUser.role) {
          console.error('❌ AuthContext.login: Invalid user data!');
          return { success: false, message: 'Invalid user data received' };
        }

        // Save to localStorage
        console.log('💾 AuthContext.login: Saving to localStorage...');
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('role', newUser.role);

        // Verify save
        console.log('💾 AuthContext.login: Verification:', {
          tokenSaved: !!localStorage.getItem('token'),
          roleSaved: localStorage.getItem('role'),
          userSaved: !!localStorage.getItem('user')
        });

        // Update state
        setToken(newToken);
        setUser(newUser);

        console.log('✅ AuthContext.login: Login complete!');
        
        return { success: true, user: newUser };
      }

      console.log('❌ AuthContext.login: API returned success: false');
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error) {
      console.error('❌ AuthContext.login: Exception caught:', error);
      console.error('❌ AuthContext.login: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Try again.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;

        // ✅ Normalize user object
        if (!newUser._id && newUser.id) {
          newUser._id = newUser.id;
        }

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('role', newUser.role);

        setToken(newToken);
        setUser(newUser);

        return { success: true, user: newUser };
      }

      return {
        success: false,
        message: response.data.message || 'Registration failed',
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    console.log('👋 AuthContext.logout: Clearing auth...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    
    // Ensure _id is preserved
    if (!updatedUser._id && user._id) {
      updatedUser._id = user._id;
    }
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (updatedUser.role) {
      localStorage.setItem('role', updatedUser.role);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  console.log('🔄 AuthProvider: Current state:', {
    hasUser: !!user,
    userId: user?._id || user?.id,
    userRole: user?.role,
    loading,
    isAuthenticated: !!user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};